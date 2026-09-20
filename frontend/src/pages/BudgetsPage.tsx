import { Card, CardContent, Grid, LinearProgress, Typography } from '@mui/material'
import { PageHeader } from '../components/PageHeader'
import { demoBudgets, demoCategories, demoTransactions } from '../data/demo'
import { formatMoney, monthLabel } from '../utils/format'

export function BudgetsPage() {
  return (
    <>
      <PageHeader title="Бюджеты" subtitle="Лимиты расходов по категориям" />
      <Grid container spacing={2}>
        {demoBudgets.map((b) => {
          const name = demoCategories.find((c) => c.id === b.categoryId)?.name ?? '—'
          const spent = demoTransactions
            .filter((t) => t.kind === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(b.month))
            .reduce((s, t) => s + t.amount, 0)
          const percent = Math.round((spent / b.limit) * 100)
          return (
            <Grid key={b.id} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{name}</Typography>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    {monthLabel(b.month)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(percent, 100)}
                    color={percent >= 100 ? 'error' : percent >= 80 ? 'warning' : 'primary'}
                    sx={{ height: 10, borderRadius: 5, my: 1 }}
                  />
                  <Typography variant="body2">
                    {formatMoney(spent)} из {formatMoney(b.limit)} ({percent}%)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}
