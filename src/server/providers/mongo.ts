import type { Db as Database } from "mongodb";
import { HistoryItem } from "./payonPC";

const COLLECTION_NAME = "payonstories";
export type MongoData = {
  itemId: string;
  modifiedAt: Date;
  data: HistoryItem[number];
};

export class MongoRepository {
  constructor(private database: Database) {}

  async saveRawItem(item: HistoryItem[number] & { id: string }) {
    const collection = this.getPayonCollection();
    await collection.insertOne({
      itemId: item.id,
      modifiedAt: new Date(),
      data: item,
    });
  }

  async getRawItemByItemId(itemId: string) {
    const collection = this.getPayonCollection();
    return await collection.findOne({
      itemId,
    });
  }

  private getPayonCollection() {
    return this.database.collection<MongoData>(COLLECTION_NAME);
  }
}
