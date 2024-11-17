import React from 'react';

import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';

import PropTypes from 'prop-types';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: '10px',
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

// loads the searchbar found in the navigation bar
const SearchBar = ({ allListings, setDisplayedListingsFn }) => {
  const [search, setSearch] = React.useState('');

  // this function filters through all listings and sets displayedlistings
  // does substring match per word in the search string on the title and city of listing
  const searchTitleCity = (substring) => {
    if (substring === '') {
      setDisplayedListingsFn(allListings);
      return;
    }

    const words = substring.toLowerCase().split(' ');
    const display = allListings.filter(listing =>
      words.some(word => listing.title.toLowerCase().includes(word)) || words.some(word => listing.address.city.toLowerCase().includes(word))
    )

    setDisplayedListingsFn(display);
  }

  return (
    <>
      <Search>
        <StyledInputBase
          placeholder="Search Listings…"
          inputProps={{ 'aria-label': 'search' }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value === '') {
              searchTitleCity(e.target.value);
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              searchTitleCity(e.target.value);
            }
          }}
        />
      </Search>
      <Button onClick={() => {
        searchTitleCity(search);
      }}>
        <SearchIcon style={{ color: 'white' }} />
      </Button>
    </>
  );
}

SearchBar.propTypes = {
  allListings: PropTypes.array,
  setDisplayedListingsFn: PropTypes.func
}

export default SearchBar;
