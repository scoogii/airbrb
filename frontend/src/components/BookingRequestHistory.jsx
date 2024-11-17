import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Chip, CircularProgress } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import { colorStatus } from '../API';

// Creates a row in the table for Booking Requests
const createData = (bookingId, name, dateStart, dateEnd, totalPrice, status) => {
  return {
    bookingId,
    name,
    dateStart,
    dateEnd,
    totalPrice,
    status,
  };
}

// Custom comparator for the sorting function
const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// Decides which comparator to use (asc vs desc)
const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Column properties
const headCells = [
  {
    id: 'bookingId',
    numeric: true,
    disablePadding: false,
    label: 'Booking ID'
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Name',
  },
  {
    id: 'dateStart',
    numeric: false,
    disablePadding: false,
    label: 'Start',
  },
  {
    id: 'dateEnd',
    numeric: false,
    disablePadding: false,
    label: 'End'
  },
  {
    id: 'totalPrice',
    numeric: true,
    disablePadding: false,
    label: 'Total Price ($AUD)',
  },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Status',
  }
];

// Creates the first row of the table, which consists of the titles of the columns
const EnhancedTableHead = (props) => {
  const { order, orderBy, onRequestSort } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              style={{ fontWeight: 'bold' }}
            >
              {headCell.label}
              {orderBy === headCell.id
                ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  )
                : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell
          style={{ fontWeight: 'bold' }}
        >
            Action
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
};

// Creates the title of the table
const EnhancedTableToolbar = () => {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px'
      }}
    >
      <Typography
        sx={{ flex: '1 1 100%', color: 'white' }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        Booking Request History
      </Typography>
    </Toolbar>
  );
}

// Loads the table for Booking Requests
const BookingRequestHistory = ({ bookings, fetchBookingsFn, setSbMsgFn, openSbFn }) => {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [clickedAccept, setClickedAccept] = React.useState(false);
  const [clickedReject, setClickedReject] = React.useState(false);

  const rows = bookings.map(booking => createData(booking.id, booking.owner, new Date(booking.dateRange[0]), new Date(booking.dateRange[1]), booking.totalPrice, booking.status));

  // Handles how rows are sorted
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handles which page of the table to display
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handles how many rows should be displayed in the table
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  // This function queries the backend and accepts a booking.
  // SnackBar pops up on success.
  const acceptBookingFn = async (bookingId) => {
    setClickedAccept(true);

    const response = await fetch('http://localhost:5005/bookings/accept/' + bookingId, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN')
      }
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
    }

    setSbMsgFn('Booking ' + bookingId + ' accepted.');
    openSbFn();
    fetchBookingsFn();
    setClickedAccept(false);
  }

  // This function queries the backend and declines a booking.
  // SnackBar pops up on success.
  const rejectBookingFn = async (bookingId) => {
    setClickedReject(true);

    const response = await fetch('http://localhost:5005/bookings/decline/' + bookingId, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN')
      }
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
    }

    setSbMsgFn('Booking ' + bookingId + ' rejected.');
    openSbFn();
    fetchBookingsFn();
    setClickedReject(false);
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, borderRadius: '12px' }}>
        <EnhancedTableToolbar />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {rows.sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={index}
                    >
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="normal"
                      >
                        {row.bookingId}
                      </TableCell>
                      <TableCell align='left'>{row.name}</TableCell>
                      <TableCell align="left">{row.dateStart.toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</TableCell>
                      <TableCell align="left">{row.dateEnd.toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</TableCell>
                      <TableCell align="left">{row.totalPrice}</TableCell>
                      <TableCell align="left">
                        <Chip label={row.status} style={{ background: colorStatus(row.status), color: 'white' }} />
                      </TableCell>
                      <TableCell align="left">
                        {row.status === 'pending' && <div style={{ display: 'flex' }}>
                          <Button
                            variant='contained'
                            style={{ background: '#449e65', width: '80px' }}
                            onClick={() => acceptBookingFn(row.bookingId)}
                            disabled={clickedAccept}
                          >
                            {clickedAccept ? <CircularProgress /> : 'Accept'}
                          </Button>
                          &nbsp;&nbsp;&nbsp;
                          <Button
                            variant='contained'
                            style={{ background: '#e35e68', width: '80px' }}
                            onClick={() => rejectBookingFn(row.bookingId)}
                            disabled={clickedReject}
                          >
                            {clickedReject ? <CircularProgress size="1.5rem" color="inherit"/> : 'Reject'}
                          </Button>
                        </div>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}

BookingRequestHistory.propTypes = {
  bookings: PropTypes.array,
  fetchBookingsFn: PropTypes.func,
  setSbMsgFn: PropTypes.func,
  openSbFn: PropTypes.func
}

export default BookingRequestHistory;
