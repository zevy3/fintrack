import { mockDb } from '../../../shared/api/mock-db'
import type { Budget, BudgetInput } from '../model/types'

export const budgetApi = {
  list: (month: string): Promise<Budget[]> => mockDb.listBudgets(month),
  create: (input: BudgetInput): Promise<Budget> => mockDb.createBudget(input),
  updateLimit: (id: number, limit: number): Promise<Budget> => mockDb.updateBudget(id, limit),
  remove: (id: number): Promise<void> => mockDb.deleteBudget(id),
}
