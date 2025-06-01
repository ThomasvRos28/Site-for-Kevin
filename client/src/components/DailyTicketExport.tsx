import { useState, useEffect } from 'react';
import './DailyTicketExport.css';

interface Ticket {
  id: string;
  date: string;
  customer: string;
  truckNumber: string;
  dumpingTicketNumber: string;
  fileName: string;
  filePath: string;
}

interface DailyTicketExportProps {
  clientId: string;
  clientEmail: string;
}

const DailyTicketExport = ({ clientId, clientEmail }: DailyTicketExportProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTodaysTickets();
  }, [clientId]);

  const fetchTodaysTickets = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`http://localhost:5000/api/tickets/daily/${clientId}?date=${today}`);
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        setMessage('Error fetching tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setMessage('Error fetching tickets');
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/tickets/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          clientEmail,
          tickets,
        }),
      });

      if (response.ok) {
        setMessage('Tickets exported successfully');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      setMessage('Error exporting tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="daily-ticket-export">
      <h2>Daily Ticket Export</h2>
      
      {tickets.length > 0 ? (
        <>
          <div className="tickets-list">
            <h3>Tickets for {new Date().toLocaleDateString()}</h3>
            <ul>
              {tickets.map(ticket => (
                <li key={ticket.id}>
                  <span className="ticket-number">#{ticket.dumpingTicketNumber}</span>
                  <span className="ticket-customer">{ticket.customer}</span>
                  <span className="ticket-truck">Truck #{ticket.truckNumber}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            className="export-button"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export Tickets'}
          </button>
        </>
      ) : (
        <p>No tickets found for today</p>
      )}

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default DailyTicketExport; 