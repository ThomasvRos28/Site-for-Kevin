import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './AvailableJobsList.css';

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
  geofence?: {
    type: 'Polygon' | 'Circle';
    coordinates?: number[][];
    center?: [number, number];
    radius?: number;
  };
}

const AvailableJobsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [availableJobs, setAvailableJobs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [driverInfo, setDriverInfo] = useState<any>(null);

  useEffect(() => {
    // Check if trucker is logged in
    const truckerAuth = localStorage.getItem('truckerAuth');
    if (!truckerAuth) {
      navigate('/trucker-login');
      return;
    }

    const driverData = JSON.parse(truckerAuth);
    setDriverInfo(driverData);
    fetchAvailableJobs();
  }, [navigate]);

  const fetchAvailableJobs = async () => {
    try {
      setLoading(true);
      setError('');
      // Only fetch purchase orders with 'available' status
      const response = await axios.get('http://localhost:5000/api/purchase-orders', {
        params: { status: 'available' }
      });
      setAvailableJobs(response.data);
    } catch (error: any) {
      console.error('Error fetching available jobs:', error);
      setError(error.response?.data?.error || 'Failed to load available jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = (jobId: string) => {
    navigate(`/trucker-job-acceptance/${jobId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('truckerAuth');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="available-jobs-container">
        <div className="loading-spinner">
          <div className="spinner-large"></div>
          <p>Loading available jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="available-jobs-container">
      <header className="page-header">
        <div className="header-content">
          <div className="page-brand">
            <div className="page-title">
              <h1>{t('trucker.availableJobs')}</h1>
              <p>{t('trucker.welcome', { name: driverInfo?.driverName })}</p>
              <div className="jobs-banner">
                <span className="highlight-text">{t('trucker.selectAvailableJob')}</span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {t('common.logout')}
        </button>
      </header>

      <div className="jobs-content">
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

        {availableJobs.length === 0 ? (
          <div className="no-jobs-message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>{t('trucker.noJobsAvailable')}</h3>
            <p>{t('trucker.checkBackLater')}</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {availableJobs.map(job => (
              <div key={job._id} className="job-card">
                <div className="job-header">
                  <h3>{job.jobDetails}</h3>
                  <span className="client-name">{job.clientId.name}</span>
                </div>
                <div className="job-details">
                  <div className="detail-item">
                    <span className="detail-label">{t('po.materialType')}:</span>
                    <span className="detail-value">{job.materialType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('po.location')}:</span>
                    <span className="detail-value">{job.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('po.scheduledDate')}:</span>
                    <span className="detail-value">{new Date(job.scheduledDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  className="accept-job-button" 
                  onClick={() => handleAcceptJob(job._id)}
                >
                  {t('trucker.acceptJob')}
                </button>
              </div>
            ))}
          </div>
        )}

        <button className="refresh-button" onClick={fetchAvailableJobs}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('common.refresh')}
        </button>
      </div>
    </div>
  );
};

export default AvailableJobsList;
