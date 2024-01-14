import React, { Component, Fragment } from 'react';
import openSocket from "socket.io-client"
import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    const graphqlQuery = {
      query: `{
        getPosts { posts{
          _id
          content
          title
          creator { email name _id }
          createdAt
        }
        totalPosts
      }
      }`
    }

    fetch("http://localhost:8080/graphql", {
      headers: {
        "Authorization": "Bearer " + this.props.token,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        // if (resData.status !== 200) {
        //   throw new Error('Failed to fetch user status.');
        // }
        console.table(resData.data);
        this.setState({ status: resData.data.status });
      })
      .catch(this.catchError);

    this.loadPosts();
  }

  loadPosts = direction => {

    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }
    const graphqlQuery = {
      query: `{
        getPosts(pageOffset:{page:${page},perPage: 2}){ posts {
          _id
          content
          title
          imageUrl
          creator { email name _id }
          createdAt
        } totalPosts}
      }`
    }
    fetch('http://localhost:8080/graphql', {
      headers: {
        "Authorization": "Bearer " + this.props.token,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {

        return res.json();
      })
      .then(resData => {
        // if (resData.status !== 200) {
        //   throw new Error('Failed to fetch posts.');
        // }
        this.setState({
          posts: resData.data.getPosts.posts,
          totalPosts: resData.data.getPosts.totalPosts,
          postsLoading: false
        });
        console.log(this.state);
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = event => {
    event.preventDefault();
    fetch('URL')
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });
    // Set up data (with image!)

    const formData = new FormData();
    if (this.state.editPost) {
      console.log(this.state.editPost._id);
      console.table(this.state.editPost);
      formData.append("oldPath", this.state.editPost.imageUrl)
    }
    formData.append("image", postData.image);

    console.log(JSON.stringify(formData));
    console.table(this.state.editPost);


    fetch('http://localhost:8080/photo-url', {
      method: "PUT",
      body: formData,
      headers: {
        "Authorization": "Bearer " + this.props.token,
      }
    }
    ).then((resp) => {
      return resp.json()
    }).then((respImage) => {
      const graphqlQuery = {
        query: `
        mutation {
          ${this.state.editPost ? "updateSinglePost" : "createPost"}(
            postInput: {
              postId : "${this.state.editPost ? this.state.editPost._id : ''}", 
              title: "${postData.title}",
              content: "${postData.content}",
              imageUrl: "${respImage.filepath}"
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
      fetch("http://localhost:8080/graphql", {
        method: "POST",
        body: JSON.stringify(graphqlQuery),
        headers: {
          "Authorization": "Bearer " + this.props.token,
          "Content-Type": "application/json"
        }
        // body: JSON.stringify({
        //   title: postData.title, content: postData.content,
        //   creator: {
        //     name: "Debasish Pati",
        //   },
        //   image: "/images/old-vintage-book.png"
        // }),
        // headers: {
        //   "Content-Type": "application/json"
        // }
      }
      )
        .then(res => {

          return res.json();
        })
        .then(resData => {
          // if (resData.status !== 200 && resData.status !== 201) {
          //   throw new Error('Creating or editing a post failed!');
          // }
          const post = {
            _id: resData.data.createPost._id,
            title: resData.data.createPost.title,
            content: resData.data.createPost.content,
            creator: resData.data.createPost.creator.name,
            createdAt: resData.data.createPost.createdAt
          };
          this.setState(prevState => {
            let updatedPosts = [...prevState.posts];
            if (prevState.editPost) {
              const postIndex = prevState.posts.findIndex(
                p => p._id === prevState.editPost._id
              );
              updatedPosts[postIndex] = post;
            } else if (prevState.posts.length < 2) {
              updatedPosts = prevState.posts.concat(post);
            }
            return {
              posts: updatedPosts,
              isEditing: false,
              editPost: null,
              editLoading: false
            };
          });
        })
        .catch(err => {
          console.log(err);
          this.setState({
            isEditing: false,
            editPost: null,
            editLoading: false,
            error: err
          });
        });
    })

  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = postId => {
    this.setState({ postsLoading: true });
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
    fetch(`http://localhost:8080/graphql `, {
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + this.props.token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        // if (res.status !== 200 && res.status !== 201) {
        //   throw new Error('Deleting a post failed!');
        // }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        this.setState(prevState => {
          const updatedPosts = prevState.posts.filter(p => p._id !== postId);
          return { posts: updatedPosts, postsLoading: false };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              page={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator && post.creator.name || ""}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
