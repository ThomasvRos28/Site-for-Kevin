import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './TruckerStats.css'

interface TruckerStats {
  totalLoads: number
  totalCubicYards: number
  totalTons: number
  totalOtherUnits: number
  recentLoads: Array<{
    id: string
    date: string
    clientName: string
    materialType: string
    loadQuantity: string
    loadUnit: string
    ticketNumber: string
  }>
  monthlyStats: Array<{
    month: string
    loads: number
    cubicYards: number
    tons: number
    otherUnits: number
  }>
}

const TruckerStats = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<TruckerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [driverInfo, setDriverInfo] = useState<any>(null)

  useEffect(() => {
    // Check if developer mode is enabled
    const developerMode = localStorage.getItem('developerMode')
    if (!developerMode || !JSON.parse(developerMode)) {
      navigate('/')
      return
    }

    // Check if trucker is logged in
    const truckerAuth = localStorage.getItem('truckerAuth')
    if (!truckerAuth) {
      navigate('/trucker-login')
      return
    }

    const driverData = JSON.parse(truckerAuth)
    setDriverInfo(driverData)
    fetchStats(driverData.driverName)
  }, [navigate])

  const fetchStats = async (driverName: string) => {
    try {
      setLoading(true)
      setError('')
      console.log(`Fetching stats for ${driverName}...`)
      const response = await axios.get(`http://localhost:5000/api/auth/trucker/stats`, {
        params: { driverName },
      })
      setStats(response.data)
    } catch (error: any) {
      console.error('Error fetching stats:', error)
      setError(error.response?.data?.error || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('truckerAuth')
    navigate('/')
  }

  if (loading) {
    return (
      <div className="trucker-stats-container">
        <div className="loading-spinner">
          <div className="spinner-large"></div>
          <p>Loading your stats...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="trucker-stats-container">
        <div className="error-container">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <h2>Error Loading Stats</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/trucker-login')} className="retry-button">
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="trucker-stats-container">
      <header className="stats-header">
        <div className="header-left">
          <button
            className="back-button"
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <div className="driver-info">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="driver-icon">
              <path d="M3 7h18l-2 9H5L3 7z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="9" cy="20" r="1" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="1" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M3 7L2 3H1" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            <div>
              <h1>Driver Dashboard</h1>
              <p>Welcome back, {driverInfo?.driverName}</p>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Logout
        </button>
        <button 
          onClick={() => navigate('/trucker-material-ticketing')} 
          className="material-ticketing-button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Material Ticketing
        </button>
      </header>

      <main className="stats-main">
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 8v6M23 11l-3 3-3-3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Total Loads</h3>
              <p className="stat-number">{stats?.totalLoads || 0}</p>
              <span className="stat-label">Loads Delivered</span>
            </div>
          </div>

          <div className="stat-card secondary">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h18v18H3V3z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M9 9h6v6H9V9z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M3 9h6M15 9h6M9 3v6M9 15v6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Cubic Yards</h3>
              <p className="stat-number">{stats?.totalCubicYards?.toLocaleString() || '0'}</p>
              <span className="stat-label">Cubic Yards Transported</span>
            </div>
          </div>

          <div className="stat-card tertiary">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Tons</h3>
              <p className="stat-number">{stats?.totalTons?.toLocaleString() || '0'}</p>
              <span className="stat-label">Tons Transported</span>
            </div>
          </div>

          {stats?.totalOtherUnits && stats.totalOtherUnits > 0 && (
            <div className="stat-card quaternary">
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Other Units</h3>
                <p className="stat-number">{stats?.totalOtherUnits?.toLocaleString() || '0'}</p>
                <span className="stat-label">Other Units Transported</span>
              </div>
            </div>
          )}
        </div>

        <div className="recent-loads">
          <h2>Recent Loads</h2>
          {stats?.recentLoads && stats.recentLoads.length > 0 ? (
            <div className="loads-table">
              <div className="table-header">
                <span>Date</span>
                <span>Client</span>
                <span>Material</span>
                <span>Quantity</span>
                <span>Unit</span>
                <span>Ticket #</span>
              </div>
              {stats.recentLoads.map((load) => (
                <div key={load.id} className="table-row">
                  <span data-label="Date:">{new Date(load.date).toLocaleDateString()}</span>
                  <span data-label="Client:">{load.clientName}</span>
                  <span data-label="Material:">{load.materialType}</span>
                  <span data-label="Quantity:">{load.loadQuantity}</span>
                  <span data-label="Unit:">{load.loadUnit || 'N/A'}</span>
                  <span data-label="Ticket #:">{load.ticketNumber}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <p>No recent loads found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default TruckerStats
