import { createContext, useContext } from 'react'
import type { LoginInput, User } from './types'

export interface AuthState {
  status: 'loading' | 'authenticated' | 'anonymous'
  user: User | null
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен вызываться внутри AuthProvider')
  return ctx
}
