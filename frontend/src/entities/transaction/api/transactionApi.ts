import { mockDb } from '../../../shared/api/mock-db'
import type { Transaction, TransactionFilters, TransactionInput, TransactionPage } from '../model/types'

export const transactionApi = {
  list: (filters: TransactionFilters): Promise<TransactionPage> => mockDb.listTransactions(filters),
  create: (input: TransactionInput): Promise<Transaction> => mockDb.createTransaction(input),
  update: (id: number, input: TransactionInput): Promise<Transaction> => mockDb.updateTransaction(id, input),
  remove: (id: number): Promise<void> => mockDb.deleteTransaction(id),
}
