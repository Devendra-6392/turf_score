import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
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
  IconButton,
  Box,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import { PlusOutlined, DeleteOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authHeaders, hasPermission } from 'utils/admin-access';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SlotManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const canView = hasPermission(admin, 'slots', 'view');
  const canCreate = hasPermission(admin, 'slots', 'create');
  const canEdit = hasPermission(admin, 'slots', 'edit');
  const canDelete = hasPermission(admin, 'slots', 'delete');
  const { data: turf } = useSWR(`${import.meta.env.VITE_APP_API_URL}/turfs/${id}`, fetcher);
  const { data: slots, isLoading } = useSWR(`${import.meta.env.VITE_APP_API_URL}/turfs/${id}/slots`, fetcher);

  const [open, setOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '06:00',
    endTime: '07:00',
    price: 800
  });

  const handleOpen = (slot = null) => {
    if (slot) {
      setEditingSlot(slot);
      setFormData({
        date: new Date(slot.date).toISOString().split('T')[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price
      });
    } else {
      setEditingSlot(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        startTime: '06:00',
        endTime: '07:00',
        price: 800
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const url = editingSlot 
        ? `${import.meta.env.VITE_APP_API_URL}/turfs/slots/${editingSlot.id}`
        : `${import.meta.env.VITE_APP_API_URL}/turfs/${id}/slots`;
      
      const method = editingSlot ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(true),
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unable to save slot');
      
      mutate(`${import.meta.env.VITE_APP_API_URL}/turfs/${id}/slots`);
      handleClose();
      if (result.message) window.alert(result.message);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/turfs/slots/${slotId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Delete failed');
      mutate(`${import.meta.env.VITE_APP_API_URL}/turfs/${id}/slots`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!canView) return <Alert severity="error">You do not have permission to view or manage availability slots.</Alert>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Button startIcon={<ArrowLeftOutlined />} onClick={() => navigate('/manage/turfs')}>
                Back to Turfs
            </Button>
            <Typography variant="h4">Manage Slots: {turf?.name}</Typography>
        </Stack>
        <MainCard
          title="Availability Slots"
          secondary={
            canCreate && <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => handleOpen()}>
              Add Slot
            </Button>
          }
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slots?.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>{new Date(slot.date).toLocaleDateString()}</TableCell>
                      <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                      <TableCell>₹{slot.price}</TableCell>
                      <TableCell>
                        <Chip label={slot.status} color={slot.status === 'AVAILABLE' ? 'success' : 'warning'} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {canEdit && <IconButton size="small" color="primary" onClick={() => handleOpen(slot)}><EditOutlined /></IconButton>}
                          {canDelete && <IconButton size="small" color="error" onClick={() => handleDelete(slot.id)}><DeleteOutlined /></IconButton>}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {slots?.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} align="center">No slots found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>{editingSlot ? 'Edit Slot' : 'Add New Slot'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Stack direction="row" spacing={2}>
                <TextField
                    label="Start Time"
                    type="time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
                <TextField
                    label="End Time"
                    type="time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
            </Stack>
            <TextField
              label="Price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingSlot ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
