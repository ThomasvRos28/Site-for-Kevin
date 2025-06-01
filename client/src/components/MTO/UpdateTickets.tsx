import { useState } from 'react'
import './UpdateTickets.css'

interface Ticket {
  id: string
  client: string
  project: string
  date: string
  material: string
  quantity: number
  unit: string
  price: number
  status: string
  ticketNumber?: string
  loadSite?: string
  dumpSite?: string
  fileName?: string
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

interface UpdateTicketsProps {
  tickets: Ticket[]
  clients: Client[]
  onUpdateTicket: (ticketId: string, updates: any) => void
  onDeleteTicket: (ticketId: string) => void
}

const UpdateTickets = ({ tickets, clients, onUpdateTicket, onDeleteTicket }: UpdateTicketsProps) => {
  const [editingTicket, setEditingTicket] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [filters, setFilters] = useState({
    client: '',
    project: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })

  const statusOptions = ['pending', 'in-progress', 'completed', 'cancelled']
  const materialTypes = ['Concrete', 'Gravel', 'Sand', 'Asphalt', 'Stone', 'Dirt', 'Clay', 'Topsoil']
  const units = ['tons', 'cubic yards', 'cubic meters', 'loads']

  const filteredTickets = tickets.filter(ticket => {
    if (filters.client && ticket.client !== filters.client) return false
    if (filters.project && !ticket.project.toLowerCase().includes(filters.project.toLowerCase())) return false
    if (filters.status && ticket.status !== filters.status) return false
    if (filters.dateFrom && ticket.date < filters.dateFrom) return false
    if (filters.dateTo && ticket.date > filters.dateTo) return false
    return true
  })

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket.id)
    setEditData({ ...ticket })
  }

  const handleSave = () => {
    if (editingTicket) {
      onUpdateTicket(editingTicket, editData)
      setEditingTicket(null)
      setEditData({})
    }
  }

  const handleCancel = () => {
    setEditingTicket(null)
    setEditData({})
  }

  const handleDelete = (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      onDeleteTicket(ticketId)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditData((prev: any) => ({ ...prev, [name]: value }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#4caf50'
      case 'pending': return '#ff9800'
      case 'in-progress': return '#2196f3'
      case 'cancelled': return '#f44336'
      default: return '#757575'
    }
  }

  const clearFilters = () => {
    setFilters({
      client: '',
      project: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    })
  }

  return (
    <div className="update-tickets">
      <div className="section-header">
        <h2>Update Ticket Information</h2>
        <div className="tickets-count">
          {filteredTickets.length} of {tickets.length} tickets
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Client</label>
            <select name="client" value={filters.client} onChange={handleFilterChange}>
              <option value="">All Clients</option>
              {Array.from(new Set(tickets.map(t => t.client))).map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Project</label>
            <input
              type="text"
              name="project"
              value={filters.project}
              onChange={handleFilterChange}
              placeholder="Search projects..."
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-actions">
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Client</th>
              <th>Project</th>
              <th>Date</th>
              <th>Material</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket.id}>
                {editingTicket === ticket.id ? (
                  // Edit mode
                  <>
                    <td>{ticket.id}</td>
                    <td>
                      <select
                        name="client"
                        value={editData.client || ''}
                        onChange={handleEditChange}
                        className="edit-input"
                      >
                        {clients.map(client => (
                          <option key={client.id} value={client.name}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        name="project"
                        value={editData.project || ''}
                        onChange={handleEditChange}
                        className="edit-input"
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        name="date"
                        value={editData.date || ''}
                        onChange={handleEditChange}
                        className="edit-input"
                      />
                    </td>
                    <td>
                      <select
                        name="material"
                        value={editData.material || ''}
                        onChange={handleEditChange}
                        className="edit-input"
                      >
                        {materialTypes.map(material => (
                          <option key={material} value={material}>
                            {material}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="quantity-edit">
                        <input
                          type="number"
                          name="quantity"
                          value={editData.quantity || ''}
                          onChange={handleEditChange}
                          className="edit-input quantity-input"
                          step="0.1"
                        />
                        <select
                          name="unit"
                          value={editData.unit || ''}
                          onChange={handleEditChange}
                          className="edit-input unit-select"
                        >
                          {units.map(unit => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        name="price"
                        value={editData.price || ''}
                        onChange={handleEditChange}
                        className="edit-input"
                        step="0.01"
                      />
                    </td>
                    <td>
                      <select
                        name="status"
                        value={editData.status || ''}
                        onChange={handleEditChange}
                        className="edit-input"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="edit-actions">
                        <button className="btn btn-sm btn-success" onClick={handleSave}>
                          Save
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={handleCancel}>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  // View mode
                  <>
                    <td>{ticket.id}</td>
                    <td>{ticket.client}</td>
                    <td>{ticket.project}</td>
                    <td>{ticket.date}</td>
                    <td>{ticket.material}</td>
                    <td>{ticket.quantity} {ticket.unit}</td>
                    <td>{formatCurrency(ticket.price)}</td>
                    <td>
                      <span 
                        className="status"
                        style={{ backgroundColor: getStatusColor(ticket.status), color: 'white' }}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(ticket)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(ticket.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <div className="no-tickets">
            No tickets found matching the current filters.
          </div>
        )}
      </div>
    </div>
  )
}

export default UpdateTickets
