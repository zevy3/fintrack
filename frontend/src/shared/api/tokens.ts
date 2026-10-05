// Хранение пары токенов. localStorage переживает перезагрузку страницы;
// риск (XSS) учтён: токены не логируются, access живёт недолго, refresh отзывается на сервере.
const ACCESS = 'ft.access'
const REFRESH = 'ft.refresh'

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export const tokens = {
  access: () => localStorage.getItem(ACCESS),
  refresh: () => localStorage.getItem(REFRESH),
  set(pair: TokenPair) {
    localStorage.setItem(ACCESS, pair.access_token)
    localStorage.setItem(REFRESH, pair.refresh_token)
  },
  clear() {
    localStorage.removeItem(ACCESS)
    localStorage.removeItem(REFRESH)
  },
}

// Сообщение приложению о потере сессии (refresh не сработал).
const listeners = new Set<() => void>()
export const onAuthLost = (fn: () => void) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
export const emitAuthLost = () => listeners.forEach((fn) => fn())
