import type { Db as Database, Filter } from 'mongodb';
import { HistoryItems } from './payonPC';
import { ItemHistory, ItemVending } from '../resolvers/inputs';
import { subDays } from 'date-fns';
import { groupBy, orderBy } from 'lodash';

const PAYON_STORIES_COLLECTION_NAME = 'payonstories';
const LIST_OF_ITEM_IDS_COLLECTION_NAME = 'listofitemids';
const PROCESSED_ITEMS_COLLECTION_NAME = 'processeditems';
const VENDING_ITEMS_COLLECTION_NAME = 'vendingitems';

export type RawHistoryItemsMongoData = {
  itemId: string;
  itemName: string;
  createdAt: Date;
  rawData: {
    vendHist: HistoryItems;
    sellHist: HistoryItems;
  };
};
export type ItemListMongoData = {
  createdAt: Date;
  itemIds: Array<number>;
};
export type HistoryItemsMongoData = Pick<
  ItemHistory,
  'itemId' | 'name' | 'refinement' | 'cards' | 'sellHist' | 'vendHist'
> & { createdAt?: Date };
export type VendingItemsMongoData = Pick<
  ItemVending,
  'itemId' | 'refinement' | 'cards' | 'vendingData'
> & { createdAt?: Date };

export class MongoRepository {
  constructor(private database: Database) {}

  /* payon stories methods: raw data */

  /**
   * @deprecated: opt to insert all data already processed
   */
  async insertRawItem(data: RawHistoryItemsMongoData) {
    const collection = this.getPayonCollection();
    await collection.insertOne(data);
  }

  /**
   * @deprecated: opt to insert all data already processed
   */
  async insertRawItems(items: Array<RawHistoryItemsMongoData>) {
    const collection = this.getPayonCollection();
    await collection.insertMany(items);
  }

  /**
   * @deprecated: opt to use already processed data
   */
  async getRawItemByItemId(itemId: string) {
    const collection = this.getPayonCollection();
    const [first] = await collection
      .find({
        itemId,
      })
      .sort({ _id: -1 })
      .limit(1)
      .toArray();

    return first;
  }

  /**
   * @deprecated: opt to use already processed data
   */
  async getAllRawItems() {
    const collection = this.getPayonCollection();
    const result = await collection
      .aggregate<{
        _id: string;
        first: RawHistoryItemsMongoData;
      }>(
        [
          {
            $sort: {
              _id: -1,
            },
          },
          {
            $group: {
              _id: '$itemId',
              first: { $first: '$$ROOT' },
            },
          },
        ],
        {
          allowDiskUse: true,
        },
      )
      .toArray();

    return result.map(item => item.first);
  }

  /**
   * @deprecated: opt to use already processed data
   */
  async deleteRawItems(filter: Filter<RawHistoryItemsMongoData>) {
    const collection = this.getPayonCollection();
    await collection.deleteMany(filter);
  }

  /* payon stories methods: list of processed items */

  async insertProcessedItems(
    items: Omit<HistoryItemsMongoData, 'createdAt'>[],
  ) {
    const collection = this.getProcessedItemsCollection();
    const today = new Date();
    await collection.insertMany(
      items.map(item => ({ ...item, createdAt: today })),
    );
  }

  async getProcessedItems(filter?: Filter<VendingItemsMongoData>) {
    const collection = this.getProcessedItemsCollection();
    const result = await collection
      .aggregate<{
        _id: string;
        first: HistoryItemsMongoData;
      }>(
        [
          ...(filter
            ? [
                {
                  $match: {
                    ...filter,
                  },
                },
              ]
            : []),
          {
            $sort: {
              _id: -1,
            },
          },
          {
            $group: {
              _id: {
                id: '$itemId',
                ref: '$refinement',
                cards: '$cards',
              },
              first: { $first: '$$ROOT' },
            },
          },
        ],
        {
          allowDiskUse: true,
        },
      )
      .toArray();

    return result.map(r => r.first);
  }

  async dataLoadProcessedItems(itemIds: number[]) {
    const result = await this.getProcessedItems({
      itemId: {
        $in: itemIds,
      },
    });

    const groupedByItemId = groupBy(result, 'itemId');

    return itemIds.map(itemId => groupedByItemId[itemId] || []);
  }

  async getProcessedItem(itemId: number) {
    const collection = this.getProcessedItemsCollection();
    return await collection.findOne({
      itemId,
    });
  }

  async deleteOldProcessedItems() {
    const collection = this.getProcessedItemsCollection();
    await collection.deleteMany({
      createdAt: { $lte: subDays(new Date(), 2) },
    });
  }

  /* list of item ids methods */

  async getListOfItems() {
    const collection = this.getListItemIdsCollection();
    const [first] = await collection
      .find({})
      .sort({ _id: -1 })
      .limit(1)
      .toArray();

    return first;
  }

  async insertListOfItems(itemIds: number[]) {
    const collection = this.getListItemIdsCollection();
    await collection.insertOne({
      createdAt: new Date(),
      itemIds,
    });
  }

  async deleteOldListOfItems() {
    const collection = this.getListItemIdsCollection();
    await collection.deleteMany({
      createdAt: { $lte: subDays(new Date(), 2) },
    });
  }

  /* vending items methods */

  async getVendingItems(filter?: Filter<VendingItemsMongoData>) {
    const collection = this.getVendingItemsCollection();
    const result = await collection
      .aggregate<{
        _id: string;
        first: VendingItemsMongoData;
      }>(
        [
          ...(filter
            ? [
                {
                  $match: {
                    ...filter,
                  },
                },
              ]
            : []),
          {
            $sort: {
              _id: -1,
            },
          },
          {
            $group: {
              _id: {
                id: '$itemId',
                ref: '$refinement',
                cards: '$cards',
              },
              first: { $first: '$$ROOT' },
            },
          },
        ],
        {
          allowDiskUse: true,
        },
      )
      .toArray();

    return result.map(item => item.first);
  }

  async dataLoadVendingItems(itemIds: number[]) {
    const result = await this.getVendingItems({
      itemId: {
        $in: itemIds,
      },
    });

    const groupedByItemId = groupBy(result, 'itemId');

    return itemIds.map(itemId => groupedByItemId[itemId] || []);
  }

  async getOneVendingItem(itemId: number) {
    return await this.getVendingItems({
      itemId,
    });
  }

  async insertVendingItems(
    vendingItems: Array<Omit<VendingItemsMongoData, 'createdAt'>>,
  ) {
    const collection = this.getVendingItemsCollection();
    await collection.insertMany(
      vendingItems.map(item => ({
        ...item,
        createdAt: new Date(),
      })),
    );
  }

  async deleteOldVendingItems() {
    const collection = this.getVendingItemsCollection();
    await collection.deleteMany({
      createdAt: { $lte: subDays(new Date(), 2) },
    });
  }

  /* collection methods */

  private getPayonCollection() {
    return this.database.collection<RawHistoryItemsMongoData>(
      PAYON_STORIES_COLLECTION_NAME,
    );
  }

  private getListItemIdsCollection() {
    return this.database.collection<ItemListMongoData>(
      LIST_OF_ITEM_IDS_COLLECTION_NAME,
    );
  }

  private getProcessedItemsCollection() {
    return this.database.collection<HistoryItemsMongoData>(
      PROCESSED_ITEMS_COLLECTION_NAME,
    );
  }

  private getVendingItemsCollection() {
    return this.database.collection<VendingItemsMongoData>(
      VENDING_ITEMS_COLLECTION_NAME,
    );
  }
}
