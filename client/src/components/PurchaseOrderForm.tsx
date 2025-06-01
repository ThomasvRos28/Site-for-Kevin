import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePurchaseOrders } from '../contexts/PurchaseOrderContext';
import { validatePickupLocation, validateDropoffLocation } from '../utils/geofencing';
import type { Geofence, Location } from '../utils/geofencing';
import './PurchaseOrderForm.css';

interface Rate {
  materialType: string;
  rate: number;
  unit: string;
}

interface PurchaseOrderFormProps {
  onSubmit: (data: any) => void;
  geofences: Geofence[];
  isClientView?: boolean;
  initialData?: any;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ 
  onSubmit, 
  geofences, 
  isClientView = false,
  initialData 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createPurchaseOrder, updatePurchaseOrder } = usePurchaseOrders();
  const [loading, setLoading] = useState(false);
  const [haulerRates, setHaulerRates] = useState<Rate[]>(initialData?.haulerRates || []);
  const [resaleRates, setResaleRates] = useState<Rate[]>(initialData?.resaleRates || []);
  const [jobDetails, setJobDetails] = useState(initialData?.jobDetails || '');
  const [poNumber, setPoNumber] = useState(initialData?.poNumber || '');
  const [referenceNumber, setReferenceNumber] = useState(initialData?.referenceNumber || '');
  const [formData, setFormData] = useState({
    pickupLocation: initialData?.pickupLocation || { lat: 0, lng: 0 },
    dropoffLocation: initialData?.dropoffLocation || { lat: 0, lng: 0 },
  });
  const [locationErrors, setLocationErrors] = useState({
    pickup: '',
    dropoff: ''
  });

  const handleAddRate = (isHaulerRate: boolean) => {
    const newRate = {
      materialType: '',
      rate: 0,
      unit: ''
    };
    if (isHaulerRate) {
      setHaulerRates([...haulerRates, newRate]);
    } else {
      setResaleRates([...resaleRates, newRate]);
    }
  };

  const handleRateChange = (index: number, field: keyof Rate, value: string | number, isHaulerRate: boolean) => {
    const rates = isHaulerRate ? [...haulerRates] : [...resaleRates];
    rates[index] = { ...rates[index], [field]: value };
    if (isHaulerRate) {
      setHaulerRates(rates);
    } else {
      setResaleRates(rates);
    }
  };

  const handleLocationChange = (type: 'pickup' | 'dropoff', value: Location) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Location`]: value
    }));

    const geofence = geofences.find(g => g.type === type);
    const validation = geofence ? (type === 'pickup' 
      ? validatePickupLocation(value, geofence)
      : validateDropoffLocation(value, geofence)) : true;

    setLocationErrors(prev => ({
      ...prev,
      [type]: validation ? '' : t('geofencing.locationRequired')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (locationErrors.pickup || locationErrors.dropoff) {
        return;
      }

      const purchaseOrderData = {
        haulerRates,
        resaleRates,
        jobDetails,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        poNumber,
        referenceNumber,
        status: isClientView ? 'approved' : 'pending_approval',
        createdAt: new Date().toISOString()
      };

      if (initialData?.id) {
        await updatePurchaseOrder(initialData.id, purchaseOrderData);
      } else {
        await createPurchaseOrder(purchaseOrderData);
      }
      
      onSubmit(purchaseOrderData);
      navigate('/purchase-orders');
    } catch (error) {
      console.error('Error saving purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="po-form-container">
      <header className="page-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/purchase-orders')}>
            ← {t('common.back')}
          </button>
          <div className="page-brand">
            <div className="page-title">
              <h1>{isClientView ? t('po.approve') : t('po.create')}</h1>
              <p>{isClientView ? t('po.clientApproval') : t('po.jobDetails')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="po-form-content">
        <form onSubmit={handleSubmit} className="po-form">
          {/* PO Details Section */}
          <section className="form-section">
            <h2>{t('po.jobDetails')}</h2>
            <div className="form-group">
              <label>{t('po.poNumber')}</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>{t('po.referenceNumber')}</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>{t('po.jobDetails')}</label>
              <textarea
                value={jobDetails}
                onChange={(e) => setJobDetails(e.target.value)}
                className="form-textarea"
                rows={4}
                required
              />
            </div>
          </section>

          {/* Hauler Rates Section */}
          {!isClientView && (
            <section className="form-section">
              <div className="section-header">
                <h2>{t('po.haulerRates')}</h2>
                <button
                  type="button"
                  onClick={() => handleAddRate(true)}
                  className="add-rate-button"
                >
                  <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {t('po.addRate')}
                </button>
              </div>

              <div className="rates-grid">
                {haulerRates.map((rate, index) => (
                  <div key={index} className="rate-card">
                    <input
                      type="text"
                      placeholder={t('ticket.materialType')}
                      value={rate.materialType}
                      onChange={(e) => handleRateChange(index, 'materialType', e.target.value, true)}
                      className="form-input"
                      required
                    />
                    <input
                      type="number"
                      placeholder={t('po.rate')}
                      value={rate.rate}
                      onChange={(e) => handleRateChange(index, 'rate', parseFloat(e.target.value), true)}
                      className="form-input"
                      required
                    />
                    <input
                      type="text"
                      placeholder={t('ticket.unit')}
                      value={rate.unit}
                      onChange={(e) => handleRateChange(index, 'unit', e.target.value, true)}
                      className="form-input"
                      required
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Client Rates Section */}
          {isClientView && (
            <section className="form-section">
              <div className="section-header">
                <h2>{t('po.clientRates')}</h2>
                <button
                  type="button"
                  onClick={() => handleAddRate(false)}
                  className="add-rate-button"
                >
                  <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {t('po.addClientRate')}
                </button>
              </div>

              <div className="rates-grid">
                {resaleRates.map((rate, index) => (
                  <div key={index} className="rate-card">
                    <input
                      type="text"
                      placeholder={t('ticket.materialType')}
                      value={rate.materialType}
                      onChange={(e) => handleRateChange(index, 'materialType', e.target.value, false)}
                      className="form-input"
                      required
                    />
                    <input
                      type="number"
                      placeholder={t('po.rate')}
                      value={rate.rate}
                      onChange={(e) => handleRateChange(index, 'rate', parseFloat(e.target.value), false)}
                      className="form-input"
                      required
                    />
                    <input
                      type="text"
                      placeholder={t('ticket.unit')}
                      value={rate.unit}
                      onChange={(e) => handleRateChange(index, 'unit', e.target.value, false)}
                      className="form-input"
                      required
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Location Section */}
          <section className="form-section">
            <h2>{t('po.location')}</h2>
            <div className="form-group">
              <label>{t('po.pickupLocation')}</label>
              <div className="location-inputs">
                <input
                  type="number"
                  step="any"
                  placeholder={t('geofencing.latitude')}
                  value={formData.pickupLocation.lat}
                  onChange={(e) => handleLocationChange('pickup', {
                    ...formData.pickupLocation,
                    lat: parseFloat(e.target.value)
                  })}
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder={t('geofencing.longitude')}
                  value={formData.pickupLocation.lng}
                  onChange={(e) => handleLocationChange('pickup', {
                    ...formData.pickupLocation,
                    lng: parseFloat(e.target.value)
                  })}
                  required
                />
                {locationErrors.pickup && (
                  <span className="error-message">{locationErrors.pickup}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>{t('po.dropoffLocation')}</label>
              <div className="location-inputs">
                <input
                  type="number"
                  step="any"
                  placeholder={t('geofencing.latitude')}
                  value={formData.dropoffLocation.lat}
                  onChange={(e) => handleLocationChange('dropoff', {
                    ...formData.dropoffLocation,
                    lat: parseFloat(e.target.value)
                  })}
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder={t('geofencing.longitude')}
                  value={formData.dropoffLocation.lng}
                  onChange={(e) => handleLocationChange('dropoff', {
                    ...formData.dropoffLocation,
                    lng: parseFloat(e.target.value)
                  })}
                  required
                />
                {locationErrors.dropoff && (
                  <span className="error-message">{locationErrors.dropoff}</span>
                )}
              </div>
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? t('common.loading') : (isClientView ? t('po.approve') : t('common.submit'))}
            </button>
            {isClientView && (
              <button type="button" className="reject-button" onClick={() => {
                // Handle rejection
                navigate('/purchase-orders');
              }}>
                {t('po.reject')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderForm; 