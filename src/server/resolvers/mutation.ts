import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { ItemService } from "../services/itemService";
import { Inject, Service } from "typedi";
import { Item } from "./inputs";

@Resolver(Item)
@Service()
export class ItemMutationResolver {
  @Inject() private itemService!: ItemService;

  @Mutation((returns) => Boolean)
  async refreshHistory() {
    await this.itemService.refreshHistory();

    return true;
  }

  @Mutation((returns) => Boolean)
  async fullRefreshHistory() {
    await this.itemService.refreshHistory(true);

    return true;
  }

  @Mutation((returns) => Boolean)
  async refreshListOfItems() {
    await this.itemService.refreshListOfItems();

    return true;
  }
}
