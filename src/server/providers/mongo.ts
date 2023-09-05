import type { Db as Database, Filter, IntegerType } from "mongodb";
import { HistoryItems } from "./payonPC";

const PAYON_STORIES_COLLECTION_NAME = "payonstories";
const LIST_OF_ITEM_IDS_COLLECTION_NAME = "listofitemids";
export type PayonMongoData = {
  itemId: string;
  modifiedAt: Date;
  vendHist: HistoryItems;
  sellHist: HistoryItems;
};
export type ItemListMongoData = {
  createdAt: Date;
  itemIds: Array<number>;
};

export class MongoRepository {
  constructor(private database: Database) {}

  /* payon stories methods */

  async saveRawItem(
    itemId: string,
    data: { vendHist: HistoryItems; sellHist: HistoryItems },
    modifiedAt: Date
  ) {
    const collection = this.getPayonCollection();
    await collection.insertOne({
      itemId,
      modifiedAt,
      ...data,
    });
  }

  async saveRawItems(
    items: Array<{
      id: string;
      data: { vendHist: HistoryItems; sellHist: HistoryItems };
    }>
  ) {
    const collection = this.getPayonCollection();
    await collection.insertMany(
      items.map((item) => ({
        itemId: item.id,
        modifiedAt: new Date(),
        ...item.data,
      }))
    );
  }

  async getRawItemByItemId(itemId: string) {
    const collection = this.getPayonCollection();
    return await collection.findOne({
      itemId,
    });
  }

  async getAllRawItems() {
    const collection = this.getPayonCollection();
    const result = await collection
      .aggregate<{
        _id: string;
        first: PayonMongoData;
      }>([
        {
          $sort: {
            modifiedAt: -1,
          },
        },
        {
          $group: {
            _id: "$itemId",
            first: { $first: "$$ROOT" },
          },
        },
      ])
      .toArray();

    return result.map((item) => item.first);
  }

  async deleteRawItems(filter: Filter<PayonMongoData>) {
    const collection = this.getPayonCollection();
    await collection.deleteMany(filter);
  }

  /* list of item ids methods */

  async getListOfItems() {
    const collection = this.getListItemIdsCollection();
    const [first] = await collection
      .find({})
      .sort({ _id: 1 })
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
      PAYON_STORIES_COLLECTION_NAME
    );
  }

  private getListItemIdsCollection() {
    return this.database.collection<ItemListMongoData>(
      LIST_OF_ITEM_IDS_COLLECTION_NAME
    );
  }
}
