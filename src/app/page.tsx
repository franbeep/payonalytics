'use client';

import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import gql from 'graphql-tag';
import { Oswald } from 'next/font/google';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { chunk } from 'lodash';

type ResponseData = {
  items: Array<{
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
  }>;
};

const oswald = Oswald({ subsets: ['latin'] });

const columns: Array<{
  title: string;
  tooltip?: string;
}> = [
  {
    title: '', // icon
  },
  {
    title: 'ID',
  },
  {
    title: 'Name',
  },
  {
    title: 'Ref.',
    tooltip: 'Refinement',
  },
  {
    title: 'Cards',
  },
  {
    title: 'HPS30',
    tooltip: 'Highest Price Sold in 30 days',
  },
  {
    title: 'HPS7',
    tooltip: 'Highest Price Sold in 7 days',
  },
  {
    title: 'LPS30',
    tooltip: 'Lowest Price Sold in 30 days',
  },
  {
    title: 'LPS7',
    tooltip: 'Lowest Price Sold in 7 days',
  },
  {
    title: 'AVGL30',
    tooltip: 'Average Listing Price in 30 days',
  },
  {
    title: 'AVGL7',
    tooltip: 'Average Listing Price in 7 days',
  },
  {
    title: 'AVGS30',
    tooltip: 'Average Sold Price in 30 days',
  },
  {
    title: 'AVGS7',
    tooltip: 'Average Sold Price in 7 days',
  },
  {
    title: 'QTYS30',
    tooltip: 'Quantity Sold in 30 days',
  },
  {
    title: 'QTYS7',
    tooltip: 'Quantity Sold in 7 days',
  },
  {
    title: 'QTYL30',
    tooltip: 'Quantity Listed in 30 days',
  },
  {
    title: 'QTYL7',
    tooltip: 'Quantity Listed in 7 days',
  },
  // {
  //   title: 'MPPI',
  //   tooltip: 'Max Profit Per Item',
  // },
];

const query = gql`
  query Items {
    items {
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

export default function Page() {
  const [search, setSearch] = useState<string>();
  const [refinement, setRefinement] = useState<string>();
  const [timeFrame, setTimeFrame] = useState<string>();

  // const { data, error, loading } = useQuery<ResponseData>(query);

  const { data, error, loading } = {
    data: {
      items: [
        {
          cards: '',
          iconURL: 'https://db.irowiki.org/image/item/5017.png',
          itemId: '5017',
          modifiedAt: '2023-09-06T01:51:14.665Z',
          name: 'Bone Helm',
          refinement: '0',
          last7days: {
            avgl: '586130',
            avgs: '490000',
            hps: '490000',
            lps: '490000',
            qtyl: '6',
            qtys: '1',
          },
          last30days: {
            avgl: '735641',
            avgs: '598333',
            hps: '750000',
            lps: '490000',
            qtyl: '40',
            qtys: '6',
          },
        },
        {
          cards: '',
          iconURL: 'https://db.irowiki.org/image/item/5017.png',
          itemId: '5017',
          modifiedAt: '2023-09-06T01:51:14.665Z',
          name: 'Bone Helm',
          refinement: '4',
          last7days: {
            avgl: '0',
            avgs: '0',
            hps: '0',
            lps: '0',
            qtyl: '0',
            qtys: '0',
          },
          last30days: {
            avgl: '661111',
            avgs: '658333',
            hps: '666666',
            lps: '650000',
            qtyl: '3',
            qtys: '2',
          },
        },
        {
          cards: '',
          iconURL: 'https://db.irowiki.org/image/item/5017.png',
          itemId: '5017',
          modifiedAt: '2023-09-06T01:51:14.665Z',
          name: 'Bone Helm',
          refinement: '7',
          last7days: {
            avgl: '0',
            avgs: '0',
            hps: '0',
            lps: '0',
            qtyl: '0',
            qtys: '0',
          },
          last30days: {
            avgl: '4250000',
            avgs: '0',
            hps: '0',
            lps: '0',
            qtyl: '2',
            qtys: '0',
          },
        },
        {
          cards: '',
          iconURL: 'https://db.irowiki.org/image/item/5017.png',
          itemId: '5017',
          modifiedAt: '2023-09-06T01:51:14.665Z',
          name: 'Bone Helm',
          refinement: '5',
          last7days: {
            avgl: '0',
            avgs: '0',
            hps: '0',
            lps: '0',
            qtyl: '0',
            qtys: '0',
          },
          last30days: {
            avgl: '1100000',
            avgs: '0',
            hps: '0',
            lps: '0',
            qtyl: '3',
            qtys: '0',
          },
        },
        {
          cards: '',
          iconURL: 'https://db.irowiki.org/image/item/5017.png',
          itemId: '5017',
          modifiedAt: '2023-09-06T01:51:14.665Z',
          name: 'Bone Helm',
          refinement: '6',
          last7days: {
            avgl: '0',
            avgs: '0',
            hps: '0',
            lps: '0',
            qtyl: '0',
            qtys: '0',
          },
          last30days: {
            avgl: '0',
            avgs: '0',
            hps: '0',
            lps: '0',
            qtyl: '0',
            qtys: '0',
          },
        },
      ],
    },
    error: undefined,
    loading: undefined,
  };

  const noDataRow = (
    <tr>
      <td colSpan={columns.length} className="whitespace-nowrap px-6 py-4">
        <div className="text-center">
          <span className="font-bold">No Data :(</span>
        </div>
      </td>
    </tr>
  );

  const loadingDiv = (
    <tr>
      <td colSpan={columns.length} className="pt-2 text-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-100 fill-green-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </td>
    </tr>
  );

  const bySearch = (i: ResponseData['items'][number]) =>
    i.name.toLowerCase().includes(search?.toLocaleLowerCase() || '');

  const byRefinement = (i: ResponseData['items'][number]) =>
    refinement ? i.refinement === refinement : true;

  const filteredData = data?.items.filter(bySearch).filter(byRefinement);

  return (
    <div className="w-full h-screen bg-gray-200 text-black">
      {/* container */}
      <div className="mx-auto flex flex-col justify-center ">
        {/* apos image / title */}
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

        {/* main content: table */}
        <main className="mx-32 flex flex-col gap-5 justify-center">
          <div className="flex flex-row gap-5">
            <div className="bg-white p-2 max-w-md rounded">
              <input
                type="text"
                className="w-full"
                placeholder="Search by text here..."
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </div>
            <div className="bg-white p-2 w-14 rounded flex justify-center">
              <select
                className="bg-white"
                value={refinement}
                onChange={event => setRefinement(event.target.value)}
              >
                <option></option>
                <option>0</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
                <option>10</option>
              </select>
            </div>
            <div className="bg-white p-2 w-36 rounded flex justify-center">
              <select
                className="bg-white"
                value={timeFrame}
                onChange={event => setTimeFrame(event.target.value)}
              >
                <option></option>
                <option value={'allTime'}>All Time</option>
                <option value={'last30days'}>Last 30 Days</option>
                <option value={'last7days'}>Last 7 Days</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-2 rounded">
            <table className="min-w-full text-sm font-light text-center rounded border border-gray-300 border-spacing-8">
              <thead className="font-medium bg-gray-200">
                {columns.map((column, i) => (
                  <th key={`${column.title}-${i}`} scope="col" className="p-2">
                    {column.tooltip ? (
                      <span title={column.tooltip}>{column.title}</span>
                    ) : (
                      column.title
                    )}
                  </th>
                ))}
              </thead>
              <tbody>
                {/* loading spinner */}
                {loading && loadingDiv}

                {/* no data row */}
                {filteredData && filteredData.length < 1 && noDataRow}

                {/* rows */}
                {filteredData.map((item, index) => (
                  <tr
                    key={`${index}-${item.itemId}`}
                    className="even:bg-gray-50 odd:bg-white text-xs"
                  >
                    <td colSpan={1} className="pt-2 flex">
                      <img
                        className="mx-auto py-2"
                        src={item.iconURL}
                        alt={item.name}
                      />
                    </td>
                    <td colSpan={1} className="pt-2">
                      {item.itemId}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {item.name}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {item.refinement !== '0' ? `+${item.refinement}` : '-'}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {item.cards}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {formatMoney(item.last30days.hps) || '-'}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {formatMoney(item.last7days.hps) || '-'}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {formatMoney(item.last30days.lps) || '-'}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {formatMoney(item.last7days.lps) || '-'}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {formatMoney(item.last30days.avgl) || '-'}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {formatMoney(item.last7days.avgl) || '-'}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {formatMoney(item.last30days.avgs) || '-'}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {formatMoney(item.last7days.avgs) || '-'}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {item.last30days.qtys}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {item.last7days.qtys}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {item.last30days.qtyl}
                    </td>
                    <td colSpan={1} className="pt-2">
                      {item.last7days.qtyl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
