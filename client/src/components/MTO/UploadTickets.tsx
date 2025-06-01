import { useState, useRef } from 'react'
import './UploadTickets.css'

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

interface UploadTicketsProps {
  clients: Client[]
  onTicketAdded: (ticketData: any) => void
}

const UploadTickets = ({ clients, onTicketAdded }: UploadTicketsProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    client: '',
    project: '',
    date: new Date().toISOString().split('T')[0],
    material: '',
    quantity: '',
    unit: 'tons',
    price: '',
    ticketNumber: '',
    loadSite: '',
    dumpSite: ''
  })

  const materialTypes = [
    'Concrete', 'Gravel', 'Sand', 'Asphalt', 'Stone', 'Dirt', 'Clay', 'Topsoil'
  ]

  const units = ['tons', 'cubic yards', 'cubic meters', 'loads']

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB limit
    })

    if (validFiles.length !== files.length) {
      setMessage('Some files were rejected. Only PDF and image files under 10MB are allowed.')
    }

    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedFiles.length === 0) {
      setMessage('Please select at least one file to upload')
      return
    }

    if (!formData.client || !formData.project || !formData.material) {
      setMessage('Please fill in all required fields')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create ticket data
      const ticketData = {
        ...formData,
        quantity: parseFloat(formData.quantity) || 0,
        price: parseFloat(formData.price) || 0,
        fileName: selectedFiles[0].name,
        clientName: clients.find(c => c.id === formData.client)?.name || formData.client
      }

      onTicketAdded(ticketData)

      // Reset form
      setFormData({
        client: '',
        project: '',
        date: new Date().toISOString().split('T')[0],
        material: '',
        quantity: '',
        unit: 'tons',
        price: '',
        ticketNumber: '',
        loadSite: '',
        dumpSite: ''
      })
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setMessage('Ticket uploaded successfully!')
    } catch (error) {
      setMessage('Error uploading ticket. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="upload-tickets">
      <div className="section-header">
        <h2>Upload Tickets</h2>
        <div className="upload-info">
          <span>Supported: PDF, JPG, PNG (max 10MB each)</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {/* File Upload Area */}
        <div className="upload-section">
          <div
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-zone-content">
              <div className="upload-icon">📁</div>
              <h3>Drag & drop files here</h3>
              <p>or click to browse files</p>
              <button type="button" className="btn btn-secondary">
                Choose Files
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h4>Selected Files ({selectedFiles.length})</h4>
              <div className="files-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="client">Client *</label>
            <select
              id="client"
              name="client"
              value={formData.client}
              onChange={handleInputChange}
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
            <label htmlFor="project">Project *</label>
            <input
              type="text"
              id="project"
              name="project"
              value={formData.project}
              onChange={handleInputChange}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="material">Material Type *</label>
            <select
              id="material"
              name="material"
              value={formData.material}
              onChange={handleInputChange}
              required
            >
              <option value="">Select material</option>
              {materialTypes.map(material => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="0.0"
              step="0.1"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
            >
              {units.map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticketNumber">Ticket Number</label>
            <input
              type="text"
              id="ticketNumber"
              name="ticketNumber"
              value={formData.ticketNumber}
              onChange={handleInputChange}
              placeholder="Enter ticket number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="loadSite">Load Site</label>
            <input
              type="text"
              id="loadSite"
              name="loadSite"
              value={formData.loadSite}
              onChange={handleInputChange}
              placeholder="Enter load site"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dumpSite">Dump Site</label>
            <input
              type="text"
              id="dumpSite"
              name="dumpSite"
              value={formData.dumpSite}
              onChange={handleInputChange}
              placeholder="Enter dump site"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? 'Uploading...' : 'Upload Ticket'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') || message.includes('rejected') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

export default UploadTickets
