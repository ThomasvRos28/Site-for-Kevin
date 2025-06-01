const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Helper function to read JSON file
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = user.generateAuthToken();

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trucker login
router.post('/trucker/login', async (req, res) => {
  try {
    console.log('Trucker login request received:', req.body);
    const { driverName, driverCode } = req.body;

    if (!driverName || !driverCode) {
      console.log('Missing driver name or code');
      return res.status(400).json({ 
        success: false,
        error: 'Driver name and code are required' 
      });
    }

    // For development, use test credentials
    const testDrivers = [
      {
        name: 'John Smith',
        code: '123',
        loads: 3,
        description: '3 loads (Gravel, Sand, Stone)'
      },
      {
        name: 'Mike Johnson',
        code: '456',
        loads: 2,
        description: '2 loads (Concrete, Asphalt)'
      }
    ];

    // Find the driver
    const driver = testDrivers.find(d => 
      d.name.toLowerCase() === driverName.toLowerCase() && 
      d.code === driverCode
    );

    if (!driver) {
      console.log('Invalid credentials for:', driverName);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid driver name or code' 
      });
    }

    // Find or create user account for the trucker
    let user = await User.findOne({ email: `${driver.name.toLowerCase().replace(/\s+/g, '.')}@trucker.com` });
    
    if (!user) {
      // Create new user account for trucker
      user = new User({
        name: driver.name,
        email: `${driver.name.toLowerCase().replace(/\s+/g, '.')}@trucker.com`,
        password: driverCode, // Using driver code as password
        role: 'hauler'
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(driverCode, salt);

      // Save user
      await user.save();
    }

    // Generate token
    const token = user.generateAuthToken();

    console.log('Login successful for:', driver.name);
    // Return success response with token
    res.json({
      success: true,
      driver: {
        name: driver.name,
        code: driver.code,
        loads: driver.loads,
        description: driver.description
      },
      token
    });
  } catch (error) {
    console.error('Trucker login error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /trucker/stats - Get trucker statistics
router.get('/trucker/stats', async (req, res) => {
  try {
    const { driverName } = req.query;
    const TICKETS_FILE = path.join(__dirname, '../data/tickets.json'); // Correct path to tickets.json

    if (!driverName) {
      return res.status(400).json({ success: false, error: 'Driver name is required' });
    }

    const tickets = await readJsonFile(TICKETS_FILE);
    const normalizedDriverName = String(driverName).toLowerCase();

    // Filter tickets for this driver
    const driverTickets = tickets.filter(ticket =>
      ticket.driverName && String(ticket.driverName).toLowerCase().includes(normalizedDriverName)
    );

    // Calculate total loads and quantities by unit type
    const totalLoads = driverTickets.length;
    let totalCubicYards = 0;
    let totalTons = 0;
    let totalOtherUnits = 0;

    driverTickets.forEach(ticket => {
      if (ticket.loadQuantity) {
        const quantity = parseFloat(ticket.loadQuantity);
        if (!isNaN(quantity)) {
          const unit = ticket.loadUnit || '';

          if (unit.toLowerCase().includes('cubic yard') || unit.toLowerCase().includes('yard')) {
            totalCubicYards += quantity;
          } else if (unit.toLowerCase().includes('ton')) {
            totalTons += quantity;
          } else {
            totalOtherUnits += quantity;
          }
        }
      }
    });

    // Get recent loads (last 10)
    const recentLoads = driverTickets
      .sort((a, b) => new Date(b.date || b.uploadDate) - new Date(a.date || a.uploadDate))
      .slice(0, 10)
      .map(ticket => ({
        id: ticket.id,
        date: ticket.date || ticket.uploadDate,
        clientName: ticket.clientName,
        materialType: ticket.materialType || 'Material',
        loadQuantity: ticket.loadQuantity || 'N/A',
        loadUnit: ticket.loadUnit || 'N/A',
        ticketNumber: ticket.ticketNumber || 'N/A'
      }));

    // Calculate monthly stats (simplified for demo)
    const monthlyStats = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const monthTickets = driverTickets.filter(ticket => {
        const ticketDate = new Date(ticket.date || ticket.uploadDate);
        return ticketDate.getMonth() === monthDate.getMonth() &&
               ticketDate.getFullYear() === monthDate.getFullYear();
      });

      let monthCubicYards = 0;
      let monthTons = 0;
      let monthOtherUnits = 0;

      monthTickets.forEach(ticket => {
        if (ticket.loadQuantity) {
          const quantity = parseFloat(ticket.loadQuantity);
          if (!isNaN(quantity)) {
            const unit = ticket.loadUnit || '';

            if (unit.toLowerCase().includes('cubic yard') || unit.toLowerCase().includes('yard')) {
              monthCubicYards += quantity;
            } else if (unit.toLowerCase().includes('ton')) {
              monthTons += quantity;
            } else {
              monthOtherUnits += quantity;
            }
          }
        }
      });

      monthlyStats.push({
        month: monthName,
        loads: monthTickets.length,
        cubicYards: monthCubicYards,
        tons: monthTons,
        otherUnits: monthOtherUnits
      });
    }

    res.json({
      success: true,
      totalLoads,
      totalCubicYards,
      totalTons,
      totalOtherUnits,
      recentLoads,
      monthlyStats
    });
  } catch (error) {
    console.error('Fetch trucker stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trucker stats' });
  }
});

module.exports = router; 