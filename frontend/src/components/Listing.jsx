import React from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';
import { Tooltip, IconButton } from '@mui/material';
import BookIcon from '@mui/icons-material/Book';

import EditListingModal from './EditListingModal';
import ConfirmDeleteListingModal from './ConfirmDeleteListingModal'
import { useNavigate } from 'react-router-dom';

import { avgRating } from '../API';
import PublishListingModal from './PublishListingModal';
import UnpublishListingModal from './UnpublishListingModal';

import { Context, useContext } from '../Context';

// Displays a singular listing
const Listing = ({ listing, updateMyListingsFn, setSbMsgFn, openSbFn }) => {
  const navigate = useNavigate();
  const { getters } = useContext(Context);

  return (
    <Card
      style={{ cursor: 'pointer' }}
      onClick={() => {
        navigate('/listing/' + listing.id);
      }}
    >
      <CardMedia
        component="img"
        height="250"
        image={listing.thumbnail}
        alt="listing thumbnail"
      />
      <CardContent>
        <Typography variant="h5" component="div">
          {listing.title}
        </Typography>
        <Typography variant="h6" component="div">
          {listing.metadata.propType}
        </Typography>
        <Typography variant="h6" component="div">
          {listing.metadata.bedrooms} {listing.metadata.bedrooms > 1 ? 'bedrooms' : 'bedroom'}, {listing.metadata.beds} {listing.metadata.beds > 1 ? 'beds' : 'bed'}, {listing.metadata.bathrooms} {listing.metadata.bathrooms > 1 ? 'baths' : 'bath'}
        </Typography>
        <br />
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold', lineHeight: '1.3em' }}>
          {listing.address.street}
          <br />
          {listing.address.city}, {listing.address.state}
        </Typography>
        <br />
        {getters.usedDateRange === 0 && <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'underline', fontWeight: 'bold' }}>
          ${listing.price} AUD per night
        </Typography>}
        {getters.usedDateRange > 0 && <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'underline', fontWeight: 'bold' }}>
          ${getters.usedDateRange * listing.price} AUD per stay
        </Typography>}
        <br />
        <Rating name="svg-rating" value={avgRating(listing.reviews)} readOnly sx={{ marginLeft: '-5px' }} />
        <Typography variant="h6" color="text.secondary">
          {listing.reviews.length} reviews
        </Typography>
        {listing.owner === localStorage.getItem('USER') && localStorage.getItem('TOKEN') && listing.published && <>
          <Tooltip title='View Bookings'>
            <IconButton style={{ padding: '0', paddingTop: '10px', color: '#fe7777' }} aria-label="edit" onClick={(e) => {
              e.stopPropagation();
              navigate('/listing/' + listing.id + '/bookings');
            }}>
              <BookIcon />
            </IconButton>
          </Tooltip>
        </>}
        &nbsp;&nbsp;
        {listing.owner === localStorage.getItem('USER') && <EditListingModal listing={listing} refreshListingFn={updateMyListingsFn} setSbMsgFn={setSbMsgFn} openSbFn={openSbFn} />}
        &nbsp;&nbsp;
        {listing.owner === localStorage.getItem('USER') && <ConfirmDeleteListingModal listing={listing} updateMyListingsFn={updateMyListingsFn} setSbMsgFn={setSbMsgFn} openSbFn={openSbFn} />}
        &nbsp;&nbsp;&nbsp;
        {listing.owner === localStorage.getItem('USER') && !listing.published && <PublishListingModal listing={listing} updateMyListingsFn={updateMyListingsFn} setSbMsgFn={setSbMsgFn} openSbFn={openSbFn} />}
        {listing.owner === localStorage.getItem('USER') && listing.published && <UnpublishListingModal listing={listing} updateMyListingsFn={updateMyListingsFn} setSbMsgFn={setSbMsgFn} openSbFn={openSbFn} />}
      </CardContent>
    </Card>
  );
}

Listing.propTypes = {
  listing: PropTypes.object,
  updateMyListingsFn: PropTypes.func,
  setSbMsgFn: PropTypes.func,
  openSbFn: PropTypes.func
};

export default Listing;
