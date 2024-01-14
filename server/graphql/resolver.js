const User = require('../models/user.model');
const Post = require('../models/post.model');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const verifyUserValidation = (userInputData) => {
  const errors = [];
  if (!validator.isEmail(userInputData.email)) {
    errors.push({ message: 'Email is not valid!' });
  }

  if (
    validator.isEmpty(userInputData.password) ||
    !validator.isLength(userInputData.password, { min: 5 })
  ) {
    errors.push({ message: 'Password is not valid as it"s too short!' });
  }

  if (userInputData.name && validator.isEmpty(userInputData.name)) {
    errors.push({ message: 'Name is too short!' });
  }
  return errors;
};

const verifyPostValidation = (postInputData) => {
  const errors = [];
  if (
    postInputData.imageUrl === 'undefined' ||
    validator.isEmpty(postInputData.imageUrl) ||
    !validator.isLength(postInputData.imageUrl, { min: 5 })
  ) {
    errors.push({ message: 'Image is not valid as it"s too short!' });
  }

  if (
    validator.isEmpty(postInputData.title) ||
    !validator.isLength(postInputData.title, { min: 5 })
  ) {
    errors.push({ message: 'Title is not valid as it"s too short!' });
  }

  if (
    validator.isEmpty(postInputData.content) ||
    !validator.isLength(postInputData.content, { min: 5 })
  ) {
    errors.push({ message: 'Content is not valid as it"s too short!' });
  }
  return errors;
};

function handleError(errors) {
  if (errors.length > 0) {
    const err = new Error('Invalid input!');
    err.data = errors;
    err.code = 422;
    throw err;
  }
}

function createJwt(userData) {
  const token = jwt.sign(
    {
      sub: userData.name,
      userId: userData._id,
      email: userData.email,
    },
    'superSecretKey',
    { expiresIn: '7d' }
  );
  return token;
}

function verifyToken(req) {
  if (!req.isAuth) {
    const err = new Error('No token provided');
    err.code = 401;
    throw err;
  }
}

function removeFile(filepath) {
  fs.unlink(path.join(__dirname, '..', 'images', filepath), (err) => {
    if (!err) {
      console.log('file removed');
    }
  });
}

module.exports = {
  hello: () => {
    return {
      text: 'Hello world!',
      view: '12345',
    };
  },

  createUser: async function ({ userInput }, req) {
    const userExist = await User.findOne({ email: userInput.email });
    const errors = verifyUserValidation(userInput);

    if (userExist) {
      const error = new Error('Email-id exist');
      error.code = 400;
      throw error;
    }

    handleError(errors);

    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      name: userInput.name,
      password: hashedPw,
      email: userInput.email,
    });
    const userDetails = await user.save();
    return {
      ...userDetails._doc,
      _id: userDetails._id.toString(),
    };
  },

  authenticateUser: async function ({ userInput }, req) {
    const user = await User.findOne({ email: userInput.email });
    const errors = verifyUserValidation(userInput);

    if (!user) {
      const err = new Error('No account found with this Email ID');
      err.code = 500;
      throw err;
    }

    handleError(errors);

    const passwordMatch = await bcrypt.compare(
      userInput.password,
      user.password
    );
    if (!passwordMatch) {
      const err = new Error('Invalid credentials!');
      err.code = 422;
      throw err;
    }

    const jwtToken = createJwt(user);

    return {
      token: jwtToken,
      userId: user._id.toString(),
      userName: user.name,
    };
  },

  createPost: async function ({ postInput }, req) {
    verifyToken(req);
    const user = await User.findById(req.userId);
    const errors = verifyPostValidation(postInput);
    handleError(errors);

    if (!user) {
      const error = new Error('Invalid user');
      error.code = 400;
      throw error;
    }

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user,
    });
    const postDetail = await post.save();
    user.post.push(postDetail._id);
    await user.save();
    return {
      ...postDetail._doc,
      _id: postDetail._id.toString(),
      createdAt: postDetail.createdAt.toISOString(),
      updatedAt: postDetail.updatedAt.toISOString(),
    };
  },

  getPosts: async function ({ pageOffset }, req) {
    verifyToken(req);
    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .skip((pageOffset.page - 1) * 2)
      .limit(pageOffset.perPage || 2);

    const updatedPosts = posts.map(async (postItem) => {
      return {
        ...postItem._doc,
        _id: postItem._id.toString(),
        creator: await User.findById(postItem.creator),
        createdAt: postItem.createdAt.toISOString(),
        updatedAt: postItem.updatedAt.toISOString(),
      };
    });
    return { posts: updatedPosts, totalPosts };
  },

  getSinglePost: async function ({ postId }, req) {
    verifyToken(req);
    const postItem = await Post.findById(postId);
    return {
      ...postItem._doc,
      _id: postItem._id.toString(),
      creator: await User.findById(postItem.creator),
      createdAt: postItem.createdAt.toISOString(),
      updatedAt: postItem.updatedAt.toISOString(),
    };
  },

  deleteSinglePost: async function ({ postId }, req) {
    verifyToken(req);
    const postItem = await Post.findById(postId);
    const user = await User.findById(postItem.creator);
    if (req.userId.toString() !== postItem.creator.toString()) {
      const error = new Error('Invalid user');
      error.code = 400;
      throw error;
    }
    await Post.findByIdAndDelete(postId);
    user.post.pull(postId);
    console.log(user.post);
    removeFile(postItem.imageUrl);
    await user.save();
    return {
      ...postItem._doc,
      _id: postItem._id.toString(),
      creator: await User.findById(postItem.creator),
      createdAt: postItem.createdAt.toISOString(),
      updatedAt: postItem.updatedAt.toISOString(),
    };
  },

  updateSinglePost: async function ({ postInput }, req) {
    verifyToken(req);
    const postDetail = await Post.findById(postInput.postId);
    if (postDetail.imageUrl != postInput.imageUrl) {
      removeFile(postDetail.imageUrl);
    }
    if (req.userId.toString() !== postDetail.creator.toString()) {
      const error = new Error('Invalid user');
      error.code = 400;
      throw error;
    }

    const updatedObj = {
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
    };
    const postItem = await Post.findByIdAndUpdate(postInput.postId, {
      $set: { ...updatedObj },
    });
    return {
      ...postItem._doc,
      _id: postItem._id.toString(),
      creator: await User.findById(postItem.creator),
      createdAt: postItem.createdAt.toISOString(),
      updatedAt: postItem.updatedAt.toISOString(),
    };
  },
};
