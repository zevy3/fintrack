import { Box, LinearProgress, Typography } from '@mui/material'
import { formatMoney } from '../../../shared/lib/format'

export function BudgetProgress({ spent, limit }: { spent: number; limit: number }) {
  const percent = Math.round((spent / limit) * 100)
  const color = percent >= 100 ? 'error' : percent >= 80 ? 'warning' : 'primary'
  return (
    <Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(percent, 100)}
        color={color}
        sx={{ height: 10, borderRadius: 5, my: 1, '& .MuiLinearProgress-bar': { transition: 'transform .8s ease' } }}
      />
      <Typography variant="body2" color={percent >= 100 ? 'error' : 'text.primary'}>
        {formatMoney(spent)} из {formatMoney(limit)} ({percent}%)
        {percent >= 100 && ' — лимит превышен'}
      </Typography>
    </Box>
  )
}
