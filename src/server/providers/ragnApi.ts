// https://ragnapi.com/

import axios from "axios";

export class RagnApi {
  async getMonsterInfo(monsterId: string) {
    const { data } = await axios.get(
      new URL(`/monsters/${monsterId}`, process.env.RAGNAPI_ENDPOINT!).href
    );

    if (!data) throw Error("getMonsterInfo failed");

    return data;
  }
  async getItemInfo(itemId: string) {
    const { data } = await axios.get(
      new URL(`/items/${itemId}`, process.env.RAGNAPI_ENDPOINT!).href
    );

    if (!data) throw Error("getItemInfo failed");

    return data;
  }
}
