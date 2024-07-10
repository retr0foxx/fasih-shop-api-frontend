const UserDAO = require('../daos/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const parseReq = require("../utils/parseReq")
require('dotenv').config();

module.exports.loginUser = async ({ username, password }) => {
    const user = await UserDAO.getByName(username);
    if (!user) throw {
        status: 404,
        error: 'User does not exist'
    };

    const status = await bcrypt.compare(password, user.password);
    if (!status) throw {
        status: 401,
        message: 'Auth failure'
    };
    
    const token = jwt.sign(
        {
            username: username,
            id: user.id,
        },
        process.env.JWT_KEY,
        process.env.MODE !== 'dev' ? { expiresIn: '1h' } : undefined
    );
    return [token, user.id];
}

module.exports.getById = async (id) => {
    const user = await UserDAO.getById(id);
    if (user === null) throw {
        status: 404,
        message: "User does not exist"
    };
    return user;
}

module.exports.signUpUser = async ({ username, password }) => {
    const user = await UserDAO.getByName(username);
    if (user) throw {
        status: 409,
        message: 'User already exists'
    };

    const hash = await bcrypt.hash(password, 10);
    let created_user = await UserDAO.create({
        username: username,
        password: hash,
    });
    return created_user;
}

// oh so it does that to filter out any other possible user-input parameters
module.exports.getAllUsers = async ({ limit, page }) => await UserDAO.getAll(parseReq({ limit, page }));
