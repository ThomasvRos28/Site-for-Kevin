import { useState, useMemo } from 'react'
import './ViewExportTickets.css'

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

interface ViewExportTicketsProps {
  tickets: Ticket[]
  clients: Client[]
}

const ViewExportTickets = ({ tickets, clients }: ViewExportTicketsProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<keyof Ticket>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filters, setFilters] = useState({
    client: '',
    project: '',
    status: '',
    material: '',
    dateFrom: '',
    dateTo: ''
  })
  const [exporting, setExporting] = useState(false)

  const statusOptions = ['pending', 'in-progress', 'completed', 'cancelled']
  const materialTypes = ['Concrete', 'Gravel', 'Sand', 'Asphalt', 'Stone', 'Dirt', 'Clay', 'Topsoil']

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => {
      if (filters.client && ticket.client !== filters.client) return false
      if (filters.project && !ticket.project.toLowerCase().includes(filters.project.toLowerCase())) return false
      if (filters.status && ticket.status !== filters.status) return false
      if (filters.material && ticket.material !== filters.material) return false
      if (filters.dateFrom && ticket.date < filters.dateFrom) return false
      if (filters.dateTo && ticket.date > filters.dateTo) return false
      return true
    })

    // Sort tickets
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [tickets, filters, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTickets = filteredAndSortedTickets.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: keyof Ticket) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setFilters({
      client: '',
      project: '',
      status: '',
      material: '',
      dateFrom: '',
      dateTo: ''
    })
    setCurrentPage(1)
  }

  const exportToCSV = () => {
    setExporting(true)

    try {
      const headers = [
        'Ticket ID',
        'Client',
        'Project',
        'Date',
        'Material',
        'Quantity',
        'Unit',
        'Price',
        'Status',
        'Ticket Number',
        'Load Site',
        'Dump Site',
        'File Name'
      ]

      const csvRows = [
        headers.join(','),
        ...filteredAndSortedTickets.map(ticket => [
          `"${ticket.id}"`,
          `"${ticket.client}"`,
          `"${ticket.project}"`,
          `"${ticket.date}"`,
          `"${ticket.material}"`,
          `"${ticket.quantity}"`,
          `"${ticket.unit}"`,
          `"${ticket.price}"`,
          `"${ticket.status}"`,
          `"${ticket.ticketNumber || ''}"`,
          `"${ticket.loadSite || ''}"`,
          `"${ticket.dumpSite || ''}"`,
          `"${ticket.fileName || ''}"`
        ].join(','))
      ]

      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `mto_tickets_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Error exporting tickets')
    } finally {
      setExporting(false)
    }
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

  const getSortIcon = (field: keyof Ticket) => {
    if (sortField !== field) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="view-export-tickets">
      <div className="section-header">
        <h2>View & Export Ticket Data</h2>
        <div className="header-actions">
          <button 
            className="btn btn-success"
            onClick={exportToCSV}
            disabled={exporting || filteredAndSortedTickets.length === 0}
          >
            {exporting ? 'Exporting...' : `Export CSV (${filteredAndSortedTickets.length})`}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>Filters & Search</h3>
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
            <label>Material</label>
            <select name="material" value={filters.material} onChange={handleFilterChange}>
              <option value="">All Materials</option>
              {materialTypes.map(material => (
                <option key={material} value={material}>{material}</option>
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
        </div>
        
        <div className="filter-actions">
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear All Filters
          </button>
          <div className="results-info">
            Showing {filteredAndSortedTickets.length} of {tickets.length} tickets
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="table-controls">
        <div className="pagination-controls">
          <label>
            Show:
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            per page
          </label>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable">
                Ticket ID {getSortIcon('id')}
              </th>
              <th onClick={() => handleSort('client')} className="sortable">
                Client {getSortIcon('client')}
              </th>
              <th onClick={() => handleSort('project')} className="sortable">
                Project {getSortIcon('project')}
              </th>
              <th onClick={() => handleSort('date')} className="sortable">
                Date {getSortIcon('date')}
              </th>
              <th onClick={() => handleSort('material')} className="sortable">
                Material {getSortIcon('material')}
              </th>
              <th onClick={() => handleSort('quantity')} className="sortable">
                Quantity {getSortIcon('quantity')}
              </th>
              <th onClick={() => handleSort('price')} className="sortable">
                Price {getSortIcon('price')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {getSortIcon('status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.map(ticket => (
              <tr key={ticket.id}>
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
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedTickets.length === 0 && (
          <div className="no-tickets">
            No tickets found matching the current filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button 
            className="page-button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ViewExportTickets
