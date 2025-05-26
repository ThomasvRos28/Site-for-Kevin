const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const { db, bucket } = require('./firebase-config');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

async function ensureDirectories() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Data storage files
const TICKETS_FILE = path.join(dataDir, 'tickets.json');
const CLIENTS_FILE = path.join(dataDir, 'clients.json');

// Initialize data files
async function initializeData() {
  try {
    // Initialize tickets file
    try {
      await fs.access(TICKETS_FILE);
    } catch {
      await fs.writeFile(TICKETS_FILE, JSON.stringify([], null, 2));
    }

    // Initialize clients file with sample data
    try {
      await fs.access(CLIENTS_FILE);
    } catch {
      const sampleClients = [
        { id: '1', name: 'ABC Corporation', email: 'contact@abc.com' },
        { id: '2', name: 'XYZ Industries', email: 'info@xyz.com' },
        { id: '3', name: 'Tech Solutions Ltd', email: 'support@techsolutions.com' }
      ];
      await fs.writeFile(CLIENTS_FILE, JSON.stringify(sampleClients, null, 2));
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Helper functions
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Routes

// GET /api/clients - Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await readJsonFile(CLIENTS_FILE);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// POST /api/tickets/upload - Upload a ticket
app.post('/api/tickets/upload', upload.single('file'), async (req, res) => {
  try {
    const { clientId, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    const tickets = await readJsonFile(TICKETS_FILE);
    const clients = await readJsonFile(CLIENTS_FILE);

    const client = clients.find(c => c.id === clientId);
    if (!client) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    const newTicket = {
      id: uuidv4(),
      clientId,
      clientName: client.name,
      description: description || '',
      fileName: req.file.originalname,
      filePath: req.file.filename,
      fileSize: req.file.size,
      uploadDate: new Date().toISOString(),
      status: 'pending'
    };

    tickets.push(newTicket);
    await writeJsonFile(TICKETS_FILE, tickets);

    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload ticket' });
  }
});

// POST /api/tickets/manual - Create a manual ticket with Firebase storage
app.post('/api/tickets/manual', upload.single('ticketImage'), async (req, res) => {
  try {
    const {
      clientId,
      clientName,
      description,
      fileName,
      status,
      date,
      jobProjectId,
      materialType,
      loadQuantity,
      ticketNumber,
      driverName,
      isManualEntry
    } = req.body;

    if (!clientId || !ticketNumber || !materialType || !loadQuantity) {
      return res.status(400).json({ error: 'Client ID, ticket number, material type, and load quantity are required' });
    }

    const tickets = await readJsonFile(TICKETS_FILE);
    const clients = await readJsonFile(CLIENTS_FILE);

    const client = clients.find(c => c.id === clientId);
    if (!client) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    let imageUrl = '';
    let cloudFilePath = '';

    // Upload image to Firebase Storage if provided
    if (req.file) {
      try {
        const fileExtension = path.extname(req.file.originalname);
        const cloudFileName = `tickets/${ticketNumber}-${Date.now()}${fileExtension}`;

        // Read the uploaded file
        const fileBuffer = await fs.readFile(req.file.path);

        // Upload to Firebase Storage (mock for demo)
        const file = bucket.file(cloudFileName);
        await file.save(fileBuffer, {
          metadata: {
            contentType: req.file.mimetype,
          },
        });

        // Make the file publicly accessible
        await file.makePublic();

        // Get the public URL
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-09-2491'
        });

        imageUrl = url;
        cloudFilePath = cloudFileName;

        console.log(`Image uploaded to Firebase Storage: ${cloudFileName}`);
      } catch (uploadError) {
        console.error('Firebase upload error:', uploadError);
        // Continue without image if upload fails
      }
    }

    const newTicket = {
      id: uuidv4(),
      clientId,
      clientName: client.name,
      description: description || '',
      fileName: fileName || `Ticket-${ticketNumber}-${materialType}`,
      filePath: req.file ? req.file.filename : '', // Local file path for backward compatibility
      fileSize: req.file ? req.file.size : 0,
      imageUrl: imageUrl, // Firebase Storage URL
      cloudFilePath: cloudFilePath, // Firebase Storage path
      uploadDate: new Date().toISOString(),
      status: status || 'pending',
      // Additional manual ticket fields
      date: date || new Date().toISOString().split('T')[0],
      jobProjectId: jobProjectId || '',
      materialType: materialType || '',
      loadQuantity: loadQuantity || '',
      ticketNumber: ticketNumber || '',
      driverName: driverName || '',
      isManualEntry: isManualEntry === 'true' || true
    };

    // Save to both local JSON and Firebase Firestore
    tickets.push(newTicket);
    await writeJsonFile(TICKETS_FILE, tickets);

    // Save to Firebase Firestore (mock for demo)
    try {
      await db.collection('tickets').add(newTicket);
      console.log('Ticket saved to Firestore');
    } catch (firestoreError) {
      console.error('Firestore save error:', firestoreError);
    }

    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Manual ticket creation error:', error);
    res.status(500).json({ error: 'Failed to create manual ticket' });
  }
});

// GET /api/tickets - Get tickets with filtering and pagination
app.get('/api/tickets', async (req, res) => {
  try {
    const { page = 1, limit = 10, clientId, status } = req.query;
    let tickets = await readJsonFile(TICKETS_FILE);

    // Apply filters
    if (clientId) {
      tickets = tickets.filter(ticket => ticket.clientId === clientId);
    }
    if (status) {
      tickets = tickets.filter(ticket => ticket.status === status);
    }

    // Sort by upload date (newest first)
    tickets.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

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

// PATCH /api/tickets/:id - Update ticket information
app.patch('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const tickets = await readJsonFile(TICKETS_FILE);
    const ticketIndex = tickets.findIndex(ticket => ticket.id === id);

    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update ticket with provided fields
    tickets[ticketIndex] = { ...tickets[ticketIndex], ...updates };
    await writeJsonFile(TICKETS_FILE, tickets);

    res.json(tickets[ticketIndex]);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// DELETE /api/tickets/:id - Delete a ticket
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fs = require('fs').promises;
    const path = require('path');

    const tickets = await readJsonFile(TICKETS_FILE);
    const ticketIndex = tickets.findIndex(ticket => ticket.id === id);

    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = tickets[ticketIndex];

    // Delete the associated file if it exists
    if (ticket.filePath) {
      const filePath = path.join(__dirname, 'uploads', ticket.filePath);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (fileError) {
        console.warn(`Could not delete file ${filePath}:`, fileError.message);
        // Continue with ticket deletion even if file deletion fails
      }
    }

    // Remove ticket from array
    tickets.splice(ticketIndex, 1);
    await writeJsonFile(TICKETS_FILE, tickets);

    res.json({
      message: 'Ticket deleted successfully',
      deletedTicket: ticket
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

// POST /api/invoices/send - Send invoices via email
app.post('/api/invoices/send', async (req, res) => {
  try {
    const { ticketIds, recipientEmail } = req.body;

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ error: 'Ticket IDs are required' });
    }

    if (!recipientEmail) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    const tickets = await readJsonFile(TICKETS_FILE);
    const selectedTickets = tickets.filter(ticket => ticketIds.includes(ticket.id));

    if (selectedTickets.length === 0) {
      return res.status(404).json({ error: 'No valid tickets found' });
    }

    // For demo purposes, we'll just log the email sending
    // In a real application, you would configure nodemailer with actual SMTP settings
    console.log('Sending invoice email to:', recipientEmail);
    console.log('Selected tickets:', selectedTickets.map(t => ({ id: t.id, fileName: t.fileName })));

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      message: 'Invoices sent successfully',
      sentTickets: selectedTickets.length,
      recipientEmail
    });
  } catch (error) {
    console.error('Send invoices error:', error);
    res.status(500).json({ error: 'Failed to send invoices' });
  }
});

// GET /api/tickets/archive - Get all tickets for archive with filtering
app.get('/api/tickets/archive', async (req, res) => {
  try {
    const { clientId, startDate, endDate, page = 1, limit = 50 } = req.query;
    let tickets = await readJsonFile(TICKETS_FILE);

    // Apply filters
    if (clientId) {
      tickets = tickets.filter(ticket => ticket.clientId === clientId);
    }

    if (startDate) {
      const start = new Date(startDate);
      tickets = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.date || ticket.uploadDate);
        return ticketDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      tickets = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.date || ticket.uploadDate);
        return ticketDate <= end;
      });
    }

    // Sort by date (newest first)
    tickets.sort((a, b) => {
      const dateA = new Date(a.date || a.uploadDate);
      const dateB = new Date(b.date || b.uploadDate);
      return dateB - dateA;
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTickets = tickets.slice(startIndex, endIndex);

    res.json({
      tickets: paginatedTickets,
      totalCount: tickets.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(tickets.length / limit),
      filters: { clientId, startDate, endDate }
    });
  } catch (error) {
    console.error('Fetch archive tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch archive tickets' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  await ensureDirectories();
  await initializeData();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error);
