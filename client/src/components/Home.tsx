import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Home.css'
import { useTranslation } from 'react-i18next';

const Home = () => {
  console.log('Home component rendering...')
  const navigate = useNavigate()
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('MaterialFlow Dashboard')

  // Developer mode state
  const [developerMode, setDeveloperMode] = useState(() => {
    const saved = localStorage.getItem('developerMode')
    return saved ? JSON.parse(saved) : false
  })

  // Typewriter effect state
  const [currentText, setCurrentText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  const { t } = useTranslation();

  const phrases = [
    'material tracking',
    'ticket management',
    'invoice processing',
    'workflow operations',
    'documentation',
    'communications'
  ]

  // Toggle developer mode
  const toggleDeveloperMode = () => {
    const newMode = !developerMode
    setDeveloperMode(newMode)
    localStorage.setItem('developerMode', JSON.stringify(newMode))
  }

  // Quick test login function
  const quickTestLogin = () => {
    // Enable developer mode
    setDeveloperMode(true)
    localStorage.setItem('developerMode', JSON.stringify(true))
    
    // Create test trucker auth data
    const testTruckerAuth = {
      driverName: 'John Smith',
      driverCode: '123',
      loginTime: new Date().toISOString()
    }
    
    // Store in localStorage
    localStorage.setItem('truckerAuth', JSON.stringify(testTruckerAuth))
    
    // Navigate to trucker stats
    navigate('/trucker-stats')
  }

  // Quick Purchase Order login function
  const quickPOLogin = () => {
    // Create fake JWT token
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTc0YzFmMzEyMzQ1Njc4OTBhYmNkZWYiLCJyb2xlIjoiaGF1bGVyIiwiaWF0IjoxNjE2MTYyMzQ1LCJleHAiOjE2MTYyNDg3NDV9.fake-signature'
    
    // Create fake user data
    const fakeUser = {
      id: '6574c1f3123456789abcdef',
      name: 'Test Hauler',
      email: 'test@hauler.com',
      role: 'hauler'
    }
    
    // Store auth data in localStorage
    localStorage.setItem('token', fakeToken)
    localStorage.setItem('user', JSON.stringify(fakeUser))
    
    // Enable mock data mode
    localStorage.setItem('useMockData', 'true')
    
    // Navigate to purchase orders
    navigate('/purchase-orders')
  }

  // Control body overflow only for home page on desktop
  useEffect(() => {
    const isMobile = window.innerWidth <= 768

    if (!isMobile) {
      // Only prevent scrolling on desktop/tablet
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      // Allow scrolling on mobile
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
    }

    // Handle window resize
    const handleResize = () => {
      const isMobileNow = window.innerWidth <= 768
      if (isMobileNow) {
        document.body.style.overflow = 'auto'
        document.documentElement.style.overflow = 'auto'
      } else {
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup: restore scrolling when leaving home page
    return () => {
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Load company settings from localStorage (simulating persistence)
  useEffect(() => {
    const savedSettings = localStorage.getItem('materialflow-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.logoPreview) {
          setCompanyLogo(settings.logoPreview)
        }
        if (settings.companyName) {
          setCompanyName(settings.companyName)
        }
      } catch (error) {
        console.error('Error loading company settings:', error)
      }
    }
  }, [])

  // True 60fps typewriter effect
  useEffect(() => {
    let frameCount = 0
    let animationId: number
    let pauseFrames = 0
    const typingFrameDelay = 5 // 5 frames = 83ms at 60fps (faster typing)
    const deletingFrameDelay = 3 // 3 frames = 50ms at 60fps
    const pauseFrameDelay = 180 // 180 frames = 3 seconds at 60fps (good pause when complete)

    const animate = () => {
      frameCount++

      const currentPhrase = phrases[currentIndex]

      if (pauseFrames > 0) {
        pauseFrames--
      } else if (!isDeleting) {
        // Typing
        if (frameCount >= typingFrameDelay && charIndex < currentPhrase.length) {
          setCharIndex(prev => prev + 1)
          setCurrentText(currentPhrase.slice(0, charIndex + 1))
          frameCount = 0
        } else if (charIndex >= currentPhrase.length && pauseFrames === 0) {
          // Start pause before deleting (only if not already pausing)
          pauseFrames = pauseFrameDelay
          setIsDeleting(true)
          frameCount = 0
        }
      } else {
        // Deleting
        if (frameCount >= deletingFrameDelay && charIndex > 0) {
          setCharIndex(prev => prev - 1)
          setCurrentText(currentPhrase.slice(0, charIndex - 1))
          frameCount = 0
        } else if (charIndex <= 0) {
          // Move to next phrase
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % phrases.length)
          setCharIndex(0)
          setCurrentText('')
          frameCount = 0
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [currentIndex, isDeleting, charIndex, phrases])

  const navigationButtons = [
    {
      title: 'Administration',
      titleKey: 'navigation.administration',
      descKey: 'navigation.adminDesc',
      description: 'Manage system settings and user accounts',
      path: '/administration',
      color: '#1E88E5',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="10" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M8 26c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="8" r="2" fill="currentColor"/>
          <circle cx="8" cy="8" r="2" fill="currentColor"/>
          <circle cx="24" cy="24" r="2" fill="currentColor"/>
          <circle cx="8" cy="24" r="2" fill="currentColor"/>
        </svg>
      )
    },
    {
      title: 'Material Ticketing',
      titleKey: 'navigation.materialTicketing',
      descKey: 'navigation.ticketingDesc',
      description: 'Upload, manage, and process material tickets',
      path: '/ticket-history',
      color: '#FF9800',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M10 12h12M10 16h8M10 20h10" stroke="currentColor" strokeWidth="2"/>
          <circle cx="22" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M20 10l1 1 3-3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      )
    },
    {
      title: 'Purchase Orders',
      titleKey: 'navigation.purchaseOrders',
      descKey: 'navigation.poDesc',
      description: 'Create and manage purchase orders',
      path: '/purchase-orders',
      color: '#4CAF50',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M10 12h12M10 16h12M10 20h8" stroke="currentColor" strokeWidth="2"/>
          <circle cx="24" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M22 10l1 1 3-3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      )
    },
    {
      title: "MTO's Flagship",
      titleKey: 'navigation.mtoFlagship',
      descKey: 'navigation.mtoDesc',
      description: 'Access flagship features and tools',
      path: '/mto-flagship',
      color: '#00ACC1',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4l4 8h8l-6.5 4.7L24 24l-8-5.8L8 24l2.5-7.3L4 12h8l4-8z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M16 13v6M13 16h6" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    }
  ]

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="developer-mode-toggle">
            <label className="toggle-switch" title={t('toggleDevMode')}>
              <input
                type="checkbox"
                checked={developerMode}
                onChange={toggleDeveloperMode}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">{t('devMode')}</span>
            </label>
          </div>
          {developerMode && (
            <div className="trucker-login-button">
              <button
                className="trucker-btn"
                onClick={() => navigate('/trucker-login')}
                title={t('truckerLogin')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7h18l-2 9H5L3 7z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="9" cy="20" r="1" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="20" cy="20" r="1" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M3 7L2 3H1" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                {t('truckerLogin')}
              </button>
            </div>
          )}
          <div className="quick-test-login-button">
            <button
              className="test-login-btn"
              onClick={quickTestLogin}
              title={t('testLogin')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M16 3h5v5" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 3L14 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 11l9 9" stroke="currentColor" strokeWidth="2"/>
                <path d="M19 13v8H5V5h8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {t('testLogin')}
            </button>
          </div>
          <div className="quick-po-login-button">
            <button
              className="po-login-btn"
              onClick={quickPOLogin}
              title={t('poLogin')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {t('poLogin')}
            </button>
          </div>
        </div>
        <div className="header-brand">
          {companyLogo && (
            <img
              src={companyLogo}
              alt="Company Logo"
              className="company-logo"
            />
          )}
          <div className="brand-text">
            <h1>{companyName}</h1>
            <div className="typewriter-container">
              <span className="typewriter-prefix">Automate your</span>
              <span className="typewriter-space"> </span>
              <span className="typewriter-text">
                {currentText}
                <span className="typewriter-cursor">|</span>
              </span>
            </div>
            <p>Professional Material Ticketing & Workflow Management System</p>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="navigation-grid">
          {navigationButtons.map((button, index) => (
            <div
              key={index}
              className="nav-card"
              onClick={() => {
                if (button.title === 'Material Ticketing') {
                  navigate('/ticket-history');
                } else {
                  navigate(button.path);
                }
              }}
              style={{ borderLeftColor: button.color }}
            >
              <div className="nav-card-icon" style={{ color: button.color }}>
                {button.icon}
              </div>
              <div className="nav-card-content">
                <h2 style={{textTransform: 'capitalize', fontWeight: 600, color: '#fff'}}>
                  {t(button.titleKey)}
                </h2>
                <p style={{marginTop: 4, color: '#fff', fontSize: '1rem', fontWeight: 400}}>
                  {t(button.descKey)}
                </p>
              </div>
              <div className="nav-card-arrow">→</div>
            </div>
          ))}

        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2025 MaterialFlow Dashboard. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Home
