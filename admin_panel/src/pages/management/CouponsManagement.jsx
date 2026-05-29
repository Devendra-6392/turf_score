import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Box, CircularProgress, Alert, Typography, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authHeaders } from 'utils/admin-access';

const API_URL = import.meta.env.VITE_APP_API_URL;

const fetcher = (url) =>
  fetch(url, { headers: authHeaders() }).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

export default function CouponsManagement() {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  const { data: coupons, error, isLoading } = useSWR(
    `${API_URL}/coupons/admin`,
    fetcher
  );

  const { data: turfs } = useSWR(
    isSuperAdmin ? `${API_URL}/turfs` : null,
    fetcher
  );

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    value: '',
    minBookingAmt: '0',
    maxDiscountAmt: '1000',
    usageLimit: '100',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    turfId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!formData.code || !formData.value) {
      alert("Code and Value are required");
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!isSuperAdmin) {
        // Automatically tie to the logged in admin's turf
        payload.turfId = admin?.turfId || null;
      } else if (payload.turfId === '') {
        payload.turfId = null;
      }

      const res = await fetch(`${API_URL}/coupons/admin`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create coupon');
      }
      alert('Coupon created and notifications sent!');
      setOpen(false);
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        value: '',
        minBookingAmt: '0',
        maxDiscountAmt: '1000',
        usageLimit: '100',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        turfId: ''
      });
      mutate(`${API_URL}/coupons/admin`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainCard 
      title="Coupons & Promotions"
      secondary={<Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setOpen(true)}>Create Coupon</Button>}
    >
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Manage promotional codes to drive user acquisition. Set limits and track usage.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load coupons</Alert>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Value</TableCell>
                {isSuperAdmin && <TableCell>Turf</TableCell>}
                <TableCell>Usage Limit</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell><Typography fontWeight={700}>{row.code}</Typography></TableCell>
                  <TableCell>{row.discountType}</TableCell>
                  <TableCell>{row.value}</TableCell>
                  {isSuperAdmin && <TableCell>{row.turf?.name || <Chip label="Global" size="small" variant="combined" />}</TableCell>}
                  <TableCell>{row.usedCount} / {row.usageLimit}</TableCell>
                  <TableCell>
                    <Chip label={row.isActive ? 'Active' : 'Expired'} color={row.isActive ? 'success' : 'default'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
              {(!coupons || coupons.length === 0) && (
                <TableRow>
                  <TableCell colSpan={isSuperAdmin ? 6 : 5} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">No coupons created yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Coupon</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Promo Code (e.g. SUMMER20)" fullWidth value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            
            {isSuperAdmin && (
              <TextField select label="Link to Turf" fullWidth value={formData.turfId} onChange={e => setFormData({...formData, turfId: e.target.value})}>
                <MenuItem value="">General / Global Coupon</MenuItem>
                {turfs?.map(turf => (
                  <MenuItem key={turf.id} value={turf.id}>{turf.name}</MenuItem>
                ))}
              </TextField>
            )}

            <Stack direction="row" spacing={2}>
              <TextField select label="Discount Type" fullWidth value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                <MenuItem value="FLAT">Flat Amount (₹)</MenuItem>
              </TextField>
              <TextField label="Value" type="number" fullWidth value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              <TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Usage Limit" type="number" fullWidth value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} />
              <TextField label="Min Booking Amount" type="number" fullWidth value={formData.minBookingAmt} onChange={e => setFormData({...formData, minBookingAmt: e.target.value})} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create & Notify Users'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
