const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const Ticket = require('../models/Ticket');
const Rate = require('../models/Rate');
const MaterialType = require('../models/MaterialType');
const UnitOfMeasure = require('../models/UnitOfMeasure');
const excel = require('exceljs');

// Sync ticket
router.post('/tickets/sync', async (req, res) => {
  try {
    const ticket = req.body;
    const existingTicket = await Ticket.findOne({ ticketNumber: ticket.ticketNumber });
    
    if (existingTicket) {
      // Update existing ticket
      await Ticket.findByIdAndUpdate(existingTicket._id, ticket);
    } else {
      // Create new ticket
      await Ticket.create(ticket);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Ticket sync error:', error);
    res.status(500).json({ error: 'Failed to sync ticket' });
  }
});

// Sync purchase order
router.post('/purchaseorders/sync', async (req, res) => {
  try {
    const po = req.body;
    const existingPO = await PurchaseOrder.findOne({ poNumber: po.poNumber });
    
    if (existingPO) {
      // Update existing PO
      await PurchaseOrder.findByIdAndUpdate(existingPO._id, po);
    } else {
      // Create new PO
      await PurchaseOrder.create(po);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('PO sync error:', error);
    res.status(500).json({ error: 'Failed to sync purchase order' });
  }
});

// Get all rates
router.get('/rates', async (req, res) => {
  try {
    const rates = await Rate.find({
      effectiveDate: { $lte: new Date() },
      $or: [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: null }
      ]
    });
    res.json(rates);
  } catch (error) {
    console.error('Rates fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Export all data
router.get('/export/all', async (req, res) => {
  try {
    const workbook = new excel.Workbook();
    
    // Tickets sheet
    const ticketsSheet = workbook.addWorksheet('Tickets');
    const tickets = await Ticket.find().populate('poId');
    ticketsSheet.columns = [
      { header: 'Ticket Number', key: 'ticketNumber' },
      { header: 'PO Number', key: 'poNumber' },
      { header: 'Material Type', key: 'materialType' },
      { header: 'Quantity', key: 'quantity' },
      { header: 'Unit', key: 'unitOfMeasure' },
      { header: 'Date', key: 'timestamp' },
      { header: 'Location', key: 'location' }
    ];
    tickets.forEach(ticket => {
      ticketsSheet.addRow({
        ...ticket.toObject(),
        poNumber: ticket.poId?.poNumber,
        location: `${ticket.location.lat}, ${ticket.location.lng}`
      });
    });

    // Purchase Orders sheet
    const posSheet = workbook.addWorksheet('Purchase Orders');
    const pos = await PurchaseOrder.find();
    posSheet.columns = [
      { header: 'PO Number', key: 'poNumber' },
      { header: 'Status', key: 'status' },
      { header: 'Geofence Type', key: 'geofenceType' },
      { header: 'Geofence Details', key: 'geofenceDetails' }
    ];
    pos.forEach(po => {
      posSheet.addRow({
        ...po.toObject(),
        geofenceType: po.geofence?.type,
        geofenceDetails: po.geofence?.type === 'circle' 
          ? `Center: ${po.geofence.center}, Radius: ${po.geofence.radius}`
          : `Polygon: ${po.geofence.coordinates?.length} points`
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=export-${new Date().toISOString()}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router; 