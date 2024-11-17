import React from 'react';

import Nav from '../components/Nav';
import { TextField, Typography, Button, useMediaQuery, FormControl, InputLabel, OutlinedInput, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '@fontsource/roboto'

import { useNavigate } from 'react-router-dom';
import { useContext, Context } from '../Context';

// Loads the login page
const Login = () => {
  const navigate = useNavigate();

  const loginBox = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '70vh',
    margin: useMediaQuery('(max-width: 800px)') ? '5% 10%' : '5% 25%',
    background: 'white',
    border: '1px solid #b0b0b0',
    borderRadius: '12px',
    flexDirection: 'column',
  }

  const loginButton = {
    marginTop: '3vh',
    marginBottom: '3vh',
    paddingLeft: '5vw',
    paddingRight: '5vw',
  }

  const { setters } = useContext(Context);
  const [email, setEmail] = React.useState('');
  const [password, setPwd] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  // Queries the backend to log in a user.
  // Does some checking on the input fields
  const loginFn = async () => {
    if (!email) {
      alert('Please enter an email!');
      return;
    } else if (!password) {
      alert('Please enter a password!');
      return;
    }

    const response = await fetch('http://localhost:5005/user/auth/login', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      })
    });

    const data = await response.json();
    if (data.error) {
      alert(data.error)
    } else {
      // If the user successfully logs in, send them to the landing page
      // and set some basic variables to identify user.
      localStorage.setItem('TOKEN', data.token);
      localStorage.setItem('USER', email);
      setters.setUser(email);
      navigate('/');
    }
  }

  return (
    <>
      <Nav />
      <div style={loginBox}>
        <Typography variant="h5">Welcome to airbrb</Typography>
        <TextField sx={{ width: { sm: 300, md: 400 } }} style={{ marginTop: '2vh' }} label="Email" variant="outlined" value={email} onChange={(e) => { setEmail(e.target.value) }} />
        <FormControl sx={{ width: { xs: 195, sm: 300, md: 400 } }} style={{ marginTop: '2vh', marginBottom: '2vh' }} variant="outlined">
          <InputLabel>Password</InputLabel>
          <OutlinedInput
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  edge="end"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            value={password}
            onChange={(e) => {
              setPwd(e.target.value)
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                loginFn();
              }
            }}
          />
        </FormControl>
        <Button style={loginButton} variant="contained" size="large" sx={{ background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)' }} onClick={loginFn}>Login</Button>
      </div>
    </>
  );
}

export default Login;
