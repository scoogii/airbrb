import React from 'react';

import {
  Routes,
  Route
} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MyListings from './pages/MyListings';
import ViewListing from './pages/ViewListing';
import ViewListingBookings from './pages/ViewListingBookings';

const Site = () => {
  // This component is responsible for loading the correct
  // page based on the url.
  // There are some basic security measures in place so that
  // some pages are restricted to some users.

  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/register" element={<Register />}></Route>
      <Route path="/mylistings" element={<MyListings />}></Route>
      <Route path="/listing/:listingId" element={<ViewListing />}></Route>
      <Route path="/listing/:listingId/bookings" element={<ViewListingBookings />}></Route>
    </Routes>
  );
}

export default Site;
