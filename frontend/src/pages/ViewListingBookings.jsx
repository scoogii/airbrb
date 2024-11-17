import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Nav from '../components/Nav';

import { Typography, CircularProgress, Card, CardContent, Alert, Snackbar, Button } from '@mui/material';
import ListingCarousel from '../components/ListingCarousel';

import BookingRequestHistory from '../components/BookingRequestHistory';

// The page loads the booking request for the host
const ViewListingBookings = () => {
  const listingId = useLocation().pathname.split('/')[2];
  const navigate = useNavigate();

  const [listing, setListing] = React.useState(null);
  const [listingPeriod, setListingPeriod] = React.useState(0);

  // SnackBar code
  // State of SnackBar (open or closed)
  const [sbOpen, setSbOpen] = React.useState(false);
  const handleClick = () => setSbOpen(true);
  const handleSbClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSbOpen(false);
  }

  // Message of snackBar
  const [sbMessage, setSbMessage] = React.useState('');
  const SnackBar = () => {
    return (
      <Snackbar
        open={sbOpen}
        autoHideDuration={5000}
        onClose={handleSbClose}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Alert onClose={handleSbClose} severity='success' sx={{ width: '100%' }}>
          {sbMessage}
        </Alert>
      </Snackbar>
    )
  }

  // This function queries the backend for the current listing.
  // Also calculates the number of days the listing has been posted for.
  const refreshListing = async () => {
    const response = await fetch('http://localhost:5005/listings/' + listingId, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN')
      }
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
    } else {
      setListing({ ...data.listing, ...{ id: listingId } });

      const timeDifference = new Date().getTime() - (new Date(data.listing.postedOn)).getTime();
      const nDays = timeDifference / (1000 * 3600 * 24);
      setListingPeriod(Math.floor(nDays));
    }
  }

  // This is so the above function is called on page load.
  React.useEffect(refreshListing, []);

  const [bookings, setBookings] = React.useState([]);

  // this function queries the backend for all bookings and filters for those
  // which belong to the current listing
  const fetchBookings = async () => {
    if (!localStorage.getItem('TOKEN')) {
      return;
    }

    const response = await fetch('http://localhost:5005/bookings', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN')
      }
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
    } else {
      setBookings(data.bookings.filter(booking => booking.listingId === listingId));
    }
  };

  // This is so the above function is called on page load.
  React.useEffect(fetchBookings, []);

  // Calculates the number of days a listing has been booked for in the current year
  const daysBooked = () => {
    const currentYear = new Date().getFullYear();
    const bookingsThisYear = bookings.filter((booking) => {
      const startYear = new Date(booking.dateRange[0]).getFullYear();
      const endYear = new Date(booking.dateRange[1]).getFullYear();

      return startYear === currentYear && endYear === currentYear && booking.status === 'accepted';
    });

    let nDays = 0;
    for (const booking of bookingsThisYear) {
      const timeDifference = (new Date(booking.dateRange[1])).getTime() - (new Date(booking.dateRange[0])).getTime();
      nDays += timeDifference / (1000 * 3600 * 24);
    }

    return nDays;
  }

  return (!listing)
    ? (
      <>
        <Nav />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
          <CircularProgress />
        </div>
      </>)
    : (
      <>
        <Nav />
        <div style={{ padding: '20px 30px', textAlign: 'right' }}>
          <Button variant='outlined' color='warning' onClick={() => {
            navigate('/listing/' + listingId);
          }}>
            Back
          </Button>
        </div>
        {listing.owner === localStorage.getItem('USER') && <div style={{ margin: '0 30px', display: 'flex', justifyContent: 'space-between' }}>
          <Card sx={{ width: '100vw' }}>
            <ListingCarousel thumbnail={listing.thumbnail} imgs={listing.metadata.imgs} />
            <CardContent sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ width: '50%', minWidth: '300px' }}>
                <Typography variant="h3">
                  {listing.title} - {listing.metadata.propType}
                </Typography>
                <br />
                <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  {listing.address.street}
                  <br />
                  {listing.address.city}, {listing.address.state}
                </Typography>
                <br />
                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  Posted {listingPeriod} days ago
                </Typography>
                <br />
                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  Booked for {daysBooked()} days this year
                </Typography>
                <br />
                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  Generated ${daysBooked() * listing.price} AUD in profit
                </Typography>
                <br />
              </div>
              <div style={{ width: '50%', minWidth: '300px' }}>
                <BookingRequestHistory bookings={bookings} fetchBookingsFn={fetchBookings} setSbMsgFn={setSbMessage} openSbFn={handleClick} />
              </div>
            </CardContent>
          </Card>
        </div>}
        <SnackBar />
      </>);
}

export default ViewListingBookings;
