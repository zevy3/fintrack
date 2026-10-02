import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material'
import { budgetApi, type Budget } from '../../../entities/budget'
import { useCategories } from '../../../entities/category'
import { errorMessage } from '../../../shared/api/errors'
import { monthLabel } from '../../../shared/lib/format'
import { useNotify } from '../../../shared/ui'

const schema = z.object({
  category_id: z.string().min(1, 'Выберите категорию'),
  limit: z
    .string()
    .trim()
    .min(1, 'Введите лимит')
    .regex(/^\d+([.,]\d{1,2})?$/, 'Введите число: не более двух знаков после запятой')
    .refine((v) => Number(v.replace(',', '.')) > 0, 'Лимит должен быть больше нуля'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  month: string
  budget?: Budget // если передан — меняется только лимит
  onClose: () => void
}

export function BudgetFormDialog({ open, month, budget, onClose }: Props) {
  const queryClient = useQueryClient()
  const notify = useNotify()
  const { data: categories = [] } = useCategories()
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category_id: '', limit: '' },
  })

  const mutation = useMutation({
    mutationFn: (v: FormValues) => {
      const limit = Number(v.limit.replace(',', '.'))
      return budget
        ? budgetApi.updateLimit(budget.id, limit)
        : budgetApi.create({ category_id: Number(v.category_id), month, limit })
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
      notify(budget ? 'Лимит обновлён' : 'Бюджет добавлен')
      onClose()
    },
  })

  useEffect(() => {
    if (open) {
      reset({ category_id: budget ? String(budget.category_id) : '', limit: budget ? String(budget.limit) : '' })
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, budget, reset])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <DialogTitle>{budget ? 'Изменить лимит' : `Новый бюджет — ${monthLabel(month)}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {mutation.isError && <Alert severity="error">{errorMessage(mutation.error)}</Alert>}
            <Controller
              name="category_id"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  label="Категория расходов"
                  disabled={!!budget}
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {categories
                    .filter((c) => c.kind === 'expense')
                    .map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
            <Controller
              name="limit"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Лимит, ₽"
                  inputMode="decimal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
