import { MongoRepository, PayonPC, RagnApi } from "../providers";
import { subDays } from "date-fns";
import { coveredItemIds } from "@/server/constants";
import sleep from "../utils/sleep";
import { Inject, Service } from "typedi";
import { Item } from "../resolvers/inputs";

const TIMEOUT = 300;

@Service()
export class ItemService {
  constructor(
    @Inject()
    private mongoRepository: MongoRepository,

    @Inject()
    private payonPC: PayonPC,

    @Inject()
    ragnApi: RagnApi
  ) {}

  async refreshHistory(fullRefresh = false) {
    console.time(`[refreshHistory] Done!`);

    // delete old records
    console.log(`[refreshHistory] Deleting records...`);
    await this.mongoRepository.deleteRawItems({
      modifiedAt: { $lte: subDays(new Date(), 1) },
    });
    await this.mongoRepository.deleteListOfItems({
      createdAt: { $lte: subDays(new Date(), 1) },
    });

    // get list of item ids
    const itemIds = fullRefresh
      ? coveredItemIds
      : (await this.mongoRepository.getListOfItems()).itemIds;

    // fetch new records
    console.log(`[refreshHistory] Fetching new records...`);
    const currentDate = new Date();

    let count = 1;
    const listOfItemIds = [];
    for (const itemId of itemIds) {
      console.log(`[refreshHistory] ${itemId} [${count++}/${itemIds.length}]`);

      const item = await this.payonPC.getItemHistory(String(itemId));

      // TODO: add item title, description, etc. from ragnApi

      if (item.vendHistory?.length || item.sellHistory?.length) {
        // ...and save if it has history
        listOfItemIds.push(itemId);
        await this.mongoRepository.saveRawItem(
          String(itemId),
          {
            vendHist: item.vendHistory || [],
            sellHist: item.sellHistory || [],
          },
          currentDate
        );
      }

      await sleep(TIMEOUT);
    }

    console.timeEnd(`[refreshHistory] Done!`);
  }

  async refreshListOfItems() {
    const items = await this.mongoRepository.getAllRawItems();

    const listOfItemIds = items.map(({ itemId }) => itemId);

    await this.mongoRepository.insertListOfItems(listOfItemIds.map(Number));
  }

  async getItems() {
    const rawItems = await this.mongoRepository.getAllRawItems();

    return rawItems.map(
      (item) =>
        ({
          id: item.itemId,
          title: "no name",
          description: "no desc",
          shouldIByIt: false,
          modifiedAt: item.modifiedAt,
        } satisfies Item)
    );
  }

  async getFullItem() {
    // TODO
  }

  async getOneItemFromPayon(itemId: string) {
    const item = await this.payonPC.getItemHistory(String(itemId));

    return item;
  }
}
