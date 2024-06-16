const Item = require('../models/item');
const sync = require('../utils/sync');

module.exports.getAll = async options => {
    await sync();
    return await Item.findAll(options);
}

module.exports.getById = async id => {
    await sync();
    return await Item.findOne({ where: { id } });
}

module.exports.countAll = async options => {
    await sync();
    return await Item.count(options);
}

module.exports.create = async item => {
    await sync();
    await Item.create(item);
}

module.exports.update = async item => {
    await sync();
    await Item.update(item, { where: { id: item.id } });
}

// only needs id but using this to keep it all uniform
module.exports.delete = async item => {
    await sync();
    await Item.destroy({ where: { id: item.id } });
}
