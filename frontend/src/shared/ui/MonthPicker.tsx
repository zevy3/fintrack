import { TextField } from '@mui/material'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function MonthPicker({ value, onChange }: Props) {
  return (
    <TextField
      type="month"
      size="small"
      label="Месяц"
      value={value}
      onChange={(e) => e.target.value && onChange(e.target.value)}
      slotProps={{ inputLabel: { shrink: true } }}
    />
  )
}
