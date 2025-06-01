import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './TicketList.css'
import TicketDetailModal from './TicketDetailModal'

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
  ticketNumber?: string
  driverName?: string
  isManualEntry?: boolean
}

interface TicketListProps {
  tickets: Ticket[]
  selectedTickets: string[]
  onTicketSelect: (ticketId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onEditTicket: (ticket: Ticket) => void
  onDeleteTicket: (ticketId: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const TicketList = ({
  tickets,
  selectedTickets,
  onTicketSelect,
  onSelectAll,
  onEditTicket,
  onDeleteTicket,
  currentPage,
  totalPages,
  onPageChange
}: TicketListProps) => {
  const { t } = useTranslation();
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<Ticket | null>(null)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const handleDeleteClick = (ticket: Ticket) => {
    if (window.confirm(`Are you sure you want to delete the ticket "${ticket.fileName}"? This action cannot be undone.`)) {
      onDeleteTicket(ticket.id)
    }
  }

  const allSelected = tickets.length > 0 && tickets.every(ticket => selectedTickets.includes(ticket.id))
  const someSelected = selectedTickets.length > 0 && !allSelected

  return (
    <div className="ticket-list">
      {tickets.length === 0 ? (
        <div className="empty-state">
          <p>No tickets found</p>
        </div>
      ) : (
        <>
          <div className="list-header">
            <label className="select-all">
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = someSelected
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
              Select All ({tickets.length})
            </label>
          </div>

          <div className="tickets-grid">
            {tickets.map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <label className="ticket-select">
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(ticket.id)}
                      onChange={(e) => onTicketSelect(ticket.id, e.target.checked)}
                    />
                  </label>
                  <div className="ticket-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(ticket.status) }}
                    >
                      {t('tickets.status.' + ticket.status)}
                    </span>
                  </div>
                </div>

                <div
                  className="ticket-content clickable-content"
                  onClick={() => setSelectedTicketForDetail(ticket)}
                  title="Click to view detailed information"
                >
                  <h3 className="ticket-title">
                    {ticket.fileName}
                    {ticket.isManualEntry && <span className="manual-badge">Manual</span>}
                  </h3>
                  <p className="ticket-client">Client: {ticket.clientName}</p>

                  {/* Manual ticket specific information */}
                  {ticket.isManualEntry && (
                    <div className="manual-ticket-details">
                      {ticket.ticketNumber && (
                        <p className="ticket-detail"><strong>Ticket #:</strong> {ticket.ticketNumber}</p>
                      )}
                      {ticket.materialType && (
                        <p className="ticket-detail"><strong>Material:</strong> {ticket.materialType}</p>
                      )}
                      {ticket.loadQuantity && (
                        <p className="ticket-detail"><strong>Quantity:</strong> {ticket.loadQuantity}</p>
                      )}
                      {ticket.driverName && (
                        <p className="ticket-detail"><strong>Driver:</strong> {ticket.driverName}</p>
                      )}
                      {ticket.jobProjectId && (
                        <p className="ticket-detail"><strong>Job/Project:</strong> {ticket.jobProjectId}</p>
                      )}
                    </div>
                  )}

                  {ticket.description && (
                    <p className="ticket-description">{ticket.description}</p>
                  )}

                  <div className="ticket-meta">
                    <span className="file-size">
                      {ticket.filePath ? formatFileSize(ticket.fileSize) : 'Manual Entry'}
                    </span>
                    <span className="upload-date">
                      {ticket.date ? `Date: ${new Date(ticket.date).toLocaleDateString()}` : formatDate(ticket.uploadDate)}
                    </span>
                  </div>
                </div>

                <div className="ticket-actions">
                  <button
                    className="edit-button"
                    onClick={() => onEditTicket(ticket)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteClick(ticket)}
                  >
                    Delete
                  </button>
                  {(ticket.imageUrl || ticket.filePath) && (
                    <a
                      href={ticket.imageUrl || `http://localhost:5000/${ticket.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-button"
                    >
                      {ticket.imageUrl ? 'View Image' : 'Download'}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-number ${page === currentPage ? 'active' : ''}`}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="page-button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicketForDetail && (
        <TicketDetailModal
          ticket={selectedTicketForDetail}
          onClose={() => setSelectedTicketForDetail(null)}
          onEdit={onEditTicket}
          onDelete={onDeleteTicket}
        />
      )}
    </div>
  )
}

export default TicketList
