import { useState } from 'react'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { useMonthSummary } from '../../../entities/report'
import { ExportCsvButton } from '../../../features/report-export'
import { currentMonth, formatMoney, monthLabel } from '../../../shared/lib/format'
import { LoadState, MonthPicker, PageHeader } from '../../../shared/ui'

export function ReportsPage() {
  const [month, setMonth] = useState(currentMonth())
  const query = useMonthSummary(month)
  const expenses = query.data?.by_category.filter((c) => c.kind === 'expense') ?? []
  const max = Math.max(...expenses.map((c) => c.total), 1)

  return (
    <>
      <PageHeader
        title="Отчёты"
        subtitle={`Расходы по категориям — ${monthLabel(month)}`}
        action={
          <Stack direction="row" spacing={2}>
            <MonthPicker value={month} onChange={setMonth} />
            <ExportCsvButton month={month} />
          </Stack>
        }
      />
      <LoadState
        isLoading={query.isLoading}
        error={query.error}
        isEmpty={query.data?.by_category.length === 0}
        emptyText="За выбранный месяц нет операций."
        onRetry={() => query.refetch()}
      >
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              {expenses.map((c) => (
                <Box key={c.category_id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>{c.category_name}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{formatMoney(c.total)}</Typography>
                  </Box>
                  <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', mt: 0.5 }}>
                    <Box
                      sx={{ height: 1, width: `${(c.total / max) * 100}%`, borderRadius: 4, bgcolor: 'primary.main', transition: 'width .8s ease' }}
                    />
                  </Box>
                </Box>
              ))}
              {expenses.length === 0 && <Typography color="text.secondary">Расходов за месяц нет.</Typography>}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography>Итого расходов</Typography>
                <Typography sx={{ fontWeight: 600 }}>{formatMoney(query.data?.expense ?? 0)}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </LoadState>
    </>
  )
}
