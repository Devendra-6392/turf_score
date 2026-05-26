import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, IconButton, Tooltip, Box, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, Chip, Switch, FormControlLabel, CardMedia, Typography
} from '@mui/material';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authHeaders } from 'utils/admin-access';

const API_URL = import.meta.env.VITE_APP_API_URL;

const fetcher = (url) =>
  fetch(url, { headers: authHeaders() }).then((res) => res.json());

export default function BannerManagement() {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  const { data: banners, isLoading } = useSWR(
    `${API_URL}/banners/admin`,
    fetcher
  );

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [preview, setPreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    sortOrder: 0
  });

  const handleOpen = (banner = null) => {
    if (banner) {
      setEditMode(true);
      setSelectedId(banner.id);
      setFormData({
        title: banner.title || '',
        imageUrl: banner.imageUrl || '',
        linkUrl: banner.linkUrl || '',
        isActive: banner.isActive !== false,
        sortOrder: banner.sortOrder || 0
      });
      setPreview(banner.imageUrl || '');
    } else {
      setEditMode(false);
      setSelectedId(null);
      setFormData({ title: '', imageUrl: '', linkUrl: '', isActive: true, sortOrder: 0 });
      setPreview('');
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.imageUrl) {
      alert('Title and Image URL are required.');
      return;
    }
    try {
      const url = editMode
        ? `${API_URL}/banners/${selectedId}`
        : `${API_URL}/banners`;

      const res = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${editMode ? 'update' : 'create'} banner`);
      }

      mutate(`${API_URL}/banners/admin`);
      handleClose();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await fetch(`${API_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete banner');
      mutate(`${API_URL}/banners/admin`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const res = await fetch(`${API_URL}/banners/${banner.id}`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify({ ...banner, isActive: !banner.isActive })
      });
      if (!res.ok) throw new Error('Failed to toggle banner');
      mutate(`${API_URL}/banners/admin`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isSuperAdmin) {
    return <Alert severity="error">Only Super Admins can manage banners.</Alert>;
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MainCard
      title="Banner Management"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          size="small"
          onClick={() => handleOpen()}
        >
          Add Banner
        </Button>
      }
    >
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Banners are displayed on the mobile app home screen as a carousel. They auto-scroll for users.
      </Typography>

      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Preview</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Order</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banners?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <CardMedia
                    component="img"
                    sx={{ width: 140, height: 70, borderRadius: 1.5, objectFit: 'cover' }}
                    image={row.imageUrl}
                    alt={row.title}
                  />
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>{row.title}</Typography>
                  {row.linkUrl && (
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                      Link: {row.linkUrl}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.isActive ? 'Active' : 'Inactive'}
                    color={row.isActive ? 'success' : 'default'}
                    size="small"
                    onClick={() => handleToggleActive(row)}
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>
                <TableCell>{row.sortOrder}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleOpen(row)}>
                        <EditOutlined />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                        <DeleteOutlined />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {(!banners || banners.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No banners found. Click "Add Banner" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Add/Edit Dialog ── */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editMode ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Banner Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Weekend Tournament!"
            />
            <TextField
              label="Image URL"
              fullWidth
              value={formData.imageUrl}
              onChange={(e) => {
                setFormData({ ...formData, imageUrl: e.target.value });
                setPreview(e.target.value);
              }}
              placeholder="https://example.com/banner.jpg"
              helperText="Use a direct image URL (recommended: 800×400px)"
            />
            {preview && (
              <CardMedia
                component="img"
                sx={{ width: '100%', height: 180, borderRadius: 2, objectFit: 'cover' }}
                image={preview}
                alt="Preview"
                onError={() => setPreview('')}
              />
            )}
            <TextField
              label="Link URL (optional)"
              fullWidth
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="Deep link or URL to open on tap"
            />
            <TextField
              label="Sort Order"
              type="number"
              fullWidth
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              helperText="Lower numbers appear first"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active (visible on mobile app)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? 'Save Changes' : 'Create Banner'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
