const express = require('express');
const router = express.Router();
const truckerController = require('../controllers/truckerController');

// Login route
router.post('/login', truckerController.login);

// Get trucker stats
router.get('/stats/:driverCode', truckerController.getStats);

module.exports = router; 