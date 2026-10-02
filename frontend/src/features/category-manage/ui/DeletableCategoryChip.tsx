import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CategoryChip, categoryApi, type Category } from '../../../entities/category'
import { errorMessage } from '../../../shared/api/errors'
import { ConfirmDialog, useNotify } from '../../../shared/ui'

/** Чип категории с удалением через подтверждение. */
export function DeletableCategoryChip({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const notify = useNotify()
  const mutation = useMutation({
    mutationFn: () => categoryApi.remove(category.id),
    onSuccess: () => {
      queryClient.invalidateQueries()
      notify('Категория удалена')
    },
    onError: (e) => notify(errorMessage(e), 'error'),
    onSettled: () => setOpen(false),
  })

  return (
    <>
      <CategoryChip name={category.name} kind={category.kind} onDelete={() => setOpen(true)} />
      <ConfirmDialog
        open={open}
        title={`Удалить категорию «${category.name}»?`}
        text="Категорию с операциями удалить нельзя."
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
