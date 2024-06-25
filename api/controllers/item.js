const ItemService = require('../services/item');
const UserService = require("../services/user")
const ash = require('../utils/asyncHandler');

module.exports.getAllItems = ash(async (req, res, next) => {
    const { items, total_items } = await ItemService.getItems(req.query);

    return res.status(200).json({
        message: 'Items retrieved',
        total_count: total_items,
        count: items.length,
        items: items.map(item => ({
            id: item.id,
            itemName: item.itemName,
            price: item.price,
            description: item.description,
            itemImage: item.itemImage === "NO_IMAGE.png" ? undefined : item.itemImage,
            itemCreatorId: item.itemCreatorId
        })),
    });
});

// TODO: Make it response with a 404 if there is no user with that ID
module.exports.getItemsByCreatorId = ash(async (req, res, next) => {
    let creator_id = req.params.id;
    const { items, total_items } = await ItemService.getItemsByCreatorId(creator_id, req.query);

    return res.status(200).json({
        message: `Items created by user ID ${creator_id}`,
        total_count: total_items,
        count: items.length,
        items: items.map(item => ({
            id: item.id,
            itemName: item.itemName,
            price: item.price,
            description: item.description,
            itemImage: item.itemImage === "NO_IMAGE.png" ? undefined : item.itemImage,
            itemCreatorId: item.itemCreatorId
        }))
    });
});

module.exports.getItemsByName = ash(async (req, res, next) => {
    const { items, total_items } = await ItemService.getItemsByName(req.params.itemName, req.query);

    return res.status(200).json({
        message: 'Found results for: ' + req.params.itemName,
        total_count: total_items,
        items,
    });
});

module.exports.getById = ash(async (req, res, next) => {
    // console.log(req.params.id);
    const item = await ItemService.getById(req.params.id);
    return res.status(200).json({ message: 'Item retrieved', item });
});

module.exports.getImageById = ash(async (req, res, next) => {
    const imagePath = await ItemService.getImageById(req.params.id);
    return res.status(200).sendFile(imagePath);
});

// TODO: Delete item image file on item creation/update failure

module.exports.create = ash(async (req, res, next) => {
    console.log(`User ID ${req.userData.id} has created an item with name ${req.body.itemName}`);
    let created_item = await ItemService.createItem(req.body, req.file, req.userData.id);
    return res.status(201).json({ message: 'Item created', id: created_item.id });
});

module.exports.update = ash(async (req, res, next) => {
    await ItemService.updateItem(
        {
            id: req.params.id,
            itemName: req.itemName,
            price: req.price,
            description: req.description
        },
        req.file
    );
    return res.status(200).json({ message: 'Item updated successfully' });
});

module.exports.delete = ash(async (req, res, next) => {
    await ItemService.deleteItem({ id: req.params.id }, req.file);
    return res.status(200).json({ message: 'Item deletion successful' });
});