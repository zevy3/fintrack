import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { budgetApi } from '../../../entities/budget'
import { errorMessage } from '../../../shared/api/errors'
import { ConfirmDialog, useNotify } from '../../../shared/ui'

export function DeleteBudgetButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const notify = useNotify()
  const mutation = useMutation({
    mutationFn: () => budgetApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries()
      notify('Бюджет удалён')
    },
    onError: (e) => notify(errorMessage(e), 'error'),
    onSettled: () => setOpen(false),
  })

  return (
    <>
      <IconButton aria-label="Удалить бюджет" onClick={() => setOpen(true)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
      <ConfirmDialog
        open={open}
        title="Удалить бюджет?"
        text="Операции останутся, исчезнет только лимит."
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
