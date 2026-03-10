const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  timestamp: { type: Date, default: Date.now },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: undefined },
  },
  sensors: {
    temperature: { type: Number },
    heartRate: { type: Number },
    accelerometer: {
      x: { type: Number },
      y: { type: Number },
      z: { type: Number },
    },
    bleRssi: { type: Number },
    loraSignal: { type: Number },
  },
  batteryLevel: { type: Number },
  isEmergency: { type: Boolean, default: false },
});

SensorDataSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SensorData', SensorDataSchema);
