import { http } from '../../../shared/api/http'
import type { Budget, BudgetInput } from '../model/types'

export const budgetApi = {
  list: (month: string) => http.json<Budget[]>('/budgets', { query: { month } }),
  create: (input: BudgetInput) => http.json<Budget>('/budgets', { method: 'POST', body: input }),
  updateLimit: (id: number, limit: number) => http.json<Budget>(`/budgets/${id}`, { method: 'PATCH', body: { limit } }),
  remove: (id: number) => http.empty(`/budgets/${id}`, { method: 'DELETE' }),
}
