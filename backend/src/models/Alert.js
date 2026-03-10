const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['emergency', 'sos', 'fall_detected', 'geofence', 'manual'],
      required: [true, 'Alert type is required'],
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'responding', 'resolved', 'false_alarm'],
      default: 'active',
    },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: undefined },
    },
    address: { type: String },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: { type: Date },
    resolvedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

AlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', AlertSchema);
