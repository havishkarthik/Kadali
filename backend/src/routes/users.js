const express = require('express');
const { getAllUsers, getUserById, updateUser, deactivateUser } = require('../controllers/userController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect, roleCheck('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deactivateUser);

module.exports = router;
