'use client';

import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import gql from 'graphql-tag';
import { Oswald } from 'next/font/google';
import Image from 'next/image';
import { useState } from 'react';
import { chunk } from 'lodash';
import { Input, Select, Table, TableColumnProps } from '@/components';

type ResponseHistoryData = {
  itemsHistory: Array<{
    iconURL: string;
    itemId: string;
    modifiedAt: string;
    name: string;
    cards: string;
    refinement: string;
    last7days: {
      avgl: string;
      avgs: string;
      hps: string;
      lps: string;
      qtyl: string;
      qtys: string;
    };
    last30days: {
      avgl: string;
      avgs: string;
      hps: string;
      lps: string;
      qtyl: string;
      qtys: string;
    };
    allTime: {
      avgl: string;
      avgs: string;
      hps: string;
      lps: string;
      qtyl: string;
      qtys: string;
    };
  }>;
};

type ResponseVendingData = {
  itemsVending: Array<{
    itemId: string;
    refinement: string;
    cards: string;
    iconURL: string;
    name: string;
    lp: string;
    hp: string;
    qty: string;
    minLocation: {
      location: string;
      price: string;
    };
    vendingData: {
      listedDate: Date;
      shopName: string;
      amount: string;
      price: string;
      coordinates: {
        map: string;
        x: number;
        y: number;
      };
    };
  }>;
};

type TimeFrame = 'last7days' | 'last30days' | 'allTime';

const oswald = Oswald({ subsets: ['latin'] });

const historyQuery = gql`
  query Items {
    itemsHistory {
      cards
      iconURL
      itemId
      modifiedAt
      name
      refinement
      last7days {
        avgl
        avgs
        hps
        lps
        qtyl
        qtys
      }
      last30days {
        avgl
        avgs
        hps
        lps
        qtyl
        qtys
      }
      allTime {
        avgl
        avgs
        hps
        lps
        qtyl
        qtys
      }
    }
  }
`;
const vendingQuery = gql`
  query ItemsVending {
    itemsVending {
      itemId
      refinement
      cards
      iconURL
      name
      lp
      hp
      qty
      minLocation {
        location
        price
      }
      vendingData {
        listedDate
        shopName
        amount
        price
        coordinates {
          map
          x
          y
        }
      }
    }
  }
`;

const formatMoney = (str: string) => {
  if (str === '0') return '-';

  const rev = Array.from(str).reverse();

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
    render: item => (item.refinement !== '0' ? `+${item.refinement}` : '-'),
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
    render: item => formatMoney(item[timeFrame].hps) || '-',
  },
  {
    title: 'LPS',
    widthClass: 'w-36',
    field: `${timeFrame}.lps`,
    tooltip: 'Lowest Price Sold in the time frame',
    render: item => formatMoney(item[timeFrame].lps) || '-',
  },
  {
    title: 'AVGL',
    widthClass: 'w-36',
    field: `${timeFrame}.avgl`,
    tooltip: 'Average Listing Price in the time frame',
    render: item => formatMoney(item[timeFrame].avgl) || '-',
  },
  {
    title: 'AVGS',
    widthClass: 'w-36',
    field: `${timeFrame}.avgs`,
    tooltip: 'Average Sold Price in the time frame',
    render: item => formatMoney(item[timeFrame].avgs) || '-',
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
const vendingColumns: Array<
  TableColumnProps<ResponseVendingData['itemsVending'][number]>
> = [
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
    render: item => (item.refinement !== '0' ? `+${item.refinement}` : '-'),
  },
  {
    title: 'Cards',
    widthClass: 'w-1/3',
    field: 'cards',
  },
  {
    title: 'HP',
    widthClass: 'w-36',
    field: `hp`,
    tooltip: 'Highest Price on sale',
    render: item => formatMoney(item.hp) || '-',
  },
  {
    title: 'LP',
    widthClass: 'w-36',
    field: `lp`,
    tooltip: 'Lowest Price on sale',
    render: item => formatMoney(item.lp) || '-',
  },
  {
    title: 'QTY',
    widthClass: 'w-36',
    field: `qty`,
    tooltip: 'Quantity on sale',
  },
  {
    title: 'Location',
    widthClass: 'w-60',
    field: `minLocation.location`,
  },
];

export default function Page() {
  const [search, setSearch] = useState<string>();
  const [refinement, setRefinement] = useState<string>();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('last30days');
  const { data: historyData, loading: historyLoading } =
    useQuery<ResponseHistoryData>(historyQuery);
  const { data: vendingData, loading: vendingLoading } =
    useQuery<ResponseVendingData>(vendingQuery);

  const bySearch = <T extends { name: string; cards: string; itemId: string }>(
    i: T,
  ) => {
    if (!search) return true;

    const names = `${i.name.toLocaleLowerCase()} ${i.cards.toLocaleLowerCase()} ${i.itemId.toLocaleLowerCase()}`;

    const searchWords = search.toLocaleLowerCase().split(' ');

    for (const word of searchWords) {
      if (!names.includes(word)) return false;
    }

    return true;
  };

  const byRefinement = <T extends { refinement: string }>(i: T) =>
    refinement ? i.refinement === refinement : true;

  const filteredHistoryData =
    historyData?.itemsHistory.filter(bySearch).filter(byRefinement) || [];
  const filteredVendingData =
    vendingData?.itemsVending.filter(bySearch).filter(byRefinement) || [];

  return (
    <div className="w-full h-screen bg-gray-200 text-black">
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
                setValue={setRefinement}
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
              columns={vendingColumns}
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
