export type Kind = 'income' | 'expense'

export interface Category {
  id: number
  name: string
  kind: Kind
}

export interface Transaction {
  id: number
  kind: Kind
  amount: number
  date: string // ISO-дата, YYYY-MM-DD
  categoryId: number
  note: string
}

export interface Budget {
  id: number
  categoryId: number
  month: string // YYYY-MM
  limit: number
}
