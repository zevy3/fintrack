import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { transactionApi } from '../../../entities/transaction'
import { errorMessage } from '../../../shared/api/errors'
import { ConfirmDialog, useNotify } from '../../../shared/ui'

export function DeleteTransactionButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const notify = useNotify()
  const mutation = useMutation({
    mutationFn: () => transactionApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries()
      notify('Операция удалена')
      setOpen(false)
    },
    onError: (e) => {
      notify(errorMessage(e), 'error')
      setOpen(false)
    },
  })

  return (
    <>
      <IconButton aria-label="Удалить операцию" onClick={() => setOpen(true)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
      <ConfirmDialog
        open={open}
        title="Удалить операцию?"
        text="Действие нельзя отменить."
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
