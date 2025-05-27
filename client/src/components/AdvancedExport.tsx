import { useState } from 'react'
import './AdvancedExport.css'

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

interface AdvancedExportProps {
  tickets: Ticket[]
  reportName: string
  filters: ReportFilters
}

type ExportFormat = 'csv' | 'excel' | 'json' | 'google-sheets' | 'airtable'

interface ExportColumn {
  key: string
  label: string
  selected: boolean
}

const AdvancedExport = ({ tickets, reportName, filters }: AdvancedExportProps) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [exporting, setExporting] = useState(false)
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [groupByField, setGroupByField] = useState('')

  const [columns, setColumns] = useState<ExportColumn[]>([
    { key: 'ticketNumber', label: 'Ticket Number', selected: true },
    { key: 'date', label: 'Date', selected: true },
    { key: 'clientName', label: 'Client Name', selected: true },
    { key: 'jobProjectId', label: 'Job/Project ID', selected: true },
    { key: 'materialType', label: 'Material Type', selected: true },
    { key: 'loadQuantity', label: 'Load Quantity', selected: true },
    { key: 'loadUnit', label: 'Load Unit', selected: true },
    { key: 'driverName', label: 'Driver Name', selected: true },
    { key: 'status', label: 'Status', selected: true },
    { key: 'fileName', label: 'File Name', selected: false },
    { key: 'description', label: 'Description/Notes', selected: false },
    { key: 'fileSize', label: 'File Size', selected: false },
    { key: 'uploadDate', label: 'Upload Date', selected: false },
    { key: 'isManualEntry', label: 'Entry Type', selected: false },
    { key: 'hasImage', label: 'Has Image', selected: false }
  ])

  const exportFormats = [
    {
      id: 'csv' as ExportFormat,
      name: 'CSV',
      description: 'Comma-separated values (Excel compatible)',
      icon: '📊',
      recommended: true
    },
    {
      id: 'excel' as ExportFormat,
      name: 'Excel',
      description: 'Microsoft Excel format (.xlsx)',
      icon: '📈',
      recommended: true
    },
    {
      id: 'json' as ExportFormat,
      name: 'JSON',
      description: 'JavaScript Object Notation (API friendly)',
      icon: '🔧',
      recommended: false
    },
    {
      id: 'google-sheets' as ExportFormat,
      name: 'Google Sheets',
      description: 'Direct import to Google Sheets',
      icon: '📋',
      recommended: true
    },
    {
      id: 'airtable' as ExportFormat,
      name: 'Airtable',
      description: 'Airtable-compatible CSV format',
      icon: '🗃️',
      recommended: false
    }
  ]

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTicketValue = (ticket: Ticket, key: string): string => {
    switch (key) {
      case 'date':
        return ticket.date || ticket.uploadDate.split('T')[0]
      case 'fileSize':
        return formatFileSize(ticket.fileSize)
      case 'uploadDate':
        return formatDate(ticket.uploadDate)
      case 'isManualEntry':
        return ticket.isManualEntry ? 'Manual Entry' : 'File Upload'
      case 'hasImage':
        return (ticket.imageUrl || ticket.filePath) ? 'Yes' : 'No'
      default:
        return String(ticket[key as keyof Ticket] || '')
    }
  }

  const toggleColumn = (key: string) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, selected: !col.selected } : col
    ))
  }

  const selectAllColumns = () => {
    setColumns(prev => prev.map(col => ({ ...col, selected: true })))
  }

  const deselectAllColumns = () => {
    setColumns(prev => prev.map(col => ({ ...col, selected: false })))
  }

  const generateCSV = () => {
    const selectedColumns = columns.filter(col => col.selected)
    const headers = selectedColumns.map(col => col.label)
    
    const escapeCSV = (value: string): string => {
      const str = String(value).trim()
      return `"${str.replace(/"/g, '""')}"`
    }

    const csvRows = [headers.map(header => escapeCSV(header)).join(',')]
    
    tickets.forEach(ticket => {
      const row = selectedColumns.map(col => escapeCSV(getTicketValue(ticket, col.key)))
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }

  const generateJSON = () => {
    const selectedColumns = columns.filter(col => col.selected)
    
    const data = tickets.map(ticket => {
      const row: Record<string, string> = {}
      selectedColumns.forEach(col => {
        row[col.label] = getTicketValue(ticket, col.key)
      })
      return row
    })

    const exportData = {
      metadata: includeMetadata ? {
        reportName,
        generatedAt: new Date().toISOString(),
        totalRecords: tickets.length,
        filters: Object.entries(filters)
          .filter(([_, value]) => value && (Array.isArray(value) ? value.length > 0 : true))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      } : undefined,
      data
    }

    return JSON.stringify(exportData, null, 2)
  }

  const generateExcelCompatibleCSV = () => {
    // Use semicolon separator for better Excel compatibility in many regions
    const selectedColumns = columns.filter(col => col.selected)
    const headers = selectedColumns.map(col => col.label)
    
    const escapeCSV = (value: string): string => {
      const str = String(value).trim()
      return `"${str.replace(/"/g, '""')}"`
    }

    const csvRows = [headers.map(header => escapeCSV(header)).join(';')]
    
    tickets.forEach(ticket => {
      const row = selectedColumns.map(col => escapeCSV(getTicketValue(ticket, col.key)))
      csvRows.push(row.join(';'))
    })

    // Add BOM for proper UTF-8 encoding in Excel
    return '\uFEFF' + csvRows.join('\n')
  }

  const generateGoogleSheetsFormat = () => {
    // Google Sheets prefers comma-separated with proper escaping
    return generateCSV()
  }

  const generateAirtableFormat = () => {
    // Airtable uses standard CSV format
    return generateCSV()
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleExport = async () => {
    if (tickets.length === 0) {
      alert('No tickets to export')
      return
    }

    const selectedColumns = columns.filter(col => col.selected)
    if (selectedColumns.length === 0) {
      alert('Please select at least one column to export')
      return
    }

    setExporting(true)

    try {
      const timestamp = new Date().toISOString().split('T')[0]
      const baseFilename = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`

      let content: string
      let filename: string
      let mimeType: string

      switch (selectedFormat) {
        case 'csv':
          content = generateCSV()
          filename = `${baseFilename}.csv`
          mimeType = 'text/csv'
          break
        case 'excel':
          content = generateExcelCompatibleCSV()
          filename = `${baseFilename}.csv`
          mimeType = 'text/csv'
          break
        case 'json':
          content = generateJSON()
          filename = `${baseFilename}.json`
          mimeType = 'application/json'
          break
        case 'google-sheets':
          content = generateGoogleSheetsFormat()
          filename = `${baseFilename}_google_sheets.csv`
          mimeType = 'text/csv'
          break
        case 'airtable':
          content = generateAirtableFormat()
          filename = `${baseFilename}_airtable.csv`
          mimeType = 'text/csv'
          break
        default:
          throw new Error('Unsupported export format')
      }

      downloadFile(content, filename, mimeType)

      // Show success message with format-specific instructions
      if (selectedFormat === 'google-sheets') {
        alert('CSV file downloaded! To import to Google Sheets:\n1. Open Google Sheets\n2. File > Import\n3. Upload the downloaded CSV file\n4. Choose "Comma" as separator')
      } else if (selectedFormat === 'airtable') {
        alert('CSV file downloaded! To import to Airtable:\n1. Open your Airtable base\n2. Click "Add a table"\n3. Choose "CSV file"\n4. Upload the downloaded file')
      } else if (selectedFormat === 'excel') {
        alert('Excel-compatible CSV downloaded! The file should open directly in Microsoft Excel with proper formatting.')
      }

    } catch (error) {
      console.error('Export error:', error)
      alert('Error exporting data. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="advanced-export">
      <h3>📤 Export Options</h3>
      
      {/* Format Selection */}
      <div className="format-selection">
        <h4>Choose Export Format</h4>
        <div className="format-grid">
          {exportFormats.map(format => (
            <div
              key={format.id}
              className={`format-card ${selectedFormat === format.id ? 'selected' : ''} ${format.recommended ? 'recommended' : ''}`}
              onClick={() => setSelectedFormat(format.id)}
            >
              <div className="format-icon">{format.icon}</div>
              <div className="format-info">
                <h5>{format.name}</h5>
                <p>{format.description}</p>
                {format.recommended && <span className="recommended-badge">Recommended</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column Selection */}
      <div className="column-selection">
        <div className="column-header">
          <h4>Select Columns to Export</h4>
          <div className="column-actions">
            <button onClick={() => setShowColumnSelector(!showColumnSelector)}>
              {showColumnSelector ? '🔼 Hide Columns' : '🔽 Show Columns'}
            </button>
            <button onClick={selectAllColumns}>Select All</button>
            <button onClick={deselectAllColumns}>Deselect All</button>
          </div>
        </div>

        {showColumnSelector && (
          <div className="column-grid">
            {columns.map(column => (
              <label key={column.key} className="column-checkbox">
                <input
                  type="checkbox"
                  checked={column.selected}
                  onChange={() => toggleColumn(column.key)}
                />
                {column.label}
              </label>
            ))}
          </div>
        )}

        <div className="selected-columns-summary">
          <span>{columns.filter(col => col.selected).length} of {columns.length} columns selected</span>
        </div>
      </div>

      {/* Export Options */}
      <div className="export-options">
        <h4>Export Options</h4>
        <div className="options-grid">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
            />
            Include metadata (report info, filters, timestamp)
          </label>
        </div>
      </div>

      {/* Export Button */}
      <div className="export-actions">
        <button
          className="export-button"
          onClick={handleExport}
          disabled={exporting || tickets.length === 0}
        >
          {exporting ? (
            <>
              <span className="spinner"></span>
              Exporting...
            </>
          ) : (
            <>
              <span className="export-icon">📥</span>
              Export {tickets.length} Records as {exportFormats.find(f => f.id === selectedFormat)?.name}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default AdvancedExport
