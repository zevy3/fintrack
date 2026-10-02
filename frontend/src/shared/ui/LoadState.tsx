import type { ReactNode } from 'react'
import { Alert, Box, Button, CircularProgress, Fade, Typography } from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'
import { errorMessage } from '../api/errors'

interface Props {
  isLoading: boolean
  error: unknown
  isEmpty: boolean
  emptyText: string
  onRetry: () => void
  children: ReactNode
}

/** Единое отображение состояний «загрузка / ошибка / пусто / данные». */
export function LoadState({ isLoading, error, isEmpty, emptyText, onRetry, children }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }} role="status" aria-label="Загрузка">
        <CircularProgress />
      </Box>
    )
  }
  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Повторить
          </Button>
        }
      >
        Не удалось загрузить данные: {errorMessage(error)}
      </Alert>
    )
  }
  if (isEmpty) {
    return (
      <Fade in>
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <InboxIcon sx={{ fontSize: 56, opacity: 0.5 }} />
          <Typography sx={{ mt: 1 }}>{emptyText}</Typography>
        </Box>
      </Fade>
    )
  }
  return <>{children}</>
}
