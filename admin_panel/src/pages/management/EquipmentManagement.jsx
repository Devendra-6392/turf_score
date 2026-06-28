import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, FormControlLabel, Switch
} from '@mui/material';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Toast from 'react-hot-toast';

import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authFetcher, authHeaders, hasPermission } from 'utils/admin-access';

export default function EquipmentManagement() {
  const { admin } = useAdminAuth();
  const canEdit = hasPermission(admin, 'inventory', 'edit');
  const canDelete = hasPermission(admin, 'inventory', 'delete');
  const equipmentUrl = `${import.meta.env.VITE_APP_API_URL}/equipment`;

  const { data: equipmentList, error } = useSWR(equipmentUrl, authFetcher);
  
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', isRentable: true, stockCount: 10, isActive: true
  });

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        isRentable: item.isRentable,
        stockCount: item.stockCount,
        isActive: item.isActive
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', price: '', isRentable: true, stockCount: 10, isActive: true });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const url = editingItem ? `${equipmentUrl}/${editingItem.id}` : equipmentUrl;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(true),
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to save equipment');
      Toast.success(`Equipment ${editingItem ? 'updated' : 'created'}`);
      mutate(equipmentUrl);
      handleClose();
    } catch (err) {
      Toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this equipment?')) return;
    try {
      const res = await fetch(`${equipmentUrl}/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete');
      Toast.success('Equipment deleted');
      mutate(equipmentUrl);
    } catch (err) {
      Toast.error(err.message);
    }
  };

  if (error) return <Typography color="error">Failed to load equipment</Typography>;

  return (
    <MainCard 
      title="Equipment & Inventory" 
      secondary={
        canEdit && (
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => handleOpen()}>
            Add Item
          </Button>
        )
      }
    >
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipmentList?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>₹{row.price}</TableCell>
                <TableCell>{row.stockCount}</TableCell>
                <TableCell>{row.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell align="right">
                  {canEdit && (
                    <IconButton color="primary" onClick={() => handleOpen(row)}><EditOutlined /></IconButton>
                  )}
                  {canDelete && (
                    <IconButton color="error" onClick={() => handleDelete(row.id)}><DeleteOutlined /></IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!equipmentList?.length && (
              <TableRow>
                <TableCell colSpan={5} align="center">No equipment found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? 'Edit Equipment' : 'Add Equipment'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Price (₹)" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Stock Count" value={formData.stockCount} onChange={e => setFormData({ ...formData, stockCount: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />} label="Active" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
