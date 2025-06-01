import { useState } from 'react'

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

interface SendInvoicesProps {
  tickets: Ticket[]
  clients: Client[]
}

const SendInvoices = ({ tickets, clients }: SendInvoicesProps) => {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [sending, setSending] = useState(false)

  const completedTickets = tickets.filter(ticket => ticket.status === 'completed')

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTickets.length === completedTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(completedTickets.map(ticket => ticket.id))
    }
  }

  const groupedTickets = selectedTickets.reduce((groups, ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId)
    if (ticket) {
      if (!groups[ticket.client]) {
        groups[ticket.client] = []
      }
      groups[ticket.client].push(ticket)
    }
    return groups
  }, {} as Record<string, Ticket[]>)

  const handleSendInvoices = async () => {
    setSending(true)
    
    // Simulate sending invoices
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert(`Invoices sent successfully for ${Object.keys(groupedTickets).length} clients!`)
    setSelectedTickets([])
    setShowPreview(false)
    setSending(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getTotalForClient = (clientTickets: Ticket[]) => {
    return clientTickets.reduce((sum, ticket) => sum + ticket.price, 0)
  }

  return (
    <div className="send-invoices">
      <div className="section-header">
        <h2>Send Invoices</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowPreview(true)}
            disabled={selectedTickets.length === 0}
          >
            Preview Invoice ({selectedTickets.length})
          </button>
        </div>
      </div>

      <div className="section">
        <h3>Select Completed Tickets</h3>
        <div className="select-actions">
          <button className="btn btn-secondary" onClick={handleSelectAll}>
            {selectedTickets.length === completedTickets.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="selection-count">
            {selectedTickets.length} of {completedTickets.length} tickets selected
          </span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Ticket ID</th>
                <th>Client</th>
                <th>Project</th>
                <th>Date</th>
                <th>Material</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {completedTickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(ticket.id)}
                      onChange={() => handleTicketSelect(ticket.id)}
                    />
                  </td>
                  <td>{ticket.id}</td>
                  <td>{ticket.client}</td>
                  <td>{ticket.project}</td>
                  <td>{ticket.date}</td>
                  <td>{ticket.material}</td>
                  <td>{ticket.quantity} {ticket.unit}</td>
                  <td>{formatCurrency(ticket.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {completedTickets.length === 0 && (
            <div className="no-tickets">
              No completed tickets available for invoicing.
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Invoice Preview</h3>
              <button className="close-button" onClick={() => setShowPreview(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="invoice-summary">
                <h4>Invoice Summary</h4>
                <p>Invoices will be sent to {Object.keys(groupedTickets).length} client(s)</p>
              </div>

              {Object.entries(groupedTickets).map(([clientName, clientTickets]) => {
                const client = clients.find(c => c.name === clientName)
                return (
                  <div key={clientName} className="client-invoice">
                    <div className="client-header">
                      <h5>{clientName}</h5>
                      <span className="client-email">{client?.email || 'No email'}</span>
                    </div>
                    
                    <div className="invoice-items">
                      {clientTickets.map(ticket => (
                        <div key={ticket.id} className="invoice-item">
                          <span>{ticket.id} - {ticket.material}</span>
                          <span>{ticket.quantity} {ticket.unit}</span>
                          <span>{formatCurrency(ticket.price)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="client-total">
                      <strong>Total: {formatCurrency(getTotalForClient(clientTickets))}</strong>
                    </div>
                  </div>
                )
              })}

              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowPreview(false)}
                  disabled={sending}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-success"
                  onClick={handleSendInvoices}
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send Invoices'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SendInvoices
