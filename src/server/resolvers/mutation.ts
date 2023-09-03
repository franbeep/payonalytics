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

// TODO: need item class here
@Resolver()
export class ItemMutationResolver {
  constructor(private itemService: ItemService) {}

  @Mutation((returns) => Boolean)
  async refreshHistory() {
    await this.itemService.refreshHistory();

    return true;
  }
}
