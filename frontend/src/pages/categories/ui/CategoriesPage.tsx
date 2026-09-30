import { Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material'
import { PageHeader } from '../components/PageHeader'
import { demoCategories } from '../data/demo'

export function CategoriesPage() {
  const groups = [
    { title: 'Доходы', items: demoCategories.filter((c) => c.kind === 'income'), color: 'success' as const },
    { title: 'Расходы', items: demoCategories.filter((c) => c.kind === 'expense'), color: 'error' as const },
  ]

  return (
    <>
      <PageHeader title="Категории" subtitle="Группировка доходов и расходов" />
      <Grid container spacing={2}>
        {groups.map((g) => (
          <Grid key={g.title} size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {g.title}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {g.items.map((c) => (
                    <Chip key={c.id} label={c.name} color={g.color} variant="outlined" />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  )
}
