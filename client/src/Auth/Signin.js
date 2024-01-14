import React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import ErrorHandler from '../common/ErrorHandler';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';

import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>
      {new Date().getFullYear()}
    </Typography>
  );
}

const defaultTheme = createTheme();

const validateInput = (userInput) => {
  const errors = {};

  if (!userInput.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(userInput.email)) {
    errors.email = 'Invalid email address';
  }

  if (!userInput.password) {
    errors.password = 'Password is required';
  } else if (userInput.password.length < 5) {
    errors.password = 'Password length should be greater than or equal ';
  }

  return Object.values(errors);
};

const isValidEmail = (email) => {
  return email.includes('@') && email.includes('.') && email.split(".")[1].length > 2;
};

const authenticateUser = async (userInput) => {
  const graphqlQuery = {
    query: `
    mutation {
      authenticateUser (userInput:{ email: "${userInput.email}",
                              password:"${userInput.password}", })
     {token userId userName}
    }
      `
  }
  const res = await fetch('https://feed-post-app.onrender.com/graphql', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(graphqlQuery)
  });
  const response = await res.json();
  if (response.data?.authenticateUser) {
    localStorage.setItem("accessToken", response.data.authenticateUser.token)
    localStorage.setItem("userId", response.data.authenticateUser.userId)
    localStorage.setItem("userName", response.data.authenticateUser.userName)
  }
  if (response.errors && response.errors[0].status >= 400) {
    throw new Error(
      `Make sure the email address and Password same!\n\n${response.errors[0].error.message.toUpperCase()}`
    );
  }

}

const Signin = () => {
  const [errors, setErrors] = React.useState([]);
  const [errorState, setErrorState] = React.useState({ error: null });
  const navigate = useNavigate()

  const token = localStorage.getItem("accessToken");
  React.useEffect(() => {
    console.log(typeof token);
    if (token) { return navigate("/all-posts"); }
  }, [])


  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userInput = {
      email: data.get('email'),
      password: data.get('password'),
    }
    const validatedError = validateInput(userInput)
    setErrors(validatedError);
    console.log(validatedError)
    if (validatedError.length === 0) {
      try {
        await authenticateUser(userInput);
        navigate('/all-posts')
      } catch (err) {
        console.log(err);
        setErrorState({ error: err })
      }
    }
  };

  const errorHandler = () => {
    setErrorState({ error: null });
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <ErrorHandler error={errorState.error} onHandle={errorHandler} />
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>{/* <LockOutlinedIcon /> */}</Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {errors.length > 0 && errors.map((errorMessage, i) => {
              return (
                <Box key={i} sx={{ textAlign: "center", borderRadius: "4px", p: 1, m: 1, backgroundColor: "#efc0c0" }}>
                  <Typography sx={{ color: "red" }} component="h6" variant="body1">
                    {errorMessage}
                  </Typography>
                </Box>
              )
            })}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link to="/" >
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link to="/" >
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
};

export default Signin;
