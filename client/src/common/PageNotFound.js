import { Box, Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const PageNotFound = () => {
    const navigate = useNavigate()
    return (
        <Box>
            <Box
                sx={{
                    position: 'relative',
                    display: 'flex',
                    height: '70vh',
                    height: '50vh',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <img
                    style={{
                        height: '600px',
                        width: '100%',
                        objectFit: 'contain',
                        filter: 'inherit',
                    }}
                    src={require('../assets/error-404-page.jpg')}
                    alt="Page could not fould"
                />
            </Box>
            <Button
                sx={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '20%',
                    backgroundColor: '#387511',
                    transform: 'translateX(-50%)',
                    color: '#fff',
                    width: '200px',
                    '&:hover': {
                        backgroundColor: '#387511',
                    },
                }}
                onClick={() => {
                    navigate('/');
                }}
            >
                Go to Home page
            </Button>
        </Box>
    )
}

export default PageNotFound