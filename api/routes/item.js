const { Router } = require('express');
const router = Router();

const ItemController = require('../controllers/item');
const jwtAuth = require('../auth/jwtAuth');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './item_images/'),
    filename: (req, file, cb) => cb(null, `${new Date().toISOString().replaceAll(':', '-')}-${file.originalname}`),
});
const upload = multer({ storage });

// TODO: Don't let users edit creatorId or item id
// TODO: Don't let users decide the user ID on item creation

router.get('/', ItemController.getAllItems);
router.get('/itemname/:itemName', ItemController.getItemsByName);
router.get('/id/:id', ItemController.getById);
router.get('/id/:id/image', ItemController.getImageById);
router.get("/creatorid/:id", ItemController.getItemsByCreatorId);

router.post('/', jwtAuth, upload.single('itemImage'), ItemController.create);

router.patch('/:id', jwtAuth, upload.single('itemImage'), ItemController.update);

router.delete('/:id', jwtAuth, ItemController.delete);

module.exports = router;