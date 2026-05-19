import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { Loader2, Search, MapPin, AlertCircle } from 'lucide-react';
import { theme } from '../../styles/theme';

const mapContainerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '12px',
};

const center = {
  lat: 14.5995, // Default to Manila
  lng: 120.9842
};

const libraries = ['places'];

const GoogleMapPicker = ({ onLocationSelect, initialLocation }) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(initialLocation || center);
  const [address, setAddress] = useState('');
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (initialLocation) {
      setMarker(initialLocation);
    }
  }, [initialLocation]);

  const onMapClick = useCallback((e) => {
    const newPos = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setMarker(newPos);
    updateAddress(newPos);
  }, []);

  const updateAddress = async (pos) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: pos }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const addr = results[0].formatted_address;
        setAddress(addr);
        onLocationSelect({ ...pos, address: addr });
      }
    });
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const pos = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setMarker(pos);
      if (map) map.panTo(pos);
      const addr = place.formatted_address;
      setAddress(addr);
      onLocationSelect({ ...pos, address: addr });
    }
  };

  if (!apiKey) {
    return (
      <div style={{ 
        height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', backgroundColor: '#fff1f2', borderRadius: '12px',
        padding: '24px', textAlign: 'center', border: '1px dashed #fecdd3'
      }}>
        <AlertCircle size={32} color="#e11d48" style={{ marginBottom: '12px' }} />
        <h4 style={{ margin: '0 0 8px 0', color: '#9f1239' }}>Google Maps API Key Missing</h4>
        <p style={{ fontSize: '13px', color: '#be123c', margin: 0 }}>
          Please add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code> file and restart the development server.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ 
        height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', backgroundColor: '#fff1f2', borderRadius: '12px',
        padding: '24px', textAlign: 'center', border: '1px dashed #fecdd3'
      }}>
        <AlertCircle size={32} color="#e11d48" style={{ marginBottom: '12px' }} />
        <h4 style={{ margin: '0 0 8px 0', color: '#9f1239' }}>Map Load Error</h4>
        <p style={{ fontSize: '13px', color: '#be123c', margin: 0 }}>
          The Google Maps API failed to load. Check your API key restrictions or network connection.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
        <Loader2 className="animate-spin" size={32} color={theme.colors.primary} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ position: 'relative' }}>
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={onPlaceChanged}
        >
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search for company address..."
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </Autocomplete>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={marker}
        zoom={15}
        onClick={onMapClick}
        onLoad={(map) => setMap(map)}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        }}
      >
        <Marker position={marker} animation={window.google.maps.Animation.DROP} />
      </GoogleMap>

      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '8px', 
        padding: '12px', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '10px',
        fontSize: '13px',
        color: '#0369a1',
        border: '1px solid #bae6fd'
      }}>
        <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span><strong>Selected:</strong> {address || 'Click on map or search above to select location'}</span>
      </div>
    </div>
  );
};

export default GoogleMapPicker;
