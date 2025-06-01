const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const auth = require('../middleware/auth');

// Create a new PO
router.post('/', auth, async (req, res) => {
  try {
    const po = new PurchaseOrder({
      haulerId: req.user._id,
      clientId: req.body.clientId,
      haulerRates: req.body.haulerRates,
      resaleRates: req.body.resaleRates || [],
      jobDetails: req.body.jobDetails,
      geofence: req.body.geofence
    });

    await po.save();
    res.status(201).json(po);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all POs for a client
router.get('/client', auth, async (req, res) => {
  try {
    const pos = await PurchaseOrder.find({ clientId: req.user._id })
      .populate('haulerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all POs for a hauler
router.get('/hauler', auth, async (req, res) => {
  try {
    const pos = await PurchaseOrder.find({ haulerId: req.user._id })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update PO status (approve/reject)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ message: 'PO not found' });
    }

    if (po.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    po.status = req.body.status;
    if (req.body.status === 'approved') {
      po.approvedAt = Date.now();
      po.approvedBy = req.user._id;
    }

    await po.save();
    res.json(po);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update PO details
router.patch('/:id', auth, async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ message: 'PO not found' });
    }

    if (po.haulerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (po.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot modify approved/rejected PO' });
    }

    Object.assign(po, req.body);
    await po.save();
    res.json(po);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH resale rates and approve PO (client)
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ message: 'PO not found' });
    }
    if (po.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Allow client to add resale rates and approve
    po.resaleRates = req.body.resaleRates || po.resaleRates;
    po.status = 'approved';
    po.approvedAt = Date.now();
    po.approvedBy = req.user._id;
    await po.save();
    res.json(po);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 