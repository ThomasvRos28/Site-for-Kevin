import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import MaterialTicketing from './components/MaterialTicketing'
import TicketArchive from './components/TicketArchive'
import Administration from './components/Administration'
import MTOFlagship from './components/MTOFlagship'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/administration" element={<Administration />} />
          <Route path="/material-ticketing" element={<MaterialTicketing />} />
          <Route path="/ticket-archive" element={<TicketArchive />} />
          <Route path="/mto-flagship" element={<MTOFlagship />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
