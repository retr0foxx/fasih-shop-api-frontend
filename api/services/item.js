const ItemDAO = require('../daos/item');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const parseReq = require('../utils/parseReq');
const deleteImage = require('../utils/deleteImage');

// takes in pagination info and gives limited items
// gives all items if no info given
module.exports.getItems = async ({ limit, page }) => {
    console.log('\x1b[36m%s\x1b[0m', new Date().toString());
    return {
        items: await ItemDAO.getAll(parseReq({ limit, page })),
        total_items: await ItemDAO.countAll({}),
    };
}

module.exports.getItemsByCreatorId = async (creator_id, { limit, page }) => {
    let condition = { itemCreatorId: creator_id };

    const items = await ItemDAO.getAll({
        ...condition,
        ...parseReq({ limit, page })
    });

    return {
        items,
        total_count: await ItemDAO.countAll(condition)
    };
}

module.exports.getItemsByName = async (itemName, { limit, page }) => {
    const keywords = itemName.split(' ').map(keyword => ({ itemName: { [Op.like]: `%${keyword}%` } }));
    const condition = { where: { [Op.and]: keywords } };

    const items = await ItemDAO.getAll({
        ...condition,
        ...parseReq({ limit, page })
    });

    return {
        items,
        total_count: await ItemDAO.countAll(condition),
    };
}

module.exports.getById = async id => {
    const item = await ItemDAO.getById(id);
    if (!item) throw {
        status: 404,
        message: 'Item not found',
    };
    return item;
}

// finds path to image
module.exports.getImageById = async id => {
    const item = await this.getById(id);

    const imagePath = path.join(__dirname, '../../', 'item_images/', item.itemImage);
    if (!fs.existsSync(imagePath)) throw {
        status: 404,
        message: 'Item image not found',
    };
    return imagePath;
}

module.exports.createItem = async (item, file, creator_id) => {
    return await ItemDAO.create({
        itemName: item.itemName,
        price: item.price,
        description: item.description,
        itemImage: file?.filename,
        itemCreatorId: creator_id
    });
}

const exists = async id => {
    const item = await ItemDAO.getById(id);
    if (!item) throw {
        status: 404,
        message: 'Item does not exist',
    };
    return item;
}

module.exports.updateItem = async (item, file) => {
    const old_item = exists(item.id);

    // delete old image
    if (file)
        deleteImage(old_item.itemImage);
    // replace with new image
    await ItemDAO.update({ ...item, itemImage: file?.filename });
}

module.exports.deleteItem = async (item, file) => {
    exists(item.id);

    if (file)
        deleteImage(file.filename);
    await ItemDAO.delete(item);
}