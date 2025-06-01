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
  status: string
  // clientId can be either a string ID or an object with client details
  clientId?: string | {
    _id?: string
    name: string
    email: string
  }
  haulerId?: {
    name: string
    email: string
  }
  haulerRates?: Array<{
    materialType: string
    rate: number
    unit: string
  }>
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
  // We display location errors directly in the UI
  const [locationError, setLocationError] = useState('')
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [insideGeofence, setInsideGeofence] = useState(false)

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
    poId: '',
    cans: [{ canIn: '', canOut: '' }]
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
    
    // Initial fetch of purchase orders
    console.log('Initial fetch of purchase orders')
    fetchPurchaseOrders()
    
    // Set up a periodic refresh every 10 seconds
    const refreshInterval = setInterval(() => {
      console.log('Refreshing purchase orders...')
      fetchPurchaseOrders()
    }, 10000)
    
    getCurrentLocation()
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval)
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
      // Get trucker authentication from localStorage
      const truckerAuth = localStorage.getItem('truckerAuth')
      if (!truckerAuth) {
        throw new Error('No trucker authentication found')
      }

      const authData = JSON.parse(truckerAuth)
      console.log('Using trucker auth data:', {
        driverName: authData.driverName,
        hasToken: !!authData.token,
        loginTime: authData.loginTime
      })

      // Create an array to hold all purchase orders
      let allPurchaseOrders: PurchaseOrder[] = []
      let fetchedAny = false

      // First try the main purchase orders endpoint
      try {
        console.log('Fetching from main purchase orders endpoint')
        const response = await axios.get('http://localhost:5000/api/purchase-orders', {
          headers: {
            'Authorization': `Bearer ${authData.token}`
          }
        })
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Successfully fetched ${response.data.length} purchase orders from main endpoint`)
          allPurchaseOrders = [...allPurchaseOrders, ...response.data]
          fetchedAny = true
        }
      } catch (error) {
        console.error('Error fetching from main purchase orders endpoint:', error)
      }

      // Then try the hauler-specific endpoint
      try {
        console.log('Fetching from hauler purchase orders endpoint')
        const response = await axios.get('http://localhost:5000/api/purchase-orders/hauler', {
          headers: {
            'Authorization': `Bearer ${authData.token}`
          }
        })
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Successfully fetched ${response.data.length} purchase orders from hauler endpoint`)
          allPurchaseOrders = [...allPurchaseOrders, ...response.data]
          fetchedAny = true
        }
      } catch (error) {
        console.error('Error fetching from hauler purchase orders endpoint:', error)
      }

      // Remove duplicates by ID
      if (fetchedAny) {
        const uniquePOs = Array.from(new Map(allPurchaseOrders.map(po => [po._id, po])).values())
        console.log(`Combined ${allPurchaseOrders.length} purchase orders, ${uniquePOs.length} unique`)
        
        // Log all purchase orders for debugging
        uniquePOs.forEach(po => {
          console.log(`PO: ${po._id}, Status: ${po.status}, Job: ${po.jobDetails}`)
        })
        
        setPurchaseOrders(uniquePOs)
        return
      }
      
      // If both endpoints fail, use mock data
      console.warn('Both API endpoints failed, using mock data')
      const mockPurchaseOrders: PurchaseOrder[] = [
        {
          _id: 'mock1',
          jobDetails: 'Mock Job 1 - Gravel Delivery',
          status: 'open',
          clientId: { name: 'ABC Construction', email: 'abc@example.com' },
          haulerRates: [{ materialType: 'Gravel', rate: 50, unit: 'ton' }]
        },
        {
          _id: 'mock2',
          jobDetails: 'Mock Job 2 - Sand Delivery',
          status: 'open',
          clientId: { name: 'XYZ Builders', email: 'xyz@example.com' },
          haulerRates: [{ materialType: 'Sand', rate: 45, unit: 'ton' }]
        }
      ]
      
      console.log(`Using ${mockPurchaseOrders.length} mock purchase orders`)
      setPurchaseOrders(mockPurchaseOrders)
    } catch (error: any) {
      console.error('Error in fetchPurchaseOrders:', error)
      setError('Failed to load purchase orders. Please try again.')
      
      // Fallback to empty array if everything fails
      setPurchaseOrders([])
    }
  }

  // When the PO ID changes in the form, update the selected PO
  useEffect(() => {
    if (!formData.poId) {
      setSelectedPO(null)
      return
    }
    const po = purchaseOrders.find(po => po._id === formData.poId)
    setSelectedPO(po || null)
  }, [formData.poId, purchaseOrders])

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
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleCanInputChange = (index: number, field: 'canIn' | 'canOut', value: string) => {
    const updatedCans = [...formData.cans]
    updatedCans[index] = { ...updatedCans[index], [field]: value }
    setFormData({
      ...formData,
      cans: updatedCans
    })
  }

  const addCan = () => {
    setFormData({
      ...formData,
      cans: [...formData.cans, { canIn: '', canOut: '' }]
    })
  }

  const removeCan = (index: number) => {
    if (formData.cans.length <= 1) return
    const updatedCans = [...formData.cans]
    updatedCans.splice(index, 1)
    setFormData({
      ...formData,
      cans: updatedCans
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')

      // Get current driver info
      const truckerAuth = localStorage.getItem('truckerAuth')
      if (!truckerAuth) {
        navigate('/trucker-login')
        return
      }

      const driverData = JSON.parse(truckerAuth)
      const driverName = driverData.driverName

      // Prepare form data
      const ticketFormData = new FormData()
      ticketFormData.append('clientId', formData.clientId)
      ticketFormData.append('clientName', clients.find(c => c.id === formData.clientId)?.name || '')
      ticketFormData.append('date', formData.date)
      ticketFormData.append('jobProjectId', formData.jobProjectId)
      ticketFormData.append('materialType', formData.materialType)
      ticketFormData.append('loadQuantity', formData.loadQuantity)
      ticketFormData.append('loadUnit', formData.loadUnit)
      ticketFormData.append('ticketNumber', formData.ticketNumber)
      ticketFormData.append('description', formData.description)
      ticketFormData.append('driverName', driverName)
      ticketFormData.append('isManualEntry', 'true')
      ticketFormData.append('status', formData.status)
      ticketFormData.append('loadSite', formData.loadSite)
      ticketFormData.append('dumpSite', formData.dumpSite)
      ticketFormData.append('price', formData.price)
      ticketFormData.append('poId', formData.poId)
      
      // Add can tracking data as JSON string
      ticketFormData.append('cans', JSON.stringify(formData.cans))

      // Add location if available
      if (driverLocation) {
        ticketFormData.append('lat', driverLocation.lat.toString())
        ticketFormData.append('lng', driverLocation.lng.toString())
      }

      // Add file if selected
      if (selectedFile) {
        ticketFormData.append('file', selectedFile)
      }

      // Submit ticket
      await axios.post(
        'http://localhost:5000/api/trucker/tickets',
        ticketFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      // Reset form after successful submission
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
        poId: '',
        cans: [{ canIn: '', canOut: '' }]
      })
      setSelectedFile(null)

      // Refresh ticket list
      fetchTickets(driverName)

      alert('Ticket submitted successfully!')
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
              <h1>MATERIAL TICKETING</h1>
              <p>Welcome, {driverInfo?.driverName}</p>
              <div className="ticketing-banner">
                <span className="highlight-text">Create and submit material tickets</span>
              </div>
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
                className="form-control"
                name="poId"
                value={formData.poId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a Purchase Order</option>
                {purchaseOrders.length === 0 ? (
                  <option value="" disabled>No purchase orders available</option>
                ) : (
                  purchaseOrders.map(po => {
                    // Debug log each purchase order
                    console.log('Rendering PO in dropdown:', po)
                    
                    // Extract client name safely
                    let clientName = 'Unknown Client'
                    if (typeof po.clientId === 'string') {
                      clientName = po.clientId
                    } else if (po.clientId && typeof po.clientId === 'object' && 'name' in po.clientId) {
                      clientName = po.clientId.name
                    }
                    
                    // Extract material type safely
                    let materialType = 'Unknown Material'
                    if (po.haulerRates && Array.isArray(po.haulerRates) && po.haulerRates.length > 0) {
                      materialType = po.haulerRates[0].materialType || 'Unknown Material'
                    }
                    
                    // Create a descriptive label
                    const poLabel = `${po.jobDetails || 'No Job Details'} - ${clientName} - ${materialType} (${po._id.slice(-6)})`
                    
                    return (
                      <option key={po._id} value={po._id}>
                        {poLabel}
                      </option>
                    )
                  })
                )}
              </select>
              <small className="form-text text-muted">
                Select a purchase order to create a material ticket
              </small>
            </div>

            {locationError && (
              <div className="form-group">
                <div className="error-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8v4M12 16v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {locationError}
                </div>
              </div>
            )}

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
            
            <div className="form-section">
              <h3 className="section-title">Can Tracking</h3>
              <p className="section-description">Specify how many cans are used with can in/out details</p>
              
              {formData.cans.map((can, index) => (
                <div key={index} className="can-container">
                  <div className="can-header">
                    <h4>Can #{index + 1}</h4>
                    {formData.cans.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-can-btn" 
                        onClick={() => removeCan(index)}
                        title="Remove this can"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor={`canIn-${index}`}>Can In:</label>
                      <input
                        type="text"
                        id={`canIn-${index}`}
                        value={can.canIn}
                        onChange={(e) => handleCanInputChange(index, 'canIn', e.target.value)}
                        placeholder="Can in details..."
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`canOut-${index}`}>Can Out:</label>
                      <input
                        type="text"
                        id={`canOut-${index}`}
                        value={can.canOut}
                        onChange={(e) => handleCanInputChange(index, 'canOut', e.target.value)}
                        placeholder="Can out details..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                type="button" 
                className="add-can-btn" 
                onClick={addCan}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Add Another Can
              </button>
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