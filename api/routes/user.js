const { Router } = require('express');
const router = Router();

const UserController = require('../controllers/user');

router.get('/', UserController.getAllUsers);

router.post('/', UserController.create);
router.post('/login', UserController.login);

module.exports = router;