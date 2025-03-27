
import { useState, useEffect } from 'react';

export function useLoadGoogleMaps(apiKey: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }
    
    // Don't load if already trying to load
    if (document.getElementById('google-maps-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error('Error loading Google Maps script');
      setError('Failed to load Google Maps. Please check your internet connection and try again.');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup function - only remove if it's the script we added
      const scriptElement = document.getElementById('google-maps-script');
      if (scriptElement) {
        document.head.removeChild(scriptElement);
      }
    };
  }, [apiKey]);

  return { isLoaded, error };
}
