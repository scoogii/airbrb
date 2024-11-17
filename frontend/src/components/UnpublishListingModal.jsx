import React from 'react';

import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import Typography from '@mui/material/Typography';
import { useMediaQuery, CircularProgress } from '@mui/material';

import PropTypes from 'prop-types';

// loads a modal which confirms if the host wishes to unpublish their listing
const UnpublishListingModal = ({ listing, updateMyListingsFn, setSbMsgFn, openSbFn }) => {
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
  }

  const [clicked, setClicked] = React.useState(false);

  // this function queries the backend and unpublishes a listing.
  // snackbar opens on success.
  const unpublishListingFn = async () => {
    setClicked(true);

    const response = await fetch('http://localhost:5005/listings/unpublish/' + listing.id, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN'),
        'Content-type': 'application/json'
      }
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
    setSbMsgFn('Listing successfully unpublished.');
    openSbFn();
  }

  return (
    <>
      <Button variant="outlined" color='error' style={{ position: 'relative', top: '6px' }} onClick={(e) => {
        e.stopPropagation();
        handleOpen();
      }}>Unpublish Listing</Button>
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
              Unpublish listing?
            </Typography>

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Button
                sx={{
                  width: { xs: 90, sm: 110, md: 170 },
                  background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)',
                  marginRight: { xs: 1.5, sm: 1, md: 1, lg: 2 },
                }}
                style={{ marginTop: '3vh' }}
                variant='contained'
                onClick={unpublishListingFn}
                disabled={clicked}
              >
                {(clicked) ? <CircularProgress size="1.5rem" color="inherit" /> : 'Unpublish'}
              </Button>
              <Button
                sx={{
                  width: { xs: 90, sm: 110, md: 170 },
                  marginLeft: { xs: 1.5, sm: 1, md: 1, lg: 2 },
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

UnpublishListingModal.propTypes = {
  listing: PropTypes.object,
  updateMyListingsFn: PropTypes.func,
  setSbMsgFn: PropTypes.func,
  openSbFn: PropTypes.func
}

export default UnpublishListingModal;
