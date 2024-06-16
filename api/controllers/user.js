const UserService = require('../services/user');

const ash = require('../utils/asyncHandler');

module.exports.getAllUsers = ash(async (req, res, next) => {
    const users = await UserService.getAllUsers();

    return res.status(200).json({
        message: 'Users retrieved',
        count: users.length,
        users: users.map(user => ({
            id: user.id,
            name: user.name,
            createdAt: user.createdAt,
        })),
    });
});

module.exports.create = ash(async (req, res, next) => {
    await UserService.signUpUser({
        username: req.body.username,
        password: req.body.password,
    });

    return res.status(201).json({ message: 'User created successfully' });
});

module.exports.login = ash(async (req, res, next) => {
    const token = await UserService.loginUser({
        username: req.body.username,
        password: req.body.password,
    });

    return res.status(200).json({
        message: 'Login successful',
        token_type: 'Bearer',
        token
    });
});
