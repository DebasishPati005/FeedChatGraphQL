const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type TextType{
        text: String
        view: Int!
    }

    type LoginResponse{
        token: String!
        userId: String!
        userName: String!
    }

    input PageOffset{
        page:Int
        perPage:Int
    }

    type PostsResponse {
        posts: [Post!]!
         totalPosts:Int!
    }

    type RootQueryType {
        hello: TextType!
        getPosts(pageOffset:PageOffset): PostsResponse
        getSinglePost(postId:String!): Post!
        deleteSinglePost(postId:String!): Post!
    }

    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status:  String!
        post: [Post!]!
    }

    input UserInputType {
        email: String!
        password: String!
        name: String
    }

    input PostInputType {
        postId:String
        title: String!
        imageUrl: String!
        content: String!
    }

    type RootMutationType {
        createUser(userInput: UserInputType!): User!
        authenticateUser(userInput: UserInputType!): LoginResponse
        createPost(postInput: PostInputType!): Post!
        updateSinglePost(postInput: PostInputType!): Post!
    }

    schema {
        query: RootQueryType
        mutation: RootMutationType
    }
`);
