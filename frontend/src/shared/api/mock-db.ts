// Имитация backend в памяти браузера (ЛР3). Подключается только через entities/*/api,
// на этапе ЛР5 заменяется настоящими HTTP-запросами.
import type { Budget, BudgetInput } from '../../entities/budget/model/types'
import type { Category, CategoryInput } from '../../entities/category/model/types'
import type { MonthSummary } from '../../entities/report/model/types'
import type { Transaction, TransactionFilters, TransactionInput, TransactionPage } from '../../entities/transaction/model/types'
import { demoBudgets, demoCategories, demoTransactions } from './demo-data'
import { ApiError } from './errors'

// Режим для демонстрации состояний интерфейса: ?mock=error | empty | slow
const mode = new URLSearchParams(window.location.search).get('mock')

let categories: Category[] = structuredClone(demoCategories)
let transactions: Transaction[] = structuredClone(demoTransactions)
let budgets: Omit<Budget, 'spent'>[] = structuredClone(demoBudgets)
let nextId = 1000

async function latency<T>(fn: () => T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, mode === 'slow' ? 4000 : 500))
  if (mode === 'error') throw new ApiError(500, 'Сервер временно недоступен')
  return fn()
}

const isEmptyMode = mode === 'empty'

export const mockDb = {
  listCategories: () => latency(() => (isEmptyMode ? [] : [...categories])),

  createCategory: (input: CategoryInput) =>
    latency(() => {
      if (categories.some((c) => c.name === input.name && c.kind === input.kind)) {
        throw new ApiError(409, 'Такая категория уже существует')
      }
      const category = { id: nextId++, ...input }
      categories = [...categories, category]
      return category
    }),

  updateCategory: (id: number, name: string) =>
    latency(() => {
      const category = categories.find((c) => c.id === id)
      if (!category) throw new ApiError(404, 'Категория не найдена')
      category.name = name
      return { ...category }
    }),

  deleteCategory: (id: number) =>
    latency(() => {
      if (transactions.some((t) => t.category_id === id)) {
        throw new ApiError(409, 'Нельзя удалить категорию, в которой есть операции')
      }
      categories = categories.filter((c) => c.id !== id)
    }),

  listTransactions: (f: TransactionFilters) =>
    latency((): TransactionPage => {
      if (isEmptyMode) return { items: [], total: 0 }
      const filtered = transactions
        .filter((t) => (f.kind ? t.kind === f.kind : true) && (f.category_id ? t.category_id === f.category_id : true))
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      return { items: filtered.slice(f.offset, f.offset + f.limit), total: filtered.length }
    }),

  createTransaction: (input: TransactionInput) =>
    latency(() => {
      checkTransaction(input)
      const item = { id: nextId++, ...input }
      transactions = [item, ...transactions]
      return item
    }),

  updateTransaction: (id: number, input: TransactionInput) =>
    latency(() => {
      checkTransaction(input)
      const index = transactions.findIndex((t) => t.id === id)
      if (index < 0) throw new ApiError(404, 'Операция не найдена')
      transactions[index] = { id, ...input }
      return transactions[index]
    }),

  deleteTransaction: (id: number) =>
    latency(() => {
      transactions = transactions.filter((t) => t.id !== id)
    }),

  listBudgets: (month: string) =>
    latency((): Budget[] =>
      isEmptyMode
        ? []
        : budgets.filter((b) => b.month === month).map((b) => ({ ...b, spent: spent(b.category_id, month) })),
    ),

  createBudget: (input: BudgetInput) =>
    latency((): Budget => {
      const category = categories.find((c) => c.id === input.category_id)
      if (!category) throw new ApiError(404, 'Категория не найдена')
      if (category.kind !== 'expense') throw new ApiError(422, 'Бюджет можно задать только для категории расходов')
      if (budgets.some((b) => b.category_id === input.category_id && b.month === input.month)) {
        throw new ApiError(409, 'Бюджет на эту категорию и месяц уже существует')
      }
      const budget = { id: nextId++, ...input }
      budgets = [...budgets, budget]
      return { ...budget, spent: spent(budget.category_id, budget.month) }
    }),

  updateBudget: (id: number, limit: number) =>
    latency((): Budget => {
      const budget = budgets.find((b) => b.id === id)
      if (!budget) throw new ApiError(404, 'Бюджет не найден')
      budget.limit = limit
      return { ...budget, spent: spent(budget.category_id, budget.month) }
    }),

  deleteBudget: (id: number) =>
    latency(() => {
      budgets = budgets.filter((b) => b.id !== id)
    }),

  summary: (month: string) =>
    latency((): MonthSummary => {
      const inMonth = isEmptyMode ? [] : transactions.filter((t) => t.date.startsWith(month))
      const totals = new Map<number, number>()
      for (const t of inMonth) totals.set(t.category_id, (totals.get(t.category_id) ?? 0) + t.amount)
      const by_category = [...totals.entries()]
        .map(([category_id, total]) => {
          const c = categories.find((x) => x.id === category_id)!
          return { category_id, category_name: c.name, kind: c.kind, total }
        })
        .sort((a, b) => b.total - a.total)
      const sum = (kind: string) => by_category.filter((c) => c.kind === kind).reduce((s, c) => s + c.total, 0)
      return { month, income: sum('income'), expense: sum('expense'), balance: sum('income') - sum('expense'), by_category }
    }),

  exportCsv: (month: string) =>
    latency(() => {
      const lines = transactions
        .filter((t) => t.date.startsWith(month))
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((t) => {
          const name = categories.find((c) => c.id === t.category_id)?.name ?? ''
          return [t.date, t.kind === 'income' ? 'доход' : 'расход', name, t.amount.toFixed(2), t.note].join(';')
        })
      return new Blob(['﻿Дата;Тип;Категория;Сумма;Комментарий\n' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    }),
}

function spent(categoryId: number, month: string): number {
  return transactions
    .filter((t) => t.kind === 'expense' && t.category_id === categoryId && t.date.startsWith(month))
    .reduce((s, t) => s + t.amount, 0)
}

function checkTransaction(input: TransactionInput) {
  const category = categories.find((c) => c.id === input.category_id)
  if (!category) throw new ApiError(404, 'Категория не найдена')
  if (category.kind !== input.kind) throw new ApiError(422, 'Тип операции не совпадает с типом категории')
}
