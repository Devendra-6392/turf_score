import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// project imports
import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authHeaders, hasPermission } from 'utils/admin-access';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function TurfManagement() {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();
  const canView = hasPermission(admin, 'turfs', 'view');
  const canEdit = hasPermission(admin, 'turfs', 'edit');
  const canDelete = hasPermission(admin, 'turfs', 'delete');
  const canManageSlots = hasPermission(admin, 'slots', 'view');
  const { data: turfs, isLoading } = useSWR(
    `${import.meta.env.VITE_APP_API_URL}/turfs`,
    fetcher
  );

  const [editMode, setEditMode] = useState(false);
  const [selectedTurfId, setSelectedTurfId] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: '',
    state: '',
    pricePerHour: 800,
    description: '',
    category: 'Football'
  });

  const handleOpen = (turf = null) => {
    if (turf) {
      setEditMode(true);
      setSelectedTurfId(turf.id);
      setFormData({
        name: turf.name,
        location: turf.location,
        city: turf.city,
        state: turf.state || 'State',
        pricePerHour: turf.pricePerHour,
        description: turf.description,
        category: turf.category
      });
    } else {
      setEditMode(false);
      setSelectedTurfId(null);
      setFormData({
        name: '',
        location: '',
        city: '',
        state: 'State',
        pricePerHour: 800,
        description: '',
        category: 'Football'
      });
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const url = editMode
        ? `${import.meta.env.VITE_APP_API_URL}/turfs/${selectedTurfId}`
        : `${import.meta.env.VITE_APP_API_URL}/turfs`;

      const res = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error(`Failed to ${editMode ? 'update' : 'create'} turf`);
      mutate(`${import.meta.env.VITE_APP_API_URL}/turfs`);
      handleClose();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this turf?')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/turfs/${id}`, {
          method: 'DELETE',
          headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete turf');
        mutate(`${import.meta.env.VITE_APP_API_URL}/turfs`);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (!canView) return <Alert severity="error">You do not have permission to view turf details.</Alert>;

  const filteredTurfs = turfs?.filter((t) => admin.role === 'SUPER_ADMIN' || t.id === admin.turfId);

  return (
    <MainCard
      title={admin?.role === 'SUPER_ADMIN' ? 'Manage Turfs' : 'My Assigned Turf'}
      secondary={
        admin?.role === 'SUPER_ADMIN' && (
          <Button variant="contained" startIcon={<PlusOutlined />} size="small" onClick={() => handleOpen()}>
            Add New Turf
          </Button>
        )
      }
    >
      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Price/hr</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTurfs?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>₹{row.pricePerHour}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {canManageSlots && (
                      <Tooltip title="Manage Slots">
                        <IconButton size="small" color="secondary" onClick={() => navigate(`/manage/turfs/${row.id}/slots`)}>
                          <CalendarOutlined />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canEdit && (
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleOpen(row)}>
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                          <DeleteOutlined />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {(!filteredTurfs || filteredTurfs.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No turfs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editMode ? 'Edit Turf Details' : 'Add New Turf'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Turf Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField label="Location" fullWidth value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            <TextField label="City" fullWidth value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
            <TextField label="Price Per Hour" type="number" fullWidth value={formData.pricePerHour} onChange={(e) => setFormData({ ...formData, pricePerHour: parseInt(e.target.value) })} />
            <TextField label="Description" multiline rows={3} fullWidth value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editMode ? 'Save Changes' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
