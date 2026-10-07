import { http } from '../../../shared/api/http'
import type { Category, CategoryInput } from '../model/types'

export const categoryApi = {
  list: () => http.json<Category[]>('/categories'),
  create: (input: CategoryInput) => http.json<Category>('/categories', { method: 'POST', body: input }),
  rename: (id: number, name: string) => http.json<Category>(`/categories/${id}`, { method: 'PATCH', body: { name } }),
  remove: (id: number) => http.empty(`/categories/${id}`, { method: 'DELETE' }),
}
