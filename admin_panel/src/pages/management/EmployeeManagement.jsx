import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { DeleteOutlined, EditOutlined, PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authFetcher, authHeaders, emptyPermissions, normalizePermissions, permissionModules } from 'utils/admin-access';

const publicFetcher = (url) => fetch(url).then((res) => res.json());
const blankForm = () => ({ name: '', email: '', password: '', turfId: '', isActive: true, permissions: emptyPermissions() });

export default function EmployeeManagement() {
  const { admin } = useAdminAuth();
  const employeesUrl =
    admin?.role === 'SUPER_ADMIN'
      ? `${import.meta.env.VITE_APP_API_URL}/admin/employees`
      : admin?.role === 'TURF_ADMIN'
        ? `${import.meta.env.VITE_APP_API_URL}/admin/employees?turfId=${admin.turfId}`
        : null;
  const { data: employees, error } = useSWR(employeesUrl, authFetcher);
  const { data: turfs } = useSWR(admin?.role === 'SUPER_ADMIN' ? `${import.meta.env.VITE_APP_API_URL}/turfs` : null, publicFetcher);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(blankForm);
  const [status, setStatus] = useState(null);

  if (admin?.role !== 'TURF_ADMIN' && admin?.role !== 'SUPER_ADMIN') {
    return <Alert severity="error">Access denied. Only administrators can configure employee access.</Alert>;
  }

  const openCreate = () => {
    setEditingId(null);
    setFormData({ ...blankForm(), turfId: admin.role === 'TURF_ADMIN' ? admin.turfId : '' });
    setStatus(null);
    setOpen(true);
  };

  const openEdit = (employee) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '',
      turfId: employee.turfId,
      isActive: employee.isActive,
      permissions: normalizePermissions(employee.permissions)
    });
    setStatus(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setStatus(null);
  };

  const setPermission = (moduleName, action, enabled) => {
    setFormData((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [moduleName]:
          action === 'view' && !enabled
            ? Object.keys(current.permissions[moduleName]).reduce((actions, key) => ({ ...actions, [key]: false }), {})
            : {
                ...current.permissions[moduleName],
                [action]: enabled,
                ...(action !== 'view' && enabled ? { view: true } : {})
              }
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/admin/employees${editingId ? `/${editingId}` : ''}`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: authHeaders(true),
          body: JSON.stringify(formData)
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save employee');

      mutate(employeesUrl);
      if (editingId) {
        handleClose();
      } else {
        setStatus({ type: 'success', message: `Employee created. Temporary password: ${data.employee.defaultPassword}` });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee and remove their dashboard access?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/admin/employees/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to delete employee');
      mutate(employeesUrl);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard
          title={admin.role === 'SUPER_ADMIN' ? 'Employee Access Across Turfs' : `${admin.turfName || 'My Turf'} Employees`}
          secondary={
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
              Add Employee
            </Button>
          }
        >
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}
          <Alert severity="info" icon={<SafetyCertificateOutlined />} sx={{ mb: 2 }}>
            Choose exactly what each employee can view, create, edit, or delete. Access applies only to their assigned turf.
          </Alert>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  {admin.role === 'SUPER_ADMIN' && <TableCell>Turf</TableCell>}
                  <TableCell>Access</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees?.map((employee) => {
                  const grants = permissionModules.filter((module) => employee.permissions?.[module.key]?.view);
                  return (
                    <TableRow key={employee.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{employee.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{employee.email}</Typography>
                      </TableCell>
                      {admin.role === 'SUPER_ADMIN' && <TableCell>{employee.turf?.name || '-'}</TableCell>}
                      <TableCell>
                        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                          {grants.length ? grants.map((module) => (
                            <Chip key={module.key} label={module.label} color="primary" size="small" variant="outlined" />
                          )) : <Chip label="No access" size="small" />}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={employee.isActive ? 'Active' : 'Disabled'} color={employee.isActive ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => openEdit(employee)} aria-label="Edit permissions">
                          <EditOutlined />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(employee.id)} aria-label="Delete employee">
                          <DeleteOutlined />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!employees?.length && (
                  <TableRow>
                    <TableCell colSpan={admin.role === 'SUPER_ADMIN' ? 5 : 4} align="center" sx={{ py: 4 }}>
                      No employees found. Add an employee and assign only the access they need.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Edit Employee Access' : 'Add Employee and Set Access'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {status && <Alert severity={status.type}>{status.message}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Full Name" fullWidth value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
              <TextField label="Email Address" fullWidth value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
            </Stack>
            {!editingId && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Password (Optional)" type="password" fullWidth value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} />
                {admin.role === 'SUPER_ADMIN' && (
                  <TextField select label="Assigned Turf" fullWidth value={formData.turfId} onChange={(event) => setFormData({ ...formData, turfId: event.target.value })}>
                    {turfs?.map((turf) => <MenuItem value={turf.id} key={turf.id}>{turf.name}</MenuItem>)}
                  </TextField>
                )}
              </Stack>
            )}
            {editingId && (
              <FormControlLabel
                control={<Checkbox checked={formData.isActive} onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })} />}
                label="Employee account is active"
              />
            )}
            <Divider />
            <Typography variant="h5">Access Levels</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Area</TableCell>
                    {['view', 'create', 'edit', 'delete'].map((action) => <TableCell key={action} align="center">{action}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissionModules.map((module) => (
                    <TableRow key={module.key}>
                      <TableCell>{module.label}</TableCell>
                      {['view', 'create', 'edit', 'delete'].map((action) => (
                        <TableCell key={action} align="center">
                          {module.actions.includes(action) && (
                            <Checkbox
                              checked={formData.permissions[module.key][action]}
                              onChange={(event) => setPermission(module.key, action, event.target.checked)}
                              size="small"
                            />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.name || !formData.email || (!editingId && !formData.turfId)}>
            {editingId ? 'Save Access' : 'Create Employee'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
