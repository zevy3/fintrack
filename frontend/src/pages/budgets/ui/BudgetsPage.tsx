import { useState } from 'react'
import { Box, Button, Card, CardContent, Grid, Grow, IconButton, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { BudgetProgress, useBudgets, type Budget } from '../../../entities/budget'
import { useCategories } from '../../../entities/category'
import { BudgetFormDialog, DeleteBudgetButton } from '../../../features/budget-manage'
import { currentMonth, monthLabel } from '../../../shared/lib/format'
import { LoadState, MonthPicker, PageHeader } from '../../../shared/ui'

export function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth())
  const [dialog, setDialog] = useState<{ open: boolean; budget?: Budget }>({ open: false })
  const query = useBudgets(month)
  const { data: categories = [] } = useCategories()

  return (
    <>
      <PageHeader
        title="Бюджеты"
        subtitle={`Лимиты расходов — ${monthLabel(month)}`}
        action={
          <Stack direction="row" spacing={2}>
            <MonthPicker value={month} onChange={setMonth} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true })}>
              Добавить бюджет
            </Button>
          </Stack>
        }
      />
      <LoadState
        isLoading={query.isLoading}
        error={query.error}
        isEmpty={query.data?.length === 0}
        emptyText="На этот месяц бюджетов нет. Задайте лимит для категории расходов."
        onRetry={() => query.refetch()}
      >
        <Grid container spacing={2}>
          {query.data?.map((b, i) => (
            <Grid key={b.id} size={{ xs: 12, md: 6 }}>
              <Grow in timeout={400} style={{ transitionDelay: `${i * 80}ms` }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">{categories.find((c) => c.id === b.category_id)?.name ?? '—'}</Typography>
                      <Box>
                        <IconButton aria-label="Изменить лимит" onClick={() => setDialog({ open: true, budget: b })}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <DeleteBudgetButton id={b.id} />
                      </Box>
                    </Box>
                    <BudgetProgress spent={b.spent} limit={b.limit} />
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </LoadState>
      <BudgetFormDialog open={dialog.open} month={month} budget={dialog.budget} onClose={() => setDialog({ open: false })} />
    </>
  )
}
