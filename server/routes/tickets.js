const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const Ticket = require('../models/Ticket');
const PurchaseOrder = require('../models/PurchaseOrder');
const turf = require('@turf/turf');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create a new ticket
router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('Received ticket creation request:', req.body);
    const { poId, location } = req.body;
    if (!poId || !location) {
      return res.status(400).json({ error: 'poId and location are required' });
    }
    const { lat, lng } = typeof location === 'string' ? JSON.parse(location) : location;
    // Fetch the PO and its geofence
    const po = await PurchaseOrder.findById(poId);
    if (!po || !po.geofence) {
      return res.status(400).json({ error: 'PO or geofence not found' });
    }
    let isInside = false;
    if (po.geofence.type === 'Polygon' && Array.isArray(po.geofence.coordinates) && po.geofence.coordinates.length > 0) {
      const polygon = turf.polygon([po.geofence.coordinates]);
      isInside = turf.booleanPointInPolygon(turf.point([lng, lat]), polygon);
    } else if (po.geofence.type === 'Circle' && Array.isArray(po.geofence.center) && po.geofence.radius) {
      const center = turf.point(po.geofence.center);
      const pt = turf.point([lng, lat]);
      isInside = turf.booleanPointInCircle(pt, center, po.geofence.radius / 1000); // radius in km
    }
    if (!isInside) {
      return res.status(400).json({ error: 'Location is outside the allowed geofence for this PO.' });
    }
    const ticketData = {
      ...req.body,
      fileName: req.file ? req.file.originalname : null,
      filePath: req.file ? req.file.filename : null,
      fileSize: req.file ? req.file.size : null
    };
    console.log('Processed ticket data:', ticketData);
    const ticket = new Ticket(ticketData);
    await ticket.save();
    console.log('Ticket created successfully:', ticket);
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationErrors 
      });
    }
    res.status(500).json({ error: 'Error creating ticket' });
  }
});

// Get all tickets
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/tickets request received');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log(`Fetching tickets - page: ${page}, limit: ${limit}, skip: ${skip}`);

    const [tickets, total] = await Promise.all([
      Ticket.find()
        .sort({ uploadDate: -1 })
        .skip(skip)
        .limit(limit),
      Ticket.countDocuments()
    ]);

    console.log(`Found ${tickets.length} tickets out of ${total} total`);

    res.json({
      tickets,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTickets: total
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Error fetching tickets' });
  }
});

// Get a single ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Error fetching ticket' });
  }
});

// Update a ticket
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      fileName: req.file ? req.file.originalname : undefined,
      filePath: req.file ? req.file.filename : undefined,
      fileSize: req.file ? req.file.size : undefined
    };

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      ticketData,
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Error updating ticket' });
  }
});

// Delete a ticket
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Delete associated file if it exists
    if (ticket.filePath) {
      const filePath = path.join(__dirname, '..', 'uploads', ticket.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Error deleting ticket' });
  }
});

// Get daily tickets for a client
router.get('/daily/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { date } = req.query;

    const tickets = await Ticket.find({
      clientId,
      date,
      isManualEntry: true
    }).sort({ uploadDate: -1 });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching daily tickets:', error);
    res.status(500).json({ error: 'Error fetching daily tickets' });
  }
});

// Export tickets and send via email
router.post('/export', async (req, res) => {
  try {
    const { clientId, clientEmail, tickets } = req.body;

    // Create email transporter
    const transporter = nodemailer.createTransport({
      // Configure your email service here
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Create HTML content for the email
    const htmlContent = `
      <h2>Daily Ticket Report - ${new Date().toLocaleDateString()}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Ticket #</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Customer</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Truck #</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Time</th>
          </tr>
        </thead>
        <tbody>
          ${tickets.map(ticket => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${ticket.dumpingTicketNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${ticket.customer}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${ticket.truckNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${ticket.timeIn} - ${ticket.timeOut}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Attach ticket images
    const attachments = await Promise.all(
      tickets
        .filter(ticket => ticket.filePath)
        .map(async ticket => {
          const filePath = path.join(__dirname, '..', 'uploads', ticket.filePath);
          try {
            const fileContent = await readFile(filePath);
            return {
              filename: ticket.fileName,
              content: fileContent
            };
          } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            return null;
          }
        })
    );

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: clientEmail,
      subject: `Daily Ticket Report - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
      attachments: attachments.filter(Boolean)
    });

    res.json({ message: 'Tickets exported successfully' });
  } catch (error) {
    console.error('Error exporting tickets:', error);
    res.status(500).json({ error: 'Error exporting tickets' });
  }
});

module.exports = router; 