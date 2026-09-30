// Демонстрационные данные для mock-режима (ЛР3). Форма совпадает с ответами backend.
export const demoCategories = [
  { id: 1, name: 'Зарплата', kind: 'income' as const },
  { id: 2, name: 'Подработка', kind: 'income' as const },
  { id: 3, name: 'Продукты', kind: 'expense' as const },
  { id: 4, name: 'Транспорт', kind: 'expense' as const },
  { id: 5, name: 'Развлечения', kind: 'expense' as const },
  { id: 6, name: 'Связь и интернет', kind: 'expense' as const },
]

export const demoTransactions = [
  { id: 1, kind: 'income' as const, amount: 60000, date: '2026-10-01', category_id: 1, note: 'Аванс' },
  { id: 2, kind: 'income' as const, amount: 8500, date: '2026-10-03', category_id: 2, note: 'Заказ на вёрстку' },
  { id: 3, kind: 'expense' as const, amount: 3240, date: '2026-10-02', category_id: 3, note: 'Продукты на неделю' },
  { id: 4, kind: 'expense' as const, amount: 2100, date: '2026-10-04', category_id: 4, note: 'Карта «Тройка»' },
  { id: 5, kind: 'expense' as const, amount: 1800, date: '2026-10-05', category_id: 5, note: 'Кино' },
  { id: 6, kind: 'expense' as const, amount: 650, date: '2026-10-05', category_id: 6, note: 'Мобильная связь' },
  { id: 7, kind: 'expense' as const, amount: 2780, date: '2026-10-06', category_id: 3, note: 'Супермаркет' },
]

export const demoBudgets = [
  { id: 1, category_id: 3, month: '2026-10', limit: 15000 },
  { id: 2, category_id: 4, month: '2026-10', limit: 4000 },
  { id: 3, category_id: 5, month: '2026-10', limit: 3000 },
  { id: 4, category_id: 6, month: '2026-10', limit: 800 },
]
