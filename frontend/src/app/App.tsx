import { Route, Routes } from 'react-router-dom'
import { BudgetsPage } from '../pages/budgets'
import { CategoriesPage } from '../pages/categories'
import { DashboardPage } from '../pages/dashboard'
import { NotFoundPage } from '../pages/not-found'
import { ReportsPage } from '../pages/reports'
import { TransactionsPage } from '../pages/transactions'
import { LoginPage } from '../pages/login'
import { RegisterPage } from '../pages/register'
import { PublicOnly, RequireAuth } from './guards/guards'
import { Layout } from './layout/Layout'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
