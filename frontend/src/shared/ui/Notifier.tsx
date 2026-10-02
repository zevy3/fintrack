import { useCallback, useState, type ReactNode } from 'react'
import { Alert, Snackbar } from '@mui/material'
import { NotifyContext, type Notify, type Severity } from './notify-context'


export function NotifierProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ message: string; severity: Severity } | null>(null)
  const notify = useCallback<Notify>((message, severity = 'success') => setState({ message, severity }), [])

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <Snackbar
        open={state !== null}
        autoHideDuration={4000}
        onClose={() => setState(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={state?.severity ?? 'success'} variant="filled" onClose={() => setState(null)}>
          {state?.message}
        </Alert>
      </Snackbar>
    </NotifyContext.Provider>
  )
}
