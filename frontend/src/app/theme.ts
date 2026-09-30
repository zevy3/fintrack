import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#2e7d6b' },
    secondary: { main: '#3a5a9b' },
    success: { main: '#2e7d32' },
    error: { main: '#c62828' },
    background: { default: '#f4f6f8' },
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
})
