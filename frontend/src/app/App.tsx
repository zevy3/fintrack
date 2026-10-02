import { Route, Routes } from 'react-router-dom'
import { BudgetsPage } from '../pages/budgets'
import { CategoriesPage } from '../pages/categories'
import { DashboardPage } from '../pages/dashboard'
import { NotFoundPage } from '../pages/not-found'
import { ReportsPage } from '../pages/reports'
import { TransactionsPage } from '../pages/transactions'
import { Layout } from './layout/Layout'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
