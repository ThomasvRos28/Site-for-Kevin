import { useState, useEffect, useMemo } from 'react'
import AdvancedExport from './AdvancedExport'
import './ReportingTools.css'

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
  date?: string
  jobProjectId?: string
  materialType?: string
  loadQuantity?: string
  loadUnit?: string
  ticketNumber?: string
  driverName?: string
  isManualEntry?: boolean
}

interface Client {
  id: string
  name: string
  email: string
  phone?: string
}

interface ReportingToolsProps {
  tickets: Ticket[]
  clients: Client[]
}

interface ReportFilters {
  dateFrom: string
  dateTo: string
  clientIds: string[]
  materialTypes: string[]
  statuses: string[]
  driverNames: string[]
  loadUnits: string[]
  entryTypes: string[]
  minQuantity: string
  maxQuantity: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  filters: Partial<ReportFilters>
  columns: string[]
}

const ReportingTools = ({ tickets, clients }: ReportingToolsProps) => {
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: '',
    dateTo: '',
    clientIds: [],
    materialTypes: [],
    statuses: [],
    driverNames: [],
    loadUnits: [],
    entryTypes: [],
    minQuantity: '',
    maxQuantity: ''
  })

  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [reportName, setReportName] = useState('')

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const materialTypes = [...new Set(tickets.map(t => t.materialType).filter(Boolean))]
    const statuses = [...new Set(tickets.map(t => t.status).filter(Boolean))]
    const driverNames = [...new Set(tickets.map(t => t.driverName).filter(Boolean))]
    const loadUnits = [...new Set(tickets.map(t => t.loadUnit).filter(Boolean))]
    
    return {
      materialTypes: materialTypes.sort(),
      statuses: statuses.sort(),
      driverNames: driverNames.sort(),
      loadUnits: loadUnits.sort()
    }
  }, [tickets])

  // Predefined report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'daily-summary',
      name: 'Daily Summary',
      description: 'Daily ticket summary with totals by material type',
      filters: {
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0]
      },
      columns: ['date', 'clientName', 'materialType', 'loadQuantity', 'loadUnit', 'status']
    },
    {
      id: 'client-monthly',
      name: 'Client Monthly Report',
      description: 'Monthly breakdown by client with material totals',
      filters: {
        dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0]
      },
      columns: ['clientName', 'materialType', 'loadQuantity', 'loadUnit', 'date', 'status']
    },
    {
      id: 'material-analysis',
      name: 'Material Analysis',
      description: 'Analysis of material types and quantities over time',
      filters: {},
      columns: ['materialType', 'loadQuantity', 'loadUnit', 'date', 'clientName', 'driverName']
    },
    {
      id: 'driver-performance',
      name: 'Driver Performance',
      description: 'Driver performance and delivery tracking',
      filters: {},
      columns: ['driverName', 'date', 'clientName', 'materialType', 'loadQuantity', 'status']
    },
    {
      id: 'pending-tickets',
      name: 'Pending Tickets',
      description: 'All tickets with pending status',
      filters: {
        statuses: ['pending']
      },
      columns: ['ticketNumber', 'date', 'clientName', 'materialType', 'loadQuantity', 'driverName']
    }
  ]

  // Filter tickets based on current filters
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const ticketDate = ticket.date || ticket.uploadDate.split('T')[0]
        if (filters.dateFrom && ticketDate < filters.dateFrom) return false
        if (filters.dateTo && ticketDate > filters.dateTo) return false
      }

      // Client filter
      if (filters.clientIds.length > 0 && !filters.clientIds.includes(ticket.clientId)) return false

      // Material type filter
      if (filters.materialTypes.length > 0 && !filters.materialTypes.includes(ticket.materialType || '')) return false

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(ticket.status)) return false

      // Driver filter
      if (filters.driverNames.length > 0 && !filters.driverNames.includes(ticket.driverName || '')) return false

      // Load unit filter
      if (filters.loadUnits.length > 0 && !filters.loadUnits.includes(ticket.loadUnit || '')) return false

      // Entry type filter
      if (filters.entryTypes.length > 0) {
        const entryType = ticket.isManualEntry ? 'manual' : 'upload'
        if (!filters.entryTypes.includes(entryType)) return false
      }

      // Quantity range filter
      if (filters.minQuantity || filters.maxQuantity) {
        const quantity = parseFloat(ticket.loadQuantity || '0')
        if (filters.minQuantity && quantity < parseFloat(filters.minQuantity)) return false
        if (filters.maxQuantity && quantity > parseFloat(filters.maxQuantity)) return false
      }

      return true
    })
  }, [tickets, filters])

  // Apply report template
  const applyTemplate = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId)
    if (template) {
      setFilters(prev => ({ ...prev, ...template.filters }))
      setReportName(template.name)
      setSelectedTemplate(templateId)
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      clientIds: [],
      materialTypes: [],
      statuses: [],
      driverNames: [],
      loadUnits: [],
      entryTypes: [],
      minQuantity: '',
      maxQuantity: ''
    })
    setSelectedTemplate('')
    setReportName('')
  }

  // Handle multi-select changes
  const handleMultiSelectChange = (field: keyof ReportFilters, value: string) => {
    setFilters(prev => {
      const currentValues = prev[field] as string[]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      return { ...prev, [field]: newValues }
    })
  }

  return (
    <div className="reporting-tools">
      <div className="reporting-header">
        <h2>📊 Reporting & Analytics</h2>
        <p>Generate customizable reports and export data in multiple formats</p>
      </div>

      {/* Report Templates */}
      <div className="report-templates">
        <h3>Quick Report Templates</h3>
        <div className="template-grid">
          {reportTemplates.map(template => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => applyTemplate(template.id)}
            >
              <h4>{template.name}</h4>
              <p>{template.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Filters */}
      <div className="custom-filters">
        <div className="filter-header">
          <h3>Custom Filters</h3>
          <div className="filter-actions">
            <button
              className="toggle-advanced"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? '🔼 Hide Advanced' : '🔽 Show Advanced'}
            </button>
            <button className="clear-filters" onClick={clearFilters}>
              🗑️ Clear All
            </button>
          </div>
        </div>

        <div className="basic-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Date Range:</label>
              <div className="date-range">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  placeholder="From"
                />
                <span>to</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  placeholder="To"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Clients:</label>
              <div className="multi-select">
                {clients.map(client => (
                  <label key={client.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.clientIds.includes(client.id)}
                      onChange={() => handleMultiSelectChange('clientIds', client.id)}
                    />
                    {client.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Material Types:</label>
                <div className="multi-select">
                  {filterOptions.materialTypes.map(material => (
                    <label key={material} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.materialTypes.includes(material)}
                        onChange={() => handleMultiSelectChange('materialTypes', material)}
                      />
                      {material}
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Status:</label>
                <div className="multi-select">
                  {filterOptions.statuses.map(status => (
                    <label key={status} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status)}
                        onChange={() => handleMultiSelectChange('statuses', status)}
                      />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Drivers:</label>
                <div className="multi-select">
                  {filterOptions.driverNames.map(driver => (
                    <label key={driver} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.driverNames.includes(driver)}
                        onChange={() => handleMultiSelectChange('driverNames', driver)}
                      />
                      {driver}
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Entry Type:</label>
                <div className="multi-select">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.entryTypes.includes('manual')}
                      onChange={() => handleMultiSelectChange('entryTypes', 'manual')}
                    />
                    Manual Entry
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.entryTypes.includes('upload')}
                      onChange={() => handleMultiSelectChange('entryTypes', 'upload')}
                    />
                    File Upload
                  </label>
                </div>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Quantity Range:</label>
                <div className="quantity-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minQuantity}
                    onChange={(e) => setFilters(prev => ({ ...prev, minQuantity: e.target.value }))}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxQuantity}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxQuantity: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <h3>Report Results</h3>
        <div className="summary-stats">
          <div className="stat-card">
            <span className="stat-number">{filteredTickets.length}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{new Set(filteredTickets.map(t => t.clientName)).size}</span>
            <span className="stat-label">Unique Clients</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{new Set(filteredTickets.map(t => t.materialType)).size}</span>
            <span className="stat-label">Material Types</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {filteredTickets.reduce((sum, t) => sum + parseFloat(t.loadQuantity || '0'), 0).toFixed(1)}
            </span>
            <span className="stat-label">Total Quantity</span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="export-section">
        <AdvancedExport 
          tickets={filteredTickets} 
          reportName={reportName || 'Custom Report'}
          filters={filters}
        />
      </div>
    </div>
  )
}

export default ReportingTools
