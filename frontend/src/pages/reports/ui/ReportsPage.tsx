import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { PageHeader } from '../components/PageHeader'
import { demoCategories, demoTransactions } from '../data/demo'
import { formatMoney } from '../utils/format'

export function ReportsPage() {
  const rows = demoCategories
    .filter((c) => c.kind === 'expense')
    .map((c) => ({
      name: c.name,
      total: demoTransactions.filter((t) => t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
    }))
    .sort((a, b) => b.total - a.total)
  const max = Math.max(...rows.map((r) => r.total), 1)

  return (
    <>
      <PageHeader
        title="Отчёты"
        subtitle="Расходы по категориям за октябрь 2026"
        action={
          <Button variant="outlined" startIcon={<DownloadIcon />} disabled>
            Экспорт в CSV
          </Button>
        }
      />
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            {rows.map((r) => (
              <Box key={r.name}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>{r.name}</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{formatMoney(r.total)}</Typography>
                </Box>
                <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', mt: 0.5 }}>
                  <Box sx={{ height: 1, width: `${(r.total / max) * 100}%`, borderRadius: 4, bgcolor: 'primary.main' }} />
                </Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </>
  )
}
