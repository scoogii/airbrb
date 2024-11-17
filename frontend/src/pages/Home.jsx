import React from 'react';

import Nav from '../components/Nav';
import Listing from '../components/Listing';
import Grid from '@mui/material/Grid';
import { useContext, Context } from '../Context';
import { Alert, LinearProgress, Snackbar, Typography } from '@mui/material';
import FilterListingsModal from '../components/FilterListingsModal';

// The Home/Landing Page
const Home = () => {
  // Since loading listings can take some time to render,
  // we use this variable to determine if the page can be loaded
  // or a loading screen is displayed.
  const [loaded, setLoaded] = React.useState(false);

  // Loading the Home Page removes the need to display
  // price per stay. Hence set usedDateRange to 0.
  const { getters, setters } = useContext(Context);
  React.useEffect(() => {
    setters.setUsedDateRange(0);
  }, []);

  // allListings is a list of all listings from the backend
  const [allListings, setAllListings] = React.useState([]);
  // displayedListings is a filter on allListings based on search/filters.
  // These two lists prevent the need for a backend request when the search/filters
  // are cleared.
  const [displayedListings, setDisplayedListings] = React.useState([]);

  // SnackBar Code
  // State of SnackBar (open or closed)
  const [sbOpen, setSbOpen] = React.useState(false);
  const handleClick = () => setSbOpen(true);
  const handleSbClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSbOpen(false);
  }

  // Message of SnackBar
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

  // When this function is called, retrieves all listings from the backend.
  // Retrieves the full details of the listing.
  // Since this is the landing page, only listings which are published will be
  // retrieved and displayed.
  const updateAllListings = async () => {
    const response = await fetch('http://localhost:5005/listings', {
      method: 'GET',
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
      return;
    }

    const fetchListings = async (listing) => {
      const response = await fetch('http://localhost:5005/listings/' + listing.id, {
        method: 'GET',
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.listing.published) {
        return { ...data.listing, ...{ id: listing.id } };
      }
    }

    // After retrieving all the listings, select only those which are published.
    const listings = (await Promise.all(data.listings.map(fetchListings))).filter(listing => listing !== undefined);

    // Sort listings based on Title
    setAllListings(listings.sort((a, b) => {
      return (a.title).localeCompare(b.title);
    }));

    // Once all the relevant listings have been retrieved,
    // page can now be loaded.
    setLoaded(true);
  }

  // These useEffects allow the above functions to be called on page load.
  React.useEffect(updateAllListings, []);
  React.useEffect(() => {
    setDisplayedListings(allListings);
  }, [allListings])

  return (
    <>
      <Nav allListings={allListings} setDisplayedListingsFn={setDisplayedListings} />
      {(loaded)
        ? (<>
          <br />
          <div style={{ padding: '0 30px' }}>
            {getters.user && <><Typography variant='h5'>
              Hello {getters.user}!
            </Typography><br /></>}
            {allListings.length > 0 && <><FilterListingsModal allListings={allListings} setDisplayedListingsFn={setDisplayedListings} /><br /><br /></>}
            {(displayedListings.length > 0) && <Grid container spacing={2}>
              {displayedListings.map((listing, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <Listing listing={listing} updateMyListingsFn={updateAllListings} setSbMsgFn={setSbMessage} openSbFn={handleClick} />
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

export default Home;
