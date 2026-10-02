import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface Props {
  open: boolean
  title: string
  text: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, title, text, confirmLabel = 'Удалить', loading, onConfirm, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
