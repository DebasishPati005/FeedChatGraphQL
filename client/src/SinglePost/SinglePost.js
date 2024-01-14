
import React from 'react';
import { Typography, Button, Paper, Grid, CardMedia } from '@mui/material';
import { useParams, useNavigate } from "react-router-dom";
import CreateFeedPost from '../FeedPost/CreateFeedPost';
import ErrorHandler from '../common/ErrorHandler';


const getSinglePost = async (postId) => {
  const graphqlQuery = {
    query: `{
      getSinglePost(postId:"${postId}") {
        _id
        content
        title
        creator { email name _id }
        createdAt
        imageUrl
      }
      }`
  }
  const token = localStorage.getItem("accessToken");

  const resp = await fetch('https://feed-post-app.onrender.com/graphql', {
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(graphqlQuery)
  });
  const response = await resp.json();
  if (response.errors && response.errors[0].status >= 400) {
    throw new Error(
      `Could not fetch all the posts.\n${response.errors[0].error.message.toUpperCase()}`
    );
  }
  return response?.data?.getSinglePost
}


const SinglePost = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = React.useState(null);
  const [newPostSubmitted, setNewPostSubmitted] = React.useState(false);
  const [errorState, setErrorState] = React.useState({ error: null });

  React.useEffect(() => {
    const getPost = async () => {
      const Post = await getSinglePost(postId)
      setPost(Post);
    };
    getPost();
  }, [newPostSubmitted])
  const [open, setOpen] = React.useState(false);

  const handleClose = (submitted) => {
    if (submitted) {
      setNewPostSubmitted(!newPostSubmitted)
    }
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const errorHandler = () => {
    setErrorState({ error: null });
  };

  return post && (
    <Grid container spacing={2}>
      <ErrorHandler error={errorState.error} onHandle={errorHandler} />

      {
        open && (<CreateFeedPost open={open} handleDialogClose={handleClose} feedPostData={post} />
        )
      }
      <Grid item xs={12} style={{ marginButton: '20px', display: "flex", alignItems: "center", flexDirection: "column" }}>
        <Typography variant="h4">{post.title}</Typography>

      </Grid>
      <Grid item xs={12} sx={{ display: { sm: 'flex' }, justifyContent: 'center', margin: { xs: "0 20px" } }}>
        <Paper elevation={3} style={{ padding: '20px', display: "flex", alignItems: "center", flexDirection: "column", maxWidth: "780px", }}>
          <CardMedia
            component="img"
            width="400"
            height="400"
            alt="123 Main St, Phoenix, AZ cover"
            src={"https://feed-post-app.onrender.com/images/" + post.imageUrl}
            sx={{
              borderRadius: 0.5,
              width: { xs: '100%', sm: 400 },
              mr: { sm: 1.5 },
              mb: { xs: 1.5, sm: 0 },
            }}
          />
          <Typography variant="h6">Content: </Typography>
          <Typography variant="body1">{post.content}</Typography>
          <Typography variant="h6">Created At: </Typography>
          <Typography variant="body1">{new Date(post.createdAt).toLocaleString()}</Typography>
          <Button color='info' onClick={handleClickOpen} >
            Edit
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} style={{ marginButton: '20px', display: "flex", alignItems: "center", flexDirection: "column" }}>
        <Button color='warning' onClick={() => { navigate("/all-posts") }} >
          Back
        </Button>
      </Grid>
    </Grid>
  );
};

export default SinglePost;