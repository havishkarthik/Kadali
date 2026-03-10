const Device = require('../models/Device');

async function getDevices(req, res) {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const devices = await Device.find(filter).populate('owner', 'name email').select('-__v');
    return res.status(200).json({ success: true, count: devices.length, devices });
  } catch (err) {
    console.error('getDevices error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function createDevice(req, res) {
  try {
    const device = await Device.create({ ...req.body, owner: req.user._id });
    return res.status(201).json({ success: true, device });
  } catch (err) {
    console.error('createDevice error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Device ID already exists' });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getDeviceById(req, res) {
  try {
    const device = await Device.findById(req.params.id).populate('owner', 'name email').select('-__v');
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    const isOwner = device.owner && device.owner._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.status(200).json({ success: true, device });
  } catch (err) {
    console.error('getDeviceById error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateDevice(req, res) {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    const isOwner = device.owner && device.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updated = await Device.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-__v');

    return res.status(200).json({ success: true, device: updated });
  } catch (err) {
    console.error('updateDevice error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function deleteDevice(req, res) {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    const isOwner = device.owner && device.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await device.deleteOne();
    return res.status(200).json({ success: true, message: 'Device deleted' });
  } catch (err) {
    console.error('deleteDevice error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getDevices, createDevice, getDeviceById, updateDevice, deleteDevice };
