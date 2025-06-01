import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Geofence } from '../utils/geofencing';
import './GeofenceManager.css';

interface GeofenceManagerProps {
  onGeofencesChange: (geofences: Geofence[]) => void;
  initialGeofences?: Geofence[];
}

const GeofenceManager: React.FC<GeofenceManagerProps> = ({ onGeofencesChange, initialGeofences = [] }) => {
  const { t } = useTranslation();
  const [geofences, setGeofences] = useState<Geofence[]>(initialGeofences);
  const [newGeofence, setNewGeofence] = useState<Geofence>({
    center: { lat: 0, lng: 0 },
    radius: 100,
    type: 'pickup'
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    onGeofencesChange(geofences);
  }, [geofences, onGeofencesChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lng') {
      setNewGeofence(prev => ({
        ...prev,
        center: {
          ...prev.center,
          [name]: parseFloat(value)
        }
      }));
    } else if (name === 'radius') {
      setNewGeofence(prev => ({
        ...prev,
        radius: parseFloat(value)
      }));
    } else if (name === 'type') {
      setNewGeofence(prev => ({
        ...prev,
        type: value as 'pickup' | 'dropoff'
      }));
    }
  };

  const handleAddGeofence = () => {
    if (editingIndex !== null) {
      const updatedGeofences = [...geofences];
      updatedGeofences[editingIndex] = newGeofence;
      setGeofences(updatedGeofences);
      setEditingIndex(null);
    } else {
      setGeofences([...geofences, newGeofence]);
    }
    setNewGeofence({
      center: { lat: 0, lng: 0 },
      radius: 100,
      type: 'pickup'
    });
  };

  const handleEditGeofence = (index: number) => {
    setNewGeofence(geofences[index]);
    setEditingIndex(index);
  };

  const handleDeleteGeofence = (index: number) => {
    const updatedGeofences = geofences.filter((_, i) => i !== index);
    setGeofences(updatedGeofences);
  };

  return (
    <div className="geofence-manager">
      <h2>{t('geofencing.manageGeofences')}</h2>
      
      <form className="geofence-form" onSubmit={(e) => { e.preventDefault(); handleAddGeofence(); }}>
        <div className="form-group">
          <label>{t('geofencing.type')}</label>
          <select
            name="type"
            value={newGeofence.type}
            onChange={handleInputChange}
            required
          >
            <option value="pickup">{t('geofencing.pickupGeofence')}</option>
            <option value="dropoff">{t('geofencing.dropoffGeofence')}</option>
          </select>
        </div>

        <div className="form-group">
          <label>{t('geofencing.latitude')}</label>
          <input
            type="number"
            name="lat"
            value={newGeofence.center.lat}
            onChange={handleInputChange}
            step="any"
            required
          />
        </div>

        <div className="form-group">
          <label>{t('geofencing.longitude')}</label>
          <input
            type="number"
            name="lng"
            value={newGeofence.center.lng}
            onChange={handleInputChange}
            step="any"
            required
          />
        </div>

        <div className="form-group">
          <label>{t('geofencing.radius')}</label>
          <input
            type="number"
            name="radius"
            value={newGeofence.radius}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          {editingIndex !== null ? t('common.update') : t('common.add')}
        </button>
      </form>

      <div className="geofence-list">
        <h3>{t('geofencing.activeGeofences')}</h3>
        {geofences.map((geofence, index) => (
          <div key={index} className="geofence-item">
            <div className="geofence-info">
              <p><strong>{t('geofencing.type')}:</strong> {t(`geofencing.${geofence.type}Geofence`)}</p>
              <p><strong>{t('geofencing.latitude')}:</strong> {geofence.center.lat}</p>
              <p><strong>{t('geofencing.longitude')}:</strong> {geofence.center.lng}</p>
              <p><strong>{t('geofencing.radius')}:</strong> {geofence.radius}m</p>
            </div>
            <div className="geofence-actions">
              <button
                onClick={() => handleEditGeofence(index)}
                className="edit-button"
              >
                {t('common.edit')}
              </button>
              <button
                onClick={() => handleDeleteGeofence(index)}
                className="delete-button"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeofenceManager; 