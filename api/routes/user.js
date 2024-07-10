const { Router } = require('express');
const router = Router();

const UserController = require('../controllers/user');
const jwtAuth = require('../auth/jwtAuth');

router.get('/', UserController.getAllUsers);
router.get('/id/:id', UserController.getById)

router.post('/token', jwtAuth, UserController.getByToken);
router.post('/', UserController.create);
router.post('/login', UserController.login);

module.exports = router;