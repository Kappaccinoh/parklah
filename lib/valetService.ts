// Valet service API integration
// This file contains the API calls for valet service functionality

import { ParkingSpot } from "./parkingData";

export interface ValetLocation {
  id: number;
  name: string;
  address: string;
  partner: string;
  baseRate: number;
  memberRate: number;
}

export interface ValetTimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface ValetBookingRequest {
  locationId: number;
  date: string; // ISO format date
  timeSlot: string;
  userId?: string;
}

export interface ValetBookingResponse {
  success: boolean;
  bookingId?: string;
  error?: string;
}

// Convert a parking spot with valet service to a valet location
export const parkingSpotToValetLocation = (spot: ParkingSpot): ValetLocation | null => {
  if (!spot.hasValetService) return null;

  return {
    id: spot.id,
    name: spot.name,
    address: spot.address,
    partner: spot.valetPartner || "ParkLah Valet",
    baseRate: spot.valetBaseRate || 0,
    memberRate: Math.round((spot.valetBaseRate || 0) * 0.75), // 25% discount for members
  };
};

// Get all valet locations
export const getValetLocations = async (): Promise<ValetLocation[]> => {
  try {
    // In a real app, this would call the API endpoint
    // const response = await fetch('/api/valet/locations');
    // const data = await response.json();
    // return data;
    
    // For now, simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return empty array for demo
    return [];
  } catch (error) {
    console.error('Failed to fetch valet locations:', error);
    return [];
  }
};

// Get available time slots for a specific valet location and date
export const getValetTimeSlots = async (
  locationId: number,
  date: string
): Promise<ValetTimeSlot[]> => {
  try {
    // In a real app, this would call the API endpoint
    // const response = await fetch(`/api/valet/slots?locationId=${locationId}&date=${date}`);
    // const data = await response.json();
    // return data;
    
    // For now, simulate a delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Mock time slots (9am to 5pm, every 30 minutes)
    const timeSlots: ValetTimeSlot[] = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeSlots.push({
          id: `${locationId}-${time}`,
          time,
          available: Math.random() > 0.3, // Random availability (70% available)
        });
      }
    }
    return timeSlots;
  } catch (error) {
    console.error('Failed to fetch valet time slots:', error);
    return [];
  }
};

// Book a valet service
export const bookValetService = async (booking: ValetBookingRequest): Promise<ValetBookingResponse> => {
  try {
    // In a real app, this would call the API endpoint
    // const response = await fetch('/api/valet/book', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(booking),
    // });
    // const data = await response.json();
    // return data;
    
    // For now, simulate a delay and successful booking
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      bookingId: `VALET-${Math.floor(Math.random() * 10000)}`,
    };
  } catch (error) {
    console.error('Failed to book valet service:', error);
    return {
      success: false,
      error: 'An error occurred while booking valet service',
    };
  }
};

// Check if user subscription allows valet booking
// This is handled by the subscription context, but in a real app
// there might be additional checks against the backend
export const checkValetSubscription = async (): Promise<boolean> => {
  try {
    // In a real app, this would call the API endpoint to validate subscription
    // const response = await fetch('/api/subscription/check');
    // const data = await response.json();
    // return data.hasValetAccess;
    
    // For now, simulate a delay and return true for demo
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  } catch (error) {
    console.error('Failed to check valet subscription:', error);
    return false;
  }
};
