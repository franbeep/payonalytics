import {
  HistoryItems,
  MongoRepository,
  PayonMongoData,
  PayonPC,
  RagnApi,
} from '../providers';
import { subDays } from 'date-fns';
import { coveredItemIds, itemNames } from '@/server/constants';
import { sleep, rebuildName, joinCards } from '@/server/utils';
import { Inject, Service } from 'typedi';
import { Item } from '../resolvers/inputs';
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
    // const rawItems = await this.mongoRepository.getAllRawItems();

    // return rawItems.map(this.toDTO).flat();

    return this.mongoRepository.getProcessedItems();
  }

  async getFullItem(itemId: string) {
    const result = (await this.mongoRepository.getRawItemByItemId(itemId))!;

    return this.toDTO(result);
  }

  async getOneItemFromPayon(itemId: string) {
    const item = await this.payonPC.getItemHistory(String(itemId));

    return item;
  }

  async processItems() {
    const rawItems = await this.mongoRepository.getAllRawItems();

    const processedItems = rawItems.map(this.toDTO).flat();

    await this.mongoRepository.saveProcessedItems(processedItems);
  }

  private toDTO({ itemId, itemName, rawData, modifiedAt }: PayonMongoData) {
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
            cards: joinCards(omit(i, 'r')),
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
    }, {} as Record<string, Pick<Item, 'itemId' | 'name' | 'modifiedAt' | 'refinement' | 'cards' | 'sellHist' | 'vendHist'>>);

    return Object.values(itemsArray);
  }
}
