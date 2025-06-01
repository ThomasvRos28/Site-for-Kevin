const mongoose = require('mongoose');
const Trucker = require('../models/Trucker');
const config = require('../config');

const testTruckers = [
  {
    driverName: 'John Smith',
    driverCode: '123',
    loads: []
  },
  {
    driverName: 'Mike Johnson',
    driverCode: '456',
    loads: []
  }
];

async function seedTruckers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing truckers
    await Trucker.deleteMany({});
    console.log('Cleared existing truckers');

    // Insert test truckers
    const insertedTruckers = await Trucker.insertMany(testTruckers);
    console.log('Inserted test truckers:', insertedTruckers);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedTruckers(); 