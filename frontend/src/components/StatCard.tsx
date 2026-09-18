import { Card, CardContent, Typography } from '@mui/material'

interface Props {
  label: string
  value: string
  color?: string
}

export function StatCard({ label, value, color }: Props) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.5, color, fontWeight: 600 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}
