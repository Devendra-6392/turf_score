import { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { QRCodeSVG } from 'qrcode.react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { authFetcher, authHeaders, hasPermission } from 'utils/admin-access';

const publicFetcher = (url) => fetch(url).then((response) => response.json());

export default function CheckInManagement() {
  const { admin } = useAdminAuth();
  const canView = hasPermission(admin, 'checkins', 'view');
  const canEdit = hasPermission(admin, 'checkins', 'edit');
  const { data: allTurfs } = useSWR(canView ? `${import.meta.env.VITE_APP_API_URL}/turfs` : null, publicFetcher);
  const turfs = useMemo(
    () => allTurfs?.filter((turf) => admin?.role === 'SUPER_ADMIN' || turf.id === admin?.turfId) || [],
    [admin, allTurfs]
  );
  const [selectedTurfId, setSelectedTurfId] = useState(admin?.turfId || '');
  const turfId = selectedTurfId || turfs[0]?.id;
  const qrUrl = turfId ? `${import.meta.env.VITE_APP_API_URL}/admin/turfs/${turfId}/entry-qr` : null;
  const arrivalsUrl = `${import.meta.env.VITE_APP_API_URL}/admin/check-ins`;
  const { data: qrData, error: qrError } = useSWR(canView ? qrUrl : null, authFetcher);
  const { data: arrivals } = useSWR(canView ? arrivalsUrl : null, authFetcher, { refreshInterval: 5000 });

  if (!canView) return <Alert severity="error">You do not have permission to manage gate QR check-ins.</Alert>;

  const rotateQr = async () => {
    const response = await fetch(`${qrUrl}/rotate`, { method: 'POST', headers: authHeaders(true) });
    const result = await response.json();
    if (!response.ok) return window.alert(result.error || 'Could not rotate QR');
    mutate(qrUrl);
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 5 }}>
        <MainCard title="Gate QR Pass">
          <Stack spacing={2} alignItems="center">
            {admin?.role === 'SUPER_ADMIN' && (
              <TextField select label="Turf" fullWidth value={turfId || ''} onChange={(event) => setSelectedTurfId(event.target.value)}>
                {turfs.map((turf) => <MenuItem key={turf.id} value={turf.id}>{turf.name}</MenuItem>)}
              </TextField>
            )}
            {qrError && <Alert severity="error">{qrError.message}</Alert>}
            {qrData && (
              <>
                <Box sx={{ p: 3, bgcolor: 'common.white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <QRCodeSVG value={qrData.qrValue} size={230} level="H" includeMargin />
                </Box>
                <Typography variant="h5">{qrData.turfName}</Typography>
                <Typography color="text.secondary" align="center">
                  Display this at the entry gate. One captain or team player scan checks in the entire booking.
                </Typography>
                {canEdit && (
                  <Button startIcon={<ReloadOutlined />} variant="outlined" color="warning" onClick={rotateQr}>
                    Rotate QR Code
                  </Button>
                )}
              </>
            )}
          </Stack>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, lg: 7 }}>
        <MainCard title="Recent Arrivals">
          <Alert severity="info" icon={<SafetyCertificateOutlined />} sx={{ mb: 2 }}>
            Arrivals update automatically after a player scans the turf QR from the mobile app.
          </Alert>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Player / Team</TableCell>
                  <TableCell>Turf</TableCell>
                  <TableCell>Slot</TableCell>
                  <TableCell>Checked In</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arrivals?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{booking.team?.name || booking.user?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{booking.team?.sportType || booking.user?.email}</Typography>
                    </TableCell>
                    <TableCell>{booking.turf?.name}</TableCell>
                    <TableCell>{booking.slot?.startTime || '-'}</TableCell>
                    <TableCell>
                      <Chip color="success" size="small" label={new Date(booking.checkInTime).toLocaleString()} />
                    </TableCell>
                  </TableRow>
                ))}
                {!arrivals?.length && (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No checked-in players yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>
    </Grid>
  );
}
