const User = require('../models/User');

async function getAllUsers(req, res) {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select('-__v');
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('getUserById error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateUser(req, res) {
  try {
    const allowedFields = ['name', 'phone', 'role', 'location', 'emergencyContacts'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function deactivateUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, message: 'User deactivated', user });
  } catch (err) {
    console.error('deactivateUser error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser };
