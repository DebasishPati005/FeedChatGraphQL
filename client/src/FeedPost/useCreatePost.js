import React from 'react'

const useCreatePost = () => {
  const [loading, setLoading] = React.useState(false);
  const savePost = async (postData, editPost) => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    const graphqlQuery = {
      query: `
      mutation {
         ${editPost ? "updateSinglePost" : "createPost"}(
          postInput: {
            postId : "${editPost ? editPost._id : ''}", 
            title: "${postData.title}",
            content: "${postData.content}",
            imageUrl: "${postData.image}"
          }
        ) {
          title
          content
          createdAt
          _id
          creator {
            name
            _id
          }
        }
      }
    `
    }

    const resp = await fetch("https://feed-post-app.onrender.com/graphql", {
      method: "POST",
      body: JSON.stringify(graphqlQuery),
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    }
    );
    const response = await resp.json()
    setLoading(false)
    if (response.errors && response.errors[0].status >= 400) {
      return new Error(
        `Could not save post!\n${response.errors[0].error.message.toUpperCase()}`
      );
    }

  }

  return { loading, savePost }
}

export default useCreatePost