import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Select, MenuItem, InputLabel, FormControl,
  Card, CardContent, Grid
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import API_URL from '../../config/api';
import { toast } from 'react-toastify';

const SubscriptionManagement = () => {
  const { token, admin } = useAuth();
  const [individualSubs, setIndividualSubs] = useState([]);
  const [teamSubs, setTeamSubs] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  if (admin?.role !== 'SUPER_ADMIN') {
    return <Typography color="error">Access Denied. Super Admin only.</Typography>;
  }

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/subscriptions/admin/all${filter !== 'ALL' ? `?status=${filter}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIndividualSubs(res.data.individual || []);
      setTeamSubs(res.data.team || []);
      setStats(res.data.stats || {});
    } catch (err) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [filter]);

  const handleManage = async (id, type, action) => {
    try {
      await axios.put(`${API_URL}/subscriptions/admin/${id}/manage`, { action, type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Subscription ${action}d successfully`);
      fetchSubscriptions();
    } catch (err) {
      toast.error(`Failed to ${action} subscription`);
    }
  };

  const renderStatus = (status) => {
    const colors = {
      ACTIVE: 'success',
      EXPIRED: 'error',
      CANCELLED: 'default',
      PAUSED: 'warning'
    };
    return <Chip label={status} color={colors[status] || 'default'} size="small" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Subscription Management</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Active Subscriptions</Typography>
              <Typography variant="h5">{(stats.activeIndividual || 0) + (stats.activeTeam || 0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Revenue</Typography>
              <Typography variant="h5" color="primary">₹{stats.totalRevenue || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3, width: 200 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Filter Status</InputLabel>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Filter Status">
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="EXPIRED">Expired</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>Individual Memberships</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {individualSubs.map(sub => (
              <TableRow key={sub.id}>
                <TableCell>{sub.user?.name || sub.user?.email || 'Unknown'}</TableCell>
                <TableCell><Chip label={sub.plan} size="small" color="primary" variant="outlined"/></TableCell>
                <TableCell>₹{sub.amount}</TableCell>
                <TableCell>{renderStatus(sub.status)}</TableCell>
                <TableCell>{new Date(sub.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {sub.status === 'ACTIVE' && (
                    <Button size="small" color="error" onClick={() => handleManage(sub.id, 'individual', 'cancel')}>Cancel</Button>
                  )}
                  {sub.status === 'EXPIRED' && (
                    <Button size="small" color="success" onClick={() => handleManage(sub.id, 'individual', 'extend')}>Extend 30d</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {individualSubs.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center">No individual subscriptions found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" sx={{ mb: 2, mt: 5 }}>Team Passes</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team</TableCell>
              <TableCell>Captain</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teamSubs.map(sub => (
              <TableRow key={sub.id}>
                <TableCell>{sub.team?.name || 'Unknown'}</TableCell>
                <TableCell>{sub.team?.captain?.name || sub.team?.captain?.email || 'Unknown'}</TableCell>
                <TableCell><Chip label={sub.plan} size="small" color="secondary" variant="outlined"/></TableCell>
                <TableCell>₹{sub.amount}</TableCell>
                <TableCell>{renderStatus(sub.status)}</TableCell>
                <TableCell>{new Date(sub.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {sub.status === 'ACTIVE' && (
                    <Button size="small" color="error" onClick={() => handleManage(sub.id, 'team', 'cancel')}>Cancel</Button>
                  )}
                  {sub.status === 'EXPIRED' && (
                    <Button size="small" color="success" onClick={() => handleManage(sub.id, 'team', 'extend')}>Extend 30d</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {teamSubs.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center">No team subscriptions found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
};

export default SubscriptionManagement;
