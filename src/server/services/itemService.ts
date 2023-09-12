import {
  HistoryItems,
  MongoRepository,
  PayonMongoData,
  PayonPC,
  RagnApi,
  VendingItemsMongoData,
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

    @Inject()
    private ragnApi: RagnApi,
  ) {}

  async refreshHistory(fullRefresh = false) {
    console.time(`[refreshHistory] Done!`);

    // delete old records
    if (fullRefresh) {
      console.log(`[refreshHistory] Deleting records...`);
      await this.mongoRepository.deleteRawItems({
        modifiedAt: { $lte: subDays(new Date(), 2) },
      });
      await this.mongoRepository.deleteListOfItems({
        createdAt: { $lte: subDays(new Date(), 2) },
      });
    }

    // get list of item ids
    const itemIds = fullRefresh
      ? coveredItemIds
      : (await this.mongoRepository.getListOfItems()).itemIds;

    // fetch new records
    console.log(`[refreshHistory] Fetching new records...`);
    const currentDate = new Date();

    let count = 1;
    const processedItems: Pick<
      ItemHistory,
      | 'itemId'
      | 'name'
      | 'modifiedAt'
      | 'refinement'
      | 'cards'
      | 'sellHist'
      | 'vendHist'
    >[] = [];
    for (const itemIdNumber of itemIds) {
      const itemId = String(itemIdNumber);

      console.log(`[refreshHistory] ${itemId} [${count++}/${itemIds.length}]`);

      // get item history
      const item = await this.payonPC.getItemHistory(itemId);

      if (item.vendHistory?.length || item.sellHistory?.length) {
        // ...and save if it has history

        const result = this.flattenItem({
          itemId: String(itemId),
          itemName: this.getItemName(itemId)!,
          modifiedAt: currentDate,
          rawData: {
            vendHist: item.vendHistory || [],
            sellHist: item.sellHistory || [],
          },
        });
        processedItems.push(...result);
      }

      await sleep(TIMEOUT);
    }

    this.mongoRepository.saveProcessedItems(processedItems);

    if (fullRefresh) this.refreshListOfItems();

    console.timeEnd(`[refreshHistory] Done!`);
  }

  async refreshListOfItems() {
    const items = await this.mongoRepository.getAllRawItems();

    const listOfItemIds = items.map(({ itemId }) => itemId);

    await this.mongoRepository.insertListOfItems(listOfItemIds.map(Number));
  }

  async refreshVendingItems() {
    console.time(`[refreshVendingItems] Done!`);

    // delete old records
    console.log(`[refreshVendingItems] Deleting records...`);
    await this.mongoRepository.deleteVendingItems({
      modifiedAt: { $lte: subDays(new Date(), 2) },
    });

    // get list of item ids
    const { itemIds } = await this.mongoRepository.getListOfItems();

    // fetch new records
    let count = 1;
    const listOfVendingItemsById: Array<VendingItemsMongoData> = [];
    console.log(`[refreshVendingItems] Fetching new records...`);
    for (const itemIdNumber of itemIds) {
      const itemId = String(itemIdNumber);

      console.log(
        `[refreshVendingItems] ${itemId} [${count++}/${itemIds.length}]`,
      );

      // get item history details
      const item = (await this.payonPC.getItemHistoryDetails(itemId)) || {};

      const { data } = item;

      if (!data) continue;
      const [firstRecord] = data;

      listOfVendingItemsById.push({
        itemId: firstRecord.id,
        refinement: `${firstRecord.refine}`,
        cards: joinCards({
          c0: firstRecord.card0,
          c1: firstRecord.card1,
          c2: firstRecord.card2,
          c3: firstRecord.card3,
        }),
        vendingData: data.map(i => ({
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
      });

      await sleep(TIMEOUT);
    }

    await this.mongoRepository.insertVendingItems(listOfVendingItemsById);

    console.timeEnd(`[refreshVendingItems] Done!`);
  }

  async getItems() {
    return this.mongoRepository.getProcessedItems();
  }

  async getFullItem(itemId: string) {
    return this.mongoRepository.getProcessedItem(itemId);
  }

  async getOneItemFromPayon(itemId: string) {
    const item = await this.payonPC.getItemHistory(String(itemId));

    return item;
  }

  async processItems() {
    const rawItems = await this.mongoRepository.getAllRawItems();
    const processedItems = rawItems.map(this.flattenItem).flat();
    await this.mongoRepository.saveProcessedItems(processedItems);
  }

  async getCurrentVendingItems() {
    return await this.mongoRepository.getVendingItems();
  }

  private flattenItem({
    itemId,
    itemName,
    rawData,
    modifiedAt,
  }: PayonMongoData) {
    const histMapFn = <T extends HistoryItems[number]>(hist: T) =>
      zipWith(
        Array<string>(hist.y.length).fill(hist.x),
        hist.y,
        hist.filter,
        (a, b, _i) => {
          // some old records doesn't contain refinement info
          const i = _i || { r: 0 };

          // some cards are not cards, they are enchants, or in the case of
          // pets, they are loyalty (crazy right?)
          const everyCardIsCard = Object.values(omit(i, 'r')).every(cardId => {
            const cardName = this.getItemName(cardId.toString());
            if (cardName && cardName.toLocaleLowerCase().includes('card'))
              return true;
            return false;
          });

          return {
            date: new Date(a),
            price: b,
            refinement: `${i.r}`,
            cards: everyCardIsCard ? joinCards(omit(i, 'r')) : '',
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
        itemId,
        name: itemName,
        modifiedAt,
        refinement,
        cards,
        sellHist: sellHist.map(h => pick(h, ['date', 'price'])),
        vendHist: vendHist.map(h => pick(h, ['date', 'price'])),
      };

      return acc;
    }, {} as Record<string, Pick<ItemHistory, 'itemId' | 'name' | 'modifiedAt' | 'refinement' | 'cards' | 'sellHist' | 'vendHist'>>);

    return Object.values(itemsArray);
  }

  private getItemName(itemId: string): string | null {
    const itemIdNumber = Number(itemId);

    if (isNaN(itemIdNumber)) return null;
    if (itemIdNumber < 0) return null;

    const name =
      itemNames[Number(itemId) as keyof typeof itemNames]?.trim() || '';
    if (!name.length) return null;

    return name;
  }
}
