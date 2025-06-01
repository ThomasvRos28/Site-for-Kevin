import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './TruckerJobCompletion.css';

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
}

const TruckerJobCompletion: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    deliveryConfirmation: '',
    recipientName: '',
    deliveryNotes: '',
    cans: [{ canIn: '', canOut: '' }]
  });

  useEffect(() => {
    // Check if trucker is logged in
    const truckerAuth = localStorage.getItem('truckerAuth');
    if (!truckerAuth) {
      navigate('/trucker-login');
      return;
    }

    // Verify trucker is authenticated, but we don't need the data here
    
    fetchJobDetails();
  }, [jobId, navigate]);

  const fetchJobDetails = async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`http://localhost:5000/api/purchase-orders/${jobId}`);
      
      // Make sure the job is in progress
      if (response.data.status !== 'in_progress') {
        setError(t('trucker.jobNotInProgress'));
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

  const handleCanInputChange = (index: number, field: 'canIn' | 'canOut', value: string) => {
    const updatedCans = [...formData.cans];
    updatedCans[index] = {
      ...updatedCans[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      cans: updatedCans
    }));
  };

  const addCan = () => {
    setFormData(prev => ({
      ...prev,
      cans: [...prev.cans, { canIn: '', canOut: '' }]
    }));
  };

  const removeCan = (index: number) => {
    if (formData.cans.length === 1) return;
    
    const updatedCans = formData.cans.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      cans: updatedCans
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!job) return;
    
    // Validate form
    if (!formData.deliveryConfirmation) {
      setError(t('trucker.pleaseProvideDeliveryConfirmation'));
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Create form data for file upload
      const submitData = new FormData();
      submitData.append('jobId', jobId || '');
      submitData.append('deliveryConfirmation', formData.deliveryConfirmation);
      submitData.append('recipientName', formData.recipientName);
      submitData.append('deliveryNotes', formData.deliveryNotes);
      submitData.append('cans', JSON.stringify(formData.cans));
      
      if (selectedFile) {
        submitData.append('file', selectedFile);
      }
      
      // Submit completion data and update status to 'completed'
      await axios.post('http://localhost:5000/api/trucker/complete-job', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Redirect to the available jobs list
      navigate('/trucker-available-jobs');
    } catch (error: any) {
      console.error('Error completing job:', error);
      setError(error.response?.data?.error || 'Failed to complete job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/trucker-active-job');
  };

  if (loading) {
    return (
      <div className="job-completion-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-completion-container">
        <div className="error-container">
          <h2>{t('trucker.jobNotFound')}</h2>
          <p>{error || t('trucker.jobNotInProgress')}</p>
          <button 
            className="primary-button" 
            onClick={() => navigate('/trucker-active-job')}
          >
            {t('trucker.backToActiveJob')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-completion-container">
      <div className="job-completion-card">
        <div className="job-header">
          <h2>{t('trucker.completeJob')}</h2>
          <div className="job-title">{job.jobDetails}</div>
          <div className="client-info">{t('po.client')}: {job.clientId.name}</div>
        </div>

        <form onSubmit={handleSubmit} className="completion-form">
          <div className="form-section">
            <h3>{t('trucker.deliveryConfirmation')}</h3>
            
            <div className="form-group">
              <label htmlFor="deliveryConfirmation">{t('trucker.confirmationNumber')}:</label>
              <input
                type="text"
                id="deliveryConfirmation"
                name="deliveryConfirmation"
                value={formData.deliveryConfirmation}
                onChange={handleInputChange}
                placeholder={t('trucker.enterConfirmationNumber')}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="recipientName">{t('trucker.recipientName')}:</label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                placeholder={t('trucker.enterRecipientName')}
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>{t('trucker.canTracking')}</h3>
            
            <div className="cans-container">
              {formData.cans.map((can, index) => (
                <div key={index} className="can-item">
                  <div className="can-header">
                    <span className="can-number">Can #{index + 1}</span>
                    {formData.cans.length > 1 && (
                      <button
                        type="button"
                        className="remove-can-btn"
                        onClick={() => removeCan(index)}
                        title={t('trucker.removeCan')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="can-inputs">
                    <div className="form-group">
                      <label htmlFor={`canIn-${index}`}>{t('trucker.canIn')}:</label>
                      <input
                        type="text"
                        id={`canIn-${index}`}
                        value={can.canIn}
                        onChange={(e) => handleCanInputChange(index, 'canIn', e.target.value)}
                        placeholder={t('trucker.enterCanInDetails')}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`canOut-${index}`}>{t('trucker.canOut')}:</label>
                      <input
                        type="text"
                        id={`canOut-${index}`}
                        value={can.canOut}
                        onChange={(e) => handleCanInputChange(index, 'canOut', e.target.value)}
                        placeholder={t('trucker.enterCanOutDetails')}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                type="button" 
                className="add-can-btn" 
                onClick={addCan}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {t('trucker.addAnotherCan')}
              </button>
            </div>
          </div>
          
          <div className="form-section">
            <h3>{t('trucker.additionalInformation')}</h3>
            
            <div className="form-group">
              <label htmlFor="deliveryNotes">{t('trucker.deliveryNotes')}:</label>
              <textarea
                id="deliveryNotes"
                name="deliveryNotes"
                value={formData.deliveryNotes}
                onChange={handleInputChange}
                placeholder={t('trucker.enterDeliveryNotes')}
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="file">{t('trucker.uploadDeliveryPhoto')}:</label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept="image/*"
              />
              <div className="file-help-text">
                {t('trucker.photoHelp')}
              </div>
            </div>
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
              {submitting ? t('common.processing') : t('trucker.completeDelivery')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TruckerJobCompletion;
