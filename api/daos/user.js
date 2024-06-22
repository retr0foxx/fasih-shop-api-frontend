const User = require('../models/user');

module.exports.getAll = async () =>
    await User.findAll();

module.exports.getByName = async username =>
    await User.findOne({ where: { username }});

module.exports.getById = async id =>
    await User.findOne({where: { id: id }});

module.exports.create = async user => 
    await User.create({
        username: user.username,
        password: user.password,
    });
