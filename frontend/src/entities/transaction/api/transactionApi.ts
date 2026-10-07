import { http } from '../../../shared/api/http'
import type { Transaction, TransactionFilters, TransactionInput, TransactionPage } from '../model/types'

export const transactionApi = {
  list: (filters: TransactionFilters) =>
    http.json<TransactionPage>('/transactions', {
      query: { kind: filters.kind, category_id: filters.category_id, limit: filters.limit, offset: filters.offset },
    }),
  create: (input: TransactionInput) => http.json<Transaction>('/transactions', { method: 'POST', body: input }),
  update: (id: number, input: TransactionInput) => http.json<Transaction>(`/transactions/${id}`, { method: 'PATCH', body: input }),
  remove: (id: number) => http.empty(`/transactions/${id}`, { method: 'DELETE' }),
}
