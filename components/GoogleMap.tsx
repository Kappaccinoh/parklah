import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, HeatmapLayer } from '@react-google-maps/api';

// Default map container style
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Libraries we need to load for Google Maps
const libraries = ["places", "visualization"];

// Default center (Kuala Lumpur)
const defaultCenter = {
  lat: 3.1390,
  lng: 101.6869
};

// Map options - removing default UI controls to clean up the interface
const mapOptions = {
  disableDefaultUI: true, // Disable all default UI controls
  zoomControl: true, // Only keep zoom controls
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false, // Remove fullscreen control
  scaleControl: false,
  rotateControl: false,
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
  capacity: number;
  trafficFrequency: number[];
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
  showHeatmap?: boolean;
  onMapLoad?: (map: google.maps.Map) => void;
}

const GoogleMapComponent: React.FC<MapProps> = ({ 
  apiKey, 
  parkingSpots, 
  selectedSpotId,
  onSpotSelect,
  userLocation,
  showHeatmap = false,
  onMapLoad
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

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries as any,
  });

  useEffect(() => {
    if (isLoaded && showHeatmap) {
      // Make sure visualization library is loaded
      if (!window.google?.maps?.visualization) {
        console.log('Loading visualization library...');
        // Load visualization library dynamically if needed
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`;
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [isLoaded, showHeatmap, apiKey]);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  
  // We'll use this effect to ensure proper cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
        heatmapRef.current = null;
      }
    };
  }, []);
  
  // Type for heatmap points to resolve TypeScript errors
  interface HeatmapPoint {
    location: google.maps.LatLng;
    weight: number;
  }
  
  // Generate heatmap data based on traffic frequency
  const heatmapData = useMemo(() => {
    // Return empty array if API is not loaded
    if (!isLoaded) return [];
    
    // Only proceed if window.google is defined
    if (typeof window === 'undefined' || !window.google || !window.google.maps) return [];
    
    // Create points that follow major road patterns rather than just circles
    const points: HeatmapPoint[] = [];
    
    parkingSpots.forEach(spot => {
      // Get current hour's traffic frequency for this spot
      const hourIndex = new Date().getHours();
      const weight = spot.trafficFrequency[hourIndex] / 100;
      
      // Main point at the spot location with highest weight
      points.push({
        location: new window.google.maps.LatLng(spot.lat, spot.lng),
        weight: weight * 2, // Main point has double weight
      });
      
      // Create road-like patterns based on the spot's location
      // These are simulated road paths in different directions
      const roadDirections = [
        // Main road patterns (straight lines in 4 directions with varying lengths)
        { direction: 0, count: 8 }, // East
        { direction: 90, count: 6 }, // North
        { direction: 180, count: 8 }, // West
        { direction: 270, count: 6 }, // South
        
        // Branch roads at angles
        { direction: 45, count: 4 },  // Northeast
        { direction: 135, count: 4 }, // Northwest
        { direction: 225, count: 4 }, // Southwest
        { direction: 315, count: 4 }, // Southeast
      ];
      
      // Determine road density based on capacity
      const density = Math.min(Math.ceil(spot.capacity / 20), 20);
      
      // Create points along the simulated roads
      roadDirections.forEach(road => {
        // Number of points to add along this road direction
        const pointCount = Math.ceil(road.count * (spot.capacity / 100));
        
        // Calculate distribution of points along the road
        for (let i = 1; i <= pointCount; i++) {
          // Calculate position along road with progressive distance
          const distance = (i / pointCount) * 0.003; // Max ~300m
          const angleRad = (road.direction * Math.PI) / 180;
          
          // Calculate offset with some randomness for realistic road patterns
          const randomOffset = (Math.random() - 0.5) * 0.0001; // Small random offset
          const offsetLat = Math.sin(angleRad) * distance + (Math.random() - 0.5) * 0.0001;
          const offsetLng = Math.cos(angleRad) * distance + (Math.random() - 0.5) * 0.0001;
          
          // Weight decreases as distance from the parking spot increases
          const distanceWeight = 1 - (i / pointCount);
          
          points.push({
            location: new window.google.maps.LatLng(
              spot.lat + offsetLat,
              spot.lng + offsetLng
            ),
            // Adjust weight based on distance from spot and traffic frequency
            weight: weight * distanceWeight * 0.8,
          });
          
          // Add some side-street points for more realism
          if (i % 2 === 0 && i < pointCount - 1) {
            // Perpendicular mini-streets
            const sideAngleRad = angleRad + (Math.PI / 2);
            const sideDistance = 0.0005 * Math.random();
            
            points.push({
              location: new window.google.maps.LatLng(
                spot.lat + offsetLat + Math.sin(sideAngleRad) * sideDistance,
                spot.lng + offsetLng + Math.cos(sideAngleRad) * sideDistance
              ),
              weight: weight * distanceWeight * 0.4, // Lower weight for side streets
            });
          }
        }
      });
    });
    
    return points;
  }, [parkingSpots, isLoaded]);

  const mapRef = useRef<google.maps.Map | null>(null);

  const handleMapLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
    
    // Ensure no leftover heatmap data
    if (window.google && window.google.maps && window.google.maps.visualization) {
      const existingHeatmaps = map.get('heatmapLayers') || [];
      for (const layer of existingHeatmaps) {
        if (layer && typeof layer.setMap === 'function') {
          layer.setMap(null);
        }
      }
      map.set('heatmapLayers', []);
    }
    
    // Call the parent's onMapLoad if provided
    if (onMapLoad) {
      onMapLoad(map);
    }
  }, [onMapLoad]);

  const handleMarkerClick = (spotId: number) => {
    setActiveMarker(spotId);
    const spot = parkingSpots.find(s => s.id === spotId);
    if (spot && onSpotSelect) {
      onSpotSelect(spot);
    }
  };



  const getParkingMarkerIcon = (spot: ParkingSpot) => {
    // Return different icons based on parking type (legal, illegal, etc.)
    if (!isLoaded || !window.google) {
      return {}; // Return empty object if API not loaded
    }
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
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

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-lg font-bold">Loading Map...</h2>
          <p>Please wait while we load the map.</p>
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
      onLoad={handleMapLoad}
    >
      {/* User's current location marker */}
      {userLocation?.latitude && userLocation?.longitude && isLoaded && window.google && (
        <Marker
          position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
          // @ts-ignore - icon typing issue with the Google Maps API
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
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
      
      {/* Direct heatmap implementation */}
      {(() => {
        // Only execute this code if map is loaded and we should show heatmap
        if (isLoaded && map && showHeatmap && window.google?.maps?.visualization) {
          console.log('Creating heatmap with', heatmapData.length, 'points');
          
          // First remove any existing heatmap
          if (heatmapRef.current) {
            heatmapRef.current.setMap(null);
            heatmapRef.current = null;
          }
          
          // Create a new heatmap layer directly
          const heatmap = new window.google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            map: map,
            radius: 30,
            opacity: 0.7,
            gradient: [
              'rgba(0, 255, 255, 0)',
              'rgba(0, 255, 255, 1)',
              'rgba(0, 191, 255, 1)',
              'rgba(0, 127, 255, 1)',
              'rgba(0, 63, 255, 1)',
              'rgba(0, 0, 255, 1)',
              'rgba(0, 0, 223, 1)',
              'rgba(0, 0, 191, 1)',
              'rgba(0, 0, 159, 1)',
              'rgba(0, 0, 127, 1)',
              'rgba(63, 0, 91, 1)',
              'rgba(127, 0, 63, 1)',
              'rgba(191, 0, 31, 1)',
              'rgba(255, 0, 0, 1)'
            ]
          });
          
          // Store reference for later cleanup
          heatmapRef.current = heatmap;
        } else if (!showHeatmap && heatmapRef.current) {
          // Remove heatmap when toggled off
          console.log('Removing heatmap');
          heatmapRef.current.setMap(null);
          heatmapRef.current = null;
        }
        return null; // This IIFE doesn't render anything
      })()}
      
      {/* Parking spot markers */}
      {parkingSpots.map((spot) => (
        <React.Fragment key={spot.id}>
          <Marker
            position={{ lat: spot.lat, lng: spot.lng }}
            onClick={() => handleMarkerClick(spot.id)}
            // @ts-ignore - icon typing issue with the Google Maps API
            icon={getParkingMarkerIcon(spot)}
            animation={spot.id === selectedSpotId ? google.maps.Animation.BOUNCE : undefined}
            zIndex={100}
          />
        </React.Fragment>
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
