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

@Resolver()
@Service()
export class ItemQueryResolver {
  @Inject() private itemService!: ItemService;

  @Query((returns) => Boolean)
  async items() {
    //
  }

  /* tests */

  @Query((returns) => Boolean)
  async getOneItemFromPayon(@Arg("itemId") itemId: string) {
    const result = await this.itemService.getOneItemFromPayon(itemId);

    console.log(result);

    return true;
  }
}
