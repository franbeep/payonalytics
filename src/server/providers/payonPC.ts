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

type AvgItem = Array<{
  x: string; // date
  y: number;
}>;
export type HistoryItem = Array<{
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
  vendAvg: AvgItem;
  vendHistory: HistoryItem;
  sellAvg: AvgItem;
  sellHistory: HistoryItem;
  lastUpdated: number; // number date
};

export class PayonPC {
  getItemInfo({ id, name }: { id?: string; name?: string }) {
    if (!id && !name)
      throw Error("Invalid request: Either ID or Name must be defined");

    return axios.get<GetItemInfoResponse>(
      `${process.env.PAYON_STORIES_ENDPOINT}/item${buildParams({
        ...(id ? { id } : {}),
        ...(name ? { name } : {}),
      })}`
    );
  }

  getItemHistory(id: string) {
    return axios.get<getItemHistoryResponse>(
      `${process.env.PAYON_STORIES_ENDPOINT}/history${buildParams({ id })}`
    );
  }
}
