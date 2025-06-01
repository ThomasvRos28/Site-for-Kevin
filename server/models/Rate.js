const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['hauling', 'material'],
    required: true
  },
  materialType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialType',
    required: function() {
      return this.type === 'material';
    }
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  unitOfMeasure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UnitOfMeasure',
    required: true
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient rate lookups
rateSchema.index({ type: 1, materialType: 1, effectiveDate: -1 });

module.exports = mongoose.model('Rate', rateSchema); 