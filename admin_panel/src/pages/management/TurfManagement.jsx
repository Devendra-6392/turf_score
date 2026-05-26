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
    pricePerHour: 1000,
    description: '',
    category: 'Football',
    imageUrl: '',
    groundSize: '',
    groundType: '',
    cancellationPolicyText: '',
    openingTime: '06:00',
    closingTime: '23:00',
    contactPhone: '',
    contactEmail: '',
    safetyGuidelines: '',
    amenities: '',
    images: ''
  });

  const handleOpen = (turf = null) => {
    if (turf) {
      setEditMode(true);
      setSelectedTurfId(turf.id);
      setFormData({
        name: turf.name || '',
        location: turf.location || '',
        city: turf.city || '',
        state: turf.state || 'State',
        pricePerHour: turf.pricePerHour || 1000,
        description: turf.description || '',
        category: turf.category || 'Football',
        imageUrl: turf.imageUrl || '',
        groundSize: turf.groundSize || '',
        groundType: turf.groundType || '',
        cancellationPolicyText: turf.cancellationPolicyText || '',
        openingTime: turf.openingTime || '06:00',
        closingTime: turf.closingTime || '23:00',
        contactPhone: turf.contactPhone || '',
        contactEmail: turf.contactEmail || '',
        safetyGuidelines: turf.safetyGuidelines || '',
        amenities: Array.isArray(turf.amenities) ? turf.amenities.join(', ') : '',
        images: Array.isArray(turf.images) ? turf.images.join(', ') : ''
      });
    } else {
      setEditMode(false);
      setSelectedTurfId(null);
      setFormData({
        name: '',
        location: '',
        city: '',
        state: 'State',
        pricePerHour: 1000,
        description: '',
        category: 'Football',
        imageUrl: '',
        groundSize: '',
        groundType: '',
        cancellationPolicyText: '',
        openingTime: '06:00',
        closingTime: '23:00',
        contactPhone: '',
        contactEmail: '',
        safetyGuidelines: '',
        amenities: 'Synthetic Grass, Floodlights, Parking, Wifi',
        images: ''
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

      const amenitiesArray = formData.amenities
        ? formData.amenities.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const imagesArray = formData.images
        ? formData.images.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const bodyData = {
        ...formData,
        amenities: amenitiesArray,
        images: imagesArray
      };

      const res = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(bodyData)
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editMode ? 'Edit Turf Details' : 'Add New Turf'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField label="Turf Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <TextField label="Category" fullWidth value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            </Stack>
            <TextField label="Location" fullWidth value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label="City" fullWidth value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              <TextField label="State" fullWidth value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Price Per Hour (₹)" type="number" fullWidth value={formData.pricePerHour} onChange={(e) => setFormData({ ...formData, pricePerHour: parseInt(e.target.value) || 0 })} />
              <TextField label="Main Image URL" fullWidth value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Ground Size (e.g. 7v7, 9v9, Standard)" fullWidth value={formData.groundSize} onChange={(e) => setFormData({ ...formData, groundSize: e.target.value })} />
              <TextField label="Ground Type (e.g. FIFA Approved Synthetic)" fullWidth value={formData.groundType} onChange={(e) => setFormData({ ...formData, groundType: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Opening Time (e.g. 06:00)" fullWidth value={formData.openingTime} onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })} />
              <TextField label="Closing Time (e.g. 23:00)" fullWidth value={formData.closingTime} onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Contact Phone" fullWidth value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} />
              <TextField label="Contact Email" fullWidth value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} />
            </Stack>
            <TextField label="Description" multiline rows={2} fullWidth value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <TextField label="Safety Guidelines" multiline rows={2} fullWidth value={formData.safetyGuidelines} onChange={(e) => setFormData({ ...formData, safetyGuidelines: e.target.value })} />
            <TextField label="Cancellation Policy Text" multiline rows={2} fullWidth value={formData.cancellationPolicyText} onChange={(e) => setFormData({ ...formData, cancellationPolicyText: e.target.value })} />
            <TextField label="Amenities (comma separated list)" fullWidth value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} />
            <TextField label="Gallery Image URLs (comma separated list)" fullWidth value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} />
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
