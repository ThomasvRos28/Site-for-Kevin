import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import MaterialTicketing from './components/MaterialTicketing'
import TicketArchive from './components/TicketArchive'
import Administration from './components/Administration'
import MTOFlagship from './components/MTOFlagship'
import TruckerLogin from './components/TruckerLogin'
import TruckerStats from './components/TruckerStats'
import './App.css'

function App() {
  const basename = import.meta.env.PROD ? '/Site-for-Kevin' : ''

  // Debug logging
  console.log('App component rendering...')
  console.log('Environment:', import.meta.env.MODE)
  console.log('Production:', import.meta.env.PROD)
  console.log('Basename:', basename)

  try {
    return (
      <Router basename={basename}>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/administration" element={<Administration />} />
            <Route path="/material-ticketing" element={<MaterialTicketing />} />
            <Route path="/ticket-archive" element={<TicketArchive />} />
            <Route path="/mto-flagship" element={<MTOFlagship />} />
            <Route path="/trucker-login" element={<TruckerLogin />} />
            <Route path="/trucker-stats" element={<TruckerStats />} />
          </Routes>
        </div>
      </Router>
    )
  } catch (error) {
    console.error('Error rendering App:', error)
    return (
      <div style={{ padding: '20px', backgroundColor: 'red', color: 'white', minHeight: '100vh' }}>
        <h1>Error Loading App</h1>
        <p>Error: {String(error)}</p>
        <p>Environment: {import.meta.env.MODE}</p>
        <p>Production: {String(import.meta.env.PROD)}</p>
        <p>Basename: {basename}</p>
      </div>
    )
  }
}

export default App
