import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TicketList from './TicketList'
import ExportButton from './ExportButton'
import SendInvoicesButton from './SendInvoicesButton'
import ReportingTools from './ReportingTools'
import './MaterialTicketing.css'

interface Ticket {
  id: string
  clientId: string
  clientName: string
  description: string
  fileName: string
  filePath: string
  fileSize: number
  uploadDate: string
  status: string
  imageUrl?: string
  cloudFilePath?: string
  // Additional manual ticket fields
  date?: string
  jobProjectId?: string
  materialType?: string
  loadQuantity?: string
  loadUnit?: string
  ticketNumber?: string
  driverName?: string
  isManualEntry?: boolean
}

const MaterialTicketing = () => {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [showReporting, setShowReporting] = useState(false)
  const [clients, setClients] = useState<any[]>([])

  // Check if user is admin
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true'
    if (!isAdmin) {
      navigate('/')
      return
    }
  }, [navigate])

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

  const fetchTickets = async (page = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/tickets?page=${page}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
        setCurrentPage(data.currentPage)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  useEffect(() => {
    fetchTickets()
    fetchClients()
  }, [])

  const handleTicketSelect = (ticketId: string, selected: boolean) => {
    if (selected) {
      setSelectedTickets([...selectedTickets, ticketId])
    } else {
      setSelectedTickets(selectedTickets.filter(id => id !== ticketId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTickets(tickets.map(ticket => ticket.id))
    } else {
      setSelectedTickets([])
    }
  }

  const handlePageChange = (page: number) => {
    fetchTickets(page)
  }

  return (
    <div className="material-ticketing">
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
              <h1>Material Ticketing</h1>
              <p>View and analyze material tickets</p>
            </div>
          </div>
        </div>
      </header>

      <main className="page-main">
        <div className="content-grid">
          {/* Actions Section */}
          <section className="actions-section">
            <h2>Actions</h2>
            <div className="action-buttons">
              <button
                className="archive-button"
                onClick={() => navigate('/ticket-archive')}
              >
                📋 View Archive
              </button>
              <button
                className="reporting-button"
                onClick={() => setShowReporting(!showReporting)}
              >
                📊 {showReporting ? 'Hide Reports' : 'Advanced Reports'}
              </button>
              <ExportButton tickets={tickets} />
              <SendInvoicesButton
                selectedTickets={selectedTickets}
                onInvoicesSent={() => setSelectedTickets([])}
              />
            </div>
            <p className="selection-info">
              {selectedTickets.length} ticket(s) selected
            </p>
          </section>

          {/* Tickets List Section */}
          <section className="tickets-section">
            <h2>All Tickets</h2>
            {loading ? (
              <div className="loading">Loading tickets...</div>
            ) : (
              <TicketList
                tickets={tickets}
                selectedTickets={selectedTickets}
                onTicketSelect={handleTicketSelect}
                onSelectAll={handleSelectAll}
                onEditTicket={() => {}}
                onDeleteTicket={() => {}}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </section>
        </div>

        {/* Reporting Section */}
        {showReporting && (
          <section className="reporting-section">
            <ReportingTools tickets={tickets} clients={clients} />
          </section>
        )}
      </main>
    </div>
  )
}

export default MaterialTicketing
