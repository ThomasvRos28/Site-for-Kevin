import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './TruckerLogin.css'

const TruckerLogin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    driverName: '',
    driverCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [developerMode, setDeveloperMode] = useState(false)

  // Check if developer mode is enabled
  useEffect(() => {
    const devMode = localStorage.getItem('developerMode')
    const isDevMode = devMode && JSON.parse(devMode)
    setDeveloperMode(isDevMode || false)
  }, [])

  // Test credentials for developer mode
  const testCredentials = [
    {
      name: 'John Smith',
      code: '123',
      loads: 3,
      description: '3 loads (Gravel, Sand, Stone)'
    },
    {
      name: 'Mike Johnson',
      code: '456',
      loads: 2,
      description: '2 loads (Concrete, Asphalt)'
    }
  ]

  const fillTestCredentials = (credentials: typeof testCredentials[0]) => {
    setFormData({
      driverName: credentials.name,
      driverCode: credentials.code
    })
    setError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('Attempting trucker login with:', {
      driverName: formData.driverName.trim(),
      driverCode: formData.driverCode.trim()
    })

    try {
      console.log('Making request to:', 'http://localhost:5000/api/auth/trucker/login')
      const response = await axios.post('http://localhost:5000/api/auth/trucker/login', {
        driverName: formData.driverName.trim(),
        driverCode: formData.driverCode.trim()
      })

      console.log('Login response:', response.data)

      if (response.data.success) {
        // Store trucker info in localStorage
        const authData = {
          driverName: response.data.driver.name,
          driverCode: response.data.driver.code,
          loginTime: new Date().toISOString(),
          token: response.data.token
        }
        console.log('Storing auth data:', authData)
        localStorage.setItem('truckerAuth', JSON.stringify(authData))

        // Navigate to trucker stats
        console.log('Navigating to trucker stats...')
        navigate('/trucker-stats')
      } else {
        console.error('Login failed - success was false')
        setError('Login failed. Please check your credentials.')
      }
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      })

      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('Cannot connect to server. Please make sure the server is running on port 5000.')
      } else {
        setError(error.response?.data?.error || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="trucker-login-container">
      <div className="login-layout">
        <div className="trucker-login-card">
        <div className="login-header">
          <button
            className="back-button"
            onClick={() => navigate('/')}
            title="Back to Landing Page"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <div className="login-title">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="truck-icon">
              <path d="M3 7h18l-2 9H5L3 7z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="9" cy="20" r="1" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="1" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M3 7L2 3H1" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            <h1>Trucker Login</h1>
          </div>
        </div>

        <div className="login-description">
          <p>Enter your driver information to view your load statistics and performance metrics.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="driverName">Driver Name</label>
            <input
              type="text"
              id="driverName"
              name="driverName"
              value={formData.driverName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="driverCode">Driver Code</label>
            <input
              type="text"
              id="driverCode"
              name="driverCode"
              value={formData.driverCode}
              onChange={handleInputChange}
              placeholder="Enter your driver code"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading || !formData.driverName.trim() || !formData.driverCode.trim()}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Logging in...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2"/>
                </svg>
                View My Stats
              </>
            )}
          </button>
        </form>

        <div className="login-info">
          <div className="info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v4l0 0 4 0" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>View your total loads moved</span>
          </div>
          <div className="info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Track your performance metrics</span>
          </div>
          <div className="info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 11H1l6-6 6 6zm0 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6h6z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Access your delivery history</span>
          </div>
        </div>
      </div>

        {developerMode && (
          <div className="test-credentials-panel">
            <div className="test-credentials-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h3>Test Credentials</h3>
              <span className="dev-badge">DEV</span>
            </div>

            <div className="test-credentials-list">
              {testCredentials.map((cred, index) => (
                <div key={index} className="test-credential-item">
                  <div className="credential-info">
                    <div className="credential-name">{cred.name}</div>
                    <div className="credential-code">Code: {cred.code}</div>
                    <div className="credential-description">{cred.description}</div>
                  </div>
                  <button
                    className="use-credential-btn"
                    onClick={() => fillTestCredentials(cred)}
                    title="Click to use these credentials"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Use
                  </button>
                </div>
              ))}
            </div>

            <div className="test-credentials-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4l0 0 4 0" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Click "Use" to auto-fill login form</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TruckerLogin
