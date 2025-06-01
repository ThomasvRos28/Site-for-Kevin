const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  haulerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  haulerRates: {
    type: Map,
    of: {
      materialType: String,
      rate: Number,
      unit: String
    },
    required: true
  },
  resaleRates: {
    type: [
      {
        materialType: String,
        rate: Number,
        unit: String
      }
    ],
    default: []
  },
  jobDetails: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Add geofence for pickup/drop-off validation
  geofence: {
    type: {
      type: String,
      enum: ['Polygon', 'Circle'],
      default: 'Polygon'
    },
    coordinates: {
      type: Array, // For Polygon: [ [lng, lat], ... ]
      default: []
    },
    center: {
      type: [Number], // For Circle: [lng, lat]
      default: undefined
    },
    radius: Number // meters, for Circle
  },
  // Link tickets to this PO
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }]
});

// Update the updatedAt timestamp before saving
purchaseOrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema); 