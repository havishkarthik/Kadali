const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: [true, 'Device ID is required'], unique: true },
    name: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    lastLocation: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: undefined },
    },
    batteryLevel: { type: Number },
    firmwareVersion: { type: String },
    lastSeen: { type: Date },
  },
  { timestamps: true }
);

DeviceSchema.index({ lastLocation: '2dsphere' });

module.exports = mongoose.model('Device', DeviceSchema);
