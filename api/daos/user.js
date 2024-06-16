const User = require('../models/user');

module.exports.getAll = async () =>
    await User.findAll();

module.exports.getByName = async username =>
    await User.findOne({ where: { username }});

module.exports.create = async user => 
module.exports.create = async user => 
    await User.create({
        username: user.username,
        password: user.password,
    });
