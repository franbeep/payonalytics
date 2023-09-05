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
export class ItemQueryResolver {
  @Inject() private itemService!: ItemService;

  @Query((returns) => [Item])
  async items() {
    return await this.itemService.getItems();
  }
}
