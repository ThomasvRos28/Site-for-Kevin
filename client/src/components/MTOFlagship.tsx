import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadTickets from './MTO/UploadTickets'
import UpdateTickets from './MTO/UpdateTickets'
import ViewExportTickets from './MTO/ViewExportTickets'
import Dashboard from './MTO/Dashboard'
import SendInvoices from './MTO/SendInvoices'
import './MTOFlagship.css'

// Mock data for tickets
const mockTickets = [
  {
    id: 'TK-001',
    client: 'ABC Corporation',
    project: 'Highway Construction',
    date: '2025-01-15',
    material: 'Concrete',
    quantity: 25.5,
    unit: 'tons',
    price: 2550.00,
    status: 'completed',
    ticketNumber: 'ABC-001',
    loadSite: 'Main Quarry',
    dumpSite: 'Highway Mile 15',
    fileName: 'ticket_abc_001.pdf'
  },
  {
    id: 'TK-002',
    client: 'XYZ Industries',
    project: 'Office Building',
    date: '2025-01-16',
    material: 'Gravel',
    quantity: 18.0,
    unit: 'tons',
    price: 1440.00,
    status: 'pending',
    ticketNumber: 'XYZ-002',
    loadSite: 'North Pit',
    dumpSite: 'Downtown Site',
    fileName: 'ticket_xyz_002.pdf'
  },
  {
    id: 'TK-003',
    client: 'Tech Solutions Ltd',
    project: 'Data Center',
    date: '2025-01-17',
    material: 'Sand',
    quantity: 12.3,
    unit: 'tons',
    price: 984.00,
    status: 'in-progress',
    ticketNumber: 'TSL-003',
    loadSite: 'South Quarry',
    dumpSite: 'Tech Park',
    fileName: 'ticket_tsl_003.pdf'
  },
  {
    id: 'TK-004',
    client: 'ABC Corporation',
    project: 'Bridge Project',
    date: '2025-01-18',
    material: 'Concrete',
    quantity: 30.0,
    unit: 'tons',
    price: 3000.00,
    status: 'completed',
    ticketNumber: 'ABC-004',
    loadSite: 'Main Quarry',
    dumpSite: 'Bridge Site A',
    fileName: 'ticket_abc_004.pdf'
  },
  {
    id: 'TK-005',
    client: 'XYZ Industries',
    project: 'Warehouse',
    date: '2025-01-19',
    material: 'Asphalt',
    quantity: 22.7,
    unit: 'tons',
    price: 2270.00,
    status: 'pending',
    ticketNumber: 'XYZ-005',
    loadSite: 'East Plant',
    dumpSite: 'Industrial Zone',
    fileName: 'ticket_xyz_005.pdf'
  }
]

// Mock client data
const mockClients = [
  { id: '1', name: 'ABC Corporation', email: 'billing@abc.com', phone: '+1-555-0123' },
  { id: '2', name: 'XYZ Industries', email: 'accounts@xyz.com', phone: '+1-555-0456' },
  { id: '3', name: 'Tech Solutions Ltd', email: 'finance@techsolutions.com', phone: '+1-555-0789' }
]

type MTOSection = 'upload' | 'update' | 'view' | 'dashboard' | 'invoices'

const MTOFlagship = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<MTOSection>('dashboard')
  const [tickets, setTickets] = useState(mockTickets)
  const [clients] = useState(mockClients)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)

  // Load company settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('materialflow-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.logoPreview) {
          setCompanyLogo(settings.logoPreview)
        }
      } catch (error) {
        console.error('Error loading company settings:', error)
      }
    }
  }, [])

  const mtoSections = [
    { id: 'dashboard' as MTOSection, name: 'Dashboard', icon: '📊' },
    { id: 'upload' as MTOSection, name: 'Upload Tickets', icon: '📤' },
    { id: 'update' as MTOSection, name: 'Update Tickets', icon: '✏️' },
    { id: 'view' as MTOSection, name: 'View & Export', icon: '📋' },
    { id: 'invoices' as MTOSection, name: 'Send Invoices', icon: '💰' },
  ]

  const handleAddTicket = (ticketData: any) => {
    const newTicket = {
      id: `TK-${String(tickets.length + 1).padStart(3, '0')}`,
      ...ticketData,
      status: 'pending'
    }
    setTickets([...tickets, newTicket])
  }

  const handleUpdateTicket = (ticketId: string, updates: any) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ))
  }

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(tickets.filter(ticket => ticket.id !== ticketId))
  }

  return (
    <div className="mto-flagship">
      <header className="page-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <div className="page-brand">
            {companyLogo && (
              <img
                src={companyLogo}
                alt="Company Logo"
                className="page-logo"
              />
            )}
            <div className="page-title">
              <h1>MTO's Flagship</h1>
              <p>Material Ticketing Operations - Advanced Management Suite</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mto-container">
        <nav className="mto-sidebar">
          <h3>MTO Operations</h3>
          <ul className="mto-nav">
            {mtoSections.map(section => (
              <li key={section.id}>
                <button
                  className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="nav-icon">{section.icon}</span>
                  <span className="nav-text">{section.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="mto-content">
          {activeSection === 'dashboard' && (
            <Dashboard tickets={tickets} clients={clients} />
          )}

          {activeSection === 'upload' && (
            <UploadTickets
              clients={clients}
              onTicketAdded={handleAddTicket}
            />
          )}

          {activeSection === 'update' && (
            <UpdateTickets
              tickets={tickets}
              clients={clients}
              onUpdateTicket={handleUpdateTicket}
              onDeleteTicket={handleDeleteTicket}
            />
          )}

          {activeSection === 'view' && (
            <ViewExportTickets
              tickets={tickets}
              clients={clients}
            />
          )}

          {activeSection === 'invoices' && (
            <SendInvoices
              tickets={tickets}
              clients={clients}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default MTOFlagship
