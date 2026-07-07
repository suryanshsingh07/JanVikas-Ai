import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    coordinates: null, // [longitude, latitude]
    loaded: false,
    error: null,
  });

  const onSuccess = (location) => {
    setLocation({
      loaded: true,
      coordinates: [location.coords.longitude, location.coords.latitude],
      error: null,
    });
  };

  const onError = (error) => {
    let errorMessage = "An unknown error occurred.";
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "User denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage = "The request to get user location timed out.";
        break;
    }
    
    setLocation({
      loaded: true,
      coordinates: null,
      error: {
        code: error.code,
        message: errorMessage,
      },
    });
    
    // Only toast if explicitly requested
    if (options.toastOnError) {
      toast.error(errorMessage);
    }
  };

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      onError({
        code: 0,
        message: "Geolocation not supported",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    });
  };

  // Auto-request if specified
  useEffect(() => {
    if (options.autoRequest) {
      requestLocation();
    }
  }, [options.autoRequest]);

  return { ...location, requestLocation };
};
