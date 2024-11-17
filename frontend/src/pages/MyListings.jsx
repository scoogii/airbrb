import React from 'react';
import { useNavigate } from 'react-router-dom';

import Nav from '../components/Nav';
import MakeListingModal from '../components/MakeListingModal';
import { Typography, LinearProgress, Snackbar, Alert } from '@mui/material';
import Listing from '../components/Listing';
import Grid from '@mui/material/Grid';
import { useContext, Context } from '../Context';
import FilterListingsModal from '../components/FilterListingsModal';

// The page which shows the user's listings
const MyListings = () => {
  // Basic security measure
  // If the user is not logged in, they should not have
  // access to this page. Redirect them to the landing page.
  const navigate = useNavigate();
  if (!localStorage.getItem('TOKEN')) {
    navigate('/');
  }

  // Upon loading the MyListings page, price per stay
  // should be displayed. Hence set usedDateRange to 0.
  const { getters, setters } = useContext(Context);
  React.useEffect(() => {
    setters.setUsedDateRange(0);
  }, []);

  // myListings is a list of all listings belonging to the logged in user.
  const [myListings, setMyListings] = React.useState([]);
  // displayedListings is a list of all listings which belong to the logged in user,
  // which satisfy the search/filter. These two lists is so we do not need to
  // query the backend when the search/filter is cleared.
  const [displayedListings, setDisplayedListings] = React.useState([]);

  // State varirable to determine if page should be loaded or a
  // loading screen
  const [loaded, setLoaded] = React.useState(false);

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

  // Message of the SnackBar
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

  // This function queries the backend for all listings and filters for those belonging to the
  // logged in user.
  const updateMyListings = async () => {
    const response = await fetch('http://localhost:5005/listings', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN')
      }
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
      return;
    }

    const fetchListings = async (listing) => {
      const response = await fetch('http://localhost:5005/listings/' + listing.id, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('TOKEN')
        }
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.listing.owner === localStorage.getItem('USER')) {
        return { ...data.listing, ...{ id: listing.id } };
      }
    }

    const listings = (await Promise.all(data.listings.map(fetchListings))).filter(listing => listing !== undefined);

    // Listings sorted by:
    // published first, then by most recent
    setMyListings(listings.sort((a, b) => {
      return (Number(b.published) - Number(a.published)) || (new Date(b.postedOn) - new Date(a.postedOn));
    }));

    // Only after the listings are loaded can the page be displayed
    setLoaded(true);
  }

  // This is so the above function can be called on page load.
  React.useEffect(updateMyListings, []);
  React.useEffect(() => {
    setDisplayedListings(myListings);
  }, [myListings]);

  return (
    <>
      <Nav allListings={myListings} setDisplayedListingsFn={setDisplayedListings} />
      {(loaded)
        ? (<>
          <br />
          <div style={{ padding: '0 30px' }}>
            {getters.user && <Typography variant='h5'>
              Hello {getters.user}!
            </Typography>}
          </div>
          <MakeListingModal updateMyListingsFn={updateMyListings} setSbMsgFn={setSbMessage} openSbFn={handleClick} />
          <br />
          <div style={{ padding: '0 30px' }}>
            <Typography variant='h5'>
              Your Listings
            </Typography>
            <hr />
            {myListings.length > 0 && <FilterListingsModal allListings={myListings} setDisplayedListingsFn={setDisplayedListings} />}
            <br />
            <br />
            {(displayedListings.length > 0) && <Grid container spacing={2}>
              {displayedListings.map((listing, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <Listing listing={listing} updateMyListingsFn={updateMyListings} setSbMsgFn={setSbMessage} openSbFn={handleClick} />
                </Grid>
              ))}
            </Grid>}
            {(displayedListings.length === 0) && <Typography variant='h6'>
              There are no current listings with the given parameters!
            </Typography>}
          </div>
        </>)
        : (
          <LinearProgress />)
      }
      <SnackBar />
    </>
  );
}

export default MyListings;
