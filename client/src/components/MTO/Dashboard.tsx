import { useMemo } from 'react'
import './Dashboard.css'

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
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

interface DashboardProps {
  tickets: Ticket[]
  clients: Client[]
}

const Dashboard = ({ tickets }: DashboardProps) => {
  const dashboardData = useMemo(() => {
    // Calculate total revenue
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0)

    // Calculate total quantity
    const totalQuantity = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)

    // Group by material type
    const materialData = tickets.reduce((acc, ticket) => {
      if (!acc[ticket.material]) {
        acc[ticket.material] = { quantity: 0, revenue: 0, count: 0 }
      }
      acc[ticket.material].quantity += ticket.quantity
      acc[ticket.material].revenue += ticket.price
      acc[ticket.material].count += 1
      return acc
    }, {} as Record<string, { quantity: number; revenue: number; count: number }>)

    // Group by client
    const clientData = tickets.reduce((acc, ticket) => {
      if (!acc[ticket.client]) {
        acc[ticket.client] = { quantity: 0, revenue: 0, count: 0 }
      }
      acc[ticket.client].quantity += ticket.quantity
      acc[ticket.client].revenue += ticket.price
      acc[ticket.client].count += 1
      return acc
    }, {} as Record<string, { quantity: number; revenue: number; count: number }>)

    // Group by status
    const statusData = tickets.reduce((acc, ticket) => {
      if (!acc[ticket.status]) {
        acc[ticket.status] = 0
      }
      acc[ticket.status] += 1
      return acc
    }, {} as Record<string, number>)

    // Recent activity (last 7 days)
    const recentTickets = tickets
      .filter(ticket => {
        const ticketDate = new Date(ticket.date)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return ticketDate >= weekAgo
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    return {
      totalRevenue,
      totalQuantity,
      totalTickets: tickets.length,
      materialData,
      clientData,
      statusData,
      recentTickets
    }
  }, [tickets])

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

  return (
    <div className="dashboard">
      <div className="section-header">
        <h2>MTO Dashboard</h2>
        <div className="dashboard-period">
          <span>All Time Overview</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <div className="metric-value">{formatCurrency(dashboardData.totalRevenue)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>Total Quantity</h3>
            <div className="metric-value">{dashboardData.totalQuantity.toFixed(1)} tons</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎫</div>
          <div className="metric-content">
            <h3>Total Tickets</h3>
            <div className="metric-value">{dashboardData.totalTickets}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Active Clients</h3>
            <div className="metric-value">{Object.keys(dashboardData.clientData).length}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Material Breakdown */}
        <div className="chart-card">
          <h3>Volume by Material Type</h3>
          <div className="chart-content">
            {Object.entries(dashboardData.materialData).map(([material, data]) => (
              <div key={material} className="chart-bar">
                <div className="bar-label">
                  <span className="material-name">{material}</span>
                  <span className="material-value">{data.quantity.toFixed(1)} tons</span>
                </div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(data.quantity / dashboardData.totalQuantity) * 100}%`,
                      backgroundColor: '#2196f3'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Client */}
        <div className="chart-card">
          <h3>Revenue by Client</h3>
          <div className="chart-content">
            {Object.entries(dashboardData.clientData)
              .sort(([,a], [,b]) => b.revenue - a.revenue)
              .map(([client, data]) => (
              <div key={client} className="chart-bar">
                <div className="bar-label">
                  <span className="client-name">{client}</span>
                  <span className="client-value">{formatCurrency(data.revenue)}</span>
                </div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(data.revenue / dashboardData.totalRevenue) * 100}%`,
                      backgroundColor: '#4caf50'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Overview */}
        <div className="chart-card">
          <h3>Ticket Status Overview</h3>
          <div className="status-grid">
            {Object.entries(dashboardData.statusData).map(([status, count]) => (
              <div key={status} className="status-item">
                <div
                  className="status-circle"
                  style={{ backgroundColor: getStatusColor(status) }}
                >
                  {count}
                </div>
                <span className="status-label">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="chart-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {dashboardData.recentTickets.length > 0 ? (
              dashboardData.recentTickets.map(ticket => (
                <div key={ticket.id} className="activity-item">
                  <div className="activity-icon">🎫</div>
                  <div className="activity-content">
                    <div className="activity-title">
                      {ticket.ticketNumber || ticket.id} - {ticket.material}
                    </div>
                    <div className="activity-details">
                      {ticket.client} • {ticket.quantity} {ticket.unit} • {formatCurrency(ticket.price)}
                    </div>
                    <div className="activity-date">{ticket.date}</div>
                  </div>
                  <div
                    className="activity-status"
                    style={{ color: getStatusColor(ticket.status) }}
                  >
                    {ticket.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
