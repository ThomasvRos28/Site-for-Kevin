import { useState } from 'react'
import './TicketDetailModal.css'

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

interface TicketDetailModalProps {
  ticket: Ticket
  onClose: () => void
  onEdit?: (ticket: Ticket) => void
  onDelete?: (ticketId: string) => void
}

const TicketDetailModal = ({ ticket, onClose, onEdit, onDelete }: TicketDetailModalProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed': return '#4CAF50'
      case 'processing': return '#FF9800'
      case 'pending': return '#2196F3'
      case 'rejected': return '#f44336'
      default: return '#9E9E9E'
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(ticket)
      onClose()
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(ticket.id)
      onClose()
    }
  }

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log(`${fieldName} copied to clipboard: ${text}`)
    })
  }

  return (
    <div className="ticket-detail-modal-overlay" onClick={onClose}>
      <div className="ticket-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <h2>Ticket Details</h2>
            <div className="ticket-type-badge">
              {ticket.isManualEntry ? (
                <span className="manual-badge">Manual Entry</span>
              ) : (
                <span className="upload-badge">File Upload</span>
              )}
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Status Section */}
          <div className="detail-section">
            <h3>Status Information</h3>
            <div className="detail-grid">
              <div className="detail-item clickable" onClick={() => copyToClipboard(ticket.status, 'Status')}>
                <span className="label">Status:</span>
                <span
                  className="value status-value"
                  style={{ backgroundColor: getStatusColor(ticket.status) }}
                >
                  {ticket.status}
                </span>
              </div>
              <div className="detail-item clickable" onClick={() => copyToClipboard(ticket.id, 'Ticket ID')}>
                <span className="label">Ticket ID:</span>
                <span className="value">{ticket.id}</span>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item clickable" onClick={() => copyToClipboard(ticket.fileName, 'File Name')}>
                <span className="label">File Name:</span>
                <span className="value">{ticket.fileName}</span>
              </div>
              <div className="detail-item clickable" onClick={() => copyToClipboard(ticket.clientName, 'Client Name')}>
                <span className="label">Client:</span>
                <span className="value">{ticket.clientName}</span>
              </div>
              <div className="detail-item clickable" onClick={() => copyToClipboard(formatDate(ticket.uploadDate), 'Upload Date')}>
                <span className="label">Upload Date:</span>
                <span className="value">{formatDate(ticket.uploadDate)}</span>
              </div>
              {ticket.fileSize > 0 && (
                <div className="detail-item clickable" onClick={() => copyToClipboard(formatFileSize(ticket.fileSize), 'File Size')}>
                  <span className="label">File Size:</span>
                  <span className="value">{formatFileSize(ticket.fileSize)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Manual Entry Fields */}
          {ticket.isManualEntry && (
            <div className="detail-section">
              <h3>Ticket Details</h3>
              <div className="detail-grid">
                {ticket.date && (
                  <div className="detail-item clickable" onClick={() => copyToClipboard(ticket.date, 'Date')}>
                    <span className="label">Date:</span>
                    <span className="value">{new Date(ticket.date).toLocaleDateString()}</span>
                  </div>
                )}
                {ticket.ticketNumber && (
                  <div className="detail-item clickable" onClick={() => copyToClipboard(ticket.ticketNumber, 'Ticket Number')}>
                    <span className="label">Ticket Number:</span>
                    <span className="value ticket-number">{ticket.ticketNumber}</span>
                  </div>
                )}
                {ticket.jobProjectId && (
                  <div className="detail-item clickable" onClick={() => copyToClipboard(ticket.jobProjectId, 'Job/Project ID')}>
                    <span className="label">Job/Project ID:</span>
                    <span className="value">{ticket.jobProjectId}</span>
                  </div>
                )}
                {ticket.materialType && (
                  <div className="detail-item clickable" onClick={() => copyToClipboard(ticket.materialType, 'Material Type')}>
                    <span className="label">Material Type:</span>
                    <span className="value material-type">{ticket.materialType}</span>
                  </div>
                )}
                {ticket.loadQuantity && (
                  <div className="detail-item clickable" onClick={() => copyToClipboard(`${ticket.loadQuantity}${ticket.loadUnit ? ` ${ticket.loadUnit}` : ''}`, 'Load Quantity')}>
                    <span className="label">Load Quantity:</span>
                    <span className="value quantity">{ticket.loadQuantity}{ticket.loadUnit && ` ${ticket.loadUnit}`}</span>
                  </div>
                )}
                {ticket.driverName && (
                  <div className="detail-item clickable" onClick={() => copyToClipboard(ticket.driverName, 'Driver Name')}>
                    <span className="label">Driver Name:</span>
                    <span className="value driver-name">{ticket.driverName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {ticket.description && (
            <div className="detail-section">
              <h3>Description/Notes</h3>
              <div className="description-content clickable" onClick={() => copyToClipboard(ticket.description, 'Description')}>
                <p>{ticket.description}</p>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {(ticket.imageUrl || ticket.filePath) && (
            <div className="detail-section">
              <h3>Attached Image</h3>
              <div className="image-preview">
                {ticket.imageUrl ? (
                  <img
                    src={ticket.imageUrl}
                    alt="Ticket attachment"
                    className="ticket-image"
                    onClick={() => window.open(ticket.imageUrl, '_blank')}
                  />
                ) : ticket.filePath && (
                  <img
                    src={`http://localhost:5000/${ticket.filePath}`}
                    alt="Ticket attachment"
                    className="ticket-image"
                    onClick={() => window.open(`http://localhost:5000/${ticket.filePath}`, '_blank')}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {onEdit && (
            <button className="edit-button" onClick={handleEdit}>
              Edit Ticket
            </button>
          )}
          {onDelete && (
            <button
              className="delete-button"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Ticket
            </button>
          )}
          <button className="close-action-button" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this ticket? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button className="confirm-delete" onClick={handleDelete}>
                  Yes, Delete
                </button>
                <button className="cancel-delete" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketDetailModal
