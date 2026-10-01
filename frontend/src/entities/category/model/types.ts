import type { Kind } from '../../../shared/api/types'

export interface Category {
  id: number
  name: string
  kind: Kind
}

export interface CategoryInput {
  name: string
  kind: Kind
}
