'use client';

import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { chunk, get, orderBy } from 'lodash';

const DEFAULT_PAGINATION = 0;

export type TableColumnProps<T> = {
  title: string;
  widthClass: string;
  field?: string;
  tooltip?: string;
  extraClass?: string;
  render?: (item: T) => any;
};

type TableProps<T> = {
  columns: Array<TableColumnProps<T>>;
  data: Array<T>;
  loading: boolean;
};

export function Table<T>({ columns, data, loading }: TableProps<T>) {
  const [pagination, setPagination] = useState<number>(DEFAULT_PAGINATION);
  const [sorting, setSorting] = useState<string>('name');
  const [sortingOrder, setSortingOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setPagination(DEFAULT_PAGINATION);
  }, [data, sorting]);

  const byColumn = (i: any) => {
    const v = get(i, sorting);
    const numericValue = Number(v);

    return isNaN(numericValue) ? v : numericValue;
  };

  const paginatedData = chunk(orderBy(data, byColumn, sortingOrder), 15);

  const paginatedIndexes = useMemo(() => {
    let indexes = new Set<number>();
    // add first index
    indexes.add(0);

    const arbitraryNumber = 6;
    const arr = Array(arbitraryNumber)
      .fill(0)
      .map((_: any, i) => pagination + i - arbitraryNumber / 3);

    arr
      .filter(n => n > 0 && n < paginatedData.length - 1)
      .forEach(n => indexes.add(n));

    // add last index
    if (paginatedData.length) indexes.add(paginatedData.length - 1);

    return Array.from(indexes);
  }, [pagination, data]);

  return (
    <>
      <table className="text-sm font-light text-center rounded border border-gray-300 border-spacing-8">
        <thead className="font-medium bg-gray-200">
          <TableHeaderItem
            columns={columns}
            sorting={sorting}
            setSorting={setSorting}
            sortingOrder={sortingOrder}
            setSortingOrder={setSortingOrder}
          />
        </thead>
        <tbody>
          {/* loading spinner */}
          {loading && <LoadingDiv size={columns.length} />}

          {/* no data row */}
          {!paginatedData[pagination]?.length && (
            <NoDataRow size={columns.length} />
          )}

          {/* rows */}
          {paginatedData[pagination]?.map((item, index) => (
            <tr key={index} className="even:bg-gray-50 odd:bg-white text-xs">
              {Object.values(columns).map(columnData => (
                <td colSpan={1} className={`pt-2 ${columnData.extraClass}`}>
                  {columnData.render
                    ? columnData.render(item)
                    : get(item, columnData.field!)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* pagination */}
      <div className="min-w-full flex gap-2 justify-center">
        {paginatedIndexes.map(i => {
          return (
            <button
              key={i}
              onClick={() => setPagination(i)}
              className={`px-2 ${
                pagination === i ? 'bg-gray-200' : 'bg-white'
              } rounded border border-gray-200`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </>
  );
}

function TableHeaderItem<T>({
  columns,
  sorting,
  setSorting,
  sortingOrder,
  setSortingOrder,
}: {
  columns: Array<TableColumnProps<T>>;
  sorting?: string;
  setSorting?: Dispatch<SetStateAction<string>>;
  sortingOrder?: 'asc' | 'desc';
  setSortingOrder?: Dispatch<SetStateAction<'asc' | 'desc'>>;
}) {
  return columns.map((column, i) => {
    column.extraClass;

    const tooltipClass = column.tooltip ? 'decoration-dotted' : '';

    let sortingClass = '';
    if (column.field === sorting) {
      if (sortingOrder === 'asc') sortingClass = 'active-sorting-asc';
      else sortingClass = 'active-sorting-desc';
    }

    const resultClass = [
      `p-2 hover`,
      tooltipClass,
      sortingClass,
      column.widthClass,
    ].join(' ');

    return (
      <th
        key={`${column.title}-${i}`}
        scope="col"
        className={resultClass}
        onClick={() => {
          if (!column.field || !setSortingOrder || !setSorting) return;

          if (column.field === sorting) {
            setSortingOrder(sortingOrder === 'asc' ? 'desc' : 'asc');
            return;
          }
          setSorting(column.field);
        }}
      >
        {column.tooltip ? (
          <span title={column.tooltip}>{column.title}</span>
        ) : (
          column.title
        )}
      </th>
    );
  });
}

const LoadingDiv = ({
  size,
  text = 'Loading...',
}: {
  size: number;
  text?: string;
}) => (
  <tr>
    <td colSpan={size} className="pt-2 text-center">
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
        <span className="sr-only">{text}</span>
      </div>
    </td>
  </tr>
);

const NoDataRow = ({
  size,
  text = 'No Data :(',
}: {
  size: number;
  text?: string;
}) => (
  <tr>
    <td colSpan={size} className="whitespace-nowrap px-6 py-4">
      <div className="text-center">
        <span className="font-bold">{text}</span>
      </div>
    </td>
  </tr>
);
