// https://ragnapi.com/

import axios from 'axios';

type ItemInfo = {
  id: string;
  name: string;
  img: string;
};

export class RagnApi {
  async getMonsterInfo(monsterId: string) {
    const { data } = await axios.get(
      new URL(`/monsters/${monsterId}`, process.env.RAGNAPI_ENDPOINT!).href,
    );

    if (!data) throw Error('getMonsterInfo failed');

    return data;
  }
  async getItemInfo(itemId: string) {
    try {
      const { data } = await axios.get<ItemInfo>(
        new URL(`/items/${itemId}`, process.env.RAGNAPI_ENDPOINT!).href,
      );

      return data;
    } catch (error) {
      console.error(error);

      return {
        id: '',
        name: '',
        img: '',
      };
    }
  }
}
