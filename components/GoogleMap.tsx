import React, { useState, useCallback, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

// Default map container style
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center (Kuala Lumpur)
const defaultCenter = {
  lat: 3.1390,
  lng: 101.6869
};

// Map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

interface ParkingSpot {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  pricePerHour: number;
  walkTime: number;
  isLegal: boolean;
  // Add other properties as needed
}

interface MapProps {
  apiKey: string;
  parkingSpots: ParkingSpot[];
  selectedSpotId?: number | null;
  onSpotSelect?: (spot: ParkingSpot) => void;
  userLocation?: {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
    loading: boolean;
  };
}

const GoogleMapComponent: React.FC<MapProps> = ({ 
  apiKey, 
  parkingSpots, 
  selectedSpotId,
  onSpotSelect,
  userLocation
}) => {
  // Use user location as center when available
  const mapCenter = useMemo(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      return {
        lat: userLocation.latitude,
        lng: userLocation.longitude
      };
    }
    return defaultCenter;
  }, [userLocation?.latitude, userLocation?.longitude]);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  const handleMarkerClick = (spotId: number) => {
    setActiveMarker(spotId);
    const spot = parkingSpots.find(s => s.id === spotId);
    if (spot && onSpotSelect) {
      onSpotSelect(spot);
    }
  };

  const getParkingMarkerIcon = (spot: ParkingSpot) => {
    // Return different icons based on parking type (legal, illegal, etc.)
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: spot.isLegal ? '#4ade80' : '#ef4444',
      fillOpacity: 0.9,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 8,
      label: {
        text: `${spot.walkTime}m`,
        color: '#ffffff',
        fontSize: '10px',
        fontWeight: 'bold'
      }
    };
  };

  if (loadError) {
    return <div className="flex items-center justify-center h-full">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-sm text-gray-600">Loading Google Maps...</div>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={userLocation?.latitude ? 15 : 14} // Zoom in more when showing user location
      options={mapOptions}
      onLoad={onMapLoad}
    >
      {/* User's current location marker */}
      {userLocation?.latitude && userLocation?.longitude && (
        <Marker
          position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
          // @ts-ignore - icon typing issue with the Google Maps API
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4', // Google blue
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 8,
          }}
          zIndex={1000} // Keep user marker on top
          title="Your Location"
        />
      )}
      
      {/* Parking spot markers */}
      {parkingSpots.map((spot) => (
        <Marker
          key={spot.id}
          position={{ lat: spot.lat, lng: spot.lng }}
          onClick={() => handleMarkerClick(spot.id)}
          // @ts-ignore - icon typing issue with the Google Maps API
          icon={getParkingMarkerIcon(spot)}
          animation={spot.id === selectedSpotId ? google.maps.Animation.BOUNCE : undefined}
        />
      ))}

      {activeMarker !== null && (
        <InfoWindow
          position={{
            lat: parkingSpots.find(spot => spot.id === activeMarker)?.lat || 0,
            lng: parkingSpots.find(spot => spot.id === activeMarker)?.lng || 0
          }}
          onCloseClick={() => setActiveMarker(null)}
        >
          <div className="p-2 max-w-xs">
            <h3 className="font-medium text-sm">
              {parkingSpots.find(spot => spot.id === activeMarker)?.name}
            </h3>
            <p className="text-xs text-gray-600">
              {parkingSpots.find(spot => spot.id === activeMarker)?.address}
            </p>
            <p className="text-xs mt-1">
              RM{parkingSpots.find(spot => spot.id === activeMarker)?.pricePerHour}/hr
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
