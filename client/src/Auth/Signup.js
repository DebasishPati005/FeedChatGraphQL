import React from 'react';
import { Avatar, Button, CssBaseline, TextField, Grid, Box, Typography, Container } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LockOutlined } from "@mui/icons-material"
import { Link, useNavigate } from 'react-router-dom';
import ErrorHandler from '../common/ErrorHandler';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <a color="inherit" target="_blank" href="https://mr-deba-portfolio.web.app/">
                Mr.Deba
            </a>
            {" " + new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const defaultTheme = createTheme();


const validateInput = (userInput) => {
    const errors = {};

    if (!userInput.name) {
        errors.name = 'Name is required';
    } else if (userInput.name.length < 4) {
        errors.password = 'Name length should be greater than or equal ';
    }

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

    if (!userInput.confirmPassword) {
        errors.confirmPassword = 'Confirm Password is required';
    } else if (userInput.password !== userInput.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return Object.values(errors);
};

const isValidEmail = (email) => {
    return email.includes('@') && email.includes('.') && email.split(".")[1].length > 2;
};

const createUser = async (userInput) => {
    const graphqlQuery = {
        query: `
        mutation {
          createUser (userInput:{ email: "${userInput.email}",
                                  password:"${userInput.password}",
                                  name:"${userInput.name}" })
         {_id name email}
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
    if (response.errors && response.errors[0].status >= 400) {
        throw new Error(
            `Validation failed. Make sure the email address isn't used yet!\n${response.errors[0].error.message.toUpperCase()}`
        );
    }

}


const Signup = () => {
    const [errors, setErrors] = React.useState([]);
    const [errorState, setErrorState] = React.useState({ error: null });
    const navigate = useNavigate();

    const token = localStorage.getItem("accessToken");
    React.useEffect(() => {
        if (token)
            return navigate("/all-posts")
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const userInput = {
            name: data.get('name'),
            email: data.get('email'),
            password: data.get('password'),
            confirmPassword: data.get('confirmPassword')
        }
        const validatedError = validateInput(userInput)
        setErrors(validatedError);
        if (validatedError.length === 0) {
            try {
                await createUser(userInput);
                navigate('/signin')
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

                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><LockOutlined /></Avatar>
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
                            id="name"
                            label="Full Name"
                            name="name"
                            autoComplete="name"
                            autoFocus
                        />
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
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            autoComplete="current--password"
                        />

                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                            Sign Up
                        </Button>
                        <Grid container>
                            <Link to="/signin" >
                                {'Already have an account? Sign In'}
                            </Link>
                        </Grid>
                    </Box>
                </Box>
                <Copyright sx={{ mt: 8, mb: 4 }} />
            </Container>
        </ThemeProvider>
    );
};

export default Signup;

