import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { transactionApi } from '../api/transactionApi'
import type { TransactionFilters } from './types'

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filters: TransactionFilters) => ['transactions', filters] as const,
}

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => transactionApi.list(filters),
    placeholderData: keepPreviousData,
  })
}
