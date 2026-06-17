import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Box,
  CircularProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { BellOutlined, SendOutlined, SoundOutlined, UserOutlined } from '@ant-design/icons';
import Toast from 'react-hot-toast';

// project imports
import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authFetcher, authHeaders } from 'utils/admin-access';

const NOTIFICATION_TYPES = [
  { value: 'PROMOTION', label: '🎉 Promotion' },
  { value: 'REMINDER', label: '⏰ Reminder' },
  { value: 'PRICE_DROP', label: '💰 Price Drop' },
  { value: 'RAIN_ALERT', label: '🌧️ Rain Alert' },
  { value: 'BOOKING_CONFIRMATION', label: '✅ Booking' },
  { value: 'CANCELLATION', label: '❌ Cancellation' },
];

export default function NotificationManagement() {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  // Fetch users for the dropdown
  const usersUrl = isSuperAdmin ? `${import.meta.env.VITE_APP_API_URL}/admin/users` : null;
  const { data: users } = useSWR(usersUrl, authFetcher);

  // Fetch notification history
  const historyUrl = `${import.meta.env.VITE_APP_API_URL}/notifications/history`;
  const { data: history, isLoading: historyLoading } = useSWR(historyUrl, authFetcher, {
    refreshInterval: 10000
  });

  // Send to user form
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notifType, setNotifType] = useState('PROMOTION');
  const [sending, setSending] = useState(false);

  // Broadcast form
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastType, setBroadcastType] = useState('PROMOTION');
  const [broadcasting, setBroadcasting] = useState(false);

  const handleSendToUser = async () => {
    if (!selectedUserId || !title || !body) {
      Toast.error('Please fill all required fields');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/notifications/send`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({
          userId: selectedUserId,
          title,
          body,
          type: notifType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');

      Toast.success(data.message || 'Notification sent!');
      setSendDialogOpen(false);
      setSelectedUserId('');
      setTitle('');
      setBody('');
      mutate(historyUrl);
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastBody) {
      Toast.error('Please fill all required fields');
      return;
    }

    if (!window.confirm('Are you sure you want to send this notification to ALL users?')) return;

    setBroadcasting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/notifications/broadcast`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({
          title: broadcastTitle,
          body: broadcastBody,
          type: broadcastType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to broadcast');

      Toast.success(`${data.message} (${data.pushNotificationsSent} push sent)`);
      setBroadcastDialogOpen(false);
      setBroadcastTitle('');
      setBroadcastBody('');
      mutate(historyUrl);
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setBroadcasting(false);
    }
  };

  // Group history by title+sentAt to detect broadcasts
  const uniqueNotifs = [];
  const seen = new Set();
  history?.forEach((n) => {
    const key = `${n.title}-${n.body}-${new Date(n.sentAt).toISOString().slice(0, 16)}`;
    if (!seen.has(key)) {
      seen.add(key);
      // Count how many have same key
      const count = history.filter(
        (h) =>
          h.title === n.title &&
          h.body === n.body &&
          new Date(h.sentAt).toISOString().slice(0, 16) === new Date(n.sentAt).toISOString().slice(0, 16)
      ).length;
      uniqueNotifs.push({ ...n, recipientCount: count });
    }
  });

  return (
    <Grid container spacing={3}>
      <Grid item size={12}>
        {/* Action Cards */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          {/* Send to User Card */}
          <Card
            sx={{
              flex: 1,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
              background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
              color: '#fff',
            }}
            onClick={() => setSendDialogOpen(true)}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <UserOutlined style={{ fontSize: 36, marginBottom: 8 }} />
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                Send to User
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                Send notification to a specific user
              </Typography>
            </CardContent>
          </Card>

          {/* Broadcast Card - Only for SUPER_ADMIN */}
          {isSuperAdmin && (
            <Card
              sx={{
                flex: 1,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                background: 'linear-gradient(135deg, #E65100 0%, #F57C00 100%)',
                color: '#fff',
              }}
              onClick={() => setBroadcastDialogOpen(true)}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <SoundOutlined style={{ fontSize: 36, marginBottom: 8 }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                  Broadcast to All
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                  Send push notification to all app users
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>

        {/* Notification History */}
        <MainCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BellOutlined style={{ fontSize: 20 }} />
              <span>Notification History</span>
              <Chip
                label={`${uniqueNotifs.length} sent`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Box>
          }
        >
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Recipients</TableCell>
                    <TableCell>Sent At</TableCell>
                    <TableCell>Push Sent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uniqueNotifs.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {row.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.body}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {row.recipientCount > 1 ? (
                          <Chip
                            label={`${row.recipientCount} users`}
                            size="small"
                            color="warning"
                            icon={<SoundOutlined />}
                          />
                        ) : (
                          <Typography variant="body2">{row.user?.name || row.user?.email || 'Unknown'}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(row.sentAt).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.isPushSent ? 'Yes' : 'No'}
                          size="small"
                          color={row.isPushSent ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {uniqueNotifs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">No notifications sent yet</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>
      </Grid>

      {/* ─── Send to User Dialog ─── */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <UserOutlined />
            <span>Send Notification to User</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {isSuperAdmin && users ? (
              <FormControl fullWidth>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  label="Select User"
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name || user.email} — {user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="User ID"
                fullWidth
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                helperText="Enter the user ID to send notification"
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Notification Type</InputLabel>
              <Select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value)}
                label="Notification Type"
              >
                {NOTIFICATION_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Special Offer! 🎉"
            />
            <TextField
              label="Message"
              fullWidth
              multiline
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="e.g. Get 20% off on your next booking!"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendToUser}
            disabled={sending || !selectedUserId || !title || !body}
            startIcon={sending ? <CircularProgress size={16} /> : <SendOutlined />}
          >
            {sending ? 'Sending...' : 'Send Notification'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Broadcast Dialog (SUPER_ADMIN only) ─── */}
      {isSuperAdmin && (
        <Dialog open={broadcastDialogOpen} onClose={() => setBroadcastDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 700, color: '#E65100' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SoundOutlined />
              <span>Broadcast to All Users</span>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This will send a push notification to <strong>ALL registered users</strong> of the app. Use carefully.
            </Alert>
            <Stack spacing={2.5}>
              <FormControl fullWidth>
                <InputLabel>Notification Type</InputLabel>
                <Select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  label="Notification Type"
                >
                  {NOTIFICATION_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Title"
                fullWidth
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. 🏏 Weekend Sale!"
              />
              <TextField
                label="Message"
                fullWidth
                multiline
                rows={3}
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                placeholder="e.g. Book any turf this weekend and get flat 30% off!"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setBroadcastDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleBroadcast}
              disabled={broadcasting || !broadcastTitle || !broadcastBody}
              startIcon={broadcasting ? <CircularProgress size={16} /> : <SoundOutlined />}
            >
              {broadcasting ? 'Broadcasting...' : 'Broadcast to All'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Grid>
  );
}
