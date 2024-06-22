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

router.get('/', ItemController.getAllItems);
router.get('/itemname/:itemName', ItemController.getItemsByName);
router.get('/id/:id', ItemController.getById);
router.get('/id/:id/image', ItemController.getImageById);

router.post('/', jwtAuth, upload.single('itemImage'), ItemController.create);

router.patch('/:id', jwtAuth, upload.single('itemImage'), ItemController.update);

router.delete('/:id', jwtAuth, ItemController.delete);

module.exports = router;