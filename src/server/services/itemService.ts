import {
  MongoRepository,
  PayonMongoData,
  PayonPC,
  RagnApi,
} from '../providers';
import { subDays } from 'date-fns';
import { coveredItemIds, itemNames } from '@/server/constants';
import { sleep, rebuildName } from '@/server/utils';
import { Inject, Service } from 'typedi';
import { Item } from '../resolvers/inputs';

const TIMEOUT = 300;

@Service()
export class ItemService {
  constructor(
    @Inject()
    private mongoRepository: MongoRepository,

    @Inject()
    private payonPC: PayonPC,

    @Inject()
    private ragnApi: RagnApi,
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
    for (const itemIdNumber of itemIds) {
      const itemId = String(itemIdNumber);

      console.log(`[refreshHistory] ${itemId} [${count++}/${itemIds.length}]`);

      // get item history
      const item = await this.payonPC.getItemHistory(itemId);

      if (item.vendHistory?.length || item.sellHistory?.length) {
        // ...and save if it has history
        await this.mongoRepository.saveRawItem({
          itemId: String(itemId),
          itemName: itemNames[itemIdNumber as keyof typeof itemNames],
          modifiedAt: currentDate,
          rawData: {
            vendHist: item.vendHistory || [],
            sellHist: item.sellHistory || [],
          },
        });
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

    console.log('rawItems.length', rawItems.length);

    return rawItems.map(this.toDTO);
  }

  async getFullItem(itemId: string) {
    const result = (await this.mongoRepository.getRawItemByItemId(itemId))!;

    return this.toDTO(result);
  }

  async getOneItemFromPayon(itemId: string) {
    const item = await this.payonPC.getItemHistory(String(itemId));

    return item;
  }

  private toDTO(rawItem: PayonMongoData) {
    const { itemId: id, itemName: name, rawData, ...rest } = rawItem;

    return {
      ...rest,
      id,
      name,
      rawData: {
        ...rawItem,
        ...rawData,
      },
    } satisfies Omit<Item, 'iconURL'>;
  }
}
