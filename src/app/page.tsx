'use client';

import gql from 'graphql-tag';
import { Oswald } from 'next/font/google';
import Image from 'next/image';
import { useState } from 'react';
import { chunk } from 'lodash';
import { Input, Select, Table, TableColumnProps } from '@/components';
import { useBatchedQuery } from '@/components/hooks';

const DEFAULT_ZERO_VALUE = '-';

type ResponseHistoryData = {
  itemsHistory: Array<{
    iconURL: string;
    itemId: number;
    name: string;
    cards: string;
    refinement: number;
    last7days: HistoryTimeFrame;
    last30days: HistoryTimeFrame;
    allTime: HistoryTimeFrame;
  }>;
  hasMore: boolean;
};
type HistoryTimeFrame = {
  avgl: number;
  avgs: number;
  hps: number;
  lps: number;
  qtyl: number;
  qtys: number;
};

type ResponseVendingData = {
  itemsVending: Array<{
    itemId: number;
    refinement: number;
    cards: string;
    iconURL: string;
    name: string;
    lp: number;
    avg: number;
    hp: number;
    qty: number;
    minLocation: {
      date: Date;
      location: string;
      price: number;
    };
    vendingData: {
      listedDate: Date;
      shopName: string;
      amount: number;
      price: number;
      coordinates: {
        map: string;
        x: number;
        y: number;
      };
    };
    lps_last30days: IsPriceObject;
    avgs_last30days: IsPriceObject;
    lps_last7days: IsPriceObject;
    avgs_last7days: IsPriceObject;
    lps_allTime: IsPriceObject;
    avgs_allTime: IsPriceObject;
  }>;
  hasMore: boolean;
};
type IsPriceObject = {
  percentage: number;
  value: boolean;
};

type TimeFrame = 'last7days' | 'last30days' | 'allTime';

const oswald = Oswald({ subsets: ['latin'] });

const historyQuery = gql`
  query ItemsHistory($offset: Float, $take: Float) {
    itemsHistory(offset: $offset, take: $take) {
      cards
      iconURL
      itemId
      name
      refinement
      last7days: perDays(timeFrame: "last7days") {
        avgl
        avgs
        hps
        lps
        qtyl
        qtys
      }
      last30days: perDays(timeFrame: "last30days") {
        avgl
        avgs
        hps
        lps
        qtyl
        qtys
      }
      allTime: perDays(timeFrame: "allTime") {
        avgl
        avgs
        hps
        lps
        qtyl
        qtys
      }
    }
    hasMore(offset: $offset, take: $take)
  }
`;
const vendingQuery = gql`
  query ItemsVending($offset: Float, $take: Float) {
    itemsVending(offset: $offset, take: $take) {
      itemId
      refinement
      cards
      iconURL
      name
      lp
      avg
      hp
      qty
      minLocation {
        date
        location
        price
      }
      lps_last30days: isPrice(metric: "lps", timeFrame: "last30days") {
        percentage
        value
      }
      avgs_last30days: isPrice(metric: "avgs", timeFrame: "last30days") {
        percentage
        value
      }
      lps_last7days: isPrice(metric: "lps", timeFrame: "last7days") {
        percentage
        value
      }
      avgs_last7days: isPrice(metric: "avgs", timeFrame: "last7days") {
        percentage
        value
      }
      lps_allTime: isPrice(metric: "lps", timeFrame: "allTime") {
        percentage
        value
      }
      avgs_allTime: isPrice(metric: "avgs", timeFrame: "allTime") {
        percentage
        value
      }
    }
    hasMore(offset: $offset, take: $take)
  }
`;

const formatMoney = (value: number) => {
  if (value < 1) return DEFAULT_ZERO_VALUE;

  const rev = Array.from(value.toString()).reverse();

  return `${chunk(rev, 3)
    .map(ea => ea.reverse().join(''))
    .reverse()
    .join(',')}z`;
};

const genHistoryColumns = (
  timeFrame: TimeFrame,
): Array<TableColumnProps<ResponseHistoryData['itemsHistory'][number]>> => [
  {
    title: '', // icon
    widthClass: 'w-8',
    extraClass: 'flex',
    render: item => (
      <img className="mx-auto py-2" src={item.iconURL} alt={item.name} />
    ),
  },
  {
    title: 'ID',
    widthClass: 'w-14',
    field: 'itemId',
  },
  {
    title: 'Name',
    widthClass: 'w-36',
    field: 'name',
  },
  {
    title: 'Ref.',
    widthClass: 'w-16',
    field: 'refinement',
    tooltip: 'Refinement',
    render: item =>
      item.refinement > 0 ? `+${item.refinement}` : DEFAULT_ZERO_VALUE,
  },
  {
    title: 'Cards',
    widthClass: 'w-1/3',
    field: 'cards',
  },
  {
    title: 'HPS',
    widthClass: 'w-36',
    field: `${timeFrame}.hps`,
    tooltip: 'Highest Price Sold in the time frame',
    render: item => formatMoney(item[timeFrame].hps),
  },
  {
    title: 'LPS',
    widthClass: 'w-36',
    field: `${timeFrame}.lps`,
    tooltip: 'Lowest Price Sold in the time frame',
    render: item => formatMoney(item[timeFrame].lps),
  },
  {
    title: 'AVGL',
    widthClass: 'w-36',
    field: `${timeFrame}.avgl`,
    tooltip: 'Average Listing Price in the time frame',
    render: item => formatMoney(item[timeFrame].avgl),
  },
  {
    title: 'AVGS',
    widthClass: 'w-36',
    field: `${timeFrame}.avgs`,
    tooltip: 'Average Sold Price in the time frame',
    render: item => formatMoney(item[timeFrame].avgs),
  },
  {
    title: 'QTYS',
    widthClass: 'w-36',
    field: `${timeFrame}.qtys`,
    tooltip: 'Quantity Sold in the time frame',
  },
  {
    title: 'QTYL',
    widthClass: 'w-36',
    field: `${timeFrame}.qtyl`,
    tooltip: 'Quantity Listed in the time frame',
  },
];

const genVendingColumns = (
  timeFrame: TimeFrame,
): Array<TableColumnProps<ResponseVendingData['itemsVending'][number]>> => [
  {
    title: '', // icon
    widthClass: 'w-8',
    extraClass: 'flex',
    render: item => (
      <img className="mx-auto py-2" src={item.iconURL} alt={item.name} />
    ),
  },
  {
    title: 'ID',
    widthClass: 'w-14',
    field: 'itemId',
  },
  {
    title: 'Name',
    widthClass: 'w-36',
    field: 'name',
  },
  {
    title: 'Ref.',
    widthClass: 'w-16',
    field: 'refinement',
    tooltip: 'Refinement',
    render: item =>
      item.refinement > 0 ? `+${item.refinement}` : DEFAULT_ZERO_VALUE,
  },
  {
    title: 'Cards',
    widthClass: 'w-1/5',
    field: 'cards',
  },
  {
    title: 'HP',
    widthClass: 'w-36',
    field: `hp`,
    tooltip: 'Highest Price on sale',
    render: item => formatMoney(item.hp),
  },
  {
    title: 'AVGP',
    widthClass: 'w-36',
    field: `avg`,
    tooltip: 'Average Price on sale',
    render: item => formatMoney(item.avg),
  },
  {
    title: 'LP',
    widthClass: 'w-36',
    field: `lp`,
    tooltip: 'Lowest Price on sale',
    render: item => formatMoney(item.lp),
  },
  {
    title: 'QTY',
    widthClass: 'w-36',
    field: `qty`,
    tooltip: 'Quantity on sale',
  },
  {
    title: 'IL',
    widthClass: 'w-14',
    field: `lps_${timeFrame}.value`,
    tooltip: 'Is it Lowest on this time frame?',
    render: item => (item[`lps_${timeFrame}`].value ? '✓' : ''), // “↑” “↓”
  },
  {
    title: 'LA',
    widthClass: 'w-14',
    field: `avgs_${timeFrame}.value`,
    tooltip: 'Lower than Average on this this time frame',
    render: item => (item[`avgs_${timeFrame}`].value ? '✓' : ''),
  },
  {
    title: 'HL',
    widthClass: 'w-16',
    field: `lps_${timeFrame}.percentage`,
    tooltip: 'How lower it is (lowest)',
    render: item => {
      const { percentage } = item[`lps_${timeFrame}`];
      const percentageString = `${Math.round(Math.abs(percentage) * 100)}%`;

      if (percentage < 0) {
        return <span className=" text-red-600">{`↑ ${percentageString}`}</span>;
      }
      if (percentage > 0) {
        return (
          <span className=" text-green-600">{`↓ ${percentageString}`}</span>
        );
      }
      return '0%';
    },
  },
  {
    title: 'HA',
    widthClass: 'w-16',
    field: `avgs_${timeFrame}.percentage`,
    tooltip: 'How lower it is (average)',
    render: item => {
      const { percentage } = item[`avgs_${timeFrame}`];
      const percentageString = `${Math.round(Math.abs(percentage) * 100)}%`;

      if (percentage < 0) {
        return <span className=" text-red-600">{`↑ ${percentageString}`}</span>;
      }
      if (percentage > 0) {
        return (
          <span className=" text-green-600">{`↓ ${percentageString}`}</span>
        );
      }
      return '0%';
    },
  },
  {
    title: 'LD',
    widthClass: 'w-60',
    field: `minLocation.date`,
    tooltip: 'Lowest sale Date last 3 days',
    render: item => new Date(item.minLocation.date).toDateString(),
  },
  {
    title: 'Location',
    widthClass: 'w-60',
    field: `minLocation.location`,
  },
];

export default function Page() {
  const [search, setSearch] = useState<string>();
  const [refinement, setRefinement] = useState<number>();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('last30days');

  // TODO: need to hugely improve this
  const { data: historyData, loading: historyLoading } = useBatchedQuery<
    ResponseHistoryData,
    'itemsHistory',
    ResponseHistoryData['itemsHistory'][number]
  >(historyQuery, { iterableKey: 'itemsHistory' });
  const { data: vendingData, loading: vendingLoading } = useBatchedQuery<
    ResponseVendingData,
    'itemsVending',
    ResponseVendingData['itemsVending'][number]
  >(vendingQuery, { iterableKey: 'itemsVending' });

  const bySearch = <T extends { name: string; cards: string; itemId: number }>(
    i: T,
  ) => {
    if (!search) return true;

    const names = `${i.name.toLocaleLowerCase()} ${i.cards.toLocaleLowerCase()} ${i.itemId
      .toString()
      .toLocaleLowerCase()}`;

    const searchWords = search.toLocaleLowerCase().split(' ');

    for (const word of searchWords) {
      if (!names.includes(word)) return false;
    }

    return true;
  };

  const byRefinement = <T extends { refinement: number }>(i: T) =>
    refinement ? i.refinement === refinement : true;

  const filteredHistoryData =
    historyData.filter(bySearch).filter(byRefinement) || [];
  const filteredVendingData =
    vendingData.filter(bySearch).filter(byRefinement) || [];

  return (
    <div className="w-full h-max min-h-screen bg-gray-200 text-black">
      {/* container */}
      <div className="mx-auto flex flex-col justify-center ">
        {/* apos image / title */}
        <LogoTitle />

        {/* main content */}
        <main className="container mx-auto flex flex-col gap-5 justify-center">
          <div className="bg-white p-2 rounded flex flex-col gap-2">
            {/* search & filters */}
            <div className="flex flex-row gap-5">
              <Input
                value={search}
                setValue={setSearch}
                placeholder="Search by text here..."
              />
              <Select
                value={refinement}
                setValue={(value: string) => setRefinement(Number(value))}
                options={[
                  '',
                  ...Array(11)
                    .fill('')
                    .map((_, i) => i),
                ]}
                widthClass="w-14"
              />
              <Select
                value={timeFrame}
                setValue={setTimeFrame}
                options={{
                  'All Time': 'allTime',
                  'Last 30 Days': 'last30days',
                  'Last 7 Days': 'last7days',
                }}
                widthClass="w-36"
              />
            </div>

            <Table
              columns={genVendingColumns(timeFrame)}
              data={filteredVendingData}
              loading={vendingLoading}
            />
            <Table
              columns={genHistoryColumns(timeFrame)}
              data={filteredHistoryData}
              loading={historyLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

const LogoTitle = () => (
  <div className="mt-32 mb-8 mx-auto flex">
    <Image
      className=""
      src="/apos.png"
      alt="Apos :)"
      width="130"
      height="130"
    />
    <div className=" flex items-center justify-center">
      <h1
        className={`text-3xl font-bold text-center max-w-md ${oswald.className}`}
      >
        Payon Stories: Analytics at market values
      </h1>
    </div>
  </div>
);
