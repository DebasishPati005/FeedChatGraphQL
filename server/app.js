const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const resolver = require('./graphql/resolver');
const isAuth = require('./middleware/auth');
const fs = require('fs');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, './images'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, './images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1234');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method == 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuth);

app.put('/photo-url', (req, res, next) => {
  if (!req.isAuth) {
    return res.status(401).json({
      message: 'Sorry no authenticated user!',
    });
  }
  const file = req.file;
  if (req.body.oldPath) {
    if (!file) {
      return res.status(200).json({
        message: 'No file selected image url is same as old path',
        filepath: req.body.oldPath,
      });
    } else {
      fs.unlinkSync(
        path.join(__dirname, 'images', req.body.oldPath ?? ''),
        (err) => {
          if (!err) {
            console.log('file removed');
          }
        }
      );
    }
  }

  return res.status(201).json({
    filepath: file.filename,
    message: 'Image is file selected && saved.',
  });
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: resolver,
    graphiql: true,
    customFormatErrorFn(error) {
      if (!error.originalError) {
        return error;
      }
      const status = error.originalError.code || error.originalError.setStatus;
      const data = error.originalError.data;
      return { error, status, description: data };
    },
  })
);

app.use((error, req, res, next) => {
  const status = error.code || 500;
  return res.status(status).json({
    message: error.message,
    error: error.toString(),
    status,
  });
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log('Connected to DB');
    app.listen(8080);
  })
  .catch((error) => {
    console.log(error);
  });
