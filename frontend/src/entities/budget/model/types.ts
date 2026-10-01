export interface Budget {
  id: number
  category_id: number
  month: string // YYYY-MM
  limit: number
  spent: number
}

export interface BudgetInput {
  category_id: number
  month: string
  limit: number
}
