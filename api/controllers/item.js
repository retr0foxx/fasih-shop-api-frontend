const ItemService = require('../services/item');
const ash = require('../utils/asyncHandler');

module.exports.getAllItems = ash(async (req, res, next) => {
    const { items, total_items } = await ItemService.getItems(req.query);

    return res.status(200).json({
        message: 'Items retrieved',
        total_items,
        count: items.length,
        items: items.map(item => ({
            id: item.id,
            itemName: item.itemName,
            price: item.price,
            description: item.description,
            itemImage: item.itemImage === "NO_IMAGE.png" ? undefined : item.itemImage,
        })),
    });
});

module.exports.getItemsByName = ash(async (req, res, next) => {
    const { items, total_items } = await ItemService.getItemsByName(req.params.itemName, req.query);

    return res.status(200).json({
        message: 'Found results for: ' + req.params.itemName,
        total_items,
        items,
    });
});

module.exports.getById = ash(async (req, res, next) => {
    console.log(req.params.id);
    const item = await ItemService.getById(req.params.id);
    return res.status(200).json({ message: 'Item retrieved', item });
});

module.exports.getImageById = ash(async (req, res, next) => {
    const imagePath = await ItemService.getImageById(req.params.id);
    return res.status(200).sendFile(imagePath);
});

module.exports.create = ash(async (req, res, next) => {
    await ItemService.createItem(req.body, req.file);
    return res.status(201).json({ message: 'Item created' });
});

module.exports.update = ash(async (req, res, next) => {
    await ItemService.updateItem({ id: req.params.id, ...req.body }, req.file);
    return res.status(200).json({ message: 'Item updated successfully' });
});

module.exports.delete = ash(async (req, res, next) => {
    await ItemService.deleteItem({ id: req.params.id }, req.file);
    return res.status(200).json({ message: 'Item deletion successful' });
});