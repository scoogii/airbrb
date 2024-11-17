import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Tooltip, CircularProgress } from '@mui/material';

const boxStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '250px',
  bgcolor: 'white',
  border: '2px solid #fe6b8b',
  borderRadius: '12px',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

// Loads a Modal which Confirms if user wishes to delete their own listing.
const ConfirmDeleteListingModal = ({ listing, updateMyListingsFn, setSbMsgFn, openSbFn }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [clicked, setClicked] = React.useState(false);

  // This function deletes a user's listing and then refreshes all listings.
  // SnackBar opens on success.
  const deleteListingFn = async (listing, updateMyListingsFn) => {
    setClicked(true);

    const response = await fetch('http://localhost:5005/listings/' + listing.id, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN')
      }
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
    } else {
      handleClose();
      updateMyListingsFn();
      setSbMsgFn('Listing successfully deleted.');
      openSbFn();
    }
    setClicked(false);
  }

  return (
    <>
      <Tooltip title='Remove Listing'>
        <IconButton style={{ padding: '0', paddingTop: '10px', color: '#fe7777' }} aria-label="delete" onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
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
            <Typography style={{ fontSize: '1.3em', fontWeight: 'bold' }}>
              Delete Listing?
            </Typography>
            <br />
            <div style={{ marginTop: '1vh' }}>
              <Button
                sx={{
                  width: '80px',
                  background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)',
                }}
                style={{ marginRight: '10px' }}
                variant='contained'
                onClick={() => deleteListingFn(listing, updateMyListingsFn)}
                disabled={clicked}
              >
                {(clicked) ? <CircularProgress size="1.5rem" color="inherit" /> : 'Delete'}
              </Button>
              <Button
                sx={{
                  width: '80px'
                }}
                style={{ marginLeft: '10px' }}
                variant='outlined'
                color='error'
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </Box >
        </Fade >
      </Modal>
    </>
  );
}

ConfirmDeleteListingModal.propTypes = {
  listing: PropTypes.object,
  updateMyListingsFn: PropTypes.func,
  setSbMsgFn: PropTypes.func,
  openSbFn: PropTypes.func
};

export default ConfirmDeleteListingModal;
