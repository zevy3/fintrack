import { useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../../../entities/user'
import { errorMessage } from '../../../shared/api/errors'

const schema = z.object({
  email: z.string().trim().min(1, 'Введите e-mail').email('Некорректный e-mail'),
  password: z.string().min(1, 'Введите пароль'),
})
type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await login(values)
      navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true })
    } catch (e) {
      setError(errorMessage(e))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack spacing={2}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Вход
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <TextField label="E-mail" type="email" autoComplete="username" autoFocus {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <TextField label="Пароль" type="password" autoComplete="current-password" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
          )}
        />
        <Button type="submit" variant="contained" size="large" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Вход…' : 'Войти'}
        </Button>
        <Typography variant="body2" align="center">
          Нет аккаунта?{' '}
          <Link component={RouterLink} to="/register">
            Зарегистрироваться
          </Link>
        </Typography>
      </Stack>
    </form>
  )
}
