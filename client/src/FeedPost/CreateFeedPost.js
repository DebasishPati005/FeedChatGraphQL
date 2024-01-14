import React from 'react'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Input,
    FormControl,
    InputLabel,
    FormHelperText,
    Box,
    Typography
} from '@mui/material';
import useCreatePost from './useCreatePost';
import useSaveImage from './useSaveImage';
import ErrorHandler from '../common/ErrorHandler';

const validateInput = (userInput, editMode) => {
    const errors = {};

    if (!userInput.title) {
        errors.title = 'Title is required';
    } else if (userInput.title.length < 5) {
        errors.title = ' Title length is less than 5';
    }

    if (!userInput.image && !editMode) {
        errors.image = 'Image is required too';
    }

    if (!userInput.content) {
        errors.content = 'Content is required';
    } else if (userInput.content.length < 5) {
        errors.content = 'Content length should be greater than or equal 5';
    }

    return Object.values(errors);
};

const CreateFeedPost = (prop) => {
    const [formData, setFormData] = React.useState({
        title: prop.feedPostData ? prop.feedPostData.title : '',
        image: prop.feedPostData ? prop.feedPostData.image : null,
        content: prop.feedPostData ? prop.feedPostData.content : '',
    });
    const useSavePostHook = useCreatePost();
    const useSaveImageHook = useSaveImage();
    const [imagePreview, setImagePreview] = React.useState(null);
    const [errorState, setErrorState] = React.useState({ error: null });
    const [inputErrors, setInputErrors] = React.useState([]);


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setFormData({ ...formData, image: file });
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        const imageFormData = new FormData();
        imageFormData.append("image", formData.image);
        const validatedError = validateInput(formData, prop.feedPostData)
        setInputErrors(validatedError);


        if (validatedError.length === 0) {
            const savePost = async () => {
                if (prop.feedPostData && !formData.image) {
                    formData.image = prop.feedPostData.imageUrl;
                }
                else {
                    const photoSaveUrlResponse = await useSaveImageHook.saveImage(imageFormData)
                    formData.image = photoSaveUrlResponse.filepath;
                }

                const savePostResult = await useSavePostHook.savePost(formData, prop.feedPostData);
                if (savePostResult instanceof Error) {
                    setErrorState({ error: savePostResult })
                } else {

                    prop.handleDialogClose(true);
                }
            }
            savePost()
        }


    };

    const errorHandler = () => {
        setErrorState({ error: null });
    };

    return (
        <Dialog open={prop.open}>
            <ErrorHandler error={errorState.error} onHandle={errorHandler} />

            <DialogTitle>Create Post</DialogTitle>
            <DialogContent>
                {inputErrors.length > 0 && inputErrors.map((errorMessage, i) => {
                    return (
                        <Box key={i} sx={{ textAlign: "center", borderRadius: "4px", p: 1, m: 1, backgroundColor: "#efc0c0" }}>
                            <Typography sx={{ color: "red" }} component="h6" variant="body1">
                                {errorMessage}
                            </Typography>
                        </Box>
                    )
                })}
                <TextField
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <FormControl fullWidth margin="normal">
                    <Input
                        type="file"
                        id="file-input"
                        name="file"
                        onChange={handleFileChange}
                    />
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }}
                        />
                    )}
                </FormControl>
                <TextField
                    label="Content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    prop.handleDialogClose()
                }} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateFeedPost