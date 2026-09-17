import type { Budget, Category, Transaction } from '../types'

// Демонстрационные данные: на этапе ЛР1 backend ещё не подключён.
export const demoCategories: Category[] = [
  { id: 1, name: 'Зарплата', kind: 'income' },
  { id: 2, name: 'Подработка', kind: 'income' },
  { id: 3, name: 'Продукты', kind: 'expense' },
  { id: 4, name: 'Транспорт', kind: 'expense' },
  { id: 5, name: 'Развлечения', kind: 'expense' },
  { id: 6, name: 'Связь и интернет', kind: 'expense' },
]

export const demoTransactions: Transaction[] = [
  { id: 1, kind: 'income', amount: 60000, date: '2026-10-01', categoryId: 1, note: 'Аванс' },
  { id: 2, kind: 'income', amount: 8500, date: '2026-10-03', categoryId: 2, note: 'Заказ на вёрстку' },
  { id: 3, kind: 'expense', amount: 3240, date: '2026-10-02', categoryId: 3, note: 'Продукты на неделю' },
  { id: 4, kind: 'expense', amount: 2100, date: '2026-10-04', categoryId: 4, note: 'Карта «Тройка»' },
  { id: 5, kind: 'expense', amount: 1800, date: '2026-10-05', categoryId: 5, note: 'Кино' },
  { id: 6, kind: 'expense', amount: 650, date: '2026-10-05', categoryId: 6, note: 'Мобильная связь' },
  { id: 7, kind: 'expense', amount: 2780, date: '2026-10-06', categoryId: 3, note: 'Супермаркет' },
]

export const demoBudgets: Budget[] = [
  { id: 1, categoryId: 3, month: '2026-10', limit: 15000 },
  { id: 2, categoryId: 4, month: '2026-10', limit: 4000 },
  { id: 3, categoryId: 5, month: '2026-10', limit: 3000 },
  { id: 4, categoryId: 6, month: '2026-10', limit: 800 },
]
