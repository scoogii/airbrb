import React from 'react'

import SearchBar from './SearchBar';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import IconButton from '@mui/material/IconButton';
import HolidayVillageRoundedIcon from '@mui/icons-material/HolidayVillageRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext, Context } from '../Context'

import PropTypes from 'prop-types';

// loads the navigation bar found on many pages of the app
const Nav = ({ allListings, setDisplayedListingsFn }) => {
  const navigate = useNavigate();
  const route = useLocation().pathname;
  const token = localStorage.getItem('TOKEN');
  const { setters } = useContext(Context);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // this function queries the backend and logs a user out of the app
  const logoutFn = async () => {
    const response = await fetch('http://localhost:5005/user/auth/logout', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });

    const data = await response.json();
    if (data.error) {
      alert(data.error)
    } else {
      // if successful, we need to unset the variables which identify the user
      // also load the home page when completed.
      localStorage.removeItem('TOKEN');
      localStorage.removeItem('USER');
      setters.setUser('');

      navigate('/');
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static' sx={{ background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)' }}>
        <Toolbar>
          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='menu'
            sx={{ mr: 2 }}
            onClick={() => {
              navigate('/')
            }}
          >
            <HolidayVillageRoundedIcon />
          </IconButton>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1, cursor: 'default', paddingRight: '20px' }}>
            airbrb
          </Typography>

          {(route === '/' || route === '/mylistings') && <SearchBar allListings={allListings} setDisplayedListingsFn={setDisplayedListingsFn} />}

          <Button
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup='true'
            aria-expanded={open ? 'true' : undefined}
            onClick={handleMenuClick}
          >
            <MenuRoundedIcon style={{ color: 'white' }} />
          </Button>
          <Menu
            id='basic-menu'
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {!token && route !== '/login' && <MenuItem
              sx={{ fontSize: '0.9em' }}
              onClick={() => {
                handleMenuClose();
                navigate('/login');
              }}>
              LOGIN
            </MenuItem>}

            {!token && route !== '/register' && <MenuItem
              sx={{ fontSize: '0.9em' }}
              onClick={() => {
                handleMenuClose();
                navigate('/register');
              }}>
              REGISTER
            </MenuItem>}

            {token && <MenuItem
              sx={{ fontSize: '0.9em' }}
              onClick={() => {
                handleMenuClose();
                navigate('/');
              }}>
              ALL LISTINGS
            </MenuItem>}

            {token && <MenuItem
              sx={{ fontSize: '0.9em' }}
              onClick={() => {
                handleMenuClose();
                navigate('/mylistings');
              }}>
              YOUR LISTINGS
            </MenuItem>}

            {token && <MenuItem
              sx={{ fontSize: '0.9em' }}
              onClick={() => {
                handleMenuClose();
                logoutFn();
                navigate('/');
              }}>
              LOGOUT
            </MenuItem>}
          </Menu>
        </Toolbar>
      </AppBar>
    </Box >
  );
}

Nav.propTypes = {
  allListings: PropTypes.array,
  setDisplayedListingsFn: PropTypes.func
}

export default Nav;
