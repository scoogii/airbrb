import React from 'react';

import Nav from '../components/Nav'
import { TextField, Typography, Button, useMediaQuery, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '@fontsource/roboto'
import { useContext, Context } from '../Context';

import { useNavigate } from 'react-router-dom';

// loads the register page
const Register = () => {
  const navigate = useNavigate();

  const registerBox = {
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

  const registerButton = {
    marginTop: '3vh',
    marginBottom: '3vh',
    paddingLeft: '5vw',
    paddingRight: '5vw',
  }

  const { setters } = useContext(Context);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPwd] = React.useState('');
  const [confirmPwd, setConfirmPwd] = React.useState('');

  const [showPassword1, setShowPassword1] = React.useState(false);
  const [showPassword2, setShowPassword2] = React.useState(false);

  // Queries the backend to register the user
  // Does some checking
  const registerFn = async () => {
    // Check if input fields are valid
    if (!name) {
      alert('Enter a name!');
      return;
    } else if (!email) {
      alert('Enter an email!');
      return;
    } else if (!password) {
      alert('Enter a password!');
      return;
    } else if (password !== confirmPwd) {
      alert('Passwords do not match!');
      return;
    }

    const response = await fetch('http://localhost:5005/user/auth/register', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
      })
    });

    const data = await response.json();
    if (data.error) {
      alert(data.error)
    } else {
      // If the register is successful, the user is also logged in and sent
      // to the landing page.
      // Also set some basic variables to help identify the user.
      localStorage.setItem('TOKEN', data.token);
      localStorage.setItem('USER', email);
      setters.setUser(email);
      navigate('/');
    }
  }

  return (
    <>
      <Nav />
      <div style={registerBox}>
        <Typography variant="h5">Sign Up</Typography>
        <TextField sx={{ width: { sm: 300, md: 400 } }} style={{ marginTop: '2vh' }} label="Name" variant="outlined" value={name} onChange={(e) => { setName(e.target.value) }} />
        <TextField sx={{ width: { sm: 300, md: 400 } }} style={{ marginTop: '2vh' }} label="Email" variant="outlined" value={email} onChange={(e) => { setEmail(e.target.value) }} />
        <FormControl sx={{ width: { xs: 195, sm: 300, md: 400 } }} style={{ marginTop: '2vh', marginBottom: '2vh' }} variant="outlined">
          <InputLabel>Password</InputLabel>
          <OutlinedInput
            type={showPassword1 ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setShowPassword1(!showPassword1);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  edge="end"
                >
                  {showPassword1 ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            value={password}
            onChange={(e) => {
              setPwd(e.target.value)
            }}
          />
        </FormControl>
        <FormControl sx={{ width: { xs: 195, sm: 300, md: 400 } }} style={{ marginBottom: '2vh' }} variant="outlined">
          <InputLabel>Confirm Password</InputLabel>
          <OutlinedInput
            type={showPassword2 ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setShowPassword2(!showPassword2);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  edge="end"
                >
                  {showPassword2 ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            label="Confirm Password"
            value={confirmPwd}
            onChange={(e) => {
              setConfirmPwd(e.target.value)
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                registerFn();
              }
            }}
          />
        </FormControl>
        <Button style={registerButton} variant="contained" size="large" sx={{ background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)' }} onClick={registerFn}>Register</Button>
      </div>
    </>
  );
}

export default Register;
