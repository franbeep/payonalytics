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
import { Item, ResolversPerDays } from './inputs';

@Resolver(Item)
@Service()
export class ItemQueryResolver {
  @Inject() private itemService!: ItemService;

  @Query(returns => [Item])
  async items() {
    return await this.itemService.getItems();
  }

  @FieldResolver()
  async iconURL(@Root() { id }: Item) {
    return `${process.env.ICON_URL_BASE_ENDPOINT!}/${id}.png`;
  }

  @FieldResolver()
  async refinement(@Root() item: Item) {
    return '';
  }

  @FieldResolver()
  async cards(@Root() item: Item) {
    return '';
  }

  @FieldResolver(returns => ResolversPerDays)
  async last30days(@Root() item: Item) {
    return {
      hps: '',
      lps: '',
      avgl: '',
      avgs: '',
      qtyl: '',
      qtys: '',
    } satisfies ResolversPerDays;
  }

  @FieldResolver(returns => ResolversPerDays)
  async last7days(@Root() item: Item) {
    return {
      hps: '',
      lps: '',
      avgl: '',
      avgs: '',
      qtyl: '',
      qtys: '',
    } satisfies ResolversPerDays;
  }

  @FieldResolver()
  async mppi(@Root() item: Item) {
    return '';
  }

  @Query(returns => Item)
  async item(@Arg('itemId') itemId: string) {
    const item = await this.itemService.getFullItem(itemId);

    console.log(item);

    return item;
  }
}
