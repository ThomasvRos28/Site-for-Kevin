import { useState } from 'react'
import './ExportButton.css'

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
  // Additional manual ticket fields
  date?: string
  jobProjectId?: string
  materialType?: string
  loadQuantity?: string
  loadUnit?: string
  ticketNumber?: string
  driverName?: string
  isManualEntry?: boolean
}

interface ExportButtonProps {
  tickets: Ticket[]
}

const ExportButton = ({ tickets }: ExportButtonProps) => {
  const [exporting, setExporting] = useState(false)

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

  const exportToCSV = () => {
    if (tickets.length === 0) {
      alert('No tickets to export')
      return
    }

    setExporting(true)
    console.log('Exporting tickets:', tickets.length, 'tickets')
    console.log('Sample ticket:', tickets[0])
    console.log('All tickets:', tickets)

    try {
      // Define comprehensive CSV headers including all manual ticket fields
      const headers = [
        'Ticket ID',
        'Ticket Number',
        'Date',
        'Client Name',
        'Job/Project ID',
        'Material Type',
        'Load Quantity',
        'Load Unit',
        'Driver Name',
        'File Name',
        'Description/Notes',
        'File Size',
        'Upload Date',
        'Status',
        'Entry Type',
        'Has Image'
      ]

      // Helper function to safely escape CSV values
      const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return ''
        const str = String(value).trim()
        // Always wrap in quotes and escape internal quotes for maximum compatibility
        return `"${str.replace(/"/g, '""')}"`
      }

      // Create CSV rows with proper formatting
      const csvRows = []

      // Try semicolon separator first (better for Excel in many regions)
      const separator = ';'

      // Add header row with proper CSV escaping
      csvRows.push(headers.map(header => escapeCSV(header)).join(separator))

      // Add data rows
      tickets.forEach((ticket, index) => {
        console.log(`Processing ticket ${index + 1}:`, ticket)

        // Handle date formatting more robustly
        const getTicketDate = (ticket: any) => {
          console.log(`Date processing for ticket ${index + 1}:`, {
            'ticket.date': ticket.date,
            'ticket.uploadDate': ticket.uploadDate,
            'typeof ticket.date': typeof ticket.date,
            'typeof ticket.uploadDate': typeof ticket.uploadDate
          })

          // Try multiple date sources and formats
          if (ticket.date) {
            try {
              // Handle YYYY-MM-DD format (from date input)
              if (typeof ticket.date === 'string' && ticket.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const formattedDate = new Date(ticket.date + 'T00:00:00').toLocaleDateString()
                console.log(`Formatted ticket.date (YYYY-MM-DD): ${ticket.date} -> ${formattedDate}`)
                return formattedDate
              }
              // Handle other date formats
              const formattedDate = new Date(ticket.date).toLocaleDateString()
              console.log(`Formatted ticket.date: ${ticket.date} -> ${formattedDate}`)
              return formattedDate
            } catch (e) {
              console.warn('Invalid ticket.date:', ticket.date, e)
            }
          }
          // Fallback to upload date if no specific date
          if (ticket.uploadDate) {
            try {
              const formattedDate = new Date(ticket.uploadDate).toLocaleDateString()
              console.log(`Formatted ticket.uploadDate: ${ticket.uploadDate} -> ${formattedDate}`)
              return formattedDate
            } catch (e) {
              console.warn('Invalid ticket.uploadDate:', ticket.uploadDate, e)
            }
          }
          console.log('No valid date found for ticket')
          return ''
        }

        const row = [
          escapeCSV(ticket.id || ''),
          escapeCSV(ticket.ticketNumber || ''),
          escapeCSV(getTicketDate(ticket)),
          escapeCSV(ticket.clientName || ''),
          escapeCSV(ticket.jobProjectId || ''),
          escapeCSV(ticket.materialType || ''),
          escapeCSV(ticket.loadQuantity || ''),
          escapeCSV(ticket.loadUnit || ''),
          escapeCSV(ticket.driverName || ''),
          escapeCSV(ticket.fileName || ''),
          escapeCSV((ticket.description || '').replace(/[\t\n\r]/g, ' ')),
          escapeCSV(formatFileSize(ticket.fileSize)),
          escapeCSV(formatDate(ticket.uploadDate)),
          escapeCSV(ticket.status || ''),
          escapeCSV(ticket.isManualEntry ? 'Manual Entry' : 'File Upload'),
          escapeCSV((ticket.imageUrl || ticket.filePath) ? 'Yes' : 'No')
        ]

        console.log(`Row ${index + 1} data:`, row)
        console.log(`Row ${index + 1} joined:`, row.join(separator))
        csvRows.push(row.join(separator))
      })

      // Create CSV content with proper line endings
      const csvContent = csvRows.join('\n')

      console.log('CSV Headers:', headers)
      console.log('CSV Separator:', separator)
      console.log('CSV Rows count:', csvRows.length)
      console.log('CSV Rows array:', csvRows)
      console.log('First few lines of CSV:', csvContent.substring(0, 500))
      console.log('Full CSV content:', csvContent)
      console.log('Sample row structure:', csvRows[1] ? csvRows[1].split(separator).length + ' columns' : 'No data rows')

      if (csvRows.length <= 1) {
        console.error('WARNING: Only header row found, no data rows!')
        alert('Warning: No data rows found to export. Only headers will be exported.')
      }

      // Create and download file with proper MIME type
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const link = document.createElement('a')

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        const timestamp = new Date().toISOString().split('T')[0]
        const filename = `material_tickets_export_${timestamp}.csv`
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
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

  return (
    <button
      className="export-button"
      onClick={exportToCSV}
      disabled={exporting || tickets.length === 0}
      title={tickets.length === 0 ? 'No tickets to export' : `Export ${tickets.length} tickets to CSV`}
    >
      {exporting ? (
        <>
          <span className="spinner"></span>
          Exporting...
        </>
      ) : (
        <>
          <span className="export-icon">📊</span>
          Export CSV ({tickets.length})
        </>
      )}
    </button>
  )
}

export default ExportButton
