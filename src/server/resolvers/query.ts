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
import { Item } from './inputs';

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

  @Query(returns => Item)
  async item(@Arg('itemId') itemId: string) {
    const item = await this.itemService.getFullItem(itemId);

    console.log(item);

    return item;
  }
}
