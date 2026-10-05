import { API_URL } from '../config'
import { ApiError } from './errors'
import { emitAuthLost, tokens, type TokenPair } from './tokens'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | undefined>
  auth?: boolean // добавлять ли Authorization (по умолчанию да)
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return `${API_URL}${path}${qs ? `?${qs}` : ''}`
}

/** Достаёт понятное сообщение из ответа FastAPI: {detail: "..."} или список ошибок валидации. */
async function toApiError(response: Response): Promise<ApiError> {
  let message = `Ошибка запроса (${response.status})`
  try {
    const data = await response.json()
    if (typeof data.detail === 'string') message = data.detail
    else if (Array.isArray(data.detail)) {
      message = data.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; ') || message
    }
  } catch {
    /* тело не JSON */
  }
  return new ApiError(response.status, message)
}

// Одновременные 401 должны вызвать только один запрос на обновление токена.
let refreshing: Promise<boolean> | null = null

async function refreshTokens(): Promise<boolean> {
  const refresh = tokens.refresh()
  if (!refresh) return false
  refreshing ??= fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  })
    .then(async (response) => {
      if (!response.ok) return false
      tokens.set((await response.json()) as TokenPair)
      return true
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

async function send(path: string, { method = 'GET', body, query, auth = true }: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokens.access()
  if (auth && token) headers.Authorization = `Bearer ${token}`
  try {
    return await fetch(buildUrl(path, query), { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError(0, 'Нет связи с сервером')
  }
}

async function request(path: string, options: RequestOptions = {}): Promise<Response> {
  let response = await send(path, options)
  if (response.status === 401 && options.auth !== false) {
    if (await refreshTokens()) {
      response = await send(path, options)
    }
    if (response.status === 401) {
      tokens.clear()
      emitAuthLost()
    }
  }
  if (!response.ok) throw await toApiError(response)
  return response
}

export const http = {
  async json<T>(path: string, options?: RequestOptions): Promise<T> {
    const response = await request(path, options)
    return (await response.json()) as T
  },
  async empty(path: string, options?: RequestOptions): Promise<void> {
    await request(path, options)
  },
  async blob(path: string, options?: RequestOptions): Promise<Blob> {
    return (await request(path, options)).blob()
  },
}
