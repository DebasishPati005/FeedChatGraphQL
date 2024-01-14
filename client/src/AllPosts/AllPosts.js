import React from 'react';
import { Card, Box, Typography, CardMedia, Button } from '@mui/material';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import CreateFeedPost from '../FeedPost/CreateFeedPost';
import { useNavigate } from 'react-router-dom';
import useDeletePostHandler from "../FeedPost/useDeletePostHandler"
import ErrorHandler from '../common/ErrorHandler';


const getAllPosts = async (pageNumber) => {
    const graphqlQuery = {
        query: `{
          getPosts(pageOffset:{page:${pageNumber ?? 1},perPage: 2}){ posts {
            _id
            content
            title
            imageUrl
            creator { email name _id }
            createdAt
          } totalPosts}
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
            `Could not fetch all the posts${response.errors[0].error.message.toUpperCase()}`
        );
    }
    return response?.data?.getPosts
}

const AllPosts = () => {
    const navigate = useNavigate();
    const useDeletePost = useDeletePostHandler();
    const [open, setOpen] = React.useState(false);
    const [pageNumber, setPageNumber] = React.useState(1);
    const [postsResp, setPostsResp] = React.useState(null);
    const [newPostSubmitted, setNewPostSubmitted] = React.useState(false);
    const [errorState, setErrorState] = React.useState({ error: null });

    const handleClickOpen = () => {
        setOpen(true);
    };
    const errorHandler = () => {
        setErrorState({ error: null });
    };

    const handleClose = (submitted) => {
        if (submitted) {
            setNewPostSubmitted(!newPostSubmitted)
        }
        setOpen(false);
    };

    React.useEffect(() => {
        const posts = async () => {
            const awaitedPosts = await getAllPosts(pageNumber)
            setPostsResp(awaitedPosts);
        };
        posts()
    }, [useDeletePost.loading, newPostSubmitted, pageNumber])

    return postsResp && (
        <Box sx={{
            display: "flex",
            margin: { sm: "20px 20%" },
            flexDirection: "column",
            alignItems: "center"
        }}>
            {
                open && (<CreateFeedPost open={open} handleDialogClose={handleClose} />
                )
            }

            <Box >
                <Button onClick={handleClickOpen}>
                    New Post
                </Button>
            </Box>
            <ErrorHandler error={errorState.error} onHandle={errorHandler} />

            {
                postsResp.posts.map((post, i) => {
                    return (
                        <Card
                            key={post._id + i}
                            variant="outlined"
                            sx={{
                                p: 2,
                                boxShadow: '0 1px 3px rgba(0, 127, 255, 0.1)',
                                display: 'flex',
                                margin: "10px",
                                width: "90%",
                                justifyContent: "space-around",
                                flexDirection: {
                                    xs: 'column',
                                    sm: 'row'
                                }
                            }}
                        >
                            <CardMedia
                                component="img"
                                width="100"
                                height="100"
                                alt="123 Main St, Phoenix, AZ cover"
                                src={`https://feed-post-app.onrender.com/images/${post.imageUrl}`}
                                sx={{
                                    borderRadius: 0.5,
                                    width: { xs: '100%', sm: 100 },
                                    mr: { sm: 1.5 },
                                    mb: { xs: 1.5, sm: 0 },
                                }}
                            />
                            <Box sx={{ alignSelf: 'center', ml: 2, gap: 2 }}>
                                <Typography fontWeight="bold" noWrap>
                                    {post.title}
                                </Typography>
                                <Typography fontWeight="medium" variant="body2" color="text.secondary" noWrap>
                                    {post.content}
                                </Typography>
                                <Button color='info' onClick={() => { navigate('/post/' + post._id) }}>
                                    View
                                </Button>
                            </Box>
                            <Box sx={{ alignSelf: 'center', ml: 2, gap: 2 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                    Created At: {new Date(post.createdAt).toDateString()}
                                </Typography>
                                <Typography variant="h6" color="text.secondary" fontWeight="bold">
                                    Posted by {post.creator.name}
                                </Typography>
                                <Button color='error' onClick={() => {
                                    const deleFn = async () => {
                                        const deletePoseResult = await useDeletePost.deletePost(post._id);
                                        if (deletePoseResult instanceof Error) {
                                            setErrorState({ error: deletePoseResult })
                                        }
                                    }
                                    deleFn()
                                    // useDeletePost.deletePost(post._id).then((deletePoseResult) => {
                                    //     console.log(deletePoseResult instanceof Error)
                                    //     if (deletePoseResult instanceof Error) {
                                    //         setErrorState(error)
                                    //     }
                                    // }).catch((error) => {
                                    //     setErrorState(error)
                                    // });

                                }} >
                                    Delete
                                </Button>

                            </Box>
                        </Card>
                    )
                })
            }
            <Box sx={{
                display: "flex",
                justifyContent: "space-between"
            }}>
                <Button disabled={pageNumber === 1} onClick={() => {
                    if (pageNumber > 1) {
                        setPageNumber(pageNumber - 1)
                    }
                }}>
                    Prev
                </Button>
                <Button disabled={Math.ceil(postsResp.totalPosts / 2) === pageNumber} onClick={() => {
                    if (Math.ceil(postsResp.totalPosts / 2) > pageNumber) {
                        setPageNumber(pageNumber + 1)
                    }
                }}>
                    Next
                </Button>
            </Box>
        </Box >

    );
};

export default AllPosts;
