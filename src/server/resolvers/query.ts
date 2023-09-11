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
import { ItemHistory, ResolversPerDays } from './inputs';
import { max, maxBy, min, minBy } from 'lodash';
import { subDays, isAfter } from 'date-fns';
import { itemNames } from '../constants';

@Resolver(ItemHistory)
@Service()
export class ItemQueryResolver {
  @Inject() private itemService!: ItemService;

  @Query(returns => [ItemHistory])
  async items() {
    return await this.itemService.getItems();
  }

  @FieldResolver()
  async iconURL(@Root() { itemId }: ItemHistory) {
    return `${process.env.ICON_URL_BASE_ENDPOINT!}/${itemId}.png`;
  }

  @FieldResolver()
  async cards(@Root() { cards }: ItemHistory) {
    return cards
      .split(',')
      .map(card => itemNames[Number(card) as keyof typeof itemNames])
      .join(', ');
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
      hps: maxBy(sellHist, i => i.price)?.price.toString() || '0',
      lps: minBy(sellHist, i => i.price)?.price.toString() || '0',
      avgl: vendHist.length
        ? Math.round(
            vendHist.reduce((acc, i) => acc + i.price, 0) / vendHist.length,
          ).toString()
        : '0',
      avgs: sellHist.length
        ? Math.round(
            sellHist.reduce((acc, i) => acc + i.price, 0) / sellHist.length,
          ).toString()
        : '0',
      qtyl: vendHist.length.toString(),
      qtys: sellHist.length.toString(),
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
      hps: maxBy(sellHist, i => i.price)?.price.toString() || '0',
      lps: minBy(sellHist, i => i.price)?.price.toString() || '0',
      avgl: vendHist.length
        ? Math.round(
            vendHist.reduce((acc, i) => acc + i.price, 0) / vendHist.length,
          ).toString()
        : '0',
      avgs: sellHist.length
        ? Math.round(
            sellHist.reduce((acc, i) => acc + i.price, 0) / sellHist.length,
          ).toString()
        : '0',
      qtyl: vendHist.length.toString(),
      qtys: sellHist.length.toString(),
    } satisfies ResolversPerDays;
  }

  @FieldResolver(returns => ResolversPerDays)
  async allTime(@Root() item: ItemHistory) {
    const { vendHist, sellHist } = item;

    return {
      hps: maxBy(sellHist, i => i.price)?.price.toString() || '0',
      lps: minBy(sellHist, i => i.price)?.price.toString() || '0',
      avgl: vendHist.length
        ? Math.round(
            vendHist.reduce((acc, i) => acc + i.price, 0) / vendHist.length,
          ).toString()
        : '0',
      avgs: sellHist.length
        ? Math.round(
            sellHist.reduce((acc, i) => acc + i.price, 0) / sellHist.length,
          ).toString()
        : '0',
      qtyl: vendHist.length.toString(),
      qtys: sellHist.length.toString(),
    } satisfies ResolversPerDays;
  }

  @FieldResolver()
  async mppi(@Root() item: ItemHistory) {
    return '';
  }

  @Query(returns => [ItemHistory])
  async item(@Arg('itemId') itemId: string) {
    const item = await this.itemService.getFullItem(itemId);

    return item;
  }
}
