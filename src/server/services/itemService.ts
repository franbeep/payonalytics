import { MongoRepository, PayonPC, RagnApi } from "../providers";
import { subDays } from "date-fns";
import { coveredItemIds } from "@/server/constants";
import sleep from "../utils/sleep";
import { Inject } from "typedi";

const TIMEOUT = 300;

export class ItemService {
  constructor(
    @Inject()
    private mongoRepository: MongoRepository,

    @Inject()
    private payonPC: PayonPC,

    @Inject()
    ragnApi: RagnApi
  ) {}

  async refreshHistory() {
    // delete old records
    console.log(`[refreshHistory] Deleting records...`);
    await this.mongoRepository.deleteRawItems({
      modifiedAt: { $le: subDays(new Date(), 1) },
    });

    // fetch new ones
    console.log(`[refreshHistory] Fetching new records...`);
    const currentDate = new Date();
    const promises = coveredItemIds.map(async (itemId) => {
      const item = await this.payonPC.getItemHistory(String(itemId));

      if (item.vendHistory.length || item.sellHistory.length) {
        // ...and save if it has history
        await this.mongoRepository.saveRawItem(
          String(itemId),
          item.vendHistory,
          currentDate
        );
      }

      await sleep(TIMEOUT);
    });

    console.log(`[refreshHistory] Done!`);
    await Promise.all(promises);
  }

  async getItems() {
    return this.mongoRepository.getAllRawItems();
  }

  async getFullItem() {
    //
  }

  test() {
    this.mongoRepository.test();
    console.log(`test passed! service`);
  }
}
