const jwt = require('jsonwebtoken');
const authFail = require('./authFail');
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_KEY);
        req.userData = decoded;
        next();
    } catch (error) {
        console.error(error);
        return authFail(res);
    }
}