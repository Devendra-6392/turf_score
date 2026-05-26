import PropTypes from 'prop-types';
// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { NumericFormat } from 'react-number-format';

// project imports
import Dot from 'components/@extended/Dot';

function createData(tracking_no, name, fat, carbs, protein) {
  return { tracking_no, name, fat, carbs, protein };
}

const rows = [
  createData(84564564, 'Camera Lens', 40, 2, 40570),
  createData(98764564, 'Laptop', 300, 0, 180139),
  createData(98756325, 'Mobile', 355, 1, 90989),
  createData(98652366, 'Handset', 50, 1, 10239),
  createData(13286564, 'Computer Accessories', 100, 1, 83348),
  createData(86739658, 'TV', 99, 0, 410780),
  createData(13256498, 'Keyboard', 125, 2, 70999),
  createData(98753263, 'Mouse', 89, 2, 10570),
  createData(98753275, 'Desktop', 185, 1, 98063),
  createData(98753291, 'Chair', 100, 0, 14001)
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// ==============================|| ORDER STATUS ||============================== //

function OrderStatus({ status }) {
  let color;
  let title;

  switch (status) {
    case 'PENDING':
      color = 'warning';
      title = 'Pending';
      break;
    case 'CONFIRMED':
      color = 'success';
      title = 'Confirmed';
      break;
    case 'CANCEL_REQUESTED':
      color = 'warning';
      title = 'Cancel Requested';
      break;
    case 'CANCELLED':
      color = 'error';
      title = 'Cancelled';
      break;
    case 'COMPLETED':
      color = 'primary';
      title = 'Completed';
      break;
    default:
      color = 'primary';
      title = status;
  }

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
      <Dot color={color} />
      <Typography>{title}</Typography>
    </Stack>
  );
}

const headCells = [
  { id: 'tracking_no', align: 'left', disablePadding: false, label: 'Tracking No.' },
  { id: 'name', align: 'left', disablePadding: true, label: 'User Name' },
  { id: 'turf', align: 'left', disablePadding: false, label: 'Turf' },
  { id: 'status', align: 'left', disablePadding: false, label: 'Status' },
  { id: 'amount', align: 'right', disablePadding: false, label: 'Amount' }
];

// ==============================|| ORDER TABLE ||============================== //

export default function OrderTable({ bookings = [] }) {
  const order = 'desc';
  const orderBy = 'createdAt';

  return (
    <Box>
      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' }
        }}
      >
        <Table aria-labelledby="tableTitle">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell key={headCell.id} align={headCell.align}>
                  {headCell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((row, index) => (
              <TableRow
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                tabIndex={-1}
                key={row.id}
              >
                <TableCell>
                  <Link color="secondary">{row.id.substring(0, 8)}</Link>
                </TableCell>
                <TableCell>{row.user?.name || 'Guest'}</TableCell>
                <TableCell>{row.turf?.name || 'Unknown'}</TableCell>
                <TableCell>
                  <OrderStatus status={row.status} />
                </TableCell>
                <TableCell align="right">
                  <NumericFormat value={row.amount} displayType="text" thousandSeparator prefix="₹" />
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No recent bookings.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

OrderTable.propTypes = { bookings: PropTypes.array };
OrderStatus.propTypes = { status: PropTypes.string };
