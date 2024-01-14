const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
  const jwtToken = req.get('Authorization');
  let decodedToken;
  if (!jwtToken) {
    req.isAuth = false;
    return next();
  }
  try {
    decodedToken = jwt.verify(jwtToken.split(' ')[1], 'superSecretKey');
    if (decodedToken) {
      req.userId = decodedToken.userId;
      req.isAuth = true;
    } else {
      req.isAuth = false;
    }
    return next();
  } catch {
    req.isAuth = false;
    next();
  }
};

module.exports = isAuth;
