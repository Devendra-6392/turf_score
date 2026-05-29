import { useState } from 'react';
import useSWR from 'swr';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Box, CircularProgress, Alert, Typography, Chip, IconButton, Tooltip
} from '@mui/material';
import { DeleteOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authHeaders } from 'utils/admin-access';

const API_URL = import.meta.env.VITE_APP_API_URL;

const fetcher = (url) =>
  fetch(url, { headers: authHeaders() }).then((res) => res.json());

export default function UsersManagement() {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  const { data: users, error, isLoading } = useSWR(
    `${API_URL}/admin/users`,
    fetcher
  );

  if (!isSuperAdmin) {
    return <Alert severity="error">Only Super Admins can manage users.</Alert>;
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
    <MainCard title="User Management">
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        View and manage all registered users on the platform. Monitor their activity, matches played, and overall standing.
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Matches Played</TableCell>
              <TableCell>Total Spend</TableCell>
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
                <TableCell>
                  <Chip 
                    label={row.isActive !== false ? 'Active' : 'Suspended'} 
                    color={row.isActive !== false ? 'success' : 'error'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{row.matchesPlayed || 0}</TableCell>
                <TableCell>₹{row.totalSpend?.toFixed(2) || '0.00'}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={row.isActive !== false ? "Suspend User" : "Activate User"}>
                      <IconButton color={row.isActive !== false ? "error" : "success"}>
                        {row.isActive !== false ? <StopOutlined /> : <CheckCircleOutlined />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
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
    </MainCard>
  );
}
