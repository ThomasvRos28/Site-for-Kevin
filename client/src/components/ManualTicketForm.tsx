import { useState, useEffect } from 'react'
import './ManualTicketForm.css'

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

interface ManualTicketFormProps {
  onTicketCreated: () => void
}

const ManualTicketForm = ({ onTicketCreated }: ManualTicketFormProps) => {
  const [clients, setClients] = useState<Client[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    jobProjectId: '',
    materialType: '',
    loadQuantity: '',
    loadUnit: '',
    ticketNumber: '',
    driverName: '',
    notes: '',
    status: 'pending'
  })

  const [selectedImage, setSelectedImage] = useState<File | null>(null)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const materialTypes = [
    'Concrete',
    'Gravel',
    'Sand',
    'Asphalt',
    'Stone',
    'Dirt',
    'Clay',
    'Topsoil',
    'Crushed Stone',
    'Fill Dirt',
    'Other'
  ]

  const loadUnits = [
    'Cubic Yards',
    'Tons',
    'Loads',
    'Cubic Feet',
    'Square Yards',
    'Linear Feet'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    // Validate required fields
    if (!formData.clientId || !formData.ticketNumber || !formData.materialType || !formData.loadQuantity || !formData.loadUnit) {
      setMessage('Please fill in all required fields (Client, Ticket Number, Material Type, Load Quantity, Load Unit)')
      setSubmitting(false)
      return
    }

    try {
      const client = clients.find(c => c.id === formData.clientId)
      if (!client) {
        setMessage('Invalid client selected')
        setSubmitting(false)
        return
      }

      // Create FormData for multipart upload (to handle image)
      const submitData = new FormData()

      // Create a descriptive filename from the ticket data
      const fileName = `Ticket-${formData.ticketNumber}-${formData.materialType}-${formData.date}`

      const ticketData = {
        id: crypto.randomUUID(),
        clientId: formData.clientId,
        clientName: client.name,
        description: formData.notes,
        fileName: fileName,
        filePath: '', // Will be set if image is uploaded
        fileSize: selectedImage ? selectedImage.size : 0,
        uploadDate: new Date().toISOString(),
        status: formData.status,
        // Additional manual ticket fields
        date: formData.date,
        jobProjectId: formData.jobProjectId,
        materialType: formData.materialType,
        loadQuantity: formData.loadQuantity,
        loadUnit: formData.loadUnit,
        ticketNumber: formData.ticketNumber,
        driverName: formData.driverName,
        isManualEntry: true
      }

      // Add ticket data to FormData
      Object.keys(ticketData).forEach(key => {
        submitData.append(key, ticketData[key as keyof typeof ticketData]?.toString() || '')
      })

      // Add image if selected
      if (selectedImage) {
        submitData.append('ticketImage', selectedImage)
      }

      const response = await fetch('http://localhost:5000/api/tickets/manual', {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        setMessage('Ticket created successfully!')
        setFormData({
          date: new Date().toISOString().split('T')[0],
          clientId: '',
          jobProjectId: '',
          materialType: '',
          loadQuantity: '',
          loadUnit: '',
          ticketNumber: '',
          driverName: '',
          notes: '',
          status: 'pending'
        })
        setSelectedImage(null)
        // Reset file input
        const fileInput = document.getElementById('ticket-image') as HTMLInputElement
        if (fileInput) fileInput.value = ''

        onTicketCreated()
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      setMessage('Error creating ticket')
      console.error('Create ticket error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="manual-ticket-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">Date: *</label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ticketNumber">Ticket Number: *</label>
          <input
            id="ticketNumber"
            name="ticketNumber"
            type="text"
            value={formData.ticketNumber}
            onChange={handleInputChange}
            placeholder="Enter ticket number..."
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="clientId">Client Name: *</label>
        <select
          id="clientId"
          name="clientId"
          value={formData.clientId}
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
        <label htmlFor="jobProjectId">Job/Project ID:</label>
        <input
          id="jobProjectId"
          name="jobProjectId"
          type="text"
          value={formData.jobProjectId}
          onChange={handleInputChange}
          placeholder="Enter job or project ID..."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="materialType">Material Type: *</label>
          <select
            id="materialType"
            name="materialType"
            value={formData.materialType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select material type</option>
            {materialTypes.map(material => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="loadQuantity">Load Quantity: *</label>
          <input
            id="loadQuantity"
            name="loadQuantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.loadQuantity}
            onChange={handleInputChange}
            placeholder="e.g., 10, 5.5..."
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="loadUnit">Load Unit: *</label>
        <select
          id="loadUnit"
          name="loadUnit"
          value={formData.loadUnit}
          onChange={handleInputChange}
          required
        >
          <option value="">Select unit</option>
          {loadUnits.map(unit => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="driverName">Driver Name:</label>
        <input
          id="driverName"
          name="driverName"
          type="text"
          value={formData.driverName}
          onChange={handleInputChange}
          placeholder="Enter driver name..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="ticket-image">Image of the Ticket:</label>
        <input
          id="ticket-image"
          type="file"
          onChange={handleImageChange}
          accept=".jpg,.jpeg,.png,.pdf"
          className="file-input"
        />
        {selectedImage && (
          <div className="file-info">
            <span className="file-name">{selectedImage.name}</span>
            <span className="file-size">
              ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (optional):</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Enter any additional notes..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="status">Status:</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={submitting || !formData.clientId || !formData.ticketNumber || !formData.materialType || !formData.loadQuantity || !formData.loadUnit}
      >
        {submitting ? 'Creating...' : 'Create Ticket'}
      </button>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </form>
  )
}

export default ManualTicketForm
