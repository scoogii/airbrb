import React from 'react';
import PropTypes from 'prop-types';

import { Typography, TextField, Button, CircularProgress, useMediaQuery } from '@mui/material';
import { validDates } from '../API';

// Enables the user to select two dates and make a booking on a published listing
const MakeBooking = ({ listing, fetchBookingsFn, setSbMsgFn, openSbFn }) => {
  const [bookingDates, setBookingDates] = React.useState(['', '']);
  const [clicked, setClicked] = React.useState(false);

  // This function queries the backend to create a booking for the current listing.
  // Snackbar opens on success.
  const bookFn = async () => {
    setClicked(true);

    // Check if both dates are provided
    if (!bookingDates[0] || !bookingDates[1]) {
      alert('Please select a valid date range');
      setClicked(false);
      return;
    }

    // Checks if the start date is before the end date
    if (!validDates(bookingDates[0], bookingDates[1])) {
      alert('\'From\' date cannot be after \'To\' date!');
      setClicked(false);
      return;
    }

    // Checks if the date range provided lies within at least one availability provided by the host.
    if (!listing.availability.some(availability => new Date(availability[0]) <= new Date(bookingDates[0]) && new Date(bookingDates[1]) <= new Date(availability[1]))) {
      alert('Please select a date range within the availabilities provided!');
      setClicked(false);
      return;
    }

    const timeDifference = (new Date(bookingDates[1])).getTime() - (new Date(bookingDates[0])).getTime();
    const nDays = timeDifference / (1000 * 3600 * 24);
    const totalPrice = nDays * listing.price;

    const response = await fetch('http://localhost:5005/bookings/new/' + listing.id, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN'),
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        dateRange: bookingDates,
        totalPrice
      })
    });

    const data = await response.json();
    if (data.error) {
      alert(data.error);
    } else {
      setSbMsgFn('Booking successful. Awaiting host response');
      openSbFn();
      setBookingDates(['', '']);
      fetchBookingsFn();
    }

    setClicked(false);
  }

  return (
    <>
      <div style={{ paddingTop: '20px', textAlign: 'left' }}>
        <Typography variant="h6" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
          Make a booking:
        </Typography>
        <div>
          <div style={{ display: 'inline-block' }}>
            From:
            <br />
            <TextField variant='outlined' type='date' value={bookingDates[0]} onChange={(e) => {
              setBookingDates([e.target.value, bookingDates[1]]);
            }} />
          </div>
          {useMediaQuery('(min-width: 780px)') && <>&nbsp;&nbsp;&nbsp;</>}
          <div style={{ display: 'inline-block' }}>
            To:
            <br />
            <TextField variant='outlined' type='date' value={bookingDates[1]} onChange={(e) => {
              setBookingDates([bookingDates[0], e.target.value]);
            }} />
          </div>
          {useMediaQuery('(max-width: 995px)') && <br />}
          <Button
            sx={{
              width: '80px'
            }}
            style={{ background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)', marginLeft: useMediaQuery('(max-width: 995px)') ? '0' : '20px', height: '4em', position: 'relative', top: '14px', display: 'inline-block' }}
            variant='contained'
            onClick={bookFn}
            disabled={clicked}
          >
            {(clicked) ? <CircularProgress size="1.5rem" color="inherit"/> : 'Book'}
          </Button>
        </div>
      </div>
    </>
  );
}

MakeBooking.propTypes = {
  listing: PropTypes.object,
  fetchBookingsFn: PropTypes.func,
  setSbMsgFn: PropTypes.func,
  openSbFn: PropTypes.func
}

export default MakeBooking;
