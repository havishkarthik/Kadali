const Alert = require('../models/Alert');
const { getIO } = require('../utils/socket');

async function getAlerts(req, res) {
  try {
    let filter = {};
    if (req.user.role === 'user') {
      filter.user = req.user._id;
    }
    // admin and volunteer can see all alerts

    const alerts = await Alert.find(filter)
      .populate('user', 'name email phone')
      .populate('device', 'deviceId name')
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .select('-__v');

    return res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    console.error('getAlerts error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getActiveAlerts(req, res) {
  try {
    const alerts = await Alert.find({
      status: { $in: ['active', 'acknowledged', 'responding'] },
    })
      .populate('user', 'name email phone')
      .populate('device', 'deviceId name')
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .select('-__v');

    return res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    console.error('getActiveAlerts error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function createAlert(req, res) {
  try {
    const alert = await Alert.create({ ...req.body, user: req.user._id });

    const populated = await Alert.findById(alert._id)
      .populate('user', 'name email phone')
      .populate('device', 'deviceId name');

    try {
      const io = getIO();
      io.emit('new-alert', populated);
    } catch (socketErr) {
      console.warn('Socket emit failed:', socketErr.message);
    }

    return res.status(201).json({ success: true, alert: populated });
  } catch (err) {
    console.error('createAlert error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function acknowledgeAlert(req, res) {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'acknowledged', respondedBy: req.user._id, respondedAt: new Date() },
      { new: true }
    )
      .populate('user', 'name email phone')
      .populate('respondedBy', 'name email');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    return res.status(200).json({ success: true, alert });
  } catch (err) {
    console.error('acknowledgeAlert error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function respondAlert(req, res) {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'responding', respondedAt: new Date() },
      { new: true }
    )
      .populate('user', 'name email phone')
      .populate('respondedBy', 'name email');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    return res.status(200).json({ success: true, alert });
  } catch (err) {
    console.error('respondAlert error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function resolveAlert(req, res) {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    )
      .populate('user', 'name email phone')
      .populate('respondedBy', 'name email');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    return res.status(200).json({ success: true, alert });
  } catch (err) {
    console.error('resolveAlert error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getAlertStats(req, res) {
  try {
    const byStatus = await Alert.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byType = await Alert.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const statusMap = {};
    byStatus.forEach((s) => { statusMap[s._id] = s.count; });

    const typeMap = {};
    byType.forEach((t) => { typeMap[t._id] = t.count; });

    return res.status(200).json({ success: true, stats: { byStatus: statusMap, byType: typeMap } });
  } catch (err) {
    console.error('getAlertStats error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  getAlerts,
  getActiveAlerts,
  createAlert,
  acknowledgeAlert,
  respondAlert,
  resolveAlert,
  getAlertStats,
};
