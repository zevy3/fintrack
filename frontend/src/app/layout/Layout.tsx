import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Container,
  Drawer,
  Fade,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CategoryIcon from '@mui/icons-material/Category'
import SavingsIcon from '@mui/icons-material/Savings'
import BarChartIcon from '@mui/icons-material/BarChart'

const DRAWER_WIDTH = 240

const links = [
  { to: '/', label: 'Обзор', icon: <DashboardIcon />, end: true },
  { to: '/transactions', label: 'Операции', icon: <ReceiptLongIcon /> },
  { to: '/categories', label: 'Категории', icon: <CategoryIcon /> },
  { to: '/budgets', label: 'Бюджеты', icon: <SavingsIcon /> },
  { to: '/reports', label: 'Отчёты', icon: <BarChartIcon /> },
]

export function Layout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const menu = (
    <List sx={{ pt: 2 }}>
      {links.map((link) => (
        <ListItemButton
          key={link.to}
          component={NavLink}
          to={link.to}
          end={link.end}
          onClick={() => setOpen(false)}
          sx={{ mx: 1, borderRadius: 2, '&.active': { bgcolor: 'primary.main', color: '#fff', '& .MuiListItemIcon-root': { color: '#fff' } } }}
        >
          <ListItemIcon>{link.icon}</ListItemIcon>
          <ListItemText primary={link.label} />
        </ListItemButton>
      ))}
    </List>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {!isDesktop && (
            <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 1 }} aria-label="Открыть меню">
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" noWrap>
            Личный финучёт
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop || open}
        onClose={() => setOpen(false)}
        sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        {menu}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Fade in key={location.pathname} timeout={350}>
            <div>
              <Outlet />
            </div>
          </Fade>
        </Container>
      </Box>
    </Box>
  )
}
