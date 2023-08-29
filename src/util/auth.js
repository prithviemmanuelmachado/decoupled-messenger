const jwt = require('jsonwebtoken');
const key = process.env.KEY;

module.exports = (token) => {
    return jwt.verify(token, key);
}