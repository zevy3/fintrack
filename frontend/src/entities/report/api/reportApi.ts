import { http } from '../../../shared/api/http'
import type { MonthSummary } from '../model/types'

export const reportApi = {
  summary: (month: string) => http.json<MonthSummary>('/reports/summary', { query: { month } }),
  exportCsv: (month: string) => http.blob('/reports/export', { query: { month } }),
}
