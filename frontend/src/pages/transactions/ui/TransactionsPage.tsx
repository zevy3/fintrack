import { useState } from 'react'
import {
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { CategoryChip, useCategories } from '../../../entities/category'
import { Amount, useTransactions, type Transaction } from '../../../entities/transaction'
import { DeleteTransactionButton } from '../../../features/transaction-delete'
import { TransactionFormDialog } from '../../../features/transaction-form'
import type { Kind } from '../../../shared/api/types'
import { formatDate } from '../../../shared/lib/format'
import { LoadState, PageHeader } from '../../../shared/ui'

const PAGE_SIZE = 10

export function TransactionsPage() {
  const [kind, setKind] = useState<Kind | ''>('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [page, setPage] = useState(0)
  const [dialog, setDialog] = useState<{ open: boolean; item?: Transaction }>({ open: false })

  const { data: categories = [] } = useCategories()
  const query = useTransactions({
    kind: kind || undefined,
    category_id: categoryId || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  })
  const category = (id: number) => categories.find((c) => c.id === id)

  return (
    <>
      <PageHeader
        title="Операции"
        subtitle="Доходы и расходы"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true })}>
            Добавить операцию
          </Button>
        }
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Тип"
          value={kind}
          onChange={(e) => { setKind(e.target.value as Kind | ''); setCategoryId(''); setPage(0) }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Все</MenuItem>
          <MenuItem value="income">Доходы</MenuItem>
          <MenuItem value="expense">Расходы</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Категория"
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value === '' ? '' : Number(e.target.value)); setPage(0) }}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Все</MenuItem>
          {categories
            .filter((c) => !kind || c.kind === kind)
            .map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
        </TextField>
      </Stack>

      <LoadState
        isLoading={query.isLoading}
        error={query.error}
        isEmpty={query.data?.total === 0}
        emptyText="Операций не найдено. Измените фильтры или добавьте новую операцию."
        onRetry={() => query.refetch()}
      >
        <TableContainer component={Paper} variant="outlined" sx={{ opacity: query.isPlaceholderData ? 0.6 : 1, transition: 'opacity .2s' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Комментарий</TableCell>
                <TableCell align="right">Сумма</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {query.data?.items.map((t) => {
                const c = category(t.category_id)
                return (
                  <TableRow key={t.id} hover>
                    <TableCell>{formatDate(t.date)}</TableCell>
                    <TableCell>{c ? <CategoryChip name={c.name} kind={c.kind} /> : '—'}</TableCell>
                    <TableCell>{t.note}</TableCell>
                    <TableCell align="right">
                      <Amount kind={t.kind} value={t.amount} />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton aria-label="Редактировать операцию" onClick={() => setDialog({ open: true, item: t })}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <DeleteTransactionButton id={t.id} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={query.data?.total ?? 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          />
        </TableContainer>
      </LoadState>

      <TransactionFormDialog open={dialog.open} transaction={dialog.item} onClose={() => setDialog({ open: false })} />
    </>
  )
}
