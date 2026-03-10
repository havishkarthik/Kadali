require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Device = require('./models/Device');
const Alert = require('./models/Alert');
const SensorData = require('./models/SensorData');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kadali');
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Device.deleteMany({}),
      Alert.deleteMany({}),
      SensorData.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // NOTE: These are development seed credentials only — never use in production.
    const [admin, user1, user2, vol1, vol2] = await User.create([
      { name: 'Admin User', email: 'admin@kadali.com', password: 'admin123', role: 'admin', phone: '+1234567890' },
      { name: 'User One', email: 'user1@kadali.com', password: 'user123', role: 'user', phone: '+1111111111' },
      { name: 'User Two', email: 'user2@kadali.com', password: 'user123', role: 'user', phone: '+2222222222' },
      { name: 'Volunteer One', email: 'vol1@kadali.com', password: 'vol123', role: 'volunteer', phone: '+3333333333' },
      { name: 'Volunteer Two', email: 'vol2@kadali.com', password: 'vol123', role: 'volunteer', phone: '+4444444444' },
    ]);
    console.log('Created users');

    const [device1, device2, device3] = await Device.create([
      {
        deviceId: 'KADALI-001',
        name: 'Safety Band 1',
        owner: user1._id,
        status: 'active',
        batteryLevel: 85,
        firmwareVersion: '1.0.0',
        lastSeen: new Date(),
        lastLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
      },
      {
        deviceId: 'KADALI-002',
        name: 'Safety Band 2',
        owner: user1._id,
        status: 'active',
        batteryLevel: 62,
        firmwareVersion: '1.0.0',
        lastSeen: new Date(),
        lastLocation: { type: 'Point', coordinates: [77.6101, 12.9352] },
      },
      {
        deviceId: 'KADALI-003',
        name: 'Safety Band 3',
        owner: user1._id,
        status: 'inactive',
        batteryLevel: 15,
        firmwareVersion: '0.9.5',
        lastSeen: new Date(Date.now() - 3600000),
        lastLocation: { type: 'Point', coordinates: [77.5800, 12.9500] },
      },
    ]);
    console.log('Created devices');

    await Alert.create([
      {
        device: device1._id,
        user: user1._id,
        type: 'emergency',
        status: 'active',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        address: '123 Main St, Bangalore',
      },
      {
        device: device2._id,
        user: user1._id,
        type: 'sos',
        status: 'acknowledged',
        location: { type: 'Point', coordinates: [77.6101, 12.9352] },
        respondedBy: vol1._id,
      },
      {
        device: device1._id,
        user: user1._id,
        type: 'fall_detected',
        status: 'responding',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        respondedBy: vol2._id,
        respondedAt: new Date(Date.now() - 600000),
      },
      {
        user: user2._id,
        type: 'manual',
        status: 'resolved',
        location: { type: 'Point', coordinates: [77.5800, 12.9500] },
        respondedBy: vol1._id,
        respondedAt: new Date(Date.now() - 7200000),
        resolvedAt: new Date(Date.now() - 3600000),
        notes: 'Situation resolved safely',
      },
      {
        device: device3._id,
        user: user1._id,
        type: 'geofence',
        status: 'false_alarm',
        location: { type: 'Point', coordinates: [77.5700, 12.9600] },
        notes: 'User confirmed safe',
      },
    ]);
    console.log('Created alerts');

    const sensorRecords = Array.from({ length: 10 }, (_, i) => ({
      device: i % 2 === 0 ? device1._id : device2._id,
      timestamp: new Date(Date.now() - i * 300000),
      location: {
        type: 'Point',
        coordinates: [77.5946 + i * 0.001, 12.9716 + i * 0.001],
      },
      sensors: {
        temperature: 36 + Math.random(),
        heartRate: 70 + Math.floor(Math.random() * 20),
        accelerometer: { x: Math.random(), y: Math.random(), z: 9.8 },
        bleRssi: -60 - Math.floor(Math.random() * 20),
        loraSignal: -80 - Math.floor(Math.random() * 10),
      },
      batteryLevel: 80 - i,
      isEmergency: false,
    }));

    await SensorData.create(sensorRecords);
    console.log('Created sensor data');

    console.log('\nSeed completed successfully!');
    console.log('Accounts created:');
    console.log('  Admin:      admin@kadali.com / admin123');
    console.log('  Users:      user1@kadali.com / user123, user2@kadali.com / user123');
    console.log('  Volunteers: vol1@kadali.com / vol123, vol2@kadali.com / vol123');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
