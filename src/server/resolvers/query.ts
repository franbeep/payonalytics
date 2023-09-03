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
import { Inject } from "typedi";

@Resolver()
export class ItemQueryResolver {
  constructor(
    @Inject()
    private itemService: ItemService
  ) {}

  @Query((returns) => Boolean)
  async items() {
    //
  }

  @Query((returns) => Boolean)
  test() {
    this.itemService.test();
    console.log(`test passed! resolver`);
    return true;
  }
}
