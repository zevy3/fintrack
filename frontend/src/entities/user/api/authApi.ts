import { http } from '../../../shared/api/http'
import { tokens, type TokenPair } from '../../../shared/api/tokens'
import type { LoginInput, RegisterInput, User } from '../model/types'

export const authApi = {
  register: (input: RegisterInput) => http.json<User>('/auth/register', { method: 'POST', body: input, auth: false }),

  async login(input: LoginInput): Promise<User> {
    const pair = await http.json<TokenPair>('/auth/login', { method: 'POST', body: input, auth: false })
    tokens.set(pair)
    return authApi.me()
  },

  me: () => http.json<User>('/auth/me'),

  /** Отзывает refresh-токен на сервере и очищает токены на клиенте (даже если сервер недоступен). */
  async logout(): Promise<void> {
    const refresh = tokens.refresh()
    tokens.clear()
    if (refresh) {
      await http.empty('/auth/logout', { method: 'POST', body: { refresh_token: refresh }, auth: false }).catch(() => {})
    }
  },
}
