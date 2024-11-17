import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// The below import is for bootstrap. Needed for the images
// carousel in ViewListings
import '../node_modules/bootstrap/dist/css/bootstrap.css'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
