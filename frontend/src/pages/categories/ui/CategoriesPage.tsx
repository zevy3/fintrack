import { useState } from 'react'
import { Button, Card, CardContent, Grid, Grow, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useCategories } from '../../../entities/category'
import { CategoryFormDialog, DeletableCategoryChip } from '../../../features/category-manage'
import { LoadState, PageHeader } from '../../../shared/ui'

export function CategoriesPage() {
  const [open, setOpen] = useState(false)
  const query = useCategories()
  const groups = [
    { title: 'Доходы', kind: 'income' as const },
    { title: 'Расходы', kind: 'expense' as const },
  ]

  return (
    <>
      <PageHeader
        title="Категории"
        subtitle="Группировка доходов и расходов"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Добавить категорию
          </Button>
        }
      />
      <LoadState
        isLoading={query.isLoading}
        error={query.error}
        isEmpty={query.data?.length === 0}
        emptyText="Категорий пока нет. Создайте первую."
        onRetry={() => query.refetch()}
      >
        <Grid container spacing={2}>
          {groups.map((g, i) => (
            <Grid key={g.kind} size={{ xs: 12, md: 6 }}>
              <Grow in timeout={400} style={{ transitionDelay: `${i * 100}ms` }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {g.title}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {query.data
                        ?.filter((c) => c.kind === g.kind)
                        .map((c) => (
                          <DeletableCategoryChip key={c.id} category={c} />
                        ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </LoadState>
      <CategoryFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
