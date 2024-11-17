import React from 'react';
import PropTypes from 'prop-types';

import { formatDateRange, colorStatus } from '../API';
import MakeReviewModal from './MakeReviewModal'

import { Typography, Card, CardContent, CardActions, Button, Chip } from '@mui/material';

// loads the user's bookings and their status for a given listing
const BookingStatus = ({ bookings, fetchBookingsFn, setSbMsgFn, openSbFn, refreshListingFn }) => {
  // This function deletes a booking
  // A booking can only be deleted if it is pending (this is so booking history integrity can be maintained)
  // SnackBar pops up on success.
  const deleteBookingFn = async (booking) => {
    const response = await fetch('http://localhost:5005/bookings/' + booking.id, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN')
      }
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
    } else {
      setSbMsgFn('Booking successfully removed.');
      openSbFn();
      fetchBookingsFn();
    }
  }

  return (
    <>
      {bookings.length > 0 && <div style={{ paddingTop: '40px', textAlign: 'left' }}>
        <Typography variant="h6" style={{ fontWeight: 'bold' }}>
          Booking status:
        </Typography>
        {bookings.map((booking, i) =>
          <Card key={i} sx={{ minWidth: 275, marginTop: '10px' }}>
            <CardContent>
              <Typography variant='h6' style={{ fontWeight: 'bold' }}>
                {formatDateRange(booking.dateRange[0], booking.dateRange[1])}
              </Typography>
              <Typography variant='h6' style={{ fontStyle: 'italic' }}>
                ${booking.totalPrice} AUD
              </Typography>
              <Chip label={booking.status} style={{ background: colorStatus(booking.status), color: 'white' }} />
            </CardContent>
            <CardActions>
              {booking.status === 'pending' && <Button color='error' size='small' onClick={() => deleteBookingFn(booking)}>Delete Booking</Button>}
              {booking.status === 'accepted' && <MakeReviewModal booking={booking} setSbMsgFn={setSbMsgFn} openSbFn={openSbFn} refreshListingFn={refreshListingFn} />}
            </CardActions>
          </Card>
        )}
      </div>}
    </>
  );
}

BookingStatus.propTypes = {
  bookings: PropTypes.array,
  fetchBookingsFn: PropTypes.func,
  setSbMsgFn: PropTypes.func,
  openSbFn: PropTypes.func,
  refreshListingFn: PropTypes.func
}

export default BookingStatus;
