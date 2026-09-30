import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', py: 8 }}>
      <Typography variant="h3">404</Typography>
      <Typography color="text.secondary">Такой страницы нет</Typography>
      <Button component={Link} to="/" variant="contained">
        На главную
      </Button>
    </Stack>
  )
}
