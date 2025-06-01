import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './TruckerJobAcceptance.css';

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

const TruckerJobAcceptance: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [driverInfo, setDriverInfo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    truckNumber: '',
    driverName: '',
    startingLocation: '',
    estimatedArrival: '',
    notes: ''
  });

  useEffect(() => {
    // Check if trucker is logged in
    const truckerAuth = localStorage.getItem('truckerAuth');
    if (!truckerAuth) {
      navigate('/trucker-login');
      return;
    }

    const driverData = JSON.parse(truckerAuth);
    setDriverInfo(driverData);
    setFormData(prev => ({
      ...prev,
      driverName: driverData.driverName || ''
    }));
    
    fetchJobDetails();
  }, [jobId, navigate]);

  const fetchJobDetails = async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`http://localhost:5000/api/purchase-orders/${jobId}`);
      
      // Make sure the job is available
      if (response.data.status !== 'available') {
        setError(t('trucker.jobNoLongerAvailable'));
        setJob(null);
      } else {
        setJob(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      setError(error.response?.data?.error || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!job) return;
    
    // Validate form
    if (!formData.truckNumber || !formData.driverName || !formData.startingLocation) {
      setError(t('common.pleaseCompleteAllFields'));
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Update the purchase order status to 'accepted' and add trucker details
      await axios.put(`http://localhost:5000/api/purchase-orders/${jobId}/accept`, {
        truckNumber: formData.truckNumber,
        driverName: formData.driverName,
        startingLocation: formData.startingLocation,
        estimatedArrival: formData.estimatedArrival,
        notes: formData.notes,
        status: 'accepted',
        truckerId: driverInfo.id // Assuming driver ID is stored in auth
      });
      
      // Redirect to the active job view
      navigate('/trucker-active-job');
    } catch (error: any) {
      console.error('Error accepting job:', error);
      setError(error.response?.data?.error || 'Failed to accept job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/trucker-available-jobs');
  };

  if (loading) {
    return (
      <div className="job-acceptance-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-acceptance-container">
        <div className="error-container">
          <h2>{t('trucker.jobNotFound')}</h2>
          <p>{error || t('trucker.jobNoLongerAvailable')}</p>
          <button 
            className="primary-button" 
            onClick={() => navigate('/trucker-available-jobs')}
          >
            {t('trucker.backToAvailableJobs')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-acceptance-container">
      <div className="job-acceptance-card">
        <div className="job-header">
          <h2>{t('trucker.acceptJob')}</h2>
          <div className="job-title">{job.jobDetails}</div>
          <div className="client-info">{t('po.client')}: {job.clientId.name}</div>
        </div>

        <div className="job-details-section">
          <h3>{t('po.jobDetails')}</h3>
          <div className="details-grid">
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
        </div>

        <form onSubmit={handleSubmit} className="acceptance-form">
          <h3>{t('trucker.truckInformation')}</h3>
          
          <div className="form-group">
            <label htmlFor="truckNumber">{t('trucker.truckNumber')}:</label>
            <input
              type="text"
              id="truckNumber"
              name="truckNumber"
              value={formData.truckNumber}
              onChange={handleInputChange}
              placeholder={t('trucker.enterTruckNumber')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="driverName">{t('trucker.driverName')}:</label>
            <input
              type="text"
              id="driverName"
              name="driverName"
              value={formData.driverName}
              onChange={handleInputChange}
              placeholder={t('trucker.enterDriverName')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="startingLocation">{t('trucker.startingLocation')}:</label>
            <input
              type="text"
              id="startingLocation"
              name="startingLocation"
              value={formData.startingLocation}
              onChange={handleInputChange}
              placeholder={t('trucker.enterStartingLocation')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="estimatedArrival">{t('trucker.estimatedArrival')}:</label>
            <input
              type="datetime-local"
              id="estimatedArrival"
              name="estimatedArrival"
              value={formData.estimatedArrival}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">{t('common.notes')}:</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder={t('trucker.enterAdditionalNotes')}
              rows={3}
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

          <div className="form-actions">
            <button 
              type="button" 
              className="secondary-button" 
              onClick={handleCancel}
              disabled={submitting}
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="primary-button" 
              disabled={submitting}
            >
              {submitting ? t('common.processing') : t('trucker.acceptJob')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TruckerJobAcceptance;
