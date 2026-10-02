import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material'
import { transactionApi, type Transaction } from '../../../entities/transaction'
import { useCategories } from '../../../entities/category'
import { errorMessage } from '../../../shared/api/errors'
import { todayIso } from '../../../shared/lib/format'
import { useNotify } from '../../../shared/ui'

const schema = z.object({
  kind: z.enum(['income', 'expense']),
  amount: z
    .string()
    .trim()
    .min(1, 'Введите сумму')
    .regex(/^\d+([.,]\d{1,2})?$/, 'Введите число: не более двух знаков после запятой')
    .refine((v) => Number(v.replace(',', '.')) > 0, 'Сумма должна быть больше нуля'),
  date: z.string().min(1, 'Укажите дату'),
  category_id: z.string().min(1, 'Выберите категорию'),
  note: z.string().max(255, 'Не более 255 символов'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  transaction?: Transaction // если передана — режим редактирования
}

const emptyValues = (): FormValues => ({ kind: 'expense', amount: '', date: todayIso(), category_id: '', note: '' })

export function TransactionFormDialog({ open, onClose, transaction }: Props) {
  const queryClient = useQueryClient()
  const notify = useNotify()
  const { data: categories = [] } = useCategories()

  const { control, handleSubmit, reset, watch, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  })
  const kind = watch('kind')

  useEffect(() => {
    if (!open) return
    reset(
      transaction
        ? {
            kind: transaction.kind,
            amount: String(transaction.amount),
            date: transaction.date,
            category_id: String(transaction.category_id),
            note: transaction.note,
          }
        : emptyValues(),
    )
    mutation.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction, reset])

  const mutation = useMutation({
    mutationFn: (v: FormValues) => {
      const input = {
        kind: v.kind,
        amount: Number(v.amount.replace(',', '.')),
        date: v.date,
        category_id: Number(v.category_id),
        note: v.note.trim(),
      }
      return transaction ? transactionApi.update(transaction.id, input) : transactionApi.create(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
      notify(transaction ? 'Операция сохранена' : 'Операция добавлена')
      onClose()
    },
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <DialogTitle>{transaction ? 'Редактирование операции' : 'Новая операция'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {mutation.isError && <Alert severity="error">{errorMessage(mutation.error)}</Alert>}
            <Controller
              name="kind"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Тип"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    setValue('category_id', '') // категория должна соответствовать типу
                  }}
                >
                  <MenuItem value="expense">Расход</MenuItem>
                  <MenuItem value="income">Доход</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="amount"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Сумма, ₽"
                  inputMode="decimal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="date"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Дата"
                  type="date"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <Controller
              name="category_id"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  label="Категория"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {categories
                    .filter((c) => c.kind === kind)
                    .map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
            <Controller
              name="note"
              control={control}
              render={({ field, fieldState }) => (
                <TextField label="Комментарий" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending || formState.isSubmitting}>
            {mutation.isPending ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
