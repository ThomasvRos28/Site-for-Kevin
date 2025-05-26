import { useState, useEffect } from 'react'
import ManualTicketForm from './ManualTicketForm'
import './UploadTicketForm.css'

interface Client {
  id: string
  name: string
  email: string
}

interface UploadTicketFormProps {
  onTicketUploaded: () => void
}

const UploadTicketForm = ({ onTicketUploaded }: UploadTicketFormProps) => {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'manual'>('file')
  const [clients, setClients] = useState<Client[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !selectedClientId) {
      setMessage('Please select a file and client')
      return
    }

    setUploading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('clientId', selectedClientId)
    formData.append('description', description)

    try {
      const response = await fetch('http://localhost:5000/api/tickets/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setMessage('Ticket uploaded successfully!')
        setSelectedFile(null)
        setSelectedClientId('')
        setDescription('')
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''

        onTicketUploaded()
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      setMessage('Error uploading ticket')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-ticket-container">
      {/* Upload Method Selection */}
      <div className="upload-method-selector">
        <div className="method-tabs">
          <button
            type="button"
            className={`method-tab ${uploadMethod === 'file' ? 'active' : ''}`}
            onClick={() => setUploadMethod('file')}
          >
            📁 File Upload
          </button>
          <button
            type="button"
            className={`method-tab ${uploadMethod === 'manual' ? 'active' : ''}`}
            onClick={() => setUploadMethod('manual')}
          >
            ✏️ Manual Entry
          </button>
        </div>
      </div>

      {/* File Upload Form */}
      {uploadMethod === 'file' && (
        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="file-input">Select File:</label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              required
            />
            {selectedFile && (
              <div className="file-info">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="client-select">Client:</label>
            <select
              id="client-select"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional):</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter ticket description..."
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="upload-button"
            disabled={uploading || !selectedFile || !selectedClientId}
          >
            {uploading ? 'Uploading...' : 'Upload Ticket'}
          </button>

          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </form>
      )}

      {/* Manual Entry Form */}
      {uploadMethod === 'manual' && (
        <ManualTicketForm onTicketCreated={onTicketUploaded} />
      )}
    </div>
  )
}

export default UploadTicketForm
