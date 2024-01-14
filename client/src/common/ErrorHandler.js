import React from 'react';
import { Backdrop, Modal, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ErrorHandler = (props) => {
    React.useEffect(() => {
        console.log(props)
    }, [props.error])

    return (<>
        {props.error && (
            <Backdrop onClick={props.onHandle} open={props.error !== null}>
                <Modal open={props.error !== null} onClose={props.onHandle} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ backgroundColor: "#efc0c0", padding: '20px', borderRadius: '8px', maxWidth: '300px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <Typography variant="h6" sx={{ color: "danger" }}>
                                An Error Occurred
                            </Typography>
                            <IconButton onClick={props.onHandle}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="body2">{props.error.message}</Typography>
                    </Box>
                </Modal>
            </Backdrop>
        )}
    </>)
};

export default ErrorHandler;
