import React, { createContext } from 'react';

// initialValues for Context variables
export const initialValue = {
  user: (localStorage.getItem('USER')) ? localStorage.getItem('USER') : '',
  usedDateRange: 0
}

export const Context = createContext(initialValue);
export const useContext = React.useContext;
