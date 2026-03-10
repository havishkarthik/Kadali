const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const { getIO } = require('../utils/socket');

async function receiveData(req, res) {
  try {
    const { deviceId, location, sensors, batteryLevel, isEmergency } = req.body;

    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    const sensorData = await SensorData.create({
      device: device._id,
      location,
      sensors,
      batteryLevel,
      isEmergency: isEmergency || false,
    });

    const deviceUpdate = { lastSeen: new Date(), batteryLevel };
    if (location && location.coordinates) {
      deviceUpdate.lastLocation = location;
    }
    await Device.findByIdAndUpdate(device._id, deviceUpdate);

    if (isEmergency) {
      const alert = await Alert.create({
        device: device._id,
        user: device.owner,
        type: 'emergency',
        status: 'active',
        location,
      });

      const populated = await Alert.findById(alert._id)
        .populate('user', 'name email phone')
        .populate('device', 'deviceId name');

      try {
        const io = getIO();
        io.emit('new-alert', populated);
      } catch (socketErr) {
        console.warn('Socket emit failed:', socketErr.message);
      }
    }

    return res.status(200).json({ success: true, sensorData });
  } catch (err) {
    console.error('receiveData error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function receiveEmergency(req, res) {
  try {
    const { deviceId, location, sensors, batteryLevel } = req.body;

    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    const sensorData = await SensorData.create({
      device: device._id,
      location,
      sensors,
      batteryLevel,
      isEmergency: true,
    });

    const deviceUpdate = { lastSeen: new Date(), batteryLevel };
    if (location && location.coordinates) {
      deviceUpdate.lastLocation = location;
    }
    await Device.findByIdAndUpdate(device._id, deviceUpdate);

    const alert = await Alert.create({
      device: device._id,
      user: device.owner,
      type: 'emergency',
      status: 'active',
      location,
    });

    const populated = await Alert.findById(alert._id)
      .populate('user', 'name email phone')
      .populate('device', 'deviceId name');

    try {
      const io = getIO();
      io.emit('new-alert', populated);
    } catch (socketErr) {
      console.warn('Socket emit failed:', socketErr.message);
    }

    return res.status(200).json({ success: true, alert: populated, sensorData });
  } catch (err) {
    console.error('receiveEmergency error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function receiveHeartbeat(req, res) {
  try {
    const { deviceId } = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId },
      { lastSeen: new Date() },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    return res.status(200).json({ success: true, message: 'Heartbeat received', lastSeen: device.lastSeen });
  } catch (err) {
    console.error('receiveHeartbeat error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { receiveData, receiveEmergency, receiveHeartbeat };
