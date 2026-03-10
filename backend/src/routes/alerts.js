const express = require('express');
const {
  getAlerts,
  getActiveAlerts,
  createAlert,
  acknowledgeAlert,
  respondAlert,
  resolveAlert,
  getAlertStats,
} = require('../controllers/alertController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);

router.get('/', getAlerts);
router.get('/active', roleCheck('volunteer', 'admin'), getActiveAlerts);
router.get('/stats', roleCheck('admin'), getAlertStats);
router.post('/', createAlert);
router.put('/:id/acknowledge', acknowledgeAlert);
router.put('/:id/respond', respondAlert);
router.put('/:id/resolve', resolveAlert);

module.exports = router;
