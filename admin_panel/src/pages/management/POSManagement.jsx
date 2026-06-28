import { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  CircularProgress,
  Paper
} from '@mui/material';
import { ShoppingCartOutlined } from '@ant-design/icons';
import Toast from 'react-hot-toast';

import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authFetcher, authHeaders, hasPermission } from 'utils/admin-access';

export default function POSManagement() {
  const { admin } = useAdminAuth();
  const canEdit = hasPermission(admin, 'bookings', 'edit');

  const [turfId, setTurfId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch Turfs for SUPER_ADMIN
  const { data: turfs } = useSWR(
    admin?.role === 'SUPER_ADMIN' ? `${import.meta.env.VITE_APP_API_URL}/turfs` : null,
    authFetcher
  );

  useEffect(() => {
    if (admin?.role !== 'SUPER_ADMIN' && admin?.turfId) {
      setTurfId(admin.turfId);
    }
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      Toast.error("You don't have permission to create bookings.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/bookings/offline`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({
          turfId,
          bookingDate,
          timeSlot,
          amount: parseFloat(amount),
          paymentMethod,
          customerName,
          customerPhone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');
      
      Toast.success('Walk-in booking created successfully!');
      // Reset form (keep turf/date for quick subsequent bookings)
      setTimeSlot('');
      setAmount('');
      setCustomerName('');
      setCustomerPhone('');
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!canEdit) return <Typography color="error">You do not have permission to manage POS.</Typography>;

  return (
    <MainCard title="Point of Sale (Walk-in Booking)">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          
          {/* Turf Selection for Super Admin */}
          {admin?.role === 'SUPER_ADMIN' && (
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Turf"
                value={turfId}
                onChange={(e) => setTurfId(e.target.value)}
                required
              >
                {turfs?.map((turf) => (
                  <MenuItem key={turf.id} value={turf.id}>
                    {turf.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {/* Date & Time */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Booking Date"
              InputLabelProps={{ shrink: true }}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Time Slot (e.g. 18:00)"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              placeholder="18:00"
              required
            />
          </Grid>

          {/* Customer Details */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Customer Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </Grid>

          {/* Payment Details */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Amount Paid (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="CARD">Card Terminal</MenuItem>
            </TextField>
          </Grid>

          {/* Submit */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !turfId}
              startIcon={loading ? <CircularProgress size={20} /> : <ShoppingCartOutlined />}
            >
              Create Offline Booking
            </Button>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
}
