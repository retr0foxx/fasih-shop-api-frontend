const UserDAO = require('../daos/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
    return token;
}

module.exports.signUpUser = async ({ username, password }) => {
    const user = await UserDAO.getByName(username);
    if (user) throw {
        status: 409,
        message: 'User already exists'
    };

    const hash = await bcrypt.hash(password, 10);
    await UserDAO.create({
        username: username,
        password: hash,
    });
}

module.exports.getAllUsers = async () => await UserDAO.getAll();
