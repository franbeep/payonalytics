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

// TODO: need item class here
@Resolver()
@Service()
export class ItemMutationResolver {
  @Inject() private itemService!: ItemService;

  @Mutation((returns) => Boolean)
  async refreshHistory() {
    await this.itemService.refreshHistory();

    return true;
  }
}
