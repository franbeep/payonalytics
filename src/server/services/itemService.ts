import {
  HistoryItems,
  MongoRepository,
  RawHistoryItemsMongoData,
  PayonPC,
  RagnApi,
  VendingItemsMongoData,
  HistoryItemsMongoData,
} from '../providers';
import { subDays } from 'date-fns';
import { coveredItemIds, itemNames } from '@/server/constants';
import { sleep, rebuildName, joinCards } from '@/server/utils';
import { Inject, Service } from 'typedi';
import { ItemHistory } from '../resolvers/inputs';
import { omit, zip, zipWith, groupBy, entries, pick } from 'lodash';

const TIMEOUT = 300;

@Service()
export class ItemService {
  constructor(
    @Inject()
    private mongoRepository: MongoRepository,

    @Inject()
    private payonPC: PayonPC,
  ) {}

  /* cron refresh methods */

  async refreshHistory(
    fullRefresh = false,
    cronJobInfo?: { take: number; offset: number },
  ) {
    console.time(`[refreshHistory] Done!`);

    // get list of item ids
    let itemIds = fullRefresh
      ? coveredItemIds
      : (await this.mongoRepository.getListOfItems()).itemIds;

    // slice if cronjob
    if (cronJobInfo) {
      const { take, offset } = cronJobInfo;
      itemIds = itemIds.slice(offset, offset + take);
    }

    if (!itemIds.length) {
      console.timeEnd(`[refreshHistory] Done!`);
      return 'nothing to be done';
    }

    // fetch new records
    console.info(`[refreshHistory] Fetching new records...`);
    const currentDate = new Date();

    let count = 1;
    const processedItems: Omit<HistoryItemsMongoData, 'createdAt'>[] = [];
    for (const itemIdNumber of itemIds) {
      const itemId = String(itemIdNumber);

      console.info(`[refreshHistory] ${itemId} [${count++}/${itemIds.length}]`);

      // get item history
      const item = await this.payonPC.getItemHistory(itemId);

      if (item.vendHistory?.length || item.sellHistory?.length) {
        // process item
        const result = this.flattenRawItem({
          itemId: String(itemId),
          itemName: this.getItemName(itemId)!,
          createdAt: currentDate,
          rawData: {
            vendHist: item.vendHistory || [],
            sellHist: item.sellHistory || [],
          },
        });
        processedItems.push(...result);
      }

      // cronjob needs to be fast, < 10s
      if (!cronJobInfo) {
        await sleep(TIMEOUT);
      }
    }

    // save processed items
    this.mongoRepository.insertProcessedItems(processedItems);

    // delete old records
    this.mongoRepository.deleteOldProcessedItems();

    // refresh list of items if we're doing a full refresh
    if (fullRefresh) {
      console.info(`[refreshHistory] Deleting records...`);
      await this.mongoRepository.deleteOldListOfItems();
      await this.refreshListOfItems();
    }

    console.timeEnd(`[refreshHistory] Done!`);
    return `Processed ${itemIds} ids`;
  }

  async refreshListOfItems() {
    const items = await this.mongoRepository.getProcessedItems();

    const listOfItemIds = items.map(({ itemId }) => Number(itemId));

    await this.mongoRepository.insertListOfItems(
      Array.from(new Set(listOfItemIds)),
    );
  }

  async refreshVendingItems(cronJobInfo?: { take: number; offset: number }) {
    console.time(`[refreshVendingItems] Done!`);

    // delete old records
    console.info(`[refreshVendingItems] Deleting records...`);
    await this.mongoRepository.deleteOldVendingItems();

    // get list of item ids
    let { itemIds } = await this.mongoRepository.getListOfItems();

    // slice if cronjob
    if (cronJobInfo) {
      const { take, offset } = cronJobInfo;
      itemIds = itemIds.slice(offset, offset + take);
    }

    if (!itemIds.length) {
      console.timeEnd(`[refreshVendingItems] Done!`);
      return 'nothing to be done';
    }

    // fetch new records
    let count = 1;
    const listOfVendingItemsById: Array<
      Omit<VendingItemsMongoData, 'createdAt'>
    > = [];
    console.info(`[refreshVendingItems] Fetching new records...`);
    for (const itemIdNumber of itemIds) {
      const itemId = String(itemIdNumber);

      console.info(
        `[refreshVendingItems] ${itemId} [${count++}/${itemIds.length}]`,
      );

      // get item history details
      const itemVendingDetails =
        (await this.payonPC.getItemHistoryDetails(itemId)) || {};

      const { data } = itemVendingDetails;

      if (!data) continue;

      // transform for better structure
      const transformedData = data.map(item => ({
        itemId,
        refinement: `${item.refine}`,
        cards: this.generateCardString(
          pick(item, ['card0', 'card1', 'card2', 'card3']),
        ),
        data: item,
      }));

      // group by ref and cards
      const groupedData = groupBy(
        transformedData,
        item => `${item.cards}-${item.refinement}`,
      );

      listOfVendingItemsById.push(
        ...Object.values(groupedData).map(item => {
          const [{ itemId, refinement, cards }] = item;

          const vendingDataArr = item.map(i => i.data);

          return {
            itemId: Number(itemId),
            refinement: Number(refinement || 0),
            cards,
            vendingData: vendingDataArr.map(i => ({
              listedDate: new Date(i.time),
              shopName: i.shop_name,
              amount: i.amount,
              price: i.price,
              coordinates: {
                map: i.map,
                x: i.x,
                y: i.y,
              },
            })),
          };
        }),
      );

      // cronjob needs to be fast, < 10s
      if (!cronJobInfo) {
        await sleep(TIMEOUT);
      }
    }

    await this.mongoRepository.deleteOldVendingItems();

    await this.mongoRepository.insertVendingItems(listOfVendingItemsById);

    console.timeEnd(`[refreshVendingItems] Done!`);
    return `Processed ${itemIds} ids`;
  }

  /**
   * @deprecated should not be used anymore
   */
  async processItems() {
    const rawItems = await this.mongoRepository.getAllRawItems();
    const processedItems = rawItems.map(this.flattenRawItem).flat();
    await this.mongoRepository.insertProcessedItems(processedItems);
  }

  /* crud methods */

  async getItems(options?: { take?: number; offset?: number }) {
    if (options && options.offset !== undefined && options.take !== undefined) {
      const { take, offset } = options;
      const { itemIds } = await this.mongoRepository.getListOfItems();
      const filteredItemIds = itemIds.slice(offset, offset + take);

      if (!filteredItemIds.length) return [];

      return await this.mongoRepository.getProcessedItems({
        itemId: { $in: filteredItemIds },
      });
    }

    return this.mongoRepository.getProcessedItems();
  }

  async getFullItem(itemId: number) {
    return this.mongoRepository.getProcessedItem(itemId);
  }

  async getCurrentVendingItems(options?: { take?: number; offset?: number }) {
    if (options && options.offset !== undefined && options.take !== undefined) {
      const { take, offset } = options;
      const { itemIds } = await this.mongoRepository.getListOfItems();
      const filteredItemIds = itemIds.slice(offset, offset + take);

      if (!filteredItemIds.length) return [];

      return await this.mongoRepository.getVendingItems({
        itemId: { $in: filteredItemIds },
      });
    }

    return await this.mongoRepository.getVendingItems();
  }

  async getVendingItem(itemId: number) {
    return await this.mongoRepository.getOneVendingItem(itemId);
  }

  // aux functions

  async hasMoreIds({ take, offset }: { take?: number; offset?: number }) {
    if (take === undefined || offset === undefined) return false;

    const { itemIds } = await this.mongoRepository.getListOfItems();
    const filteredItemIds = itemIds.slice(offset, offset + take);
    if (filteredItemIds.length > 0) return true;
    return false;
  }

  private flattenRawItem({
    itemId,
    itemName,
    rawData,
  }: RawHistoryItemsMongoData) {
    const histMapFn = <T extends HistoryItems[number]>(hist: T) =>
      zipWith(
        Array<string>(hist.y.length).fill(hist.x),
        hist.y,
        hist.filter,
        (a, b, _i) => {
          // some old records doesn't contain refinement info
          const i = _i || { r: 0 };

          return {
            date: new Date(a),
            price: b,
            refinement: `${i.r}`,
            cards: this.generateCardString(omit(i, 'r')),
          };
        },
      );

    const group = (hist: ReturnType<typeof histMapFn>) =>
      groupBy(hist, item => `${item.refinement}-${item.cards}`);

    // separate into a better format

    const sellHistZipped = rawData.sellHist.map(histMapFn).flat();
    const vendHistZipped = rawData.vendHist.map(histMapFn).flat();

    // group by refinement/cards

    const sellHistGroupedByRefCards = group(sellHistZipped);
    const vendHistGroupedByRefCards = group(vendHistZipped);

    // flatten & return

    const refinamentCardsSet = new Set<string>();
    Object.keys(sellHistGroupedByRefCards).forEach(key =>
      refinamentCardsSet.add(key),
    );
    Object.keys(vendHistGroupedByRefCards).forEach(key =>
      refinamentCardsSet.add(key),
    );

    const itemsArray = Array.from(refinamentCardsSet).reduce((acc, key) => {
      const [refinement, cards] = key.split('-');

      const sellHist = sellHistGroupedByRefCards[key] || [];
      const vendHist = vendHistGroupedByRefCards[key] || [];

      acc[key] = {
        itemId: Number(itemId),
        name: itemName,
        refinement: Number(refinement || 0),
        cards,
        sellHist: sellHist.map(h => pick(h, ['date', 'price'])),
        vendHist: vendHist.map(h => pick(h, ['date', 'price'])),
      };

      return acc;
    }, {} as Record<string, Omit<HistoryItemsMongoData, 'createdAt'>>);

    return Object.values(itemsArray);
  }

  getItemName(itemId: string | number): string | null {
    const itemIdNumber = Number(itemId);

    if (isNaN(itemIdNumber)) return null;
    if (itemIdNumber < 0) return null;

    const name =
      itemNames[Number(itemId) as keyof typeof itemNames]?.trim() || '';
    if (!name.length) return null;

    return name;
  }

  generateCardString(obj: Record<string, string | number>) {
    const values = Object.values(obj).sort().filter(Boolean);

    if (!values.length) return '';

    // some cards are not cards, they are enchants, or in the case of
    // pets, they are loyalty
    const everyCardIsCard = values.every(cardId => {
      const cardName = this.getItemName(cardId.toString());
      if (cardName && cardName.toLocaleLowerCase().includes('card'))
        return true;
      return false;
    });

    if (everyCardIsCard) return values.map(this.getItemName).join(', ');
    return '';
  }
}
