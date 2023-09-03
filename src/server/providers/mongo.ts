import type { Db as Database, Filter } from "mongodb";
import { HistoryItems } from "./payonPC";

const COLLECTION_NAME = "payonstories";
export type MongoData = {
  itemId: string;
  modifiedAt: Date;
  data: HistoryItems;
};

export class MongoRepository {
  constructor(private database: Database) {}

  async saveRawItem(itemId: string, item: HistoryItems, modifiedAt: Date) {
    const collection = this.getPayonCollection();
    await collection.insertOne({
      itemId,
      modifiedAt,
      data: item,
    });
  }

  async saveRawItems(items: Array<{ id: string; data: HistoryItems }>) {
    const collection = this.getPayonCollection();
    await collection.insertMany(
      items.map((item) => ({
        itemId: item.id,
        modifiedAt: new Date(),
        data: item.data,
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
        first: MongoData;
      }>([
        {
          $sort: {
            modifiedAt: -1,
          },
        },
        {
          $group: {
            _id: "modifiedAt",
            // items: { $push: "$$ROOT" },
            first: { $first: "$modifiedAt" },
          },
        },
      ])
      .toArray();

    return result.map((item) => item.first);
  }

  async deleteRawItems(filter: Filter<MongoData>) {
    const collection = this.getPayonCollection();
    await collection.deleteMany(filter);
  }

  private getPayonCollection() {
    return this.database.collection<MongoData>(COLLECTION_NAME);
  }
}
