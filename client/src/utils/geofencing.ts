import * as turf from '@turf/turf';

export interface Location {
  lat: number;
  lng: number;
}

export interface Geofence {
  type: 'Polygon' | 'Circle';
  coordinates?: number[][];  // For polygon: array of [lng, lat] points
  center?: [number, number]; // For circle: [lng, lat]
  radius?: number;          // For circle: in meters
}

export const isWithinGeofence = (location: Location, geofence: Geofence): boolean => {
  const point = turf.point([location.lng, location.lat]);

  if (geofence.type === 'Circle' && geofence.center && geofence.radius) {
    const center = turf.point(geofence.center);
    const distance = turf.distance(point, center, { units: 'meters' });
    return distance <= geofence.radius;
  }

  if (geofence.type === 'Polygon' && geofence.coordinates) {
    const polygon = turf.polygon([geofence.coordinates]);
    return turf.booleanPointInPolygon(point, polygon);
  }

  return false;
};

export const calculateDistance = (point1: Location, point2: Location): number => {
  const from = turf.point([point1.lng, point1.lat]);
  const to = turf.point([point2.lng, point2.lat]);
  return turf.distance(from, to, { units: 'meters' });
};

export const validatePickupLocation = (location: Location, geofences: Geofence[]): boolean => {
  return geofences.some(geofence => isWithinGeofence(location, geofence));
};

export const validateDropoffLocation = (location: Location, geofences: Geofence[]): boolean => {
  return geofences.some(geofence => isWithinGeofence(location, geofence));
}; 