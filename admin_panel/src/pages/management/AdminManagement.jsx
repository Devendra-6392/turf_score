import { useState } from 'react';
import useSWR from 'swr';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authHeaders } from 'utils/admin-access';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminManagement() {
  const { admin } = useAdminAuth();
  const { data: turfs } = useSWR(`${import.meta.env.VITE_APP_API_URL}/turfs`, fetcher);
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', turfId: '' });
  const [status, setStatus] = useState(null);

  if (admin?.role !== 'SUPER_ADMIN') {
    return <Alert severity="error">Access Denied. Only Super Admins can manage administrators.</Alert>;
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setStatus(null);
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/admin/create-turf-admin`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setStatus({ 
        type: 'success', 
        message: `Admin created! Default password: ${formData.name}@12345` 
      });
      setFormData({ name: '', email: '', turfId: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard
          title="Marketplace Administrators"
          secondary={
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleOpen}>
              Add Turf Admin
            </Button>
          }
        >
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Assigned Turf</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Normally we'd fetch admins here too, but for now we focus on the creation flow */}
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Use the "Add Turf Admin" button to expand your team.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Turf Administrator</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {status && <Alert severity={status.type}>{status.message}</Alert>}
            <TextField
              label="Full Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email Address"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              select
              label="Assign to Turf"
              fullWidth
              value={formData.turfId}
              onChange={(e) => setFormData({ ...formData, turfId: e.target.value })}
            >
              {turfs?.map((turf) => (
                <MenuItem key={turf.id} value={turf.id}>
                  {turf.name}
                </MenuItem>
              ))}
            </TextField>
            <Typography variant="caption" color="textSecondary">
              * The default password will be: <strong>fullname@12345</strong>
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.turfId}>
            Create Admin
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
