import { Arg, Ctx, FieldResolver, Query, Resolver, Root } from 'type-graphql';
import { ItemService } from '../services/itemService';
import Container, { Inject, Service } from 'typedi';
import {
  ItemHistory,
  ItemVending,
  ResolversPerDays,
  ResolversIsPrice,
} from './inputs';
import { max, maxBy, min, minBy, sum } from 'lodash';
import { subDays, isAfter } from 'date-fns';
import DataLoader from 'dataloader';
import { HistoryItemsMongoData, VendingItemsMongoData } from '../providers';
import { IsEnum } from 'class-validator';

type HistoryTimeFrame = 'last7days' | 'last30days' | 'allTime';

@Resolver(ItemHistory)
@Service()
export class ItemHistoryQueryResolver {
  @Inject() private itemService!: ItemService;

  @Query(returns => [ItemHistory])
  async itemsHistory(
    @Arg('take', { nullable: true }) take?: number,
    @Arg('offset', { nullable: true }) offset?: number,
  ) {
    return await this.itemService.getItems({ take, offset });
  }

  @Query(returns => [ItemHistory])
  async itemHistory(@Arg('itemId') itemId: number) {
    const item = await this.itemService.getFullItem(itemId);

    return item;
  }

  @FieldResolver()
  iconURL(@Root() { itemId }: ItemHistory) {
    return `${process.env.ICON_URL_BASE_ENDPOINT!}/${itemId}.png`;
  }

  @FieldResolver(returns => ResolversPerDays)
  perDays(
    // TODO: correctly type this
    @Arg('timeFrame', type => String)
    timeFrame: string,
    @Root() item: ItemHistory,
  ) {
    let comparableDate: Date | null;
    switch (timeFrame) {
      case 'last7days':
        comparableDate = subDays(new Date(), 7);
        break;
      case 'last30days':
        comparableDate = subDays(new Date(), 30);
        break;
      default:
        comparableDate = null;
        break;
    }

    const vendHist = comparableDate
      ? item.vendHist.filter(item => isAfter(item.date, comparableDate!))
      : item.vendHist;
    const sellHist = comparableDate
      ? item.sellHist.filter(item => isAfter(item.date, comparableDate!))
      : item.sellHist;

    return {
      hps: maxBy(sellHist, i => i.price)?.price || 0,
      lps: minBy(sellHist, i => i.price)?.price || 0,
      avgl: vendHist.length
        ? Math.round(
            vendHist.reduce((acc, i) => acc + i.price, 0) / vendHist.length,
          )
        : 0,
      avgs: sellHist.length
        ? Math.round(
            sellHist.reduce((acc, i) => acc + i.price, 0) / sellHist.length,
          )
        : 0,
      qtyl: vendHist.length,
      qtys: sellHist.length,
    } satisfies ResolversPerDays;
  }
}

@Resolver(ItemVending)
@Service()
export class ItemVendingQueryResolver {
  @Inject() private itemService!: ItemService;

  @Query(returns => [ItemVending])
  async itemsVending(
    @Arg('take', { nullable: true }) take?: number,
    @Arg('offset', { nullable: true }) offset?: number,
  ) {
    const items = await this.itemService.getCurrentVendingItems({
      take,
      offset,
    });

    return items.filter(item => item.vendingData.length);
  }

  @Query(returns => [ItemVending])
  async itemVending(@Arg('itemId') itemId: number) {
    const items = await this.itemService.getVendingItem(itemId);

    return items.filter(item => item.vendingData.length);
  }

  @FieldResolver()
  name(@Root() { itemId }: ItemVending) {
    return this.itemService.getItemName(itemId) || '';
  }

  @FieldResolver()
  iconURL(@Root() { itemId }: ItemVending) {
    return `${process.env.ICON_URL_BASE_ENDPOINT!}/${itemId}.png`;
  }

  @FieldResolver()
  lp(@Root() { vendingData }: ItemVending) {
    return min(vendingData.map(({ price }) => price)) || 0;
  }

  @FieldResolver()
  hp(@Root() { vendingData }: ItemVending) {
    return max(vendingData.map(({ price }) => price)) || 0;
  }

  @FieldResolver()
  qty(@Root() { vendingData }: ItemVending) {
    return sum(vendingData.map(({ amount }) => amount)) || 0;
  }

  @FieldResolver()
  minLocation(@Root() { vendingData }: ItemVending) {
    if (!vendingData.length)
      return {
        location: '',
        price: 0,
      };

    const stallFound = vendingData.reduce(
      (acc, curr) => {
        curr.listedDate;
        const price = Number(curr.price);
        if (price < acc.price) {
          acc.location = `${curr.coordinates.map}, ${curr.coordinates.x}, ${curr.coordinates.y}`;
          acc.price = price;
          acc.date = curr.listedDate;
        }

        return acc;
      },
      {
        date: new Date(),
        location: '',
        price: Infinity,
      },
    );

    return stallFound;
  }

  @FieldResolver(returns => ResolversIsPrice)
  async isPrice(
    // 'avgs' | 'lps'
    @Arg('metric', type => String) metric: string,
    @Arg('timeFrame', type => String) timeFrame: HistoryTimeFrame,
    @Root() itemVending: ItemVending,
    @Ctx('dataloader')
    dataloader: {
      processedItems: DataLoader<number, HistoryItemsMongoData[], number>;
      vendingItems: DataLoader<number, VendingItemsMongoData[], number>;
    },
  ) {
    const { itemId, refinement, cards } = itemVending;
    const { processedItems: loader } = dataloader;
    const [item] = (await loader.load(itemId)).filter(
      i => i.refinement === refinement && i.cards === cards,
    );
    const itemHistoryQueryResolver = Container.get(ItemHistoryQueryResolver);

    if (!item) {
      return {
        percentage: 0,
        value: true,
      };
    }
    const perDays = itemHistoryQueryResolver.perDays(
      timeFrame,
      item as ItemHistory,
    );
    const referenceValue = perDays[metric as 'avgs' | 'lps'];

    if (referenceValue === 0) {
      return {
        percentage: 0,
        value: true,
      };
    }

    const lp = this.lp(itemVending);

    const percentage =
      referenceValue > lp
        ? 1 - Math.round((lp / referenceValue) * 100) / 100
        : (1 - Math.round((referenceValue / lp) * 100) / 100) * -1;

    return {
      percentage,
      value: lp < referenceValue,
    };
  }
}

@Resolver()
@Service()
export class ItemMiscQueryResolver {
  @Inject() private itemService!: ItemService;

  @Query(returns => Boolean)
  async hasMore(
    @Arg('take', { nullable: true }) take?: number,
    @Arg('offset', { nullable: true }) offset?: number,
  ) {
    return await this.itemService.hasMoreIds({ take, offset });
  }
}
