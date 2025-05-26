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

    try {
      // Define CSV headers
      const headers = [
        'ID',
        'Client Name',
        'File Name',
        'Description',
        'File Size',
        'Upload Date',
        'Status'
      ]

      // Convert tickets to CSV rows
      const csvRows = [
        headers.join(','), // Header row
        ...tickets.map(ticket => [
          `"${ticket.id}"`,
          `"${ticket.clientName}"`,
          `"${ticket.fileName}"`,
          `"${ticket.description.replace(/"/g, '""')}"`, // Escape quotes
          `"${formatFileSize(ticket.fileSize)}"`,
          `"${formatDate(ticket.uploadDate)}"`,
          `"${ticket.status}"`
        ].join(','))
      ]

      // Create CSV content
      const csvContent = csvRows.join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `tickets_export_${new Date().toISOString().split('T')[0]}.csv`)
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
