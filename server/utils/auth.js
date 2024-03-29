const jwt = require('jsonwebtoken');

const secret = 'mysecretssshhhhhhh'; // TODO: move to .env
const expiration = '2h';

module.exports = {
  authMiddleware: function ({ req,res, connection }) {
    let token = req.body.token || req.query.token || req.headers.authorization;
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
    }

    return req;
  },
  signToken: function ({ email, username, _id, statusPreference }) {
    const payload = { email, username, _id, statusPreference };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  }
};
