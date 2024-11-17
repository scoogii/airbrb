import React from 'react';

import Button from '@mui/material/Button';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Backdrop, Box, CircularProgress, Fade, FormControl, MenuItem, Modal, Select, TextField, Typography, useMediaQuery } from '@mui/material';

import { avgRating, validDates } from '../API';
import PropTypes from 'prop-types';

import { Context, useContext } from '../Context';

// Loads a modal which enables the user to filter through listings based on parameters listed in the spec
// This filter can filter on multiple conditions
const FilterListingsModal = ({ allListings, setDisplayedListingsFn }) => {
  const boxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '85vh',
    overflow: 'scroll',
    overflowX: 'hidden',
    width: useMediaQuery('(max-width: 600px)') ? '90vw' : '600px',
    bgcolor: 'white',
    border: '2px solid #fe6b8b',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  }

  const [bedrooms, setBedrooms] = React.useState(['', '']);
  const [dates, setDates] = React.useState(['', '']);
  const [priceRangeValue, setPriceRangeValue] = React.useState(['', '']);
  const [ratingsValue, setRatingsValue] = React.useState('');
  const handleRatingsChange = (event) => {
    setRatingsValue(event.target.value);
  };

  const [clicked, setClicked] = React.useState(false);

  const { setters } = useContext(Context);

  // This function filters through all listings and sets displayedListings based on
  // the parameters provided. Does not need to query the backend
  const filterListingsFn = async () => {
    setClicked(true);

    let display = [...allListings];

    // Filter based on number of bedrooms
    if (bedrooms[0]) {
      display = display.filter((listing) => {
        return parseInt(listing.metadata.bedrooms, 10) >= parseInt(bedrooms[0], 10);
      })
    }
    if (bedrooms[1]) {
      display = display.filter((listing) => {
        return parseInt(listing.metadata.bedrooms, 10) <= parseInt(bedrooms[1], 10);
      })
    }

    // If a start and end date is provided, ensures that the start date is before the end date
    if (dates[0] && dates[1] && !validDates(dates[0], dates[1])) {
      alert('Please enter a valid date range!');
      setClicked(false);
      return;
    }

    // Filter based on availability of the listing.
    if (dates[0]) {
      display = display.filter((listing) => {
        return listing.availability.some((availability) => {
          return (new Date(dates[0]) >= new Date(availability[0]));
        });
      });
    }
    if (dates[1]) {
      display = display.filter((listing) => {
        return listing.availability.some((availability) => {
          return (new Date(dates[1]) <= new Date(availability[1]));
        });
      });
    }

    // If both dates given, filter based on price per stay
    if (dates[0] && dates[1]) {
      const timeDifference = (new Date(dates[1])).getTime() - (new Date(dates[0])).getTime();
      const nDays = timeDifference / (1000 * 3600 * 24);

      // Set the variable to determine whether to display price per night or price per stay
      // on the listing
      setters.setUsedDateRange(nDays);

      display = display.filter((listing) => {
        const pricePerStay = nDays * parseInt(listing.price, 10);

        if (priceRangeValue[0] && priceRangeValue[1]) {
          return parseInt(priceRangeValue[0], 10) <= pricePerStay && pricePerStay <= parseInt(priceRangeValue[1], 10);
        } else if (priceRangeValue[0]) {
          return parseInt(priceRangeValue[0], 10) <= pricePerStay
        } else if (priceRangeValue[1]) {
          return pricePerStay <= parseInt(priceRangeValue[1], 10);
        }

        return true;
      });
    } else {
      // Otherwise, filter by price per night

      // Set the variable to determin whether to display price per night or price per stay
      // on the listing
      setters.setUsedDateRange(0);

      // Filter based on price per night
      if (priceRangeValue[0]) {
        display = display.filter((listing) => {
          return parseInt(priceRangeValue[0], 10) <= parseInt(listing.price, 10);
        });
      }
      if (priceRangeValue[1]) {
        display = display.filter((listing) => {
          return parseInt(priceRangeValue[1], 10) >= parseInt(listing.price, 10);
        });
      }
    }

    // Sort based on average rating of the listing
    if (ratingsValue === true) {
      setDisplayedListingsFn(display.sort((a, b) => {
        console.log('hello');
        return avgRating(a.reviews) - avgRating(b.reviews);
      }))
    } else if (ratingsValue === false) {
      setDisplayedListingsFn(display.sort((a, b) => {
        return avgRating(b.reviews) - avgRating(a.reviews);
      }))
    }

    setDisplayedListingsFn(display);
    setClicked(false);
    setOpen(false);
  }

  // This function removes all filters and redisplays all the listings
  const clearFiltersFn = () => {
    setBedrooms(['', '']);
    setDates(['', '']);
    setPriceRangeValue(['', '']);
    setRatingsValue('');
    setters.setUsedDateRange(0);
    setDisplayedListingsFn(allListings);
  }

  return (
    <>
      <div>
        <Button
          onClick={handleOpen}
          sx={{
            background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)',
            fontSize: '0.9em'
          }}
          variant='contained'
        >
          <FilterAltIcon style={{ marginLeft: '-5px' }} />
          &nbsp; Filter
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 300,
          }}
        >
          <Fade in={open}>
            <Box sx={boxStyle}>
              <Typography variant='h4' style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                Filter Listings
              </Typography>

              <Typography variant='h6' style={{ fontSize: '1em', marginTop: '3vh' }}>
                Number of Bedrooms
              </Typography>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <TextField
                  sx={{
                    width: '150',
                    marginRight: { xs: 1, lg: 0.5 }
                  }}
                  variant='outlined'
                  type='number'
                  label='Minimum'
                  value={bedrooms[0]}
                  onChange={(e) => {
                    setBedrooms([e.target.value, bedrooms[1]]);
                  }}
                />
                <TextField
                  sx={{
                    width: '150',
                    marginLeft: { xs: 1, lg: 0.5 }
                  }}
                  variant='outlined'
                  type='number'
                  label='Maximum'
                  value={bedrooms[1]}
                  onChange={(e) => {
                    setBedrooms([bedrooms[0], e.target.value]);
                  }}
                />
              </div>

              <Typography variant='h6' style={{ fontSize: '1em', marginTop: '3vh' }}>
                Enter an Availability Range:
              </Typography>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  sx={{
                    width: { xs: 150, sm: 200, md: 200, lg: 220 }
                  }}
                  variant='outlined'
                  type='date'
                  value={dates[0]}
                  onChange={(e) => {
                    setDates([e.target.value, dates[1]]);
                  }}
                />
                <Typography variant='h8' style={{ fontSize: '1em', marginLeft: 10, marginRight: 10 }}>
                  to
                </Typography>
                <TextField
                  sx={{
                    width: { xs: 150, sm: 200, md: 200, lg: 220 }
                  }}
                  variant='outlined'
                  type='date'
                  value={dates[1]}
                  onChange={(e) => {
                    setDates([dates[0], e.target.value]);
                  }}
                />
              </div>

              <Typography variant='h6' style={{ fontSize: '1em', marginTop: '3vh' }}>
                Price Range ($AU):
              </Typography>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <TextField
                  sx={{
                    width: '150',
                    marginRight: { xs: 1, lg: 0.5 }
                  }}
                  variant='outlined'
                  type='number'
                  label='Minimum'
                  value={priceRangeValue[0]}
                  onChange={(e) => {
                    setPriceRangeValue([e.target.value, priceRangeValue[1]]);
                  }}
                />
                <TextField
                  sx={{
                    width: '150',
                    marginLeft: { xs: 1, lg: 0.5 }
                  }}
                  variant='outlined'
                  type='number'
                  label='Maximum'
                  value={priceRangeValue[1]}
                  onChange={(e) => {
                    setPriceRangeValue([priceRangeValue[0], e.target.value]);
                  }}
                />
              </div>
              <Typography variant='h6' style={{ fontSize: '1em', marginTop: '3vh' }}>
                Sort Review Ratings by:
              </Typography>
              <FormControl sx={{ m: 1, minWidth: 150 }} style={{ marginBottom: '3vh' }}>
                <Select
                  sx={{ width: { xs: 150, sm: 200, md: 200, lg: 250 } }}
                  value={ratingsValue}
                  onChange={handleRatingsChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Optional' }}
                >
                  <MenuItem value={''}>
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={true}>
                    Lowest to Highest
                  </MenuItem>
                  <MenuItem value={false}>
                    Highest to Lowest
                  </MenuItem>
                </Select>
              </FormControl>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Button
                  sx={{
                    width: { xs: 90, sm: 100, md: 160, lg: 200 },
                    background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)',
                    marginRight: { xs: 1.5, sm: 1, md: 0.7, lg: 2 },
                  }}
                  style={{ marginTop: '3vh' }}
                  variant='contained'
                  onClick={filterListingsFn}
                  disabled={clicked}
                >
                  {(clicked) ? <CircularProgress size='1.5rem' color='inherit' /> : 'Filter Listings'}
                </Button>
                <Button
                  sx={{
                    width: { xs: 90, sm: 100, md: 160, lg: 200 },
                    marginLeft: { xs: 1.5, sm: 1, md: 0.7, lg: 2 },
                  }}
                  style={{ marginTop: '3vh' }}
                  variant='outlined'
                  color='error'
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              </div>
            </Box>
          </Fade>

        </Modal>
        <Button
          variant='outlined'
          color='error'
          sx={{
            fontSize: '0.9em',
            marginLeft: '1.5vw'
          }}
          onClick={clearFiltersFn}
        >
          Clear Filters
        </Button>
      </div>
    </>
  );
}

FilterListingsModal.propTypes = {
  allListings: PropTypes.array,
  setDisplayedListingsFn: PropTypes.func
}

export default FilterListingsModal;
