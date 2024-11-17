import React from 'react';

import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import Typography from '@mui/material/Typography';
import { useMediaQuery, CircularProgress, TextField } from '@mui/material';

import { validDates } from '../API';

import PropTypes from 'prop-types';

// Given a list of date pairs, ensures that the date ranges do not
// overlap
const datesOverlap = (dates) => {
  const ranges = dates.map((pair) => {
    return [new Date(pair[0]), new Date(pair[1])];
  });

  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i][0] < ranges[i - 1][1]) {
      return true;
    }
  }

  return false;
}

// loads a modal for the user who wishes to publish their listing for other users to see
const PublishListingModal = ({ listing, updateMyListingsFn, setSbMsgFn, openSbFn }) => {
  const boxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '85vh',
    overflow: 'scroll',
    overflowX: 'hidden',
    width: useMediaQuery('(max-width: 500px)') ? '90vw' : '500px',
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

  const [dates, setDates] = React.useState([['', '']]);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setDates([['', '']])
  }

  const [clicked, setClicked] = React.useState(false);

  // This function queries the backend and publishes the listing based on the availabilities provided.
  // snackbar opens on success.
  const publishListingFn = async () => {
    setClicked(true);

    // Does nothing if no availabilities are provided
    if (dates.length === 0) {
      handleClose();
      setClicked(false);
      return;
    }

    // Checks that both dates (start, end) are provided and that the start date is before the end date
    for (const date of dates) {
      if (date[0] === '' || date[1] === '' || !validDates(date[0], date[1])) {
        alert('Please enter a valid avaliability for Avaliability ' + (dates.indexOf(date) + 1) + '!');
        setClicked(false);
        return;
      }
    }

    setDates(dates.sort((a, b) => {
      const d1 = new Date(a[0]);
      const d2 = new Date(b[0]);

      return d1 - d2;
    }));

    // Checks that the availabilities do not overlap
    if (datesOverlap(dates)) {
      alert('Availiabilities cannot overlap! Please adjust availiabilities to distinct ranges!');
      setClicked(false);
      return;
    }

    const response = await fetch('http://localhost:5005/listings/publish/' + listing.id, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN'),
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        availability: dates
      })
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
      setClicked(false);
      return;
    }

    setClicked(false);
    handleClose();
    updateMyListingsFn();
    setSbMsgFn('Listing successfully published.');
    openSbFn();
  }

  return (
    <>
      <Button variant="contained" style={{ backgroundColor: '#fe7777', position: 'relative', top: '6px' }} onClick={(e) => {
        e.stopPropagation();
        handleOpen();
      }}>Publish Listing</Button>
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Fade in={open}>
          <Box sx={boxStyle}>
            <Typography variant='h4' style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
              Publish Listing
            </Typography>

            {dates.map((date, i) =>
              <div key={i}>
                <br />
                <Typography variant='h7' style={{ fontWeight: 'bold' }}>
                  Avaliability {i + 1}:
                </Typography>
                <div style={{ display: 'flex' }}>
                  <div>
                    Avaliability start
                    <TextField variant='outlined' type='date' value={date[0]} onChange={(e) => {
                      setDates(dates.map((d, j) => {
                        return (i !== j) ? d : [e.target.value, date[1]];
                      }));
                    }} />
                  </div>
                  <div>
                    Avaliability end
                    <TextField variant='outlined' type='date' value={date[1]} onChange={(e) => {
                      setDates(dates.map((d, j) => {
                        return (i !== j) ? d : [date[0], e.target.value];
                      }));
                    }} />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Button
                sx={{
                  width: { xs: 150 },
                  marginRight: { xs: 1, sm: 2.1, md: 2.3, lg: 2 },
                  background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)',
                }}
                style={{ marginTop: '3vh' }}
                variant='contained'
                onClick={() => {
                  setDates([...dates, ['', '']]);
                }}
              >
                Add another avaliability
              </Button>
              <Button
                sx={{
                  width: { xs: 150 },
                  marginLeft: { xs: 1, sm: 2.1, md: 2.3, lg: 2 },
                }}
                style={{ marginTop: '3vh' }}
                variant='outlined'
                color='error'
                onClick={() => {
                  setDates(dates.slice(0, -1));
                }}
              >
                Delete last avaliability
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Button
                sx={{
                  width: { xs: 90, sm: 100, md: 160, lg: 200 },
                  marginRight: { xs: 1.5, sm: 2, md: 2, lg: 1.3 },
                  background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)',
                }}
                style={{ marginTop: '3vh' }}
                variant='contained'
                onClick={publishListingFn}
                disabled={clicked}
              >
                {(clicked) ? <CircularProgress size="1.5rem" color="inherit" /> : 'Publish Listing'}
              </Button>
              <Button
                sx={{
                  width: { xs: 90, sm: 100, md: 160, lg: 200 },
                  marginLeft: { xs: 1.5, sm: 2, md: 2, lg: 1.3 },
                }}
                style={{ marginTop: '3vh' }}
                variant='outlined'
                color='error'
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </Box >
        </Fade >
      </Modal >
    </>
  );
}

PublishListingModal.propTypes = {
  listing: PropTypes.object,
  updateMyListingsFn: PropTypes.func,
  setSbMsgFn: PropTypes.func,
  openSbFn: PropTypes.func
}

export default PublishListingModal;
