import React, { useContext } from 'react';
import { Box, AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Divider, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminAuthContext } from 'contexts/AdminAuthContext';
import { getThemeByRole } from 'themes/adminThemes';
import {
  Dashboard,
  Settings,
  People,
  EventNote,
  Receipt,
  BarChart,
  Shield,
  LogoutSharp,
  Menu as MenuIcon,
  Close as CloseIcon,
  Storefront,
  AccountCircle
} from '@mui/icons-material';
import { useState } from 'react';

const AdminLayout = ({ children }) => {
  const { admin, logout } = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const adminTheme = getThemeByRole(admin?.role);
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  const menuItems = isSuperAdmin ? [
    { label: 'Dashboard', icon: Dashboard, path: '/dashboard', color: '#7C3AED' },
    { label: 'Admin Users', icon: People, path: '/admins', color: '#EC4899' },
    { label: 'Turfs', icon: Storefront, path: '/turfs', color: '#7C3AED' },
    { label: 'Bookings', icon: EventNote, path: '/bookings', color: '#EC4899' },
    { label: 'Coupons', icon: Receipt, path: '/coupons', color: '#7C3AED' },
    { label: 'Reports', icon: BarChart, path: '/reports', color: '#EC4899' },
    { label: 'System Settings', icon: Settings, path: '/settings', color: '#7C3AED' },
  ] : [
    { label: 'Dashboard', icon: Dashboard, path: '/dashboard', color: '#06B6D4' },
    { label: 'My Turf', icon: Storefront, path: '/my-turf', color: '#3B82F6' },
    { label: 'Bookings', icon: EventNote, path: '/bookings', color: '#06B6D4' },
    { label: 'Slots', icon: EventNote, path: '/slots', color: '#3B82F6' },
    { label: 'Coupons', icon: Receipt, path: '/coupons', color: '#06B6D4' },
    { label: 'Analytics', icon: BarChart, path: '/analytics', color: '#3B82F6' },
    { label: 'Settings', icon: Settings, path: '/settings', color: '#06B6D4' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: adminTheme.colors.surface }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: adminTheme.colors.primary, color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
            {admin?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{admin?.name}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {admin?.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '🏟️ Turf Admin'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
            }}
            selected={location.pathname === item.path}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: '8px',
              backgroundColor: location.pathname === item.path ? `${item.color}15` : 'transparent',
              color: location.pathname === item.path ? item.color : 'inherit',
              '&:hover': {
                backgroundColor: `${item.color}10`,
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>
              <item.icon />
            </ListItemIcon>
            <ListItemText primary={item.label} sx={{ '& .MuiTypography-root': { fontWeight: 500 } }} />
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout */}
      <ListItem
        button
        onClick={handleLogout}
        sx={{
          mx: 1,
          mb: 1,
          borderRadius: '8px',
          color: adminTheme.colors.error,
          '&:hover': {
            backgroundColor: `${adminTheme.colors.error}10`,
          },
        }}
      >
        <ListItemIcon sx={{ color: adminTheme.colors.error, minWidth: 40 }}>
          <LogoutSharp />
        </ListItemIcon>
        <ListItemText primary="Logout" sx={{ '& .MuiTypography-root': { fontWeight: 500 } }} />
      </ListItem>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: adminTheme.colors.background }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 260,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 260,
              bgcolor: adminTheme.colors.surface,
              borderRight: `1px solid ${adminTheme.colors.border}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 260,
              bgcolor: adminTheme.colors.surface,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <AppBar
          position="static"
          sx={{
            background: `linear-gradient(135deg, ${adminTheme.colors.primary} 0%, ${adminTheme.colors.secondary} 100%)`,
            boxShadow: adminTheme.shadows.lg,
          }}
        >
          <Toolbar>
            {isMobile && (
              <MenuIcon
                onClick={() => setDrawerOpen(!drawerOpen)}
                sx={{ cursor: 'pointer', mr: 2 }}
              />
            )}
            <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
              {isSuperAdmin ? '⚙️ Super Admin Panel' : '🏟️ Turf Admin Panel'}
            </Typography>
            <Avatar sx={{ cursor: 'pointer', bgcolor: 'rgba(255,255,255,0.2)' }}>
              {admin?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

import Typography from '@mui/material/Typography';

export default AdminLayout;
