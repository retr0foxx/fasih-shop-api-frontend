const Item = require('../models/item');

module.exports.getAll = async options => 
    await Item.findAll(options);

module.exports.getById = async id =>
    await Item.findOne({ where: { id } });

module.exports.countAll = async options =>
    await Item.count(options);

module.exports.create = async item =>
    await Item.create(item);

module.exports.update = async item =>
    await Item.update(item, { where: { id: item.id } });

// only needs id but using this to keep it all uniform
module.exports.delete = async item =>
    await Item.destroy({ where: { id: item.id } });
