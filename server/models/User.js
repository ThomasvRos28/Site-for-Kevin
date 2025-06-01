const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['hauler', 'client'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { _id: this._id.toString(), role: this.role },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
  return token;
};

module.exports = mongoose.model('User', userSchema); 