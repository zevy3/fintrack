import { mockDb } from '../../../shared/api/mock-db'
import type { Category, CategoryInput } from '../model/types'

export const categoryApi = {
  list: (): Promise<Category[]> => mockDb.listCategories(),
  create: (input: CategoryInput): Promise<Category> => mockDb.createCategory(input),
  rename: (id: number, name: string): Promise<Category> => mockDb.updateCategory(id, name),
  remove: (id: number): Promise<void> => mockDb.deleteCategory(id),
}
