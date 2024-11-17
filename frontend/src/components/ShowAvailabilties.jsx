import React from 'react';
import PropTypes from 'prop-types';

import { Typography } from '@mui/material';

import { formatDateRange } from '../API';

// displays the availabilites the host provided for a listing
const ShowAvailabilities = ({ listing }) => {
  return (
    <div style={{ textAlign: 'left' }}>
      <Typography variant="h6" style={{ fontWeight: 'bold' }}>
        Availabilities Provided:
      </Typography>
      {listing.availability.map((dates, i) =>
        <Typography key={i} variant="h6">
          {formatDateRange(dates[0], dates[1])}
        </Typography>
      )}
    </div>
  );
}

ShowAvailabilities.propTypes = {
  listing: PropTypes.object
}

export default ShowAvailabilities;
