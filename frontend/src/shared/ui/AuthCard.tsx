import type { ReactNode } from 'react'
import { Box, Paper, Typography } from '@mui/material'

/** Центрированная карточка для страниц входа и регистрации. */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, gap: 2 }}>
      <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
        Личный финучёт
      </Typography>
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 420 }}>
        {children}
      </Paper>
    </Box>
  )
}
