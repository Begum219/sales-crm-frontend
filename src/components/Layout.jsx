import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { useAuth } from '../context/useAuth';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Müşteri Adayları', path: '/leads' },
  { label: 'Müşteri Şirketleri', path: '/customers' },
  { label: 'Fırsatlar', path: '/deals' },
  { label: 'Teklifler', path: '/offers' },
];

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <BusinessCenterIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              Satış<Box component="span" sx={{ color: '#4A90A4' }}>CRM</Box>
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                sx={{
                  borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                  borderRadius: 0,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </Toolbar>
      </AppBar>

      <Outlet />
    </Box>
  );
}

export default Layout;