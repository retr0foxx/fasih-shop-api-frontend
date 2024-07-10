const UserService = require('../services/user');

const ash = require('../utils/asyncHandler');

module.exports.getAllUsers = ash(async (req, res, next) => {
    const users = await UserService.getAllUsers(req.query);

    return res.status(200).json({
        message: 'Users retrieved',
        total_count: users.length,
        // oh so this is done because there's the hash as well right
        // you cant include that.
        users: users.map(user => ({
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
        })),
    });
});

module.exports.getByToken = ash(async (req, res, next) => {
    console.log("Get by token:", req.userData.id);
    const user = await UserService.getById(req.userData.id);
    return res.status(200).json({
        message: "User retrieved",
        user: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt
        }
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
    let created_user = await UserService.signUpUser({
        username: req.body.username,
        password: req.body.password,
    });

    return res.status(201).json({ message: 'User created successfully', id: created_user.id });
});

module.exports.login = ash(async (req, res, next) => {
    const [token, id] = await UserService.loginUser({
        username: req.body.username,
        password: req.body.password,
    });

    return res.status(200).json({
        message: 'Login successful',
        token_type: 'Bearer',
        token,
        id
    });
});
