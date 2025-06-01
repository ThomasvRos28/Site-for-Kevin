import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import Home from './components/Home'
import MaterialTicketing from './components/MaterialTicketing'
import TruckerMaterialTicketing from './components/TruckerMaterialTicketing'
import TicketArchive from './components/TicketArchive'
import Administration from './components/Administration'
import MTOFlagship from './components/MTOFlagship'
import TruckerLogin from './components/TruckerLogin'
import TruckerStats from './components/TruckerStats'
import TicketHistoryPage from './components/TicketHistoryPage'
import LanguageSwitcher from './components/LanguageSwitcher'
import PurchaseOrderList from './components/PurchaseOrderList'
import PurchaseOrderForm from './components/PurchaseOrderForm'
import AvailableJobsList from './components/AvailableJobsList'
import TruckerJobAcceptance from './components/TruckerJobAcceptance'
import TruckerActiveJob from './components/TruckerActiveJob'
import TruckerJobCompletion from './components/TruckerJobCompletion'
// AdminDashboard removed as it duplicates PurchaseOrderList functionality
import { PurchaseOrderProvider } from './contexts/PurchaseOrderContext'
import Login from './components/Login'
import Register from './components/Register'
import LandingPage from './components/LandingPage'
import { useAuth } from './contexts/AuthContext'
import './App.css'
import './styles/global.css'

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

// Trucker route component
const TruckerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const truckerAuth = localStorage.getItem('truckerAuth')
  
  if (!truckerAuth) {
    return <Navigate to="/trucker-login" />
  }

  return <>{children}</>
}

function App() {
  const basename = import.meta.env.PROD ? '/Site-for-Kevin' : ''

  // Debug logging
  console.log('App component rendering...')
  console.log('Environment:', import.meta.env.MODE)
  console.log('Production:', import.meta.env.PROD)
  console.log('Basename:', basename)

  try {
    return (
      <I18nextProvider i18n={i18n}>
        <Router basename={basename}>
          <PurchaseOrderProvider>
            <div className="app">
              <LanguageSwitcher />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/administration" element={<ProtectedRoute><Administration /></ProtectedRoute>} />
                <Route path="/admin" element={<Navigate to="/administration" />} />
                <Route path="/material-ticketing" element={<ProtectedRoute><MaterialTicketing /></ProtectedRoute>} />
                <Route path="/trucker-material-ticketing" element={
                  <TruckerRoute>
                    <TruckerMaterialTicketing />
                  </TruckerRoute>
                } />
                <Route path="/ticket-archive" element={<ProtectedRoute><TicketArchive /></ProtectedRoute>} />
                <Route path="/mto-flagship" element={<ProtectedRoute><MTOFlagship /></ProtectedRoute>} />
                <Route path="/ticket-history" element={<ProtectedRoute><TicketHistoryPage /></ProtectedRoute>} />
                <Route path="/trucker-login" element={<TruckerLogin />} />
                <Route path="/trucker-stats" element={
                  <TruckerRoute>
                    <TruckerStats />
                  </TruckerRoute>
                } />
                <Route path="/trucker-available-jobs" element={
                  <TruckerRoute>
                    <AvailableJobsList />
                  </TruckerRoute>
                } />
                <Route path="/trucker-job-acceptance/:jobId" element={
                  <TruckerRoute>
                    <TruckerJobAcceptance />
                  </TruckerRoute>
                } />
                <Route path="/trucker-active-job" element={
                  <TruckerRoute>
                    <TruckerActiveJob />
                  </TruckerRoute>
                } />
                <Route path="/trucker-job-completion/:jobId" element={
                  <TruckerRoute>
                    <TruckerJobCompletion />
                  </TruckerRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* AdminDashboard route removed as it duplicates PurchaseOrderList functionality */}
                <Route
                  path="/purchase-orders"
                  element={
                    <ProtectedRoute>
                      <PurchaseOrderList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/purchase-orders/new"
                  element={
                    <ProtectedRoute>
                      <PurchaseOrderForm onSubmit={() => {}} geofences={[]} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/purchase-orders/:id/edit"
                  element={
                    <ProtectedRoute>
                      <PurchaseOrderForm onSubmit={() => {}} geofences={[]} />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </PurchaseOrderProvider>
        </Router>
      </I18nextProvider>
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
