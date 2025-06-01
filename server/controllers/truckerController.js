const Trucker = require('../models/Trucker');

// Login trucker
exports.login = async (req, res) => {
  console.log('Login request received:', req.body);
  try {
    const { driverName, driverCode } = req.body;

    // Validate input
    if (!driverName || !driverCode) {
      console.log('Missing credentials:', { driverName, driverCode });
      return res.status(400).json({
        success: false,
        error: 'Driver name and code are required'
      });
    }

    // Find trucker
    console.log('Searching for trucker:', { driverName: driverName.trim(), driverCode: driverCode.trim() });
    const trucker = await Trucker.findOne({
      driverName: driverName.trim(),
      driverCode: driverCode.trim()
    });

    if (!trucker) {
      console.log('Trucker not found');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    console.log('Trucker found:', trucker);
    // Return success response
    res.json({
      success: true,
      driver: {
        name: trucker.driverName,
        code: trucker.driverCode,
        id: trucker._id
      }
    });

  } catch (error) {
    console.error('Trucker login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get trucker stats
exports.getStats = async (req, res) => {
  console.log('Get stats request received for driver code:', req.params.driverCode);
  try {
    const { driverCode } = req.params;

    console.log('Searching for trucker with code:', driverCode);
    const trucker = await Trucker.findOne({ driverCode })
      .populate('loads');

    if (!trucker) {
      console.log('Trucker not found');
      return res.status(404).json({
        success: false,
        error: 'Trucker not found'
      });
    }

    console.log('Trucker found:', trucker);
    res.json({
      success: true,
      stats: {
        totalLoads: trucker.loads.length,
        loads: trucker.loads
      }
    });

  } catch (error) {
    console.error('Get trucker stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 