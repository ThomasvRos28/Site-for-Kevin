import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadTicketForm from './UploadTicketForm'
import TicketList from './TicketList'
import EditTicketForm from './EditTicketForm'
import ExportButton from './ExportButton'
import SendInvoicesButton from './SendInvoicesButton'
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
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('MaterialFlow Dashboard')

  // Load company settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('materialflow-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.logoPreview) {
          setCompanyLogo(settings.logoPreview)
        }
        if (settings.companyName) {
          setCompanyName(settings.companyName)
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

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleTicketUploaded = () => {
    fetchTickets(currentPage)
  }

  const handleTicketUpdated = () => {
    setEditingTicket(null)
    fetchTickets(currentPage)
  }

  const handleTicketDeleted = async (ticketId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove from selected tickets if it was selected
        setSelectedTickets(prev => prev.filter(id => id !== ticketId))
        // Refresh the tickets list
        fetchTickets(currentPage)
      } else {
        const error = await response.json()
        console.error('Error deleting ticket:', error.error)
        alert(`Error deleting ticket: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
      alert('Error deleting ticket. Please try again.')
    }
  }

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
              <p>Upload, manage, and process material tickets</p>
            </div>
          </div>
        </div>
      </header>

      <main className="page-main">
        <div className="content-grid">
          {/* Upload Section */}
          <section className="upload-section">
            <h2>Upload New Ticket</h2>
            <UploadTicketForm onTicketUploaded={handleTicketUploaded} />
          </section>

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
            <h2>Tickets</h2>
            {loading ? (
              <div className="loading">Loading tickets...</div>
            ) : (
              <TicketList
                tickets={tickets}
                selectedTickets={selectedTickets}
                onTicketSelect={handleTicketSelect}
                onSelectAll={handleSelectAll}
                onEditTicket={setEditingTicket}
                onDeleteTicket={handleTicketDeleted}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </section>
        </div>
      </main>

      {/* Edit Modal */}
      {editingTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditTicketForm
              ticket={editingTicket}
              onTicketUpdated={handleTicketUpdated}
              onCancel={() => setEditingTicket(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default MaterialTicketing
