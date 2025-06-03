import { withBasePath } from './pathUtils';

/**
 * Type definition for navigation images
 */
export type NavigationImage = {
  url: string;
  caption: string;
  contributor: string;
  timestamp: string;
};

export type NavigationImagesType = {
  [key: string]: NavigationImage;
};

/**
 * Type definition for direction steps
 */
export type DirectionStep = {
  instruction: string;
  distance: number; // in kilometers
  time: number; // in minutes
  isKey: boolean;
  imageKey?: string | null;
};

/**
 * Type for direction modes
 */
export type DirectionModes = {
  [key: string]: DirectionStep[]
};

/**
 * Location-specific navigation instruction images
 * These images are used to guide users to each specific parking location
 */
export const navigationImages: NavigationImagesType = {
  // Existing parking locations
  'turn-jalan-bukit-bintang': {
    url: withBasePath('/Jalan_Alor_in_Kuala_Lumpur_during_Corona_virus_lockdown.jpg'),
    caption: 'Turn right onto Jalan Bukit Bintang',
    contributor: 'Local user: Ahmad',
    timestamp: '2 weeks ago'
  },
  'pavilion-entrance': {
    url: withBasePath('/Jalan_Alor_in_Kuala_Lumpur_during_Corona_virus_lockdown.jpg'),
    caption: 'Pavilion mall entrance - look for the parking sign',
    contributor: 'Local user: Sarah',
    timestamp: '1 month ago'
  },
  'klcc-approach': {
    url: withBasePath('/Jalan_Alor_in_Kuala_Lumpur_during_Corona_virus_lockdown.jpg'),
    caption: 'KLCC approach view - parking entrance ahead',
    contributor: 'Local user: Michael',
    timestamp: '3 weeks ago'
  },
  'times-square-entrance': {
    url: withBasePath('/Jalan_Alor_in_Kuala_Lumpur_during_Corona_virus_lockdown.jpg'),
    caption: 'Berjaya Times Square parking entrance',
    contributor: 'Local user: Aisha',
    timestamp: '2 months ago'
  },
  'uptown-damansara-junction': {
    url: withBasePath('/Jalan_Alor_in_Kuala_Lumpur_during_Corona_virus_lockdown.jpg'),
    caption: 'Junction to Uptown Damansara',
    contributor: 'Local user: Raj',
    timestamp: '1 week ago'
  },
  
  // New parking location: Outdoor Parking - Kampung Pandan (ID: 21)
  'kampung-pandan-approach': {
    url: withBasePath('/place1/6183812248728881309.jpg'),
    caption: 'Approaching Kampung Pandan parking area',
    contributor: 'ParkLah Team',
    timestamp: '4 days ago'
  },
  'kampung-pandan-entrance': {
    url: withBasePath('/place1/6183812248728881310.jpg'),
    caption: 'Main entrance to Kampung Pandan outdoor parking',
    contributor: 'ParkLah Team',
    timestamp: '4 days ago'
  },
  'kampung-pandan-lots': {
    url: withBasePath('/place1/6183812248728881312.jpg'),
    caption: 'Available parking spots at Kampung Pandan outdoor parking',
    contributor: 'ParkLah Team',
    timestamp: '4 days ago'
  },
  
  // New parking location: Kampung Pandan Roadside Parking (ID: 22)
  'roadside-approach': {
    url: withBasePath('/place2/6183812248728881313.jpg'),
    caption: 'Approaching Kampung Pandan roadside parking area',
    contributor: 'ParkLah Team',
    timestamp: '3 days ago'
  },
  'roadside-parking-zone': {
    url: withBasePath('/place2/6183812248728881314.jpg'),
    caption: 'Legal roadside parking zone in Kampung Pandan',
    contributor: 'ParkLah Team',
    timestamp: '3 days ago'
  },
  'roadside-payment': {
    url: withBasePath('/place2/6183812248728881315.jpg'),
    caption: 'Payment machine for Kampung Pandan roadside parking',
    contributor: 'ParkLah Team',
    timestamp: '3 days ago'
  },

  // New parking location: Entier French Dining Parking (ID: 23)
  'entier-entrance': {
    url: withBasePath('/place3/6183812248728881468.jpg'),
    caption: 'Main entrance to Alila Bangsar parking for Entier French Dining',
    contributor: 'ParkLah Team',
    timestamp: '2 days ago'
  }
};

/**
 * Map parking spot names to relevant image keys
 * This associates parking locations with their specific navigation images
 */
export const spotToImageKeys: {[key: string]: string[]} = {
  // Existing mappings
  'Pavilion KL Parking': ['turn-jalan-bukit-bintang', 'pavilion-entrance'],
  'KLCC Suria Mall Parking': ['klcc-approach'],
  'Berjaya Times Square Parking': ['times-square-entrance'],
  'Starling Mall Parking': ['uptown-damansara-junction'],
  'Uptown Street Parking': ['uptown-damansara-junction'],
  
  // New parking locations
  'Outdoor Parking - Kampung Pandan': ['kampung-pandan-approach', 'kampung-pandan-entrance', 'kampung-pandan-lots'],
  'Kampung Pandan Roadside Parking': ['roadside-approach', 'roadside-parking-zone', 'roadside-payment'],
  'Entier French Dining Parking': ['entier-entrance']
};

/**
 * Get specific navigation directions for a parking spot based on travel mode
 * @param spotId - The ID of the parking spot
 * @param spotName - The name of the parking spot
 * @param travelMode - The mode of travel (driving, walking, transit)
 * @returns Array of direction steps specific to the parking location
 */
export const getDirections = (spotId: number, spotName: string, travelMode: string): DirectionStep[] => {
  // Special directions for specific parking locations
  switch(spotId) {
    // Outdoor Parking - Kampung Pandan (ID: 21)
    case 21:
      return getKampungPandanOutdoorDirections(spotName, travelMode);
      
    // Kampung Pandan Roadside Parking (ID: 22)
    case 22:
      return getKampungPandanRoadsideDirections(spotName, travelMode);
      
    // Entier French Dining Parking (ID: 23)
    case 23:
      return getEntierFrenchDiningDirections(spotName, travelMode);
      
    // Default to generic directions for other parking spots
    default:
      return getGenericDirections(spotName, travelMode);
  }
};

/**
 * Get directions specific to Kampung Pandan Outdoor Parking (ID: 21)
 */
function getKampungPandanOutdoorDirections(spotName: string, travelMode: string): DirectionStep[] {
  const imageKeys = spotToImageKeys[spotName] || [];
  
  switch(travelMode) {
    case 'driving':
      return [
        { instruction: 'Head toward Jalan Kampung Pandan', distance: 0.3, time: 2, isKey: false },
        { instruction: 'Turn right onto Jalan Kampung Pandan', distance: 0.8, time: 3, isKey: false },
        { instruction: 'Continue straight for 400m', distance: 0.4, time: 2, isKey: false },
        { instruction: 'Look for the open parking area on your right', distance: 0.2, time: 1, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'Enter through the main entrance', distance: 0.1, time: 1, isKey: true, imageKey: imageKeys[1] || null },
        { instruction: 'Park in any available space marked with white lines', distance: 0.05, time: 2, isKey: true, imageKey: imageKeys[2] || null },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    case 'walking':
      return [
        { instruction: 'Head south-east on the pedestrian walkway', distance: 0.2, time: 3, isKey: false },
        { instruction: 'Cross at the pedestrian crossing', distance: 0.1, time: 2, isKey: false },
        { instruction: 'Continue straight on Jalan Kampung Pandan', distance: 0.3, time: 4, isKey: false },
        { instruction: 'The outdoor parking area will be visible on your right', distance: 0.1, time: 1, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'Walk toward the entrance', distance: 0.1, time: 2, isKey: true, imageKey: imageKeys[1] || null },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    case 'transit':
      return [
        { instruction: 'Walk to the nearest bus stop on Jalan Kampung Pandan (150m)', distance: 0.15, time: 2, isKey: false },
        { instruction: 'Take bus T250 toward Kampung Pandan', distance: 1.2, time: 10, isKey: false },
        { instruction: 'Exit at Kampung Pandan Central stop', distance: 0.1, time: 1, isKey: false },
        { instruction: 'Walk east for 200m', distance: 0.2, time: 3, isKey: false },
        { instruction: 'The outdoor parking area will be visible ahead', distance: 0.1, time: 2, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'Enter through the main entrance', distance: 0.05, time: 1, isKey: true, imageKey: imageKeys[1] || null },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    default:
      return getGenericDirections(spotName, 'driving');
  }
}

/**
 * Get directions specific to Kampung Pandan Roadside Parking (ID: 22)
 */
function getKampungPandanRoadsideDirections(spotName: string, travelMode: string): DirectionStep[] {
  const imageKeys = spotToImageKeys[spotName] || [];
  
  switch(travelMode) {
    case 'driving':
      return [
        { instruction: 'Head toward Jalan Kampung Pandan Dalam', distance: 0.4, time: 2, isKey: false },
        { instruction: 'Continue straight past the small market', distance: 0.3, time: 1, isKey: false },
        { instruction: 'Look for the designated roadside parking zone', distance: 0.2, time: 1, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'Park parallel to the curb in marked spaces only', distance: 0.1, time: 2, isKey: true, imageKey: imageKeys[1] || null },
        { instruction: 'Pay at the parking meter located every 50m', distance: 0.05, time: 3, isKey: true, imageKey: imageKeys[2] || null },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    case 'walking':
      return [
        { instruction: 'Walk east on the main street', distance: 0.15, time: 2, isKey: false },
        { instruction: 'Turn right at the convenience store', distance: 0.15, time: 2, isKey: false },
        { instruction: 'Continue straight for 200m', distance: 0.2, time: 3, isKey: false },
        { instruction: 'Look for the roadside parking area', distance: 0.1, time: 1, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'The parking zone is clearly marked with white lines', distance: 0.05, time: 1, isKey: true, imageKey: imageKeys[1] || null },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    case 'transit':
      return [
        { instruction: 'Take bus B112 toward Kampung Pandan', distance: 1.5, time: 12, isKey: false },
        { instruction: 'Exit at the Kampung Pandan Dalam stop', distance: 0.1, time: 1, isKey: false },
        { instruction: 'Walk north for 150m', distance: 0.15, time: 2, isKey: false },
        { instruction: 'Turn right at the intersection', distance: 0.1, time: 1, isKey: false },
        { instruction: 'The roadside parking area will be on your left', distance: 0.1, time: 1, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'Look for cars parked along the designated zones', distance: 0.05, time: 1, isKey: true, imageKey: imageKeys[1] || null },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    default:
      return getGenericDirections(spotName, 'driving');
  }
}

/**
 * Get directions specific to Entier French Dining Parking (ID: 23)
 */
function getEntierFrenchDiningDirections(spotName: string, travelMode: string): DirectionStep[] {
  const imageKeys = spotToImageKeys[spotName] || [];
  
  switch(travelMode) {
    case 'driving':
      return [
        { instruction: 'Head toward Jalan Ang Seng', distance: 0.3, time: 2, isKey: false },
        { instruction: 'Turn into the Alila Bangsar hotel entrance', distance: 0.2, time: 1, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'Follow signs to the hotel parking structure', distance: 0.1, time: 1, isKey: false },
        { instruction: 'Take parking ticket at barrier', distance: 0.05, time: 1, isKey: true },
        { instruction: 'Park on available levels B1-B3', distance: 0.05, time: 2, isKey: false },
        { instruction: 'Take elevator to Level 41 for Entier French Dining', distance: 0, time: 3, isKey: false },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    case 'walking':
      return [
        { instruction: 'Walk toward Alila Bangsar hotel entrance', distance: 0.2, time: 3, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'Enter through the main lobby doors', distance: 0.1, time: 1, isKey: false },
        { instruction: 'Take the elevator directly to Level 41', distance: 0.05, time: 2, isKey: false },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    case 'transit':
      return [
        { instruction: 'Take LRT to Bangsar station', distance: 1.0, time: 15, isKey: false },
        { instruction: 'Exit station toward Jalan Ang Seng', distance: 0.1, time: 2, isKey: false },
        { instruction: 'Walk to Alila Bangsar hotel entrance (200m)', distance: 0.2, time: 3, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'Enter through the main lobby', distance: 0.05, time: 1, isKey: false },
        { instruction: 'Take the elevator to Level 41', distance: 0.05, time: 2, isKey: false },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    default:
      return getGenericDirections(spotName, 'driving');
  }
}

/**
 * Get generic directions for other parking spots
 * This serves as a fallback for parking spots without specific directions
 */
function getGenericDirections(spotName: string, travelMode: string): DirectionStep[] {
  // Use existing image keys if available for this spot
  const imageKeys = spotToImageKeys[spotName] || [];
  
  switch(travelMode) {
    case 'driving':
      return [
        { instruction: 'Exit current location to main road', distance: 0.2, time: 1, isKey: false },
        { instruction: 'Continue toward destination', distance: 0.8, time: 3, isKey: false },
        { instruction: 'Follow signs to parking area', distance: 0.5, time: 4, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'Turn into parking entrance', distance: 0.1, time: 1, isKey: true, imageKey: imageKeys[1] || null },
        { instruction: 'Look for available spots', distance: 0.1, time: 2, isKey: false },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    case 'walking':
      return [
        { instruction: 'Walk toward main street', distance: 0.1, time: 2, isKey: false },
        { instruction: 'Continue straight for 400m', distance: 0.4, time: 6, isKey: false },
        { instruction: 'Cross at the pedestrian crossing', distance: 0.1, time: 2, isKey: false },
        { instruction: 'Follow signs to destination', distance: 0.3, time: 5, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    case 'transit':
      return [
        { instruction: 'Walk to the nearest transit stop', distance: 0.2, time: 3, isKey: false },
        { instruction: 'Take the next available transport toward destination', distance: 1.5, time: 15, isKey: false },
        { instruction: 'Exit at the stop nearest to destination', distance: 0.1, time: 1, isKey: false },
        { instruction: 'Walk toward destination', distance: 0.3, time: 5, isKey: true, imageKey: imageKeys[0] || null },
        { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
      ];
      
    default:
      return [
        { instruction: 'Directions not available for this travel mode', distance: 0, time: 0, isKey: false }
      ];
  }
}
