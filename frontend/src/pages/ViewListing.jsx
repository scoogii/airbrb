import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Nav from '../components/Nav';
import ConfirmDeleteListingModal from '../components/ConfirmDeleteListingModal';
import EditListingModal from '../components/EditListingModal';
import PublishListingModal from '../components/PublishListingModal';
import UnpublishListingModal from '../components/UnpublishListingModal';

import { avgRating } from '../API';

import { Typography, Rating, CircularProgress, Card, CardContent, Alert, Snackbar, Tooltip, IconButton } from '@mui/material';
import ListingCarousel from '../components/ListingCarousel';
import ShowAvailabilities from '../components/ShowAvailabilties';

import { Context, useContext } from '../Context';
import MakeBooking from '../components/MakeBooking';
import BookingStatus from '../components/BookingStatus';
import BookIcon from '@mui/icons-material/Book';

// The page which shows details about a particular listing
const ViewListing = () => {
  // Need to retrieve the listing id from the url
  const listingId = useLocation().pathname.split('/')[2];
  const [listing, setListing] = React.useState(null);

  const navigate = useNavigate();
  const { getters } = useContext(Context);

  // SnackBar code
  // State of the snackbar (open or closed)
  const [sbOpen, setSbOpen] = React.useState(false);
  const handleClick = () => setSbOpen(true);
  const handleSbClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSbOpen(false);
  }

  // SnackBar Message
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

  // This function queries the backend for a particular listing
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
    }
  }

  // This is so the above function is called on page load.
  React.useEffect(refreshListing, []);

  const [bookings, setBookings] = React.useState([]);

  // This function, given a list of bookings, deletes those who belong to the current listing
  // if the current listing is no longer published.
  const deleteInvalidBookings = async (bookings) => {
    const newBookings = [];
    for (const booking of bookings) {
      if (booking.listingId === listing.id && !listing.published) {
        const response = await fetch('http://localhost:5005/bookings/' + booking.id, {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('TOKEN')
          }
        });
        const data = await response.json();
        if (data.error) {
          alert(data.error);
        }
      } else {
        newBookings.push(booking);
      }
    }

    return newBookings;
  }

  // This function, fetches all bookings from the backend and filters for those belonging to
  // the current user and the current listing.
  const fetchBookings = async () => {
    if (!localStorage.getItem('TOKEN')) {
      return;
    }

    if (listing === null) {
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
      const finalBookings = await deleteInvalidBookings(data.bookings);
      setBookings(finalBookings.filter(booking => booking.owner === localStorage.getItem('USER') && booking.listingId === listingId));
    }
  };

  // This is so the above function is called each time the listing is refreshed.
  React.useEffect(fetchBookings, [listing]);

  // The following weird structure is needed because we need the async function above to
  // complete before we can render the page. So we have circular spin while waiting.
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
        <div style={{ margin: '30px 30px', display: 'flex', justifyContent: 'space-between' }}>
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
                <Tooltip
                  arrow
                  placement='right'
                  title={
                    <div style={{ width: '40vw', height: '20vh' }}>
                      <Rating size='small' name="svg-rating" value={avgRating(listing.reviews)} readOnly sx={{ marginLeft: '-5px' }} />
                      <Typography variant='h6' style={{ fontWeight: 'bold' }}>
                        {avgRating(listing.reviews)} out of 5
                      </Typography>
                      <Typography variant='h8'>
                      </Typography>
                    </div>
                  }
                >
                  <span>
                    <Rating name="svg-rating" value={avgRating(listing.reviews)} readOnly sx={{ marginLeft: '-5px' }} />
                  </span>
                </Tooltip>
                <Typography variant="h5" color="text.secondary">
                  {listing.reviews.length} reviews
                </Typography>
                <br />
                {getters.usedDateRange === 0 && <Typography variant="h5" color="text.secondary" sx={{ textDecoration: 'underline', fontWeight: 'bold' }}>
                  ${listing.price} AUD per night
                </Typography>}
                {getters.usedDateRange > 0 && <Typography variant="h5" color="text.secondary" sx={{ textDecoration: 'underline', fontWeight: 'bold' }}>
                  ${getters.usedDateRange * listing.price} AUD per stay
                </Typography>}
                <Typography variant="h5" component="div">
                  {listing.metadata.bedrooms} {listing.metadata.bedrooms > 1 ? 'bedrooms' : 'bedroom'}, {listing.metadata.beds} {listing.metadata.beds > 1 ? 'beds' : 'bed'}, {listing.metadata.bathrooms} {listing.metadata.bathrooms > 1 ? 'baths' : 'bath'}
                </Typography>
                <br />
                <Typography variant="h5" component="div">
                  Amenities: {listing.metadata.amen}
                </Typography>

                {listing.reviews.length > 0 && <Typography variant="h5" component="div" style={{ marginTop: '30px' }}>
                  Reviews
                </Typography>}
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                  {listing.reviews.map((review, i) => {
                    return (<Card
                      key={i}
                      sx={{
                        marginRight: { xs: '0px', sm: '15px' },
                        marginTop: '10px',
                      }}>
                      <CardContent style={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='h5' style={{ fontWeight: 'bold', marginBottom: '1vh' }}>
                          {review.name}
                        </Typography>
                        <Rating value={review.rating} style={{ marginBottom: '1vh' }} readOnly />
                        <Typography variant='h6' style={{ fontWeight: 'bold', marginBottom: '1vh' }}>
                          {review.comment}
                        </Typography>
                      </CardContent>
                    </Card>)
                  })}
                </div>
              </div>
              <div style={{ width: '50%', minWidth: '300px', textAlign: 'right', visibility: (listing.owner === localStorage.getItem('USER')) ? 'visible' : 'none' }}>
                {listing.owner === localStorage.getItem('USER') && !listing.published && <PublishListingModal listing={listing} updateMyListingsFn={refreshListing} setSbMsgFn={setSbMessage} openSbFn={handleClick} />}
                {listing.owner === localStorage.getItem('USER') && listing.published && <UnpublishListingModal listing={listing} updateMyListingsFn={refreshListing} setSbMsgFn={setSbMessage} openSbFn={handleClick} />}
                &nbsp;&nbsp;&nbsp;
                {listing.owner === localStorage.getItem('USER') && localStorage.getItem('TOKEN') && <>
                  <Tooltip title='View Bookings'>
                    <IconButton style={{ padding: '0', paddingTop: '10px', color: '#fe7777' }} aria-label="edit" onClick={(e) => {
                      e.stopPropagation();
                      navigate('/listing/' + listingId + '/bookings');
                    }}>
                      <BookIcon />
                    </IconButton>
                  </Tooltip>
                </>}
                &nbsp;&nbsp;
                {listing.owner === localStorage.getItem('USER') && <EditListingModal listing={listing} refreshListingFn={refreshListing} setSbMsgFn={setSbMessage} openSbFn={handleClick} />}
                &nbsp;&nbsp;
                {listing.owner === localStorage.getItem('USER') && <ConfirmDeleteListingModal listing={listing} updateMyListingsFn={() => {
                  navigate('/mylistings');
                }} setSbMsgFn={setSbMessage} openSbFn={handleClick} />}
                <br />
                <br />
                {listing.published && <ShowAvailabilities listing={listing} />}
                {listing.owner !== localStorage.getItem('USER') && localStorage.getItem('TOKEN') && listing.published && <MakeBooking listing={listing} fetchBookingsFn={fetchBookings} setSbMsgFn={setSbMessage} openSbFn={handleClick} />}
                {listing.owner !== localStorage.getItem('USER') && localStorage.getItem('TOKEN') && listing.published && <BookingStatus listing={listing} bookings={bookings} fetchBookingsFn={fetchBookings} setSbMsgFn={setSbMessage} openSbFn={handleClick} refreshListingFn={refreshListing} />}
              </div>
            </CardContent>
          </Card>
        </div>
        <SnackBar />
      </>)
}

export default ViewListing;
