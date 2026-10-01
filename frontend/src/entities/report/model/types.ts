import type { Kind } from '../../../shared/api/types'

export interface CategoryTotal {
  category_id: number
  category_name: string
  kind: Kind
  total: number
}

export interface MonthSummary {
  month: string
  income: number
  expense: number
  balance: number
  by_category: CategoryTotal[]
}
