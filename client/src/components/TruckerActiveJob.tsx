import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { isWithinGeofence } from '../utils/geofencing';
import './TruckerActiveJob.css';

// Fix for default marker icon in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PurchaseOrder {
  _id: string;
  jobDetails: string;
  clientId: {
    name: string;
    email: string;
  };
  materialType: string;
  location: string;
  scheduledDate: string;
  status: string;
  truckNumber?: string;
  driverName?: string;
  startingLocation?: string;
  estimatedArrival?: string;
  notes?: string;
  geofence?: {
    type: 'Polygon' | 'Circle';
    coordinates?: number[][];
    center?: [number, number];
    radius?: number;
  };
}

const TruckerActiveJob: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [activeJob, setActiveJob] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [insideGeofence, setInsideGeofence] = useState(false);
  const [jobStatus, setJobStatus] = useState('');
  
  useEffect(() => {
    // Check if trucker is logged in
    const truckerAuth = localStorage.getItem('truckerAuth');
    if (!truckerAuth) {
      navigate('/trucker-login');
      return;
    }

    const driverData = JSON.parse(truckerAuth);
    setDriverInfo(driverData);
    
    fetchActiveJob(driverData.id);
    getCurrentLocation();
    
    // Set up location tracking
    const locationInterval = setInterval(getCurrentLocation, 30000); // Update every 30 seconds
    
    return () => {
      clearInterval(locationInterval);
    };
  }, [navigate]);
  
  useEffect(() => {
    // Check if driver is inside geofence when location updates
    if (driverLocation && activeJob?.geofence) {
      const isInside = checkIfInsideGeofence();
      setInsideGeofence(isInside);
      
      // If driver just entered geofence and job status is 'en route', update to 'on site'
      if (isInside && jobStatus === 'en_route') {
        updateJobStatus('on_site');
      }
    }
  }, [driverLocation, activeJob]);

  const fetchActiveJob = async (driverId: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch the active job for this driver
      const response = await axios.get('http://localhost:5000/api/trucker/active-job', {
        params: { driverId }
      });
      
      if (response.data) {
        setActiveJob(response.data);
        setJobStatus(response.data.status);
      } else {
        // No active job found
        navigate('/trucker-available-jobs');
      }
    } catch (error: any) {
      console.error('Error fetching active job:', error);
      setError(error.response?.data?.error || 'Failed to load active job');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError('');
        },
        (error) => {
          setLocationError('Error getting location: ' + error.message);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
    }
  };

  const checkIfInsideGeofence = () => {
    if (!driverLocation || !activeJob?.geofence) return false;
    
    return isWithinGeofence(
      driverLocation,
      activeJob.geofence.type,
      activeJob.geofence.type === 'Circle' 
        ? { center: activeJob.geofence.center, radius: activeJob.geofence.radius } 
        : { coordinates: activeJob.geofence.coordinates }
    );
  };

  const updateJobStatus = async (newStatus: string) => {
    if (!activeJob) return;
    
    try {
      await axios.put(`http://localhost:5000/api/purchase-orders/${activeJob._id}/status`, {
        status: newStatus
      });
      
      setJobStatus(newStatus);
      
      // Refresh the job data
      fetchActiveJob(driverInfo.id);
    } catch (error: any) {
      console.error('Error updating job status:', error);
      setError(error.response?.data?.error || 'Failed to update job status');
    }
  };

  const handleStartRoute = async () => {
    await updateJobStatus('en_route');
  };

  const handleStartJob = async () => {
    await updateJobStatus('in_progress');
  };

  const handleCompleteJob = () => {
    navigate(`/trucker-job-completion/${activeJob?._id}`);
  };

  const renderStatusActions = () => {
    switch (jobStatus) {
      case 'accepted':
        return (
          <button 
            className="action-button start-route-btn" 
            onClick={handleStartRoute}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 17l6-5-6-5v10z" fill="currentColor"/>
            </svg>
            {t('trucker.startRoute')}
          </button>
        );
      case 'en_route':
        return (
          <div className="status-message en-route">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {t('trucker.enRouteToJobsite')}
            {insideGeofence && (
              <button 
                className="action-button arrived-btn" 
                onClick={() => updateJobStatus('on_site')}
              >
                {t('trucker.markAsArrived')}
              </button>
            )}
          </div>
        );
      case 'on_site':
        return (
          <button 
            className="action-button start-job-btn" 
            onClick={handleStartJob}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 3l14 9-14 9V3z" fill="currentColor"/>
            </svg>
            {t('trucker.startJob')}
          </button>
        );
      case 'in_progress':
        return (
          <button 
            className="action-button complete-job-btn" 
            onClick={handleCompleteJob}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/>
            </svg>
            {t('trucker.completeJob')}
          </button>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      accepted: 'status-accepted',
      en_route: 'status-en-route',
      on_site: 'status-on-site',
      in_progress: 'status-in-progress',
      completed: 'status-completed',
      verified: 'status-verified'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || ''}`}>
        {t(`po.status.${status}`)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="active-job-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading active job...</p>
        </div>
      </div>
    );
  }

  if (!activeJob) {
    return (
      <div className="active-job-container">
        <div className="no-job-message">
          <h2>{t('trucker.noActiveJob')}</h2>
          <p>{t('trucker.browseAvailableJobs')}</p>
          <button 
            className="primary-button" 
            onClick={() => navigate('/trucker-available-jobs')}
          >
            {t('trucker.viewAvailableJobs')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="active-job-container">
      <div className="active-job-header">
        <div className="header-content">
          <h1>{t('trucker.activeJob')}</h1>
          <div className="job-title">{activeJob.jobDetails}</div>
          <div className="status-section">
            {getStatusBadge(jobStatus)}
          </div>
        </div>
        <button 
          className="logout-button" 
          onClick={() => {
            localStorage.removeItem('truckerAuth');
            navigate('/');
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {t('common.logout')}
        </button>
      </div>

      <div className="active-job-content">
        <div className="job-details-card">
          <h2>{t('po.jobDetails')}</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">{t('po.client')}:</span>
              <span className="detail-value">{activeJob.clientId.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('po.materialType')}:</span>
              <span className="detail-value">{activeJob.materialType}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('po.location')}:</span>
              <span className="detail-value">{activeJob.location}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('po.scheduledDate')}:</span>
              <span className="detail-value">{new Date(activeJob.scheduledDate).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('trucker.truckNumber')}:</span>
              <span className="detail-value">{activeJob.truckNumber}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('trucker.driverName')}:</span>
              <span className="detail-value">{activeJob.driverName}</span>
            </div>
            {activeJob.estimatedArrival && (
              <div className="detail-item">
                <span className="detail-label">{t('trucker.estimatedArrival')}:</span>
                <span className="detail-value">{new Date(activeJob.estimatedArrival).toLocaleString()}</span>
              </div>
            )}
            {activeJob.notes && (
              <div className="detail-item full-width">
                <span className="detail-label">{t('common.notes')}:</span>
                <span className="detail-value">{activeJob.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="map-section">
          <h2>{t('trucker.jobLocation')}</h2>
          {locationError && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {locationError}
            </div>
          )}
          
          {driverLocation && activeJob.geofence && (
            <div className="map-container">
              <MapContainer 
                center={[driverLocation.lat, driverLocation.lng]} 
                zoom={13} 
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Driver marker */}
                <Marker position={[driverLocation.lat, driverLocation.lng]}>
                  <Popup>
                    {t('trucker.yourLocation')}
                  </Popup>
                </Marker>
                
                {/* Geofence visualization */}
                {activeJob.geofence.type === 'Circle' && activeJob.geofence.center && activeJob.geofence.radius && (
                  <Circle 
                    center={activeJob.geofence.center} 
                    radius={activeJob.geofence.radius}
                    pathOptions={{ color: insideGeofence ? 'green' : 'blue' }}
                  >
                    <Popup>
                      {t('trucker.jobGeofence')}
                    </Popup>
                  </Circle>
                )}
                
                {activeJob.geofence.type === 'Polygon' && activeJob.geofence.coordinates && (
                  <Polygon 
                    positions={activeJob.geofence.coordinates}
                    pathOptions={{ color: insideGeofence ? 'green' : 'blue' }}
                  >
                    <Popup>
                      {t('trucker.jobGeofence')}
                    </Popup>
                  </Polygon>
                )}
              </MapContainer>
              
              <div className={`geofence-status ${insideGeofence ? 'inside' : 'outside'}`}>
                {insideGeofence 
                  ? t('trucker.insideJobGeofence') 
                  : t('trucker.outsideJobGeofence')}
              </div>
            </div>
          )}
        </div>

        <div className="action-section">
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
          
          <div className="status-actions">
            {renderStatusActions()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckerActiveJob;
