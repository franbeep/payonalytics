// https://tools.payonstories.com/pc

import axios from "axios";

import { buildParams } from "@/server/utils";

type GetItemInfoResponse = {
  isList: boolean;
  items: Array<{
    name: string;
    description: string;
    id: string;
    refine: boolean;
    slots: number;
  }>;
};

type AvgItems = Array<{
  x: string; // date
  y: number;
}>;
export type HistoryItems = Array<{
  x: string; // date
  y: Array<number>;
  filter: Array<{
    r: number; // refinement
    c0: number; // cards 0-3
    c1: number;
    c2: number;
    c3: number;
  }>;
}>;
type getItemHistoryResponse = {
  error: string;
  vendAvg?: AvgItems;
  vendHistory?: HistoryItems;
  sellAvg?: AvgItems;
  sellHistory?: HistoryItems;
  lastUpdated: number; // number date
};

export class PayonPC {
  async getItemInfo({ id, name }: { id?: string; name?: string }) {
    if (!id && !name)
      throw Error("Invalid request: Either ID or Name must be defined");

    const { data } = await axios.get<GetItemInfoResponse>(
      `${process.env.PAYON_STORIES_ENDPOINT}/item${buildParams({
        ...(id ? { id } : {}),
        ...(name ? { name } : {}),
      })}`
    );

    if (!data) throw Error("getItemInfo failed");

    return data;
  }

  async getItemHistory(id: string): Promise<getItemHistoryResponse> {
    try {
      const { data } = await axios.get<getItemHistoryResponse>(
        `${process.env.PAYON_STORIES_ENDPOINT}/history${buildParams({ id })}`
      );

      return data;
    } catch (error) {
      // id doesn´t not exist
      // TODO
      return {
        error: "request failed",
        lastUpdated: 0,
      };
    }
  }
}
