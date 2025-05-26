import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Home.css'

const Home = () => {
  const navigate = useNavigate()
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('MaterialFlow Dashboard')

  // Typewriter effect state
  const [currentText, setCurrentText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const phrases = [
    'material tracking',
    'ticket management',
    'invoice processing',
    'workflow operations',
    'documentation',
    'communications'
  ]

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

  // Typewriter effect
  useEffect(() => {
    const currentPhrase = phrases[currentIndex]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1))
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 1500)
          return
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1))
        } else {
          // Move to next phrase
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % phrases.length)
        }
      }
    }, isDeleting ? 75 : 80) // Similar speed for typing and deleting

    return () => clearTimeout(timeout)
  }, [currentText, currentIndex, isDeleting, phrases])

  const navigationButtons = [
    {
      title: 'Administration',
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
      description: 'Upload, manage, and process material tickets',
      path: '/material-ticketing',
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
      title: "MTO's Flagship",
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
              <span className="typewriter-text">{currentText}</span>
              <span className="typewriter-cursor">|</span>
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
              onClick={() => navigate(button.path)}
              style={{ borderLeftColor: button.color }}
            >
              <div className="nav-card-icon" style={{ color: button.color }}>
                {button.icon}
              </div>
              <div className="nav-card-content">
                <h2>{button.title}</h2>
                <p>{button.description}</p>
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
