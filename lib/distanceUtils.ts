/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param lat1 - Latitude of the first point
 * @param lng1 - Longitude of the first point
 * @param lat2 - Latitude of the second point
 * @param lng2 - Longitude of the second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number | null, 
  lng1: number | null, 
  lat2: number, 
  lng2: number
): number {
  // Return a large distance if coordinates are not available
  if (lat1 === null || lng1 === null) return 99999;

  // Radius of the Earth in kilometers
  const earthRadius = 6371;
  
  // Convert degrees to radians
  const dLat = degreesToRadians(lat2 - lat1);
  const dLng = degreesToRadians(lng2 - lng1);
  
  // Haversine formula
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;
  
  return distance;
}

/**
 * Estimate travel time based on distance and mode of transportation
 * @param distanceKm - Distance in kilometers
 * @param mode - Mode of transportation ('driving', 'walking', 'transit')
 * @returns Estimated time in minutes
 */
export function estimateTravelTime(distanceKm: number, mode: 'driving' | 'walking' | 'transit' = 'driving'): number {
  // Average speeds in km/h
  const speeds = {
    driving: 30, // Urban driving with traffic
    walking: 5,  // Average walking speed
    transit: 20  // Public transit with stops
  };
  
  // Calculate time in hours, then convert to minutes
  const timeHours = distanceKm / speeds[mode];
  const timeMinutes = Math.round(timeHours * 60);
  
  return timeMinutes;
}

/**
 * Format distance for display
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    // If less than 1 km, show in meters
    return `${Math.round(distanceKm * 1000)}m`;
  } else {
    // Otherwise show in km with 1 decimal place
    return `${distanceKm.toFixed(1)}km`;
  }
}

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
