// https://tools.payonstories.com/pc

import axios from "axios";

import { buildParams } from "@/server/utils";

const END_POINT = "https://tools.payonstories.com/api/pc";

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
export const getItemInfo = async ({
  id,
  name,
}: {
  id?: string;
  name?: string;
}) => {
  if (!id && !name)
    throw Error("Invalid request: Either ID or Name must be defined");

  return axios.get<GetItemInfoResponse>(
    `${END_POINT}/item${buildParams({
      ...(id ? { id } : {}),
      ...(name ? { name } : {}),
    })}`
  );
};

type AvgItem = Array<{
  x: string; // date
  y: number;
}>;
type HistoryItem = Array<{
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
export const getItemHistory = async (id: string) => {
  return axios.get<getItemHistoryResponse>(
    `${END_POINT}/history${buildParams({ id })}`
  );
};
