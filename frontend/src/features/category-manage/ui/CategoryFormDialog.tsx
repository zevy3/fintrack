import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material'
import { categoryApi } from '../../../entities/category'
import { errorMessage } from '../../../shared/api/errors'
import { useNotify } from '../../../shared/ui'

const schema = z.object({
  name: z.string().trim().min(1, 'Введите название').max(100, 'Не более 100 символов'),
  kind: z.enum(['income', 'expense']),
})

type FormValues = z.infer<typeof schema>

export function CategoryFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const notify = useNotify()
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', kind: 'expense' },
  })
  const mutation = useMutation({
    mutationFn: (v: FormValues) => categoryApi.create(v),
    onSuccess: () => {
      queryClient.invalidateQueries()
      notify('Категория добавлена')
      onClose()
    },
  })

  useEffect(() => {
    if (open) {
      reset({ name: '', kind: 'expense' })
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <DialogTitle>Новая категория</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {mutation.isError && <Alert severity="error">{errorMessage(mutation.error)}</Alert>}
            <Controller
              name="kind"
              control={control}
              render={({ field }) => (
                <TextField select label="Тип" {...field}>
                  <MenuItem value="expense">Расход</MenuItem>
                  <MenuItem value="income">Доход</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField label="Название" autoFocus {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Сохранение…' : 'Добавить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
