const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  description: String,
  fileName: String,
  filePath: String,
  fileSize: Number,
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  date: {
    type: String,
    required: true
  },
  truckNumber: {
    type: String,
    required: true
  },
  cans: [{
    id: Number,
    canIn: String,
    canOut: String,
    containerSize: String
  }],
  canIn: String,
  canOut: String,
  customer: {
    type: String,
    required: true
  },
  address: String,
  city: String,
  dumpingSite: String,
  dumpingTicketNumber: {
    type: String,
    required: true
  },
  timeIn: String,
  timeOut: String,
  serviceType: String,
  containerSize: String,
  additionalChargeOrTonnage: String,
  isManualEntry: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema); 