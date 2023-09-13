import { useState } from 'react';
import {
  ApolloError,
  NoInfer,
  OperationVariables,
  useQuery,
} from '@apollo/client';
import { DocumentNode } from 'graphql';

const INITIAL_BATCH_SIZE = 200;

export const useBatchedQuery = <
  T extends { hasMore: boolean },
  K extends keyof T,
  L,
>(
  query: DocumentNode,
  {
    iterableKey,
    variables,
  }: { iterableKey: K; variables?: OperationVariables },
) => {
  const [data, setData] = useState<Array<L>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApolloError>();
  const [offset, setOffset] = useState<number>(0);

  const isArray = (arr: NoInfer<T>[K] | Array<L>): arr is Array<L> => {
    return Array.isArray(arr);
  };

  useQuery<T>(query, {
    variables: {
      ...variables,
      take: INITIAL_BATCH_SIZE,
      offset,
    },
    onCompleted: async response => {
      const arr = response[iterableKey];

      if (!arr) {
        throw new ApolloError({ errorMessage: 'Invalid key value' });
      }

      if (!isArray(arr)) {
        throw new ApolloError({ errorMessage: 'Value is not an array' });
      }

      setData(prev => [...prev, ...arr]);

      if (response.hasMore) {
        setOffset(prev => prev + INITIAL_BATCH_SIZE);
      } else {
        setLoading(false);
      }
    },
    onError: error => {
      throw error;
    },
  });

  return {
    data,
    error,
    loading,
  };
};
