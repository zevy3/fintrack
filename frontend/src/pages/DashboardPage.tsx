import { Card, CardContent, Grid, List, ListItem, ListItemText, Typography } from '@mui/material'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { demoCategories, demoTransactions } from '../data/demo'
import { formatDate, formatMoney } from '../utils/format'

export function DashboardPage() {
  const income = demoTransactions.filter((t) => t.kind === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = demoTransactions.filter((t) => t.kind === 'expense').reduce((s, t) => s + t.amount, 0)
  const latest = [...demoTransactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const categoryName = (id: number) => demoCategories.find((c) => c.id === id)?.name ?? '—'

  return (
    <>
      <PageHeader title="Обзор" subtitle="Сводка за октябрь 2026" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Доходы" value={formatMoney(income)} color="success.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Расходы" value={formatMoney(expense)} color="error.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Баланс" value={formatMoney(income - expense)} />
        </Grid>
        <Grid size={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Последние операции
              </Typography>
              <List disablePadding>
                {latest.map((t) => (
                  <ListItem key={t.id} divider disableGutters>
                    <ListItemText
                      primary={`${categoryName(t.categoryId)} — ${t.note}`}
                      secondary={formatDate(t.date)}
                    />
                    <Typography sx={{ color: t.kind === 'income' ? 'success.main' : 'error.main', fontWeight: 600 }}>
                      {t.kind === 'income' ? '+' : '−'}
                      {formatMoney(t.amount)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}
