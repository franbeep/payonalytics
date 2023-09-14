import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { ItemService } from '../services/itemService';
import { Inject, Service } from 'typedi';
import { ItemHistory, ItemVending, ResolversPerDays } from './inputs';
import { max, maxBy, min, minBy, sum } from 'lodash';
import { subDays, isAfter } from 'date-fns';
import { itemNames } from '../constants';

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
  async iconURL(@Root() { itemId }: ItemHistory) {
    return `${process.env.ICON_URL_BASE_ENDPOINT!}/${itemId}.png`;
  }

  @FieldResolver(returns => ResolversPerDays)
  async last30days(@Root() item: ItemHistory) {
    const comparableDate = subDays(new Date(), 30);
    const vendHist = item.vendHist.filter(item =>
      isAfter(item.date, comparableDate),
    );
    const sellHist = item.sellHist.filter(item =>
      isAfter(item.date, comparableDate),
    );

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

  @FieldResolver(returns => ResolversPerDays)
  async last7days(@Root() item: ItemHistory) {
    const comparableDate = subDays(new Date(), 7);
    const vendHist = item.vendHist.filter(item =>
      isAfter(item.date, comparableDate),
    );
    const sellHist = item.sellHist.filter(item =>
      isAfter(item.date, comparableDate),
    );

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

  @FieldResolver(returns => ResolversPerDays)
  async allTime(@Root() item: ItemHistory) {
    const { vendHist, sellHist } = item;

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
  async name(@Root() { itemId }: ItemVending) {
    return this.itemService.getItemName(itemId) || '';
  }

  @FieldResolver()
  async iconURL(@Root() { itemId }: ItemVending) {
    return `${process.env.ICON_URL_BASE_ENDPOINT!}/${itemId}.png`;
  }

  @FieldResolver()
  async lp(@Root() { vendingData }: ItemVending) {
    return min(vendingData.map(({ price }) => price)) || 0;
  }

  @FieldResolver()
  async hp(@Root() { vendingData }: ItemVending) {
    return max(vendingData.map(({ price }) => price)) || 0;
  }

  @FieldResolver()
  async qty(@Root() { vendingData }: ItemVending) {
    return sum(vendingData.map(({ amount }) => amount)) || 0;
  }

  @FieldResolver()
  async minLocation(@Root() { vendingData }: ItemVending) {
    if (!vendingData.length)
      return {
        location: '',
        price: 0,
      };

    const stallFound = vendingData.reduce(
      (acc, curr) => {
        const price = Number(curr.price);
        if (price < acc.price) {
          (acc.location = `${curr.coordinates.map}, ${curr.coordinates.x}, ${curr.coordinates.y}`),
            (acc.price = price);
        }

        return acc;
      },
      {
        location: '',
        price: Infinity,
      },
    );

    return stallFound;
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
