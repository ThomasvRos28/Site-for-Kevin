import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './TicketArchive.css'
import TicketDetailModal from './TicketDetailModal'
import ExportButton from './ExportButton'
import ReportingTools from './ReportingTools'

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

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

const TicketArchive = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<Ticket | null>(null)
  const [showReporting, setShowReporting] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    clientId: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchClients()
    fetchArchiveTickets()
  }, [currentPage, filters])

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

  const fetchArchiveTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })

      if (filters.clientId) params.append('clientId', filters.clientId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`http://localhost:5000/api/tickets/archive?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
        setCurrentPage(data.currentPage)
        setTotalPages(data.totalPages)
        setTotalCount(data.totalCount)
      }
    } catch (error) {
      console.error('Error fetching archive tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setFilters({
      clientId: '',
      startDate: '',
      endDate: ''
    })
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }



  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ff9800'
      case 'processing': return '#2196f3'
      case 'completed': return '#4caf50'
      case 'rejected': return '#f44336'
      default: return '#757575'
    }
  }

  const handleImageClick = (ticket: Ticket) => {
    if (ticket.imageUrl) {
      window.open(ticket.imageUrl, '_blank')
    } else if (ticket.filePath) {
      window.open(`http://localhost:5000/${ticket.filePath}`, '_blank')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="ticket-archive">
      <header className="page-header">
        <div className="header-content">
          <button
            className="back-button"
            onClick={() => navigate('/material-ticketing')}
          >
            ← Back to Material Ticketing
          </button>
          <h1>Saved Tickets Archive</h1>
          <p className="subtitle">Complete history of all submitted tickets</p>
        </div>
      </header>

      <main className="archive-main">
        {/* Filters Section */}
        <section className="filters-section">
          <h2>Filter Tickets</h2>
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="client-filter">Client:</label>
              <select
                id="client-filter"
                value={filters.clientId}
                onChange={(e) => handleFilterChange('clientId', e.target.value)}
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="start-date">Start Date:</label>
              <input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="end-date">End Date:</label>
              <input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </section>

        {/* Results Summary */}
        <section className="results-summary">
          <div className="summary-content">
            <p>
              Showing {tickets.length} of {totalCount} tickets
              {(filters.clientId || filters.startDate || filters.endDate) && ' (filtered)'}
            </p>
            <div className="summary-actions">
              {tickets.length > 0 && (
                <>
                  <button
                    className="reporting-button"
                    onClick={() => setShowReporting(!showReporting)}
                  >
                    📊 {showReporting ? 'Hide Reports' : 'Advanced Reports'}
                  </button>
                  <ExportButton tickets={tickets} />
                </>
              )}
            </div>
          </div>
        </section>

        {/* Tickets Table */}
        <section className="tickets-table-section">
          {loading ? (
            <div className="loading">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <h3>No tickets found</h3>
              <p>Try adjusting your filters or create some tickets first.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Ticket #</th>
                    <th>Client</th>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Driver</th>
                    <th>{t('common.status')}</th>
                    <th>Image</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr
                      key={ticket.id}
                      className="clickable-row"
                      onClick={() => setSelectedTicketForDetail(ticket)}
                      title="Click to view detailed information"
                    >
                      <td>{formatDate(ticket.date || ticket.uploadDate)}</td>
                      <td className="ticket-number">
                        {ticket.ticketNumber || ticket.fileName}
                      </td>
                      <td>{ticket.clientName}</td>
                      <td>{ticket.materialType || 'N/A'}</td>
                      <td>{ticket.loadQuantity || 'N/A'}</td>
                      <td>{ticket.driverName || 'N/A'}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(ticket.status) }}
                        >
                          {t(`tickets.status.${ticket.status}`)}
                        </span>
                      </td>
                      <td>
                        {(ticket.imageUrl || ticket.filePath) ? (
                          <button
                            className="image-link"
                            onClick={() => handleImageClick(ticket)}
                            title="Click to view image"
                          >
                            📷 View
                          </button>
                        ) : (
                          <span className="no-image">No image</span>
                        )}
                      </td>
                      <td>
                        <span className={`type-badge ${ticket.isManualEntry ? 'manual' : 'file'}`}>
                          {ticket.isManualEntry ? 'Manual' : 'File'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <section className="pagination-section">
            <div className="pagination">
              <button
                className="page-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 2) + i
                  if (page > totalPages) return null
                  return (
                    <button
                      key={page}
                      className={`page-number ${page === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                className="page-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* Reporting Section */}
        {showReporting && (
          <section className="reporting-section">
            <ReportingTools tickets={tickets} clients={clients} />
          </section>
        )}
      </main>

      {/* Ticket Detail Modal */}
      {selectedTicketForDetail && (
        <TicketDetailModal
          ticket={selectedTicketForDetail}
          onClose={() => setSelectedTicketForDetail(null)}
        />
      )}
    </div>
  )
}

export default TicketArchive
