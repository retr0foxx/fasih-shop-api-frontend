const UserService = require('../services/user');

const ash = require('../utils/asyncHandler');

module.exports.getAllUsers = ash(async (req, res, next) => {
    const users = await UserService.getAllUsers();

    return res.status(200).json({
        message: 'Users retrieved',
        count: users.length,
        // oh so this is done because there's the hash as well right
        // you cant include that.
        users: users.map(user => ({
            id: user.id,
            name: user.name,
            createdAt: user.createdAt,
        })),
    });
});

module.exports.getById = ash(async (req, res, next) => {
    const user = await UserService.getById(req.params.id);

    return res.status(200).json({
        message: "User retrieved",
        user: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt
        }
    });
});

module.exports.create = ash(async (req, res, next) => {
    console.log(req.body);
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
