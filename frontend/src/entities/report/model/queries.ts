import { useQuery } from '@tanstack/react-query'
import { reportApi } from '../api/reportApi'

export const reportKeys = {
  all: ['summary'] as const,
  month: (month: string) => ['summary', month] as const,
}

export function useMonthSummary(month: string) {
  return useQuery({ queryKey: reportKeys.month(month), queryFn: () => reportApi.summary(month) })
}
