const express = require('express');
const {
  getDevices,
  createDevice,
  getDeviceById,
  updateDevice,
  deleteDevice,
} = require('../controllers/deviceController');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getDevices);
router.post('/', createDevice);
router.get('/:id', getDeviceById);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);

module.exports = router;
