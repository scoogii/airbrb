import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useMediaQuery, TextField, FormControl, InputLabel, OutlinedInput, InputAdornment, Select, MenuItem, CircularProgress } from '@mui/material';
import { fileToDataUrl, multipleFileToDataUrl } from '../API';
import PropTypes from 'prop-types';

// loads a modal which enables the user to create a listing
const MakeListingModal = ({ updateMyListingsFn, setSbMsgFn, openSbFn }) => {
  const makeListingButton = {
    background: '#fe7777',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginTop: '30px',
    padding: '1vh 2vw',
    borderRadius: '12px',
  }

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

  // State variables for input fields in modal form
  const [name, setName] = React.useState('');
  const [street, setStreet] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [amt, setAmt] = React.useState(0);
  const [propType, setPropType] = React.useState('');
  const [amen, setAmen] = React.useState('');
  const [bedrooms, setBedrooms] = React.useState(0);
  const [beds, setBeds] = React.useState(0);
  const [bathrooms, setBathrooms] = React.useState(0);
  const [thumbnailName, setThumbnailName] = React.useState('');
  const [thumbnail, setThumbnail] = React.useState(null);
  const [imgs, setImgs] = React.useState([]);
  const [imgNames, setImgNames] = React.useState('');

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setName('');
    setStreet('');
    setCity('');
    setState('');
    setAmt(0);
    setPropType('');
    setAmen('');
    setBedrooms(0);
    setBeds(0);
    setBathrooms(0);
    setThumbnail('');
    setThumbnailName('');
    setImgs([]);
    setImgNames('');
  }

  const [clicked, setClicked] = React.useState(false);

  // this function uploads files and displays feedback as to which files were selected
  const uploadImages = (files) => {
    const filenames = [];
    for (const file of files) {
      filenames.push(file.name);
    }
    setImgNames(filenames.join(', '));
    setImgs(files);
  }

  // queries the backend to create the listing
  // snackbar opens on success
  const createListingFn = async () => {
    setClicked(true);

    if (!name) {
      alert('Please enter a listing name!');
      setClicked(false);
      return;
    } else if (!street) {
      alert('Please enter the street address!');
      setClicked(false);
      return;
    } else if (!city) {
      alert('Please enter the city!');
      setClicked(false);
      return;
    } else if (!state) {
      alert('Please enter the state!');
      setClicked(false);
      return;
    } else if (!propType) {
      alert('Please select the property type!');
      setClicked(false);
      return;
    } else if (!parseInt(amt, 10) || amt <= 0) {
      alert('Amount must be a positive number!');
      setClicked(false);
      return;
    } else if (!parseInt(bedrooms, 10) || bedrooms < 0) {
      alert('Amount of bedrooms must be non-negative!');
      setClicked(false);
      return;
    } else if (!parseInt(beds, 10) || beds < 0) {
      alert('Amount of beds must be non-negative!');
      setClicked(false);
      return;
    } else if (!parseInt(bathrooms, 10) || bathrooms < 0) {
      alert('Amount of bathroosm must be non-negative!');
      setClicked(false);
      return;
    } else if (!thumbnail) {
      alert('Please upload a thumbnail!');
      setClicked(false);
      return;
    }

    const response = await fetch('http://localhost:5005/listings/new', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('TOKEN')
      },
      body: JSON.stringify({
        title: name,
        address: { street, city, state },
        price: amt,
        thumbnail: await fileToDataUrl(thumbnail),
        metadata: {
          imgs: await multipleFileToDataUrl(imgs),
          propType,
          amen,
          bedrooms,
          beds,
          bathrooms
        }
      })
    });

    const data = await response.json();
    if (data.error) {
      alert(data.error);
    } else {
      handleClose();
      updateMyListingsFn();
      setSbMsgFn('Listing successfully created.');
      openSbFn();
    }

    setClicked(false);
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button style={makeListingButton} onClick={handleOpen}>Make a Listing</Button>
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
                Make a Listing
              </Typography>

              <TextField
                sx={{ width: { xs: 200, sm: 230, md: 350 } }}
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

              <FormControl sx={{ width: { xs: 200, sm: 230, md: 350 } }} style={{ marginTop: '2vh' }}>
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

              <FormControl sx={{ width: { xs: 200, sm: 230, md: 350 } }} style={{ marginTop: '2vh' }}>
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
                sx={{ width: { xs: 200, sm: 230, md: 350 } }}
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
                sx={{ width: { xs: 200, sm: 230, md: 350 } }}
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
                sx={{ width: { xs: 200, sm: 230, md: 350 } }}
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
                sx={{ width: { xs: 200, sm: 230, md: 350 } }}
                style={{ marginTop: '2vh' }}
                label='Number of bathrooms'
                type='number'
                InputLabelProps={{ shrink: true, }}
                value={bathrooms}
                onChange={(e) => {
                  setBathrooms(e.target.value)
                }}
              />

              <Button
                sx={{
                  width: { xs: 200, sm: 230, md: 350 },
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
                  width: { xs: 200, sm: 230, md: 350 },
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
                    background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)',
                    width: { xs: 90, sm: 100, md: 160, lg: 200 },
                    marginRight: { xs: 1.5, sm: 1, md: 1, lg: 2 },
                  }}
                  style={{ marginTop: '3vh' }}
                  variant='contained'
                  onClick={createListingFn}
                  disabled={clicked}
                >
                  {(clicked) ? <CircularProgress size="1.5rem" color="inherit" /> : 'Create Listing'}
                </Button>
                <Button
                  sx={{
                    width: { xs: 90, sm: 100, md: 160, lg: 200 },
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
      </div >
    </>
  );
}

MakeListingModal.propTypes = {
  updateMyListingsFn: PropTypes.func,
  setSbMsgFn: PropTypes.func,
  openSbFn: PropTypes.func
}

export default MakeListingModal;
