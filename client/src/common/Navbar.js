import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Token } from '@mui/icons-material';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("accessToken");
    const userName = localStorage.getItem("userName");


    return (
        <AppBar position="static" sx={{ padding: "0 25px", display: "flex" }}>
            <Toolbar sx={{
                display: "flex",
                margin: { sm: "0px 30px" },
                justifyContent: "space-between"
            }}>
                <Link style={{ textDecoration: "none" }} to="/">
                    <Typography variant="h6">
                        Feed Chat
                    </Typography>
                </Link>
                {/* <Box sx={{ display: "flex", }}> */}
                {userName != "undefined" && <Typography variant="body2">
                    {userName}
                </Typography>}
                <Button color="inherit" sx={{ textTransform: "none" }} onClick={() => {
                    if (token) {
                        localStorage.removeItem("userName")
                        localStorage.removeItem("userId")
                        localStorage.removeItem("accessToken")
                        navigate('/')
                    } else {
                        location.pathname.includes("signin") ? navigate('/') : navigate('signin')

                    }
                }}>
                    {token ? "Logout" : location.pathname.includes("signin") ? "Sigb up" : "Sign in"}
                </Button>
                {/* </Box> */}

            </Toolbar>
        </AppBar>
    );
};

export default Navbar;