import { useState } from 'react'
import './EditTicketForm.css'

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

interface EditTicketFormProps {
  ticket: Ticket
  onTicketUpdated: () => void
  onCancel: () => void
}

const EditTicketForm = ({ ticket, onTicketUpdated, onCancel }: EditTicketFormProps) => {
  const [description, setDescription] = useState(ticket.description)
  const [status, setStatus] = useState(ticket.status)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage('')

    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description,
          status
        })
      })

      if (response.ok) {
        setMessage('Ticket updated successfully!')
        setTimeout(() => {
          onTicketUpdated()
        }, 1000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      setMessage('Error updating ticket')
      console.error('Update error:', error)
    } finally {
      setUpdating(false)
    }
  }

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

  return (
    <div className="edit-ticket-form">
      <div className="form-header">
        <h2>Edit Ticket</h2>
        <button className="close-button" onClick={onCancel}>×</button>
      </div>

      <div className="ticket-info">
        <div className="info-row">
          <span className="label">File:</span>
          <span className="value">{ticket.fileName}</span>
        </div>
        <div className="info-row">
          <span className="label">Client:</span>
          <span className="value">{ticket.clientName}</span>
        </div>
        <div className="info-row">
          <span className="label">Size:</span>
          <span className="value">{formatFileSize(ticket.fileSize)}</span>
        </div>
        <div className="info-row">
          <span className="label">Uploaded:</span>
          <span className="value">{formatDate(ticket.uploadDate)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter ticket description..."
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="update-button"
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Ticket'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

export default EditTicketForm
