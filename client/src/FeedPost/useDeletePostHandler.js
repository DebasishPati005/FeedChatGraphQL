import React from "react";

const useDeletePostHandler = () => {
    const [loading, setLoading] = React.useState(false);


    const deletePost = async (postId) => {
        const graphqlQuery = {
            query: `{
          deleteSinglePost(postId:"${postId}") {
            _id
            content
            title
            imageUrl
            creator { email name _id }
            createdAt
        }
        }`
        }
        const token = localStorage.getItem("accessToken");


        setLoading(true);
        const resp = await fetch(`https://feed-post-app.onrender.com/graphql `, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(graphqlQuery)
        })
        const response = await resp.json();
        setLoading(false)
        if (response.errors && response.errors[0].status >= 400) {
            return new Error(
                `Could not delete post! Because you are \n${response.errors[0].error.message.toUpperCase()}`
            );
        }
    }

    return { loading, deletePost };
};

export default useDeletePostHandler;