const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PurchaseOrder = require('../models/PurchaseOrder');
const config = require('../config');

const testPurchaseOrders = [
  {
    jobDetails: 'Road Construction - Main Street',
    haulerRates: new Map([
      ['Gravel', { materialType: 'Gravel', rate: 25, unit: 'cubic_yards' }],
      ['Sand', { materialType: 'Sand', rate: 30, unit: 'cubic_yards' }],
      ['Stone', { materialType: 'Stone', rate: 35, unit: 'cubic_yards' }]
    ]),
    geofence: {
      type: 'Circle',
      center: [-122.4194, 37.7749], // San Francisco coordinates
      radius: 1000 // 1km radius
    }
  },
  {
    jobDetails: 'Building Foundation - Downtown',
    haulerRates: new Map([
      ['Concrete', { materialType: 'Concrete', rate: 150, unit: 'cubic_yards' }],
      ['Asphalt', { materialType: 'Asphalt', rate: 120, unit: 'tons' }]
    ]),
    geofence: {
      type: 'Polygon',
      coordinates: [
        [-122.4194, 37.7749],
        [-122.4194, 37.7849],
        [-122.4294, 37.7849],
        [-122.4294, 37.7749],
        [-122.4194, 37.7749]
      ]
    }
  }
];

async function seedPurchaseOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Get or create test client
    let client = await User.findOne({ email: 'test.client@example.com' });
    if (!client) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      client = new User({
        name: 'Test Client',
        email: 'test.client@example.com',
        password: hashedPassword,
        role: 'client'
      });
      await client.save();
    }

    // Get or create test hauler
    let hauler = await User.findOne({ email: 'john.smith@trucker.com' });
    if (!hauler) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      hauler = new User({
        name: 'John Smith',
        email: 'john.smith@trucker.com',
        password: hashedPassword,
        role: 'hauler'
      });
      await hauler.save();
    }

    // Get or create test client 2
    let client2 = await User.findOne({ email: 'alice.manager@example.com' });
    if (!client2) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      client2 = new User({
        name: 'Alice Manager',
        email: 'alice.manager@example.com',
        password: hashedPassword,
        role: 'client'
      });
      await client2.save();
    }

    // Get or create test client 3
    let client3 = await User.findOne({ email: 'bob.supervisor@example.com' });
    if (!client3) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      client3 = new User({
        name: 'Bob Supervisor',
        email: 'bob.supervisor@example.com',
        password: hashedPassword,
        role: 'client'
      });
      await client3.save();
    }

    // Clear existing purchase orders
    await PurchaseOrder.deleteMany({});
    console.log('Cleared existing purchase orders');

    // Create test purchase orders
    const purchaseOrders = testPurchaseOrders.map(po => ({
      ...po,
      haulerId: hauler._id,
      clientId: client._id,
      status: 'approved',
      approvedAt: Date.now(),
      approvedBy: client._id
    }));

    const insertedPOs = await PurchaseOrder.insertMany(purchaseOrders);
    console.log('Inserted test purchase orders:', insertedPOs);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedPurchaseOrders(); 