const express = require('express');
const { receiveData, receiveEmergency, receiveHeartbeat } = require('../controllers/deviceApiController');
const deviceApiKeyAuth = require('../middleware/deviceApiKey');

const router = express.Router();

router.use(deviceApiKeyAuth);

router.post('/data', receiveData);
router.post('/emergency', receiveEmergency);
router.post('/heartbeat', receiveHeartbeat);

module.exports = router;
