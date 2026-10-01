import { mockDb } from '../../../shared/api/mock-db'
import type { MonthSummary } from '../model/types'

export const reportApi = {
  summary: (month: string): Promise<MonthSummary> => mockDb.summary(month),
  exportCsv: (month: string): Promise<Blob> => mockDb.exportCsv(month),
}
