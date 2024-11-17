import React from 'react';
import PropTypes from 'prop-types';

import EditIcon from '@mui/icons-material/Edit';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { IconButton, useMediaQuery, TextField, FormControl, InputLabel, OutlinedInput, InputAdornment, Select, MenuItem, Tooltip, CircularProgress } from '@mui/material';
import { fileToDataUrl, multipleFileToDataUrl } from '../API';

// Loads a Modal which enables the user to edit their listing.
const EditListingModal = ({ listing, refreshListingFn, setSbMsgFn, openSbFn }) => {
  const boxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '85vh',
    overflow: 'scroll',
    overflowX: 'hidden',
    width: useMediaQuery('(max-width: 600px)') ? '60vw' : '50vw',
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

  const [name, setName] = React.useState(listing.title);
  const [street, setStreet] = React.useState(listing.address.street);
  const [city, setCity] = React.useState(listing.address.city);
  const [state, setState] = React.useState(listing.address.state);
  const [amt, setAmt] = React.useState(parseInt(listing.price, 10));
  const [propType, setPropType] = React.useState(listing.metadata.propType);
  const [amen, setAmen] = React.useState(listing.metadata.amen);
  const [bedrooms, setBedrooms] = React.useState(parseInt(listing.metadata.bedrooms, 10));
  const [beds, setBeds] = React.useState(parseInt(listing.metadata.beds, 10));
  const [bathrooms, setBathrooms] = React.useState(parseInt(listing.metadata.bathrooms, 10));
  const [thumbnailName, setThumbnailName] = React.useState('');
  const [thumbnail, setThumbnail] = React.useState(null);
  const [imgs, setImgs] = React.useState([]);
  const [imgNames, setImgNames] = React.useState('');

  // State of modal (open or closed)
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleCloseSuccess = () => {
    setOpen(false);
    setName(name);
    setStreet(street);
    setCity(city);
    setState(state);
    setAmt(amt);
    setPropType(propType);
    setAmen(amen);
    setBedrooms(bedrooms);
    setBeds(beds);
    setBathrooms(bathrooms);
    setThumbnail('');
    setThumbnailName('');
    setImgs([]);
    setImgNames('');
  }

  const handleCloseCancel = () => {
    setOpen(false);
    setName(listing.title);
    setStreet(listing.address.street);
    setCity(listing.address.city);
    setState(listing.address.state);
    setAmt(parseInt(listing.price, 10));
    setPropType(listing.metadata.propType);
    setAmen(listing.metadata.amen);
    setBedrooms(listing.metadata.bedrooms);
    setBeds(listing.metadata.beds);
    setBathrooms(listing.metadata.bathrooms);
    setThumbnail('');
    setThumbnailName('');
    setImgs([]);
    setImgNames('');
  }

  const [clicked, setClicked] = React.useState(false);

  // This function loads the files and also displays feedback
  // on which files have been selected.
  const uploadImages = (files) => {
    const filenames = [];
    for (const file of files) {
      filenames.push(file.name);
    }
    setImgNames(filenames.join(', '));
    setImgs(files);
  }

  // This function queries the backend and updates the details of a listing
  // Snackbar opens on success.
  const editListingFn = async () => {
    setClicked(true);

    const changes = {};
    const metadata = {};

    // Checking for invalid input
    if (!name) {
      alert('Listing must have a title!');
      setClicked(false);
      return;
    }

    if (!street) {
      alert('Listing must have a street address!');
      setClicked(false);
      return;
    }

    if (!city) {
      alert('Listing must have a city!');
      setClicked(false);
      return;
    }

    if (!state) {
      alert('Listing must have a state!');
      setClicked(false);
      return;
    }

    if (!parseInt(amt, 10) || amt <= 0) {
      alert('Amount must be a positive number!');
      setClicked(false);
      return;
    }

    if (!propType) {
      alert('Please select a property type for the listing!');
      setClicked(false);
      return;
    }

    if (!parseInt(bedrooms, 10) || bedrooms < 0) {
      alert('Amount of bedrooms must be non-negative!');
      setClicked(false);
      return;
    }

    if (!parseInt(beds, 10) || beds < 0) {
      alert('Amount of beds must be non-negative!');
      setClicked(false);
      return;
    }

    if (!parseInt(bathrooms, 10) || bathrooms < 0) {
      alert('Amount of beds must be non-negative!');
      setClicked(false);
      return;
    }

    if (name) {
      changes.title = name;
    }
    if (street && city && state) {
      changes.address = { street, city, state };
    }
    if (amt > 0) {
      changes.price = amt;
    }
    if (propType) {
      metadata.propType = propType;
    }
    if (amen) {
      metadata.amen = amen;
    }
    if (bedrooms >= 0) {
      metadata.bedrooms = bedrooms;
    }
    if (beds >= 0) {
      metadata.beds = beds;
    }
    if (bathrooms >= 0) {
      metadata.bathrooms = bathrooms;
    }
    if (thumbnail) {
      changes.thumbnail = await fileToDataUrl(thumbnail);
    }
    if (imgs) {
      metadata.imgs = await multipleFileToDataUrl(imgs);
    }

    if (metadata !== {}) {
      changes.metadata = metadata;
    }

    if (changes === {}) {
      return;
    }

    const response = await fetch('http://localhost:5005/listings/' + listing.id, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN'),
        'Content-type': 'application/json'
      },
      body: JSON.stringify(changes)
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
    } else {
      handleCloseSuccess();
      refreshListingFn();
      setSbMsgFn('Listing sucessfully edited.');
      openSbFn();
    }

    setClicked(false);
  }

  return (
    <>
      <Tooltip title='Edit Listing'>
        <IconButton style={{ padding: '0', paddingTop: '10px', color: '#fe7777' }} aria-label="edit" onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Modal
        open={open}
        onClose={handleCloseCancel}
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
              Edit Listing
            </Typography>

            <TextField
              sx={{ width: { xs: 200, sm: 250, md: 350 } }}
              style={{ marginTop: '2vh' }}
              label='Listing Name'
              variant='outlined'
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
            >
            </TextField>

            <TextField
              sx={{ width: { xs: 200, sm: 230, md: 350 } }}
              style={{ marginTop: '2vh' }}
              label='Street'
              variant='outlined'
              value={street}
              onChange={(e) => {
                setStreet(e.target.value)
              }}
            >
            </TextField>

            <TextField
              sx={{ width: { xs: 200, sm: 230, md: 350 } }}
              style={{ marginTop: '2vh' }}
              label='City'
              variant='outlined'
              value={city}
              onChange={(e) => {
                setCity(e.target.value)
              }}
            >
            </TextField>

            <TextField
              sx={{ width: { xs: 200, sm: 230, md: 350 } }}
              style={{ marginTop: '2vh' }}
              label='State'
              variant='outlined'
              value={state}
              onChange={(e) => {
                setState(e.target.value)
              }}
            >
            </TextField>

            <FormControl sx={{ width: { xs: 200, sm: 250, md: 350 } }} style={{ marginTop: '2vh' }}>
              <InputLabel>Amount (per night)</InputLabel>
              <OutlinedInput
                startAdornment={<InputAdornment position='start'>$</InputAdornment>}
                label='Amount (per night)'
                type='number'
                value={amt}
                onChange={(e) => {
                  setAmt(e.target.value)
                }}
              />
            </FormControl>

            <FormControl sx={{ width: { xs: 200, sm: 250, md: 350 } }} style={{ marginTop: '2vh' }}>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={propType}
                label='Property Type'
                onChange={(e) => {
                  setPropType(e.target.value);
                }}
              >
                <MenuItem value={'Apartment'}>Apartment</MenuItem>
                <MenuItem value={'House'}>House</MenuItem>
                <MenuItem value={'Self-contained unit'}>Self-contained unit</MenuItem>
                <MenuItem value={'Unique Space'}>Unique Space</MenuItem>
                <MenuItem value={'Bed and breakfast'}>Bed and breakfast</MenuItem>
                <MenuItem value={'Boutique Hotel'}>Boutique Hotel</MenuItem>
                <MenuItem value={'Other'}>Other</MenuItem>
              </Select>
            </FormControl >

            <TextField
              sx={{ width: { xs: 200, sm: 250, md: 350 } }}
              style={{ marginTop: '2vh' }}
              label='Property Amenities (e.g. AC, Heated floors)'
              variant='outlined'
              value={amen}
              onChange={(e) => {
                setAmen(e.target.value)
              }}
            >
            </TextField >

            <TextField
              sx={{ width: { xs: 200, sm: 250, md: 350 } }}
              style={{ marginTop: '2vh' }}
              label='Number of bedrooms'
              type='number'
              InputLabelProps={{ shrink: true, }}
              value={bedrooms}
              onChange={(e) => {
                setBedrooms(e.target.value)
              }}
            />

            <TextField
              sx={{ width: { xs: 200, sm: 250, md: 350 } }}
              style={{ marginTop: '2vh' }}
              label='Number of beds'
              type='number'
              InputLabelProps={{ shrink: true, }}
              value={beds}
              onChange={(e) => {
                setBeds(e.target.value)
              }}
            />

            < TextField
              sx={{ width: { xs: 200, sm: 250, md: 350 } }}
              style={{ marginTop: '2vh' }}
              label='Number of bathrooms'
              type='number'
              InputLabelProps={{ shrink: true, }}
              value={bathrooms}
              onChange={(e) => {
                setBathrooms(e.target.value)
              }}
            />

            <div>
              <br />
              Uploading thumbnail and images will overwrite previously stored thumbnail and images.
            </div>

            <Button
              sx={{
                width: { xs: 200, sm: 250, md: 350 },
                background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)'
              }}
              style={{ marginTop: '2vh' }}
              variant='contained'
              component='label'
            >
              Upload Listing Thumbnail
              <input hidden accept='image/*' type='file' onChange={(e) => {
                setThumbnailName(e.target.value);
                setThumbnail(e.target.files[0]);
              }} />
            </Button>
            <div>
              {thumbnailName.split('\\').slice(-1)[0]}
            </div>

            <Button
              sx={{
                width: { xs: 200, sm: 250, md: 350 },
                background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)'
              }}
              style={{ marginTop: '2vh' }}
              variant='contained'
              component='label'
            >
              Upload Listing Images
              <input hidden accept='image/*' type='file' multiple onChange={(e) => {
                uploadImages(e.target.files);
              }} />
            </Button>
            <div>
              {imgNames}
            </div>

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Button
                sx={{
                  width: { xs: 90, sm: 100, md: 160, lg: 200 },
                  marginRight: { xs: 1.5, sm: 1, md: 1, lg: 2 },
                  background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)',
                }}
                style={{ marginTop: '3vh' }}
                variant='contained'
                onClick={editListingFn}
                disabled={clicked}
              >
                {(clicked) ? <CircularProgress size="1.5rem" color="inherit" /> : 'Edit Listing'}
              </Button>
              <Button
                sx={{
                  width: { xs: 90, sm: 100, md: 160, lg: 200 },
                  marginLeft: { xs: 1.5, sm: 1, md: 1, lg: 2 },
                }}
                style={{ marginTop: '3vh' }}
                variant='outlined'
                color='error'
                onClick={handleCloseCancel}
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

EditListingModal.propTypes = {
  listing: PropTypes.object,
  refreshListingFn: PropTypes.func,
  setSbMsgFn: PropTypes.func,
  openSbFn: PropTypes.func
}

export default EditListingModal;
