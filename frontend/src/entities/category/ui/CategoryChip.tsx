import { Chip } from '@mui/material'
import type { Kind } from '../../../shared/api/types'

interface Props {
  name: string
  kind: Kind
  onDelete?: () => void
}

export function CategoryChip({ name, kind, onDelete }: Props) {
  return <Chip size="small" label={name} color={kind === 'income' ? 'success' : 'default'} onDelete={onDelete} />
}
