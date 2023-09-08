import type { Db as Database, Filter, IntegerType } from 'mongodb';
import { HistoryItems } from './payonPC';
import { Item } from '../resolvers/inputs';

const PAYON_STORIES_COLLECTION_NAME = 'payonstories';
const LIST_OF_ITEM_IDS_COLLECTION_NAME = 'listofitemids';
const PROCESSED_ITEMS_COLLECTION_NAME = 'processeditems';

export type PayonMongoData = {
  itemId: string;
  itemName: string;
  modifiedAt: Date;
  rawData: {
    vendHist: HistoryItems;
    sellHist: HistoryItems;
  };
};
export type ItemListMongoData = {
  createdAt: Date;
  itemIds: Array<number>;
};

export class MongoRepository {
  constructor(private database: Database) {}

  /* payon stories methods */

  async saveRawItem(data: PayonMongoData) {
    const collection = this.getPayonCollection();
    await collection.insertOne(data);
  }

  async saveRawItems(items: Array<PayonMongoData>) {
    const collection = this.getPayonCollection();
    await collection.insertMany(items);
  }

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

  async getAllRawItems() {
    const collection = this.getPayonCollection();
    const result = await collection
      .aggregate<{
        _id: string;
        first: PayonMongoData;
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

  async deleteRawItems(filter: Filter<PayonMongoData>) {
    const collection = this.getPayonCollection();
    await collection.deleteMany(filter);
  }

  async saveProcessedItems(
    items: Pick<
      Item,
      | 'itemId'
      | 'modifiedAt'
      | 'name'
      | 'refinement'
      | 'cards'
      | 'sellHist'
      | 'vendHist'
    >[],
  ) {
    const collection = this.getProcessedItemsCollection();
    await collection.insertMany(items);
  }

  async getProcessedItems() {
    const collection = this.getProcessedItemsCollection();
    return await collection.find().toArray();
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

  async deleteListOfItems(filter: Filter<ItemListMongoData>) {
    const collection = this.getListItemIdsCollection();
    await collection.deleteMany(filter);
  }

  /* collection methods */

  private getPayonCollection() {
    return this.database.collection<PayonMongoData>(
      PAYON_STORIES_COLLECTION_NAME,
    );
  }

  private getListItemIdsCollection() {
    return this.database.collection<ItemListMongoData>(
      LIST_OF_ITEM_IDS_COLLECTION_NAME,
    );
  }

  private getProcessedItemsCollection() {
    return this.database.collection<
      Pick<
        Item,
        | 'itemId'
        | 'modifiedAt'
        | 'name'
        | 'refinement'
        | 'cards'
        | 'sellHist'
        | 'vendHist'
      >
    >(PROCESSED_ITEMS_COLLECTION_NAME);
  }
}
