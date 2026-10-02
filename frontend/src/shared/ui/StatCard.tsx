import { Card, CardContent, Grow, Typography } from '@mui/material'

interface Props {
  label: string
  value: string
  color?: string
  delay?: number
}

export function StatCard({ label, value, color, delay = 0 }: Props) {
  return (
    <Grow in timeout={500} style={{ transitionDelay: `${delay}ms` }}>
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
    </Grow>
  )
}
