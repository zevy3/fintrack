import { useQuery } from '@tanstack/react-query'
import { budgetApi } from '../api/budgetApi'

export const budgetKeys = {
  all: ['budgets'] as const,
  month: (month: string) => ['budgets', month] as const,
}

export function useBudgets(month: string) {
  return useQuery({ queryKey: budgetKeys.month(month), queryFn: () => budgetApi.list(month) })
}
