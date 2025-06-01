import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { isWithinGeofence } from '../utils/geofencing'
import './TruckerMaterialTicketing.css'

interface Ticket {
  id: string
  clientId: string
  clientName: string
  date: string
  jobProjectId: string
  materialType: string
  loadQuantity: string
  loadUnit: string
  ticketNumber: string
  driverName: string
  description: string
  fileName?: string
  filePath?: string
  fileSize?: number
  uploadDate: string
  status: string
  isManualEntry: boolean
  location?: {
    lat: number
    lng: number
  }
  poId?: string
  loadSite: string
  dumpSite: string
  price: string
}

interface Client {
  id: string
  name: string
  email: string
}

interface PurchaseOrder {
  _id: string
  jobDetails: string
  geofence?: {
    type: 'Polygon' | 'Circle'
    coordinates?: number[][]
    center?: [number, number]
    radius?: number
  }
}

const TruckerMaterialTicketing = () => {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [driverInfo, setDriverInfo] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState('')
  const [insideGeofence, setInsideGeofence] = useState(true)
  const [selectedPOId, setSelectedPOId] = useState('')
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)

  const [formData, setFormData] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    jobProjectId: '',
    materialType: '',
    loadQuantity: '',
    loadUnit: '',
    ticketNumber: '',
    description: '',
    loadSite: '',
    dumpSite: '',
    price: '',
    status: 'pending',
    poId: ''
  })

  useEffect(() => {
    // Check if trucker is logged in
    const truckerAuth = localStorage.getItem('truckerAuth')
    if (!truckerAuth) {
      navigate('/trucker-login')
      return
    }

    const driverData = JSON.parse(truckerAuth)
    setDriverInfo(driverData)
    fetchTickets(driverData.driverName)
    fetchClients()
    fetchPurchaseOrders()
    getCurrentLocation()
  }, [navigate])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          setLocationError('Error getting location: ' + error.message)
        }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser')
    }
  }

  const fetchTickets = async (driverName: string) => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get('http://localhost:5000/api/trucker/tickets', {
        params: { driverName }
      })
      setTickets(response.data.tickets)
    } catch (error: any) {
      console.error('Error fetching tickets:', error)
      setError(error.response?.data?.error || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/clients')
      setClients(response.data)
    } catch (error: any) {
      console.error('Error fetching clients:', error)
      setError(error.response?.data?.error || 'Failed to load clients')
    }
  }

  const fetchPurchaseOrders = async () => {
    try {
      const truckerAuth = localStorage.getItem('truckerAuth')
      if (!truckerAuth) {
        throw new Error('No trucker authentication found')
      }

      const { token } = JSON.parse(truckerAuth)
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.get('http://localhost:5000/api/purchase-orders/hauler', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setPurchaseOrders(response.data)
    } catch (error: any) {
      console.error('Error fetching purchase orders:', error)
      setError(error.response?.data?.error || 'Failed to load purchase orders')
    }
  }

  useEffect(() => {
    if (!selectedPOId) return
    const po = purchaseOrders.find(po => po._id === selectedPOId)
    setSelectedPO(po || null)
  }, [selectedPOId, purchaseOrders])

  useEffect(() => {
    if (!selectedPO || !driverLocation) return

    if (selectedPO.geofence) {
      const isInside = isWithinGeofence(driverLocation, selectedPO.geofence)
      setInsideGeofence(isInside)
    }
  }, [selectedPO, driverLocation])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')

      if (!driverLocation) {
        setError('Unable to get your location')
        return
      }

      if (!insideGeofence) {
        setError('You are outside the allowed geofence for this PO')
        return
      }

      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      submitData.append('clientName', clients.find(c => c.id === formData.clientId)?.name || '')
      submitData.append('driverName', driverInfo.driverName)
      submitData.append('location', JSON.stringify(driverLocation))

      if (selectedFile) {
        submitData.append('file', selectedFile)
      }

      await axios.post('http://localhost:5000/api/trucker/tickets', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Reset form and refresh tickets
      setFormData({
        clientId: '',
        date: new Date().toISOString().split('T')[0],
        jobProjectId: '',
        materialType: '',
        loadQuantity: '',
        loadUnit: '',
        ticketNumber: '',
        description: '',
        loadSite: '',
        dumpSite: '',
        price: '',
        status: 'pending',
        poId: ''
      })
      setSelectedFile(null)
      fetchTickets(driverInfo.driverName)
    } catch (error: any) {
      console.error('Error submitting ticket:', error)
      setError(error.response?.data?.error || 'Failed to submit ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('truckerAuth')
    navigate('/')
  }

  if (loading && !tickets.length) {
    return (
      <div className="trucker-material-ticketing-container">
        <div className="loading-spinner">
          <div className="spinner-large"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="trucker-material-ticketing-container">
      <header className="page-header">
        <div className="header-content">
          <button
            className="back-button"
            onClick={() => navigate('/trucker-stats')}
            title="Back to Stats"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <div className="page-brand">
            <div className="page-title">
              <h1>Material Ticketing</h1>
              <p>Welcome, {driverInfo?.driverName}</p>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Logout
        </button>
      </header>

      <div className="ticketing-content">
        <div className="ticket-form-container">
          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date: *</label>
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
                <label htmlFor="ticketNumber">Ticket Number: *</label>
                <input
                  type="text"
                  id="ticketNumber"
                  name="ticketNumber"
                  value={formData.ticketNumber}
                  onChange={handleInputChange}
                  placeholder="Enter ticket number..."
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="poId">Purchase Order (PO): *</label>
              <select
                id="poId"
                name="poId"
                value={formData.poId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a PO</option>
                {purchaseOrders.map(po => (
                  <option key={po._id} value={po._id}>
                    {po.jobDetails} ({po._id.slice(-4)})
                  </option>
                ))}
              </select>
            </div>

            {selectedPO && driverLocation && (
              <div className="form-group">
                <label>Geofence Map:</label>
                <div style={{ height: 300, width: '100%', marginTop: '10px' }}>
                  <MapContainer
                    key={`map-${driverLocation.lat}-${driverLocation.lng}`}
                    center={[driverLocation.lat, driverLocation.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                    crs={L.CRS.EPSG3857}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {selectedPO.geofence?.type === 'Polygon' && selectedPO.geofence.coordinates && (
                      <Polygon 
                        positions={selectedPO.geofence.coordinates.map(coord => [coord[1], coord[0]] as [number, number])}
                        pathOptions={{ 
                          color: insideGeofence ? 'green' : 'red',
                          fillOpacity: 0.2
                        }}
                      />
                    )}
                    {selectedPO.geofence?.type === 'Circle' && selectedPO.geofence.center && selectedPO.geofence.radius && (
                      <Circle
                        center={[selectedPO.geofence.center[1], selectedPO.geofence.center[0]]}
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
              <label htmlFor="jobProjectId">Job/Project ID: *</label>
              <input
                type="text"
                id="jobProjectId"
                name="jobProjectId"
                value={formData.jobProjectId}
                onChange={handleInputChange}
                placeholder="Enter job or project ID..."
                required
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
                  <option value="Gravel">Gravel</option>
                  <option value="Sand">Sand</option>
                  <option value="Stone">Stone</option>
                  <option value="Concrete">Concrete</option>
                  <option value="Asphalt">Asphalt</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="loadQuantity">Load Quantity: *</label>
                <input
                  type="number"
                  id="loadQuantity"
                  name="loadQuantity"
                  value={formData.loadQuantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity..."
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
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
                  <option value="cubic_yards">Cubic Yards</option>
                  <option value="tons">Tons</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="price">Price ($):</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price..."
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="loadSite">Load Site: *</label>
                <input
                  type="text"
                  id="loadSite"
                  name="loadSite"
                  value={formData.loadSite}
                  onChange={handleInputChange}
                  placeholder="Enter load site..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dumpSite">Dump Site: *</label>
                <input
                  type="text"
                  id="dumpSite"
                  name="dumpSite"
                  value={formData.dumpSite}
                  onChange={handleInputChange}
                  placeholder="Enter dump site..."
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
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
              <label htmlFor="file">Upload Ticket Image:</label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={loading || !insideGeofence}
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>

            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default TruckerMaterialTicketing 