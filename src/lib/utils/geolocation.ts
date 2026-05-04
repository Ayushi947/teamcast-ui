import axios from 'axios';
import { logger } from '../logger';

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Get current location using browser Geolocation API
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'Unknown location error';
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true, // Use GPS for highest accuracy
        timeout: 15000, // Increased timeout for better accuracy
        maximumAge: 60000, // 1 minute - fresher location data
      }
    );
  });
};

/**
 * Reverse geocode coordinates to get address
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const response = await axios.get('/api/geolocation/reverse-geocode', {
      params: {
        lat: latitude,
        lng: longitude,
      },
    });

    if (response.data.success && response.data.address) {
      return response.data.address;
    } else {
      throw new Error(response.data.error || 'Failed to get address');
    }
  } catch (error) {
    logger.error('Failed to get address from coordinates', error);
    return 'Failed to get address';
  }
};

/**
 * Get current location address
 */
export const getCurrentLocationAddress = async (): Promise<string> => {
  try {
    const position = await getCurrentLocation();
    const address = await reverseGeocode(
      position.coords.latitude,
      position.coords.longitude
    );

    return address;
  } catch (error) {
    logger.error('Failed to get current location address', error);
    throw error;
  }
};
