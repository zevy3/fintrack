import { useState } from 'react'
import { Card, CardContent, Grid, List, ListItem, ListItemText, Typography } from '@mui/material'
import { useCategories } from '../../../entities/category'
import { Amount, useTransactions } from '../../../entities/transaction'
import { useMonthSummary } from '../../../entities/report'
import { currentMonth, formatDate, formatMoney, monthLabel } from '../../../shared/lib/format'
import { LoadState, MonthPicker, PageHeader, StatCard } from '../../../shared/ui'

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonth())
  const summary = useMonthSummary(month)
  const latest = useTransactions({ limit: 5, offset: 0 })
  const { data: categories = [] } = useCategories()
  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? '—'

  return (
    <>
      <PageHeader title="Обзор" subtitle={`Сводка за ${monthLabel(month)}`} action={<MonthPicker value={month} onChange={setMonth} />} />
      <Grid container spacing={2}>
        <Grid size={12}>
          <LoadState
            isLoading={summary.isLoading}
            error={summary.error}
            isEmpty={false}
            emptyText=""
            onRetry={() => summary.refetch()}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard label="Доходы" value={formatMoney(summary.data?.income ?? 0)} color="#2e7d32" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard label="Расходы" value={formatMoney(summary.data?.expense ?? 0)} color="#c62828" delay={80} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard label="Баланс" value={formatMoney(summary.data?.balance ?? 0)} delay={160} />
              </Grid>
            </Grid>
          </LoadState>
        </Grid>
        <Grid size={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Последние операции
              </Typography>
              <LoadState
                isLoading={latest.isLoading}
                error={latest.error}
                isEmpty={latest.data?.items.length === 0}
                emptyText="Операций пока нет. Добавьте первую на странице «Операции»."
                onRetry={() => latest.refetch()}
              >
                <List disablePadding>
                  {latest.data?.items.map((t) => (
                    <ListItem key={t.id} divider disableGutters>
                      <ListItemText
                        primary={`${categoryName(t.category_id)}${t.note ? ` — ${t.note}` : ''}`}
                        secondary={formatDate(t.date)}
                      />
                      <Amount kind={t.kind} value={t.amount} />
                    </ListItem>
                  ))}
                </List>
              </LoadState>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}
