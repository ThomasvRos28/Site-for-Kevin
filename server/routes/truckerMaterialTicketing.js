const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

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

// Helper function to write JSON file
async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// Data storage files
const TRUCKER_TICKETS_FILE = path.join(__dirname, '..', 'data', 'trucker-tickets.json');

// Initialize trucker tickets file if it doesn't exist
async function initializeTruckerTickets() {
  try {
    await fs.access(TRUCKER_TICKETS_FILE);
  } catch {
    await writeJsonFile(TRUCKER_TICKETS_FILE, []);
  }
}

// Initialize data on startup
initializeTruckerTickets().catch(console.error);

// POST /api/trucker/tickets - Create a new trucker ticket
router.post('/tickets', upload.single('file'), async (req, res) => {
  try {
    const {
      clientId,
      clientName,
      date,
      jobProjectId,
      materialType,
      loadQuantity,
      loadUnit,
      ticketNumber,
      driverName,
      description
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const tickets = await readJsonFile(TRUCKER_TICKETS_FILE);

    const newTicket = {
      id: uuidv4(),
      clientId,
      clientName,
      date: date || new Date().toISOString(),
      jobProjectId,
      materialType,
      loadQuantity,
      loadUnit,
      ticketNumber,
      driverName,
      description: description || '',
      fileName: req.file.originalname,
      filePath: req.file.filename,
      fileSize: req.file.size,
      uploadDate: new Date().toISOString(),
      status: 'pending',
      isManualEntry: false
    };

    tickets.push(newTicket);
    await writeJsonFile(TRUCKER_TICKETS_FILE, tickets);

    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// GET /api/trucker/tickets - Get trucker tickets with filtering and pagination
router.get('/tickets', async (req, res) => {
  try {
    const { page = 1, limit = 10, driverName, status } = req.query;
    let tickets = await readJsonFile(TRUCKER_TICKETS_FILE);

    // Apply filters
    if (driverName) {
      tickets = tickets.filter(ticket => ticket.driverName === driverName);
    }
    if (status) {
      tickets = tickets.filter(ticket => ticket.status === status);
    }

    // Sort by date (newest first)
    tickets.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTickets = tickets.slice(startIndex, endIndex);

    res.json({
      tickets: paginatedTickets,
      totalCount: tickets.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(tickets.length / limit)
    });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// POST /api/trucker/tickets/manual - Create a manual ticket entry
router.post('/tickets/manual', async (req, res) => {
  try {
    const {
      clientId,
      clientName,
      date,
      jobProjectId,
      materialType,
      loadQuantity,
      loadUnit,
      ticketNumber,
      driverName,
      description
    } = req.body;

    const tickets = await readJsonFile(TRUCKER_TICKETS_FILE);

    const newTicket = {
      id: uuidv4(),
      clientId,
      clientName,
      date: date || new Date().toISOString(),
      jobProjectId,
      materialType,
      loadQuantity,
      loadUnit,
      ticketNumber,
      driverName,
      description: description || '',
      uploadDate: new Date().toISOString(),
      status: 'pending',
      isManualEntry: true
    };

    tickets.push(newTicket);
    await writeJsonFile(TRUCKER_TICKETS_FILE, tickets);

    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Create manual ticket error:', error);
    res.status(500).json({ error: 'Failed to create manual ticket' });
  }
});

// GET /api/trucker/tickets/:id - Get a specific ticket
router.get('/tickets/:id', async (req, res) => {
  try {
    const tickets = await readJsonFile(TRUCKER_TICKETS_FILE);
    const ticket = tickets.find(t => t.id === req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Fetch ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// PUT /api/trucker/tickets/:id - Update a ticket
router.put('/tickets/:id', async (req, res) => {
  try {
    const tickets = await readJsonFile(TRUCKER_TICKETS_FILE);
    const index = tickets.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updatedTicket = {
      ...tickets[index],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };

    tickets[index] = updatedTicket;
    await writeJsonFile(TRUCKER_TICKETS_FILE, tickets);

    res.json(updatedTicket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// DELETE /api/trucker/tickets/:id - Delete a ticket
router.delete('/tickets/:id', async (req, res) => {
  try {
    const tickets = await readJsonFile(TRUCKER_TICKETS_FILE);
    const index = tickets.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const deletedTicket = tickets[index];
    tickets.splice(index, 1);
    await writeJsonFile(TRUCKER_TICKETS_FILE, tickets);

    res.json({ message: 'Ticket deleted successfully', ticket: deletedTicket });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

module.exports = router; 