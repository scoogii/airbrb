import React from 'react';

import Carousel from 'react-bootstrap/Carousel';
import { CardMedia } from '@mui/material';

import PropTypes from 'prop-types';

// Displays an image carousel for a singular listing.
// Cycles through the thumbnail and images of the current listing
const ListingCarousel = ({ thumbnail, imgs }) => {
  const images = [...imgs];
  if (!images.includes(thumbnail)) {
    images.unshift(thumbnail);
  }

  const [index, setIndex] = React.useState(0);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <Carousel activeIndex={index} onSelect={handleSelect} slide={false}>
      {images.map((img, i) =>
        <Carousel.Item key={i} interval={4000}>
          <CardMedia
            component="img"
            height="500"
            image={img}
          />
        </Carousel.Item>
      )}
    </Carousel>
  );
}

ListingCarousel.propTypes = {
  thumbnail: PropTypes.string,
  imgs: PropTypes.array
}

export default ListingCarousel;
