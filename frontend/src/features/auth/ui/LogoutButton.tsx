import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../../../entities/user'

export function LogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  return (
    <Button
      color="inherit"
      startIcon={<LogoutIcon />}
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        await logout()
        navigate('/login', { replace: true })
      }}
    >
      Выйти
    </Button>
  )
}
