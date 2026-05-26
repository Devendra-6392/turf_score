import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, IconButton, Tooltip, Box, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, Typography
} from '@mui/material';
import { WalletOutlined, PlusOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authHeaders } from 'utils/admin-access';

const API_URL = import.meta.env.VITE_APP_API_URL;

const fetcher = (url) =>
  fetch(url, { headers: authHeaders() }).then((res) => res.json());

export default function WalletManagement() {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  const { data: users, error, isLoading } = useSWR(
    `${API_URL}/admin/users`,
    fetcher
  );

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = (user) => {
    setSelectedUser(user);
    setAmount('');
    setDescription('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/admin/users/${selectedUser.id}/wallet/credit`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description || `Credited by ${admin.name}`
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to credit wallet');
      }

      alert('Wallet credited successfully!');
      mutate(`${API_URL}/admin/users`);
      handleClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSuperAdmin) {
    return <Alert severity="error">Only Super Admins can manage user wallets.</Alert>;
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load users: {error.message}</Alert>;
  }

  return (
    <MainCard title="User Wallet Management">
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        As a Super Admin, you can add promotional or refund balance directly to a user's mobile app wallet. Transactions will reflect immediately.
      </Typography>

      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>User Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>XP</TableCell>
              <TableCell>Matches</TableCell>
              <TableCell>Wallet Balance</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Typography fontWeight={600}>{row.name || 'N/A'}</Typography>
                </TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone || 'N/A'}</TableCell>
                <TableCell>{row.xp}</TableCell>
                <TableCell>{row.matchesPlayed}</TableCell>
                <TableCell>
                  <Typography fontWeight={750} color="primary.main">
                    ₹{row.walletBalance?.toFixed(2) || '0.00'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    startIcon={<PlusOutlined />}
                    size="small"
                    onClick={() => handleOpen(row)}
                  >
                    Add Money
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!users || users.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found in database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Money Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Add Money to Wallet</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="subtitle2">
                Crediting wallet for: <strong>{selectedUser.name || selectedUser.email}</strong>
              </Typography>
              <TextField
                label="Amount (INR)"
                type="number"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                autoFocus
              />
              <TextField
                label="Reason / Description"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Refund for cancelled booking"
                helperText="This description will show up in the user's transaction history."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Crediting...' : 'Credit Wallet'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
