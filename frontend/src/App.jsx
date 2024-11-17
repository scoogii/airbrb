import React from 'react';
import './App.css';
import Site from './Site';
import { Context, initialValue } from './Context';

// Roboto Font
import '@fontsource/roboto'

import {
  BrowserRouter as Router
} from 'react-router-dom'

function App () {
  // user: used to display the email of the user in the App.
  const [user, setUser] = React.useState(initialValue.user);
  // usedDateRange: (usedDateRange === 0) ? display price per night : display price per stay
  const [usedDateRange, setUsedDateRange] = React.useState(initialValue.usedDateRange);
  const getters = {
    user,
    usedDateRange
  };
  const setters = {
    setUser,
    setUsedDateRange
  }

  // Wrap Context and Router around Site to allow for
  // useContext and react-router-dom function calls.

  return (
    <Context.Provider value={{ getters, setters }}>
      <Router>
        <Site />
      </Router>
    </Context.Provider>
  );
}

export default App;
