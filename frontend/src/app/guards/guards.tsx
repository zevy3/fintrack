import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../../entities/user'

function Splash() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  )
}

/** Пускает только авторизованных; остальных отправляет на /login, запомнив исходную страницу. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <Splash />
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Страницы входа и регистрации недоступны уже вошедшему пользователю. */
export function PublicOnly() {
  const { status } = useAuth()
  if (status === 'loading') return <Splash />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}
