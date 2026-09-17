const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
})

export const formatMoney = (value: number) => money.format(value)

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const monthLabel = (month: string) =>
  new Date(`${month}-01`).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
