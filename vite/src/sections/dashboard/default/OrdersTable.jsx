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

// assets
import InboxOutlined from '@ant-design/icons/InboxOutlined';

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
  const stabilizedThis = [...array.map((el, index) => [el, index])];
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'order_no',
    align: 'left',
    disablePadding: false,
    label: 'Order No.'
  },
  {
    id: 'table',
    align: 'left',
    disablePadding: true,
    label: 'Table'
  },
  {
    id: 'customer',
    align: 'left',
    disablePadding: false,
    label: 'Customer'
  },
  {
    id: 'items',
    align: 'right',
    disablePadding: false,
    label: 'Items'
  },
  {
    id: 'status',
    align: 'left',
    disablePadding: false,
    label: 'Status'
  },
  {
    id: 'amount',
    align: 'right',
    disablePadding: false,
    label: 'Amount'
  }
];

// ==============================|| ORDER TABLE - HEADER ||============================== //

function OrderTableHead({ order, orderBy }) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function OrderStatus({ status }) {
  let color;
  let title;

  switch (status) {
    case 0:
      color = 'info';
      title = 'Pending';
      break;
    case 1:
      color = 'warning';
      title = 'Preparing';
      break;
    case 2:
      color = 'secondary';
      title = 'Ready';
      break;
    case 3:
      color = 'primary';
      title = 'Served';
      break;
    case 4:
      color = 'success';
      title = 'Completed';
      break;
    case 5:
      color = 'error';
      title = 'Cancelled';
      break;
    default:
      color = 'primary';
      title = 'None';
  }

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
      <Dot color={color} />
      <Typography>{title}</Typography>
    </Stack>
  );
}

// ==============================|| EMPTY STATE ||============================== //
function EmptyState({ message = 'No data yet', height = 220 }) {
  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        color: 'text.secondary'
      }}
    >
      <InboxOutlined style={{ fontSize: '1.75rem' }} />
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
}

// ==============================|| ORDER TABLE ||============================== //
// `rows` — TODO (backend): pass real recent-orders data once the API is
// connected, e.g. rows={orders} with each item shaped as:
//   { order_no, table, customer, items, status, amount }
// Until then it defaults to an empty array and the table shows
// "No recent orders yet" instead of the old hardcoded sample rows.
export default function OrderTable({ rows = [] }) {
  const order = 'asc';
  const orderBy = 'order_no';

  if (!rows || rows.length === 0) {
    return <EmptyState message="No recent orders yet" />;
  }

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
          <OrderTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  role="checkbox"
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  tabIndex={-1}
                  key={row.order_no}
                >
                  <TableCell component="th" id={labelId} scope="row">
                    <Link sx={{ color: 'secondary.main' }}>#{row.order_no}</Link>
                  </TableCell>
                  <TableCell>{row.table}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell align="right">{row.items}</TableCell>
                  <TableCell>
                    <OrderStatus status={row.status} />
                  </TableCell>
                  <TableCell align="right">
                    <NumericFormat value={row.amount} displayType="text" thousandSeparator prefix="$" decimalScale={2} fixedDecimalScale />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

OrderTableHead.propTypes = { order: PropTypes.any, orderBy: PropTypes.string };

OrderStatus.propTypes = { status: PropTypes.number };

OrderTable.propTypes = { rows: PropTypes.array };

