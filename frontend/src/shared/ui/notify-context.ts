import { createContext, useContext } from 'react'

export type Severity = 'success' | 'error'
export type Notify = (message: string, severity?: Severity) => void

export const NotifyContext = createContext<Notify>(() => {})

export const useNotify = () => useContext(NotifyContext)
