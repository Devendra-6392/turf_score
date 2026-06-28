import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Box, Card, CardContent
} from '@mui/material';
import { EditOutlined, DeleteOutlined, PlusOutlined, FallOutlined, RiseOutlined } from '@ant-design/icons';
import Toast from 'react-hot-toast';

import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authFetcher, authHeaders } from 'utils/admin-access';

export default function ExpenseManagement() {
  const { admin } = useAdminAuth();
  const [turfId, setTurfId] = useState(admin?.turfId || '');
  
  const pnlUrl = turfId ? `${import.meta.env.VITE_APP_API_URL}/expenses/turf/${turfId}/pnl` : null;
  const expenseUrl = turfId ? `${import.meta.env.VITE_APP_API_URL}/expenses/turf/${turfId}` : null;

  const { data: pnlData, error: pnlError } = useSWR(pnlUrl, authFetcher);
  const { data: expenses, error: expenseError } = useSWR(expenseUrl, authFetcher);

  const { data: turfs } = useSWR(
    admin?.role === 'SUPER_ADMIN' ? `${import.meta.env.VITE_APP_API_URL}/turfs` : null,
    authFetcher
  );

  useEffect(() => {
    if (admin?.role !== 'SUPER_ADMIN' && admin?.turfId) {
      setTurfId(admin.turfId);
    } else if (admin?.role === 'SUPER_ADMIN' && turfs?.length > 0 && !turfId) {
        setTurfId(turfs[0].id);
    }
  }, [admin, turfs, turfId]);

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    category: 'MAINTENANCE', amount: '', date: new Date().toISOString().slice(0,10), description: ''
  });

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category,
        amount: item.amount,
        date: new Date(item.date).toISOString().slice(0,10),
        description: item.description || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ category: 'MAINTENANCE', amount: '', date: new Date().toISOString().slice(0,10), description: '' });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const url = editingItem 
        ? `${import.meta.env.VITE_APP_API_URL}/expenses/${editingItem.id}` 
        : `${import.meta.env.VITE_APP_API_URL}/expenses`;
      
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? formData : { ...formData, turfId };

      const res = await fetch(url, {
        method,
        headers: authHeaders(true),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to save expense');
      Toast.success(`Expense ${editingItem ? 'updated' : 'created'}`);
      
      mutate(expenseUrl);
      mutate(pnlUrl);
      handleClose();
    } catch (err) {
      Toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete');
      Toast.success('Expense deleted');
      mutate(expenseUrl);
      mutate(pnlUrl);
    } catch (err) {
      Toast.error(err.message);
    }
  };

  const isNetPositive = pnlData && pnlData.netProfit >= 0;

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Expense Tracker & P&L</Typography>
        {admin?.role === 'SUPER_ADMIN' && turfs && (
            <TextField
                select
                size="small"
                label="Select Turf"
                value={turfId}
                onChange={(e) => setTurfId(e.target.value)}
                sx={{ minWidth: 200 }}
            >
                {turfs.map((t) => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
            </TextField>
        )}
      </Box>

      {/* P&L Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', bgcolor: '#f5fff5' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Revenue (This Month)</Typography>
              <Typography variant="h3" color="success.main">₹{pnlData?.totalRevenue || 0}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'success.main' }}>
                <RiseOutlined /> <Typography variant="caption" sx={{ ml: 1 }}>From Bookings</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', bgcolor: '#fff5f5' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Expenses (This Month)</Typography>
              <Typography variant="h3" color="error.main">₹{pnlData?.totalExpenses || 0}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'error.main' }}>
                <FallOutlined /> <Typography variant="caption" sx={{ ml: 1 }}>Maintenance, Salary, etc.</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: isNetPositive ? 'success.light' : 'error.light', bgcolor: isNetPositive ? '#f5fff5' : '#fff5f5' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Net Profit / Loss</Typography>
              <Typography variant="h3" color={isNetPositive ? 'success.main' : 'error.main'}>
                {isNetPositive ? '+' : '-'}₹{Math.abs(pnlData?.netProfit || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: isNetPositive ? 'success.main' : 'error.main' }}>
                {isNetPositive ? <RiseOutlined /> : <FallOutlined />} 
                <Typography variant="caption" sx={{ ml: 1 }}>
                    {isNetPositive ? 'Profitable' : 'Running at a loss'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Expense List */}
      <MainCard 
        title="Expense Log" 
        secondary={
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => handleOpen()} disabled={!turfId}>
            Add Expense
          </Button>
        }
      >
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.description || '-'}</TableCell>
                  <TableCell>₹{row.amount}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpen(row)}><EditOutlined /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row.id)}><DeleteOutlined /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!expenses?.length && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No expenses recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Category"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                <MenuItem value="SALARY">Staff Salary</MenuItem>
                <MenuItem value="UTILITIES">Utilities (Electricity/Water)</MenuItem>
                <MenuItem value="MARKETING">Marketing & Promos</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth type="number" label="Amount (₹)" 
                value={formData.amount} 
                onChange={e => setFormData({ ...formData, amount: e.target.value })} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth type="date" label="Date" 
                InputLabelProps={{ shrink: true }}
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Description (Optional)" 
                multiline rows={2}
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
