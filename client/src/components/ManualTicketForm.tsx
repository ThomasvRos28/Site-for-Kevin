import React, { useState, useEffect } from 'react'
import SignatureInput from './SignatureInput'
import './ManualTicketForm.css'
import { usePurchaseOrders } from '../contexts/PurchaseOrderContext'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { isWithinGeofence } from '../utils/geofencing'

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

interface ManualTicketFormProps {
  onTicketCreated: () => void
}

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ManualTicketForm = ({ onTicketCreated }: ManualTicketFormProps) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    
    checkMobile();
  }, []);

  // If not mobile, show message
  if (!isMobile) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h2>Mobile Device Required</h2>
        <p>This feature is only available on mobile devices.</p>
        <p>Please use a smartphone or tablet to create tickets.</p>
      </div>
    );
  }

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
  const [signatureData, setSignatureData] = useState<string | null>(null)

  const { purchaseOrders } = usePurchaseOrders()
  const [selectedPOId, setSelectedPOId] = useState('')
  const [selectedPO, setSelectedPO] = useState<any>(null)
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState('')
  const [insideGeofence, setInsideGeofence] = useState(true)

  const [manualCoordinates, setManualCoordinates] = useState({
    lat: '',
  // Get approved POs only
  const approvedPOs = purchaseOrders.filter(po => po.status === 'approved')

  // Fetch PO geofence when PO changes
  useEffect(() => {
    const po = approvedPOs.find(po => po._id === selectedPOId)
    console.log('Selected PO:', po)
    console.log('PO Geofence:', po?.geofence)
    setSelectedPO(po || null)
  }, [selectedPOId, purchaseOrders])

  // Set default location when PO changes
  useEffect(() => {
    if (!selectedPO) return;
    console.log('Getting location for PO:', selectedPO);
    
    // Set a default location for testing
    const defaultLocation = { 
      lat: 40.7128,  // New York City coordinates
      lng: -74.0060
    };
    
    setDriverLocation(defaultLocation);
    setLocationError('Using default location for testing');
  }, [selectedPO]);

  // Check if inside geofence
  useEffect(() => {
    if (!selectedPO || !driverLocation) return;
    
    // Validate coordinates
    if (driverLocation.lat < -90 || driverLocation.lat > 90 ||
        driverLocation.lng < -180 || driverLocation.lng > 180) {
      setInsideGeofence(false);
      return;
    }

    let inside = false;
    if (selectedPO.geofence?.type === 'Polygon' && Array.isArray(selectedPO.geofence.coordinates) && selectedPO.geofence.coordinates.length > 0) {
      // Simple point-in-polygon check (2D)
      const x = driverLocation.lng;
      const y = driverLocation.lat;
      const poly = selectedPO.geofence.coordinates;
      let j = poly.length - 1;
      for (let i = 0; i < poly.length; i++) {
        if (
          poly[i][1] > y !== poly[j][1] > y &&
          x < (poly[j][0] - poly[i][0]) * (y - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]
        ) {
          inside = !inside;
        }
        j = i;
      }
    } else if (selectedPO.geofence?.type === 'Circle' && Array.isArray(selectedPO.geofence.center) && selectedPO.geofence.radius) {
      const dx = driverLocation.lng - selectedPO.geofence.center[0];
      const dy = driverLocation.lat - selectedPO.geofence.center[1];
      const dist = Math.sqrt(dx * dx + dy * dy) * 111320; // rough meters
      inside = dist <= selectedPO.geofence.radius;
    }
    setInsideGeofence(inside);
  }, [selectedPO, driverLocation]);

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

  const handleSignatureSubmit = (signature: string) => {
    setSignatureData(signature)
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
    if (!selectedPOId) {
      setMessage('Please select a Purchase Order (PO)')
      setSubmitting(false)
      return
    }
    if (!driverLocation) {
      setMessage('Unable to get your location.')
      setSubmitting(false)
      return
    }
    if (!insideGeofence) {
      setMessage('You are outside the allowed geofence for this PO.')
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

      // Add signature if provided
      if (signatureData) {
        submitData.append('signatureData', signatureData)
      }

      // Add PO ID and location to FormData
      submitData.append('poId', selectedPOId)
      submitData.append('location', JSON.stringify(driverLocation))

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
        setSignatureData(null)
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
        <SignatureInput
          onSubmit={handleSignatureSubmit}
          label="Driver Signature"
          placeholder="Add driver signature"
        />
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

      <div className="form-group">
        <label htmlFor="poId">Purchase Order (PO): *</label>
        <select
          id="poId"
          name="poId"
          value={selectedPOId}
          onChange={e => setSelectedPOId(e.target.value)}
          required
        >
          <option value="">Select a PO</option>
          {approvedPOs.map(po => (
            <option key={po._id} value={po._id}>
              {po.jobDetails} ({po._id.slice(-4)})
            </option>
          ))}
        </select>
      </div>

      {selectedPO && (
        <div className="form-group">
          <label>Geofence Map:</label>
          <div style={{ height: 300, width: '100%', marginTop: '10px' }}>
            {driverLocation ? (
              <div style={{ height: '100%', width: '100%' }}>
                <MapContainer
                  key={`map-${driverLocation.lat}-${driverLocation.lng}`}
                  center={[driverLocation.lat, driverLocation.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                  crs={L.CRS.EPSG3857}  // Use Web Mercator projection
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {selectedPO.geofence?.type === 'Polygon' && selectedPO.geofence.coordinates && (
                    <Polygon 
                      positions={selectedPO.geofence.coordinates}
                      pathOptions={{ 
                        color: insideGeofence ? 'green' : 'red',
                        fillOpacity: 0.2
                      }}
                    />
                  )}
                  {selectedPO.geofence?.type === 'Circle' && selectedPO.geofence.center && (
                    <Circle
                      center={selectedPO.geofence.center}
                      radius={selectedPO.geofence.radius}
                      pathOptions={{ 
                        color: insideGeofence ? 'green' : 'red',
                        fillOpacity: 0.2
                      }}
                    />
                  )}
                  <Marker position={[driverLocation.lat, driverLocation.lng]}>
                    <Popup>
                      Your Location<br />
                      Lat: {driverLocation.lat.toFixed(6)}<br />
                      Lng: {driverLocation.lng.toFixed(6)}<br />
                      {insideGeofence ? 'Inside Geofence' : 'Outside Geofence'}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px'
              }}>
                {locationError || 'Loading location...'}
              </div>
            )}
          </div>
          {selectedPO.geofence && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: insideGeofence ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px',
              color: insideGeofence ? '#2e7d32' : '#c62828'
            }}>
              {insideGeofence 
                ? 'You are within the allowed geofence area'
                : 'You are outside the allowed geofence area'}
            </div>
          )}
        </div>
      )}

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
