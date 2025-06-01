import { useState } from 'react'
import './SendInvoicesButton.css'

interface SendInvoicesButtonProps {
  selectedTickets: string[]
  onInvoicesSent: () => void
}

const SendInvoicesButton = ({ selectedTickets, onInvoicesSent }: SendInvoicesButtonProps) => {
  const [showModal, setShowModal] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  const handleSendInvoices = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!recipientEmail.trim()) {
      setMessage('Please enter a recipient email')
      return
    }

    if (selectedTickets.length === 0) {
      setMessage('Please select tickets to send')
      return
    }

    setSending(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/invoices/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticketIds: selectedTickets,
          recipientEmail: recipientEmail.trim()
        })
      })

      if (response.ok) {
        const result = await response.json()
        setMessage(`Invoices sent successfully to ${result.recipientEmail}`)
        setTimeout(() => {
          setShowModal(false)
          setRecipientEmail('')
          setMessage('')
          onInvoicesSent()
        }, 2000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      setMessage('Error sending invoices')
      console.error('Send invoices error:', error)
    } finally {
      setSending(false)
    }
  }

  const handleCancel = () => {
    setShowModal(false)
    setRecipientEmail('')
    setMessage('')
  }

  return (
    <>
      <button 
        className="send-invoices-button"
        onClick={() => setShowModal(true)}
        disabled={selectedTickets.length === 0}
        title={selectedTickets.length === 0 ? 'Select tickets to send invoices' : `Send invoices for ${selectedTickets.length} selected tickets`}
      >
        <span className="email-icon">📧</span>
        Send Invoices ({selectedTickets.length})
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Send Invoices</h3>
              <button className="close-button" onClick={handleCancel}>×</button>
            </div>

            <div className="modal-body">
              <p className="invoice-info">
                You are about to send invoices for <strong>{selectedTickets.length}</strong> selected ticket(s).
              </p>

              <form onSubmit={handleSendInvoices}>
                <div className="form-group">
                  <label htmlFor="recipient-email">Recipient Email:</label>
                  <input
                    id="recipient-email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter recipient email address"
                    required
                    disabled={sending}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={handleCancel}
                    disabled={sending}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="send-button"
                    disabled={sending || !recipientEmail.trim()}
                  >
                    {sending ? (
                      <>
                        <span className="spinner"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Invoices'
                    )}
                  </button>
                </div>

                {message && (
                  <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SendInvoicesButton
