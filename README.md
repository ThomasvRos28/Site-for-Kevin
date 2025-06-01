# MaterialFlow Dashboard

A comprehensive material management system with split user flows for administrators and truckers.

## Features

- **Split Login Flow**: Separate authentication paths for truckers and administrators
- **Protected Routes**: Role-based access control for different parts of the application
- **Material Ticketing**: Track and manage material tickets
- **Purchase Order Management**: Create and manage purchase orders
- **Administration Panel**: User management and system settings
- **Ticket Archive**: Historical record of all tickets
- **MTO Flagship Integration**: Connect with the MTO flagship system

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ThomasvRos28/Site-for-Kevin.git
   cd Site-for-Kevin
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

## Running the Application

1. **Start the backend server**
   ```bash
   cd server
   node index.js
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

## User Flows

### Landing Page
- The application starts with a landing page that offers two login options:
  - "Log in as Trucker" - For truck drivers and haulers
  - "Log in as Admin" - For administrators and clients

### Admin Flow
- After logging in, administrators are directed to the home page
- Access to all system features including:
  - Material Ticketing
  - Administration
  - Ticket Archive
  - MTO Flagship
  - Ticket History
  - Purchase Orders

### Trucker Flow
- After logging in, truckers are directed to trucker-specific features
- Limited access to only relevant functionality

## Deployment

### GitHub Pages Deployment

1. **Set up GitHub Pages**
   ```bash
   cd client
   npm install gh-pages --save-dev
   ```

2. **Configure Vite for GitHub Pages**
   The `vite.config.ts` file should have:
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/Site-for-Kevin/' : '/',
   ```

3. **Create GitHub Actions workflow**
   Create `.github/workflows/deploy.yml` with the appropriate configuration for automatic deployment.

4. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Update application with GitHub Pages setup"
   git push origin main-clean
   ```

5. **Set GitHub Repository Settings**
   - Go to repository Settings > Pages
   - Set source to "GitHub Actions"

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/trucker/login` - Trucker login

### Tickets
- `POST /api/tickets/upload` - Upload a new ticket
- `GET /api/tickets?page=1&limit=10` - Get paginated tickets
- `PATCH /api/tickets/:id` - Update ticket information

### Purchase Orders
- `GET /api/purchase-orders` - Get all purchase orders
- `POST /api/purchase-orders` - Create a new purchase order

### Clients
- `GET /api/clients` - Get all clients

## Technologies Used

### Frontend
- React 18 with TypeScript
- React Router for navigation and protected routes
- Axios for API calls
- CSS3 with modern styling and global variables
- Vite for build tooling

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT for authentication
- Firebase Admin SDK
- Multer for file uploads

## Features in Detail

### Authentication and Authorization
- Split login flow with role-based access
- JWT token-based authentication
- Protected routes for admin and trucker-specific features
- Local storage for maintaining session state

### Material Ticketing
- Create and manage material tickets
- Associate tickets with clients and haulers
- Track ticket status and history
- Upload supporting documents

### Purchase Order Management
- Create purchase orders with material rates
- Associate orders with clients and haulers
- Approval workflow for purchase orders
- Rate management for different material types

### Administration
- User management for admins and truckers
- System settings configuration
- API endpoint management
- Access control settings

### Responsive Design
- Mobile-friendly interface
- Consistent styling with global CSS variables
- Card-based UI components
- Intuitive navigation

## Development Notes

- The application uses MongoDB for data storage
- Authentication is handled via JWT tokens stored in localStorage
- File uploads are stored in the `server/uploads` directory
- The frontend includes responsive design for all devices
- Git repository is configured to ignore node_modules and build artifacts

## Repository Management

- The repository uses the `main-clean` branch as the primary branch
- A comprehensive `.gitignore` file prevents tracking of:
  - `node_modules` directories
  - Build artifacts
  - Environment files
  - Log files
  - Editor configuration files

## License

This project is proprietary and for demonstration purposes only.
