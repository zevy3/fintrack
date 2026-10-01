import { Typography } from '@mui/material'
import type { Kind } from '../../../shared/api/types'
import { formatMoney } from '../../../shared/lib/format'

export function Amount({ kind, value }: { kind: Kind; value: number }) {
  return (
    <Typography component="span" sx={{ color: kind === 'income' ? 'success.main' : 'error.main', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {kind === 'income' ? '+' : '−'}
      {formatMoney(value)}
    </Typography>
  )
}
