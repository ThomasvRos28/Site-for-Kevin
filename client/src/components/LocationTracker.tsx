import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Location, Geofence } from '../utils/geofencing';
import { isWithinGeofence, calculateDistance } from '../utils/geofencing';
import './LocationTracker.css';

interface LocationTrackerProps {
  geofences: Geofence[];
  onLocationUpdate?: (location: Location, status: string) => void;
  requiredGeofenceType?: 'pickup' | 'dropoff';
  onValidationChange?: (isValid: boolean) => void;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ 
  geofences, 
  onLocationUpdate,
  requiredGeofenceType,
  onValidationChange
}) => {
  const { t } = useTranslation();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [trackingError, setTrackingError] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    message: string;
  }>({
    isValid: false,
    message: t('geofencing.locationRequired')
  });

  useEffect(() => {
    let watchId: number;

    const startTracking = () => {
      if (!navigator.geolocation) {
        setTrackingError(t('geofencing.locationNotSupported'));
        return;
      }

      setIsTracking(true);
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          validateLocation(newLocation);
        },
        (error) => {
          setTrackingError(error.message);
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    };

    const stopTracking = () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      setIsTracking(false);
    };

    if (isTracking) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isTracking, t, requiredGeofenceType]);

  const validateLocation = (location: Location) => {
    if (!requiredGeofenceType) {
      checkGeofenceStatus(location);
      return;
    }

    const relevantGeofence = geofences.find(g => g.type === requiredGeofenceType);
    
    if (!relevantGeofence) {
      setValidationStatus({
        isValid: false,
        message: t('geofencing.noGeofenceConfigured')
      });
      return;
    }

    const isWithin = isWithinGeofence(location, relevantGeofence);
    const distance = calculateDistance(location, relevantGeofence.center);
    
    setValidationStatus({
      isValid: isWithin,
      message: isWithin 
        ? t('geofencing.withinGeofence')
        : t('geofencing.outsideGeofence', { distance: Math.round(distance) })
    });

    if (onValidationChange) {
      onValidationChange(isWithin);
    }

    if (onLocationUpdate) {
      onLocationUpdate(location, isWithin ? 'valid' : 'invalid');
    }
  };

  const checkGeofenceStatus = (location: Location) => {
    let status = t('geofencing.outOfRange');
    let isValid = false;

    for (const geofence of geofences) {
      if (isWithinGeofence(location, geofence)) {
        status = t('geofencing.withinRange');
        isValid = true;
        break;
      }
    }

    setLocationStatus(status);
    setValidationStatus({
      isValid,
      message: status
    });

    if (onLocationUpdate) {
      onLocationUpdate(location, status);
    }

    if (onValidationChange) {
      onValidationChange(isValid);
    }
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    if (!isTracking) {
      setTrackingError('');
    }
  };

  return (
    <div className="location-tracker">
      <div className="tracker-header">
        <h2>{t('geofencing.locationValidation')}</h2>
        <button 
          className={`tracking-button ${isTracking ? 'active' : ''}`}
          onClick={toggleTracking}
        >
          {isTracking ? t('common.stop') : t('common.start')} {t('geofencing.tracking')}
        </button>
      </div>

      {trackingError && (
        <div className="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {trackingError}
        </div>
      )}

      {currentLocation && (
        <div className="location-info">
          <div className="info-group">
            <label>{t('geofencing.currentLocation')}</label>
            <p>
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </p>
          </div>

          <div className="info-group">
            <label>{t('geofencing.validationStatus')}</label>
            <p className={`status ${validationStatus.isValid ? 'valid' : 'invalid'}`}>
              {validationStatus.message}
            </p>
          </div>
        </div>
      )}

      {requiredGeofenceType && (
        <div className="required-geofence">
          <h3>{t('geofencing.requiredGeofence', { type: t(`geofencing.${requiredGeofenceType}Geofence`) })}</h3>
          {geofences
            .filter(g => g.type === requiredGeofenceType)
            .map((geofence, index) => (
              <div key={index} className="geofence-item">
                <div className="geofence-info">
                  <p>{t('geofencing.latitude')}: {geofence.center.lat}</p>
                  <p>{t('geofencing.longitude')}: {geofence.center.lng}</p>
                  <p>{t('geofencing.radius')}: {geofence.radius}m</p>
                </div>
                {currentLocation && (
                  <div className="distance-info">
                    <p>
                      {t('geofencing.distanceToGeofence')}: {
                        Math.round(calculateDistance(currentLocation, geofence.center))
                      }m
                    </p>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {!requiredGeofenceType && (
        <div className="geofence-list">
          <h3>{t('geofencing.activeGeofences')}</h3>
          {geofences.map((geofence, index) => (
            <div key={index} className="geofence-item">
              <div className="geofence-info">
                <p>{t('geofencing.type')}: {t(`geofencing.${geofence.type}Geofence`)}</p>
                <p>{t('geofencing.latitude')}: {geofence.center.lat}</p>
                <p>{t('geofencing.longitude')}: {geofence.center.lng}</p>
                <p>{t('geofencing.radius')}: {geofence.radius}m</p>
              </div>
              {currentLocation && (
                <div className="distance-info">
                  <p>
                    {t('geofencing.distanceToGeofence')}: {
                      Math.round(calculateDistance(currentLocation, geofence.center))
                    }m
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationTracker; 