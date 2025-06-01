npm install gh-pages --save-dev


### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd materialflow-dashboard
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173` to access the application

## API Endpoints

### Tickets
- `POST /api/tickets/upload` - Upload a new ticket
- `GET /api/tickets?page=1&limit=10` - Get paginated tickets
- `PATCH /api/tickets/:id` - Update ticket information

### Clients
- `GET /api/clients` - Get all clients

### Invoices
- `POST /api/invoices/send` - Send invoices for selected tickets

### Health Check
- `GET /api/health` - Server health status

## Technologies Used

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- CSS3 with modern styling
- Vite for build tooling

### Backend
- Node.js with Express
- Multer for file uploads
- Nodemailer for email functionality
- UUID for unique identifiers
- CORS for cross-origin requests

## Features in Detail

### File Upload
- Supports multiple file types (PDF, DOC, images)
- File size validation (10MB limit)
- Automatic file naming with timestamps
- Client association required

### Ticket Management
- Real-time ticket list updates
- Pagination for large datasets
- Status management (pending, processing, completed, rejected)
- Bulk selection for operations

### Export Functionality
- CSV export of all tickets
- Includes all ticket metadata
- Automatic file download

### Invoice System
- Email-based invoice sending
- Bulk invoice processing
- Mock email implementation (easily replaceable with real SMTP)

## Development Notes

- The application uses JSON files for data storage (suitable for demo/development)
- Email functionality is mocked but can be easily configured with real SMTP settings
- File uploads are stored locally in the `server/uploads` directory
- The frontend includes responsive design for mobile devices

## Future Enhancements

- Database integration (PostgreSQL, MongoDB)
- Real email service integration
- User authentication and authorization
- Advanced filtering and search
- File preview functionality
- Audit logging
- Real-time notifications

## License

This project is for demonstration purposes.
