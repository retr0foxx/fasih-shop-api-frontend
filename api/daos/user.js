const User = require('../models/user');
const sync = require('../utils/sync');

module.exports.getAll = async () => {
    await sync();
    return await User.findAll(); 
}

module.exports.getByName = async username => {
    await sync();
    return await User.findOne({ where: { username }});
}

module.exports.create = async user => {
    await sync();
    await User.create({
        username: user.username,
        password: user.password,
    });
}
