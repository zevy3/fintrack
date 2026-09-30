import { useState } from 'react'
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { PageHeader } from '../components/PageHeader'
import { demoCategories, demoTransactions } from '../data/demo'
import type { Kind, Transaction } from '../types'
import { formatDate, formatMoney } from '../utils/format'

export function TransactionsPage() {
  const [items, setItems] = useState<Transaction[]>(demoTransactions)
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<Kind>('expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('2026-10-06')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [note, setNote] = useState('')

  const categoryName = (id: number) => demoCategories.find((c) => c.id === id)?.name ?? '—'
  const categories = demoCategories.filter((c) => c.kind === kind)

  const save = () => {
    if (!amount || categoryId === '') return
    setItems([{ id: Date.now(), kind, amount: Number(amount), date, categoryId, note }, ...items])
    setOpen(false)
    setAmount('')
    setNote('')
  }

  return (
    <>
      <PageHeader
        title="Операции"
        subtitle="Доходы и расходы"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Добавить операцию
          </Button>
        }
      />
      <TableContainer component={Paper} variant="outlined">
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
            {items.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{formatDate(t.date)}</TableCell>
                <TableCell>
                  <Chip size="small" label={categoryName(t.categoryId)} color={t.kind === 'income' ? 'success' : 'default'} />
                </TableCell>
                <TableCell>{t.note}</TableCell>
                <TableCell align="right" sx={{ color: t.kind === 'income' ? 'success.main' : 'error.main', fontWeight: 600 }}>
                  {t.kind === 'income' ? '+' : '−'}
                  {formatMoney(t.amount)}
                </TableCell>
                <TableCell align="right">
                  <IconButton aria-label="Удалить" onClick={() => setItems(items.filter((i) => i.id !== t.id))}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Новая операция</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Тип" value={kind} onChange={(e) => { setKind(e.target.value as Kind); setCategoryId('') }}>
              <MenuItem value="expense">Расход</MenuItem>
              <MenuItem value="income">Доход</MenuItem>
            </TextField>
            <TextField label="Сумма, ₽" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <TextField label="Дата" type="date" value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField select label="Категория" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Комментарий" value={note} onChange={(e) => setNote(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={save}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
