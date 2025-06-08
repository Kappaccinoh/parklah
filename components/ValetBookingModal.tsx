"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/lib/subscriptionContext";
import { ParkingSpot } from "@/lib/parkingData";

interface ValetBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot: ParkingSpot | null;
}

// Mock available time slots - in a real app, this would come from an API
const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", 
  "11:30", "12:00", "12:30", "13:00", "13:30", 
  "14:00", "14:30", "15:00", "15:30", "16:00",
];

// Mock API calls
const mockApiCalls = {
  // Simulate booking a valet service
  bookValet: async (spotId: number, date: Date, timeSlot: string) => {
    return new Promise<{success: boolean, bookingId: string}>((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        resolve({
          success: true,
          bookingId: `VALET-${Math.floor(Math.random() * 10000)}`
        });
      }, 1000);
    });
  }
};

const ValetBookingModal: React.FC<ValetBookingModalProps> = ({ open, onOpenChange, spot }) => {
  const { isSubscribed, upgradeSubscription } = useSubscription();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  // Format the date for display
  const formattedDate = format(selectedDate, "EEE, MMM d, yyyy");
  
  // Member rate calculation (25% off the base rate)
  const memberRate = spot ? Math.round(spot.valetBaseRate! * 0.75) : 0;
  
  // Handle booking confirmation
  const handleBookValet = async () => {
    if (!spot || !selectedTime) return;
    
    try {
      setIsLoading(true);
      setBookingError(null);
      
      // In a real implementation, this would make an API call to book the valet service
      const result = await mockApiCalls.bookValet(spot.id, selectedDate, selectedTime);
      
      if (result.success) {
        setBookingId(result.bookingId);
        setBookingConfirmed(true);
        
        // Add calendar event (in a real app this would generate an .ics file or Google Calendar event)
        // Implementation omitted for brevity
      }
    } catch (error) {
      setBookingError("Unable to complete your booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle modal reset when closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when modal is closed
      setSelectedTime(null);
      setBookingConfirmed(false);
      setBookingId(null);
      setBookingError(null);
    }
    onOpenChange(open);
  };
  
  if (!spot) return null;
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isSubscribed ? (
          // SUBSCRIBER VIEW
          <>
            {bookingConfirmed ? (
              // Confirmation view
              <>
                <DialogHeader>
                  <DialogTitle>Valet Booking Confirmed!</DialogTitle>
                  <DialogDescription>
                    Your valet service has been booked successfully.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="text-center mb-4">
                        <div className="bg-green-100 text-green-700 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-green-800">Booking #{bookingId}</h3>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span className="font-medium">{spot.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Time:</span>
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Valet Partner:</span>
                          <span className="font-medium">{spot.valetPartner}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Member Price:</span>
                          <span className="font-medium">RM{memberRate}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="mt-4 text-center text-sm text-gray-500">
                    <p>A calendar invite has been sent to your email.</p>
                    <p className="mt-1">Show this booking to the valet service attendant when you arrive.</p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={() => handleOpenChange(false)}>Close</Button>
                </DialogFooter>
              </>
            ) : (
              // Booking view
              <>
                <DialogHeader>
                  <DialogTitle>Book Valet Service</DialogTitle>
                  <DialogDescription>
                    Select date and time for valet parking at {spot.name}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium">{spot.valetPartner}</div>
                      <div className="text-sm text-gray-500">{spot.address}</div>
                    </div>
                    <Badge className="bg-purple-600 hover:bg-purple-700">
                      Member Rate: RM{memberRate}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Selected Date: {formattedDate}</span>
                    </div>
                    
                    {/* In a real implementation, this would be a date picker component */}
                    <div className="text-xs text-gray-500 pl-6">
                      Today's date is used for this demo. A real implementation would include a date picker.
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Available Time Slots</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className="text-xs h-8"
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {bookingError && (
                    <div className="mt-4 text-sm text-red-500 bg-red-50 p-2 rounded">
                      {bookingError}
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBookValet} 
                    disabled={!selectedTime || isLoading}
                  >
                    {isLoading ? "Booking..." : "Reserve Valet"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </>
        ) : (
          // UPSELL VIEW FOR NON-SUBSCRIBERS
          <>
            <DialogHeader>
              <DialogTitle>Exclusive Valet Service for ParkLah Members</DialogTitle>
              <DialogDescription>
                Get premium access to valet parking services at exclusive member rates.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-purple-800 mb-2">Member Benefits:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Exclusive member rates (25% off standard valet pricing)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Guaranteed parking spot with no waiting</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Convenient in-app booking and payment</span>
                  </li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium">{spot.valetPartner}</div>
                    <div className="text-sm text-gray-500">at {spot.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Standard Rate</div>
                    <div className="font-medium">RM{spot.valetBaseRate}</div>
                  </div>
                </div>
                
                <div className="border-t border-dashed mt-2 pt-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-purple-700">Member Rate</div>
                    <div className="font-medium text-purple-700">RM{memberRate}</div>
                  </div>
                  <div className="text-xs text-green-600">You save RM{spot.valetBaseRate! - memberRate}</div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
              >
                Maybe Later
              </Button>
              <Button 
                onClick={upgradeSubscription}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Subscribe Now
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ValetBookingModal;
