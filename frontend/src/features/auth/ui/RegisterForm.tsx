import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material'
import { authApi, useAuth } from '../../../entities/user'
import { errorMessage } from '../../../shared/api/errors'

const schema = z
  .object({
    name: z.string().trim().min(1, 'Введите имя').max(100, 'Не более 100 символов'),
    email: z.string().trim().min(1, 'Введите e-mail').email('Некорректный e-mail'),
    password: z
      .string()
      .min(8, 'Не менее 8 символов')
      .max(128, 'Не более 128 символов')
      .refine((v) => /[A-Za-zА-Яа-яЁё]/.test(v) && /\d/.test(v), 'Пароль должен содержать буквы и цифры'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Пароли не совпадают' })

type FormValues = z.infer<typeof schema>

export function RegisterForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  })

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setError(null)
    try {
      await authApi.register({ name, email, password })
      await login({ email, password }) // после регистрации сразу входим
      navigate('/', { replace: true })
    } catch (e) {
      setError(errorMessage(e))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack spacing={2}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Регистрация
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField label="Имя" autoComplete="name" autoFocus {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <TextField label="E-mail" type="email" autoComplete="username" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <TextField label="Пароль" type="password" autoComplete="new-password" {...field} error={!!fieldState.error} helperText={fieldState.error?.message ?? 'Не менее 8 символов, буквы и цифры'} />
          )}
        />
        <Controller
          name="confirm"
          control={control}
          render={({ field, fieldState }) => (
            <TextField label="Повторите пароль" type="password" autoComplete="new-password" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
          )}
        />
        <Button type="submit" variant="contained" size="large" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Регистрация…' : 'Создать аккаунт'}
        </Button>
        <Typography variant="body2" align="center">
          Уже есть аккаунт?{' '}
          <Link component={RouterLink} to="/login">
            Войти
          </Link>
        </Typography>
      </Stack>
    </form>
  )
}
