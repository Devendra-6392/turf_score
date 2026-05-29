import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Box, CircularProgress, Alert, Typography, Chip, Button
} from '@mui/material';

import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authHeaders } from 'utils/admin-access';

const API_URL = import.meta.env.VITE_APP_API_URL;

const fetcher = (url) =>
  fetch(url, { headers: authHeaders() }).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

export default function SupportTicketsManagement() {
  const { admin } = useAdminAuth();
  const [resolving, setResolving] = useState(false);

  const { data: tickets, error, isLoading } = useSWR(
    `${API_URL}/support-tickets/admin`,
    fetcher
  );

  const handleResolve = async (id) => {
    if (!window.confirm("Mark this ticket as resolved? The user will be notified.")) return;
    
    setResolving(true);
    try {
      const res = await fetch(`${API_URL}/support-tickets/admin/${id}/resolve`, {
        method: 'PUT',
        headers: authHeaders(true)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to resolve ticket');
      }
      alert('Ticket resolved and user notified!');
      mutate(`${API_URL}/support-tickets/admin`);
    } catch (err) {
      alert(err.message);
    } finally {
      setResolving(false);
    }
  };

  return (
    <MainCard title="Support Helpdesk">
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Review and resolve support tickets submitted by users regarding refunds, app issues, and general inquiries.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load support tickets</Alert>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Ticket ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.user?.name || 'Unknown'}</Typography>
                    <Typography variant="caption" color="textSecondary">{row.user?.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{row.subject}</Typography>
                    <Typography variant="caption" color="textSecondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                      {row.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.priority} 
                      color={row.priority === 'HIGH' ? 'error' : row.priority === 'MEDIUM' ? 'warning' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={row.status} color={row.status === 'OPEN' ? 'info' : 'success'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    {row.status === 'OPEN' && (
                      <Button size="small" variant="outlined" onClick={() => handleResolve(row.id)} disabled={resolving}>
                        Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!tickets || tickets.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">No active support tickets right now! 🎉</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </MainCard>
  );
}
