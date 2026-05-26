// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { hasPermission } from 'utils/admin-access';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const { admin } = useAdminAuth();
  const allowed = (item) => {
    if (item.roles && !item.roles.includes(admin?.role)) return false;
    if (item.permission && !hasPermission(admin, item.permission.resource, item.permission.action)) return false;
    return true;
  };
  const filteredMenu = menuItem.items
    .map((group) => ({
      ...group,
      children: group.children
        ?.filter((item) => allowed(item) && (!item.assignedTurf || admin?.turfId))
        .map((item) => (item.assignedTurf ? { ...item, url: item.url.replace(':assignedTurfId', admin.turfId) } : item))
    }))
    .filter((group) => group.children?.length);

  const navGroups = filteredMenu.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
}
