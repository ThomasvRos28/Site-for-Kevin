const mongoose = require('mongoose');

const truckerSchema = new mongoose.Schema({
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  driverCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  loads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Load'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trucker', truckerSchema); 