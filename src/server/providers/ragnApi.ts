import axios from 'axios';

type ItemInfo = {
  id?: string;
  name?: string;
  img?: string;
};

export class RagnApi {
  async getMonsterInfo(monsterId: string) {
    const { data } = await axios.get(
      `${process.env.RAGNAPI_ENDPOINT!}/monsters/${monsterId}`,
    );

    if (!data) throw Error('getMonsterInfo failed');

    return data;
  }
  async getItemInfo(itemId: string) {
    try {
      const { data } = await axios.get<ItemInfo>(
        `${process.env.RAGNAPI_ENDPOINT!}/items/${itemId}`,
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
