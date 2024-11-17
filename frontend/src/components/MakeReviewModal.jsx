import React from 'react';

import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import Typography from '@mui/material/Typography';
import { useMediaQuery, CircularProgress, Rating, TextField } from '@mui/material';

import PropTypes from 'prop-types';

// loads a modal which enables a user who has an accepted booking to leave a review on the listing
const MakeReviewModal = ({ booking, setSbMsgFn, openSbFn, refreshListingFn }) => {
  const boxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '85vh',
    overflow: 'scroll',
    overflowX: 'hidden',
    width: useMediaQuery('(max-width: 500px)') ? '90vw' : '450px',
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
    setRating(3);
    setName('');
    setComment('');
  }

  const [clicked, setClicked] = React.useState(false);
  const [rating, setRating] = React.useState(3);
  const [name, setName] = React.useState('');
  const [comment, setComment] = React.useState('');

  // queries the backend and makes a review on a listing
  // snackbar opens on success
  const makeReviewFn = async () => {
    setClicked(true);
    if (!rating && !comment) {
      setClicked(false);
      alert('Please review a rating and comment');
      return;
    }

    const response = await fetch('http://localhost:5005/listings/' + booking.listingId + '/review/' + booking.id, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN'),
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        review: { name, comment, rating }
      })
    });

    const data = await response.json();
    if (data.error) {
      alert(data.error);
      setClicked(false);
    } else {
      setClicked(false);
      refreshListingFn();
      setSbMsgFn('Thanks for leaving a review!')
      openSbFn();
      handleClose();
    }
  }

  return (
    <>
      <Button
        sx={{
          fontSize: '0.8125em'
        }}
        style={{
          color: '#1c8037'
        }} onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}>Leave a review</Button>
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
              Leave a Review
            </Typography>

            <Rating
              name='half-rating'
              size='large'
              value={rating}
              style={{ marginTop: '3vh' }}
              onChange={(e) => {
                setRating(parseInt(e.target.value, 10));
              }}
            />

            <TextField
              sx={{ width: { xs: 150, sm: 200, md: 300 } }}
              style={{ marginTop: '3vh' }}
              label='Name'
              variant='outlined'
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
            />

            <TextField
              sx={{ width: { xs: 150, sm: 200, md: 300 } }}
              style={{ marginTop: '3vh', marginBottom: '2vh' }}
              label='Comment'
              value={comment}
              onChange={(e) => {
                setComment(e.target.value)
              }}
              variant='outlined'
            />

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Button
                sx={{
                  width: { xs: 100, sm: 100, md: 160, lg: 170 },
                  marginRight: 2,
                  background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)',
                }}
                style={{ marginTop: '3vh' }}
                variant='contained'
                onClick={makeReviewFn}
                disabled={clicked}
              >
                {(clicked) ? <CircularProgress size="1.5rem" color="inherit" /> : 'Submit'}
              </Button>
              <Button
                sx={{
                  width: { xs: 100, sm: 100, md: 160, lg: 170 },
                  marginLeft: 2,
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

MakeReviewModal.propTypes = {
  booking: PropTypes.object,
  setSbMsgFn: PropTypes.func,
  openSbFn: PropTypes.func,
  refreshListingFn: PropTypes.func
}

export default MakeReviewModal;
