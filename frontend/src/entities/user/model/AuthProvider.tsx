import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { onAuthLost, tokens } from '../../../shared/api/tokens'
import { authApi } from '../api/authApi'
import { AuthContext, type AuthState } from './auth-context'
import type { LoginInput, User } from './types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthState['status']>(tokens.access() || tokens.refresh() ? 'loading' : 'anonymous')

  // При старте восстанавливаем сессию по сохранённым токенам.
  useEffect(() => {
    if (status !== 'loading') return
    authApi
      .me()
      .then((u) => {
        setUser(u)
        setStatus('authenticated')
      })
      .catch(() => {
        tokens.clear()
        setStatus('anonymous')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Сессия потеряна (refresh не сработал): возвращаем пользователя на вход.
  useEffect(
    () =>
      onAuthLost(() => {
        setUser(null)
        setStatus('anonymous')
        queryClient.clear()
      }),
    [queryClient],
  )

  const login = useCallback(async (input: LoginInput) => {
    const u = await authApi.login(input)
    setUser(u)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    queryClient.clear() // данные прежнего пользователя не должны остаться в кэше
    setUser(null)
    setStatus('anonymous')
  }, [queryClient])

  const value = useMemo(() => ({ status, user, login, logout }), [status, user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
