import type { Kind } from '../../../shared/api/types'

export interface Transaction {
  id: number
  kind: Kind
  amount: number
  date: string // YYYY-MM-DD
  category_id: number
  note: string
}

export interface TransactionInput {
  kind: Kind
  amount: number
  date: string
  category_id: number
  note: string
}

export interface TransactionFilters {
  kind?: Kind
  category_id?: number
  limit: number
  offset: number
}

export interface TransactionPage {
  items: Transaction[]
  total: number
}
