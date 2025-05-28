import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CarFront, Clock, PersonStanding, Train, X, ChevronRight, ChevronDown, Info } from 'lucide-react';
import Image from 'next/image';
import { formatDistance } from '@/lib/distanceUtils';

// Type definition for navigation images
type NavigationImage = {
  url: string;
  caption: string;
  contributor: string;
  timestamp: string;
};

type NavigationImagesType = {
  [key: string]: NavigationImage;
};

import { withBasePath } from '../lib/pathUtils';

// Mock navigation instruction images for key turns and locations
const navigationImages: NavigationImagesType = {
  // Use the local image for all locations
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
  }
};

// Map parking spot names to relevant image keys
const spotToImageKeys: {[key: string]: string[]} = {
  'Pavilion KL Parking': ['turn-jalan-bukit-bintang', 'pavilion-entrance'],
  'KLCC Suria Mall Parking': ['klcc-approach'],
  'Berjaya Times Square Parking': ['times-square-entrance'],
  'Starling Mall Parking': ['uptown-damansara-junction'],
  'Uptown Street Parking': ['uptown-damansara-junction'],
};

// Type definition for direction steps
type DirectionStep = {
  instruction: string;
  distance: number;
  time: number;
  isKey: boolean;
  imageKey?: string | null;
};

// Type for direction modes
type DirectionModes = {
  [key: string]: DirectionStep[]
};

// Get different directions based on travel mode
const getMockDirections = (spotName: string, travelMode: string): DirectionStep[] => {
  // In a real implementation, this would be fetched from a directions API
  
  // Define direction sets for each mode
  const directions: DirectionModes = {
    driving: [
      { instruction: 'Exit current location to main road', distance: 0.2, time: 1, isKey: false },
      { instruction: 'Turn right onto Jalan Raja Chulan', distance: 0.8, time: 3, isKey: false },
      { instruction: 'Continue onto Jalan Bukit Bintang', distance: 0.5, time: 4, isKey: true, imageKey: 'turn-jalan-bukit-bintang' },
      { instruction: 'Turn left into parking entrance', distance: 0.1, time: 1, isKey: true, imageKey: spotToImageKeys[spotName]?.[1] || null },
      { instruction: 'Proceed to B2 for available spots', distance: 0.1, time: 2, isKey: false },
      { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
    ],
    walking: [
      { instruction: 'Walk east toward main street', distance: 0.1, time: 2, isKey: false },
      { instruction: 'Cross at pedestrian crossing', distance: 0.05, time: 1, isKey: true },
      { instruction: 'Walk along Jalan Bukit Bintang', distance: 0.4, time: 5, isKey: false },
      { instruction: 'Pass by street vendors on right', distance: 0.2, time: 3, isKey: true, imageKey: 'turn-jalan-bukit-bintang' },
      { instruction: 'Enter via pedestrian entrance', distance: 0.05, time: 1, isKey: true, imageKey: spotToImageKeys[spotName]?.[0] || null },
      { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
    ],
    transit: [
      { instruction: 'Walk to nearest LRT station', distance: 0.3, time: 4, isKey: false },
      { instruction: 'Take Kelana Jaya Line toward KLCC', distance: 2.5, time: 8, isKey: true },
      { instruction: 'Exit at Bukit Bintang station', distance: 0.1, time: 2, isKey: true, imageKey: 'turn-jalan-bukit-bintang' },
      { instruction: 'Walk along pedestrian bridge', distance: 0.2, time: 3, isKey: false },
      { instruction: 'Enter via main entrance', distance: 0.1, time: 2, isKey: true, imageKey: spotToImageKeys[spotName]?.[0] || null },
      { instruction: 'Arrive at destination', distance: 0, time: 0, isKey: false }
    ]
  }
  
  return directions[travelMode] || directions.driving;
};

interface NavigationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot: {
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
    pricePerHour: number;
    distanceKm?: number;
    estimatedDriveTimeMin?: number;
    entrances?: { name: string; description: string }[];
  } | null;
  userLocation: {
    latitude: number | null;
    longitude: number | null;
  };
}

export function NavigationSheet({ open, onOpenChange, spot, userLocation }: NavigationSheetProps) {
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  const [directions, setDirections] = useState<any[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  
  const directionsData = useMemo(() => {
    if (!spot) return []
    return getMockDirections(spot.name, travelMode)
  }, [spot, travelMode]);

  useEffect(() => {
    setDirections(directionsData);
  }, [directionsData]);

  // If no spot is selected, don't render
  if (!spot) return null;

  // Calculate total distance and time
  const totalDistance = useMemo(() => {
    return directions.reduce((total, step) => total + step.distance, 0)
  }, [directions])

  const totalTime = useMemo(() => {
    return directions.reduce((total, step) => total + step.time, 0)
  }, [directions])
  
  // Get mode-specific travel info
  const getModeInfo = (mode: string) => {
    switch(mode) {
      case 'driving':
        return {
          icon: <CarFront size={16} />,
          label: 'Drive',
          timeMultiplier: 1,
          costRange: spot?.pricePerHour || 'RM5-10/hour'
        }
      case 'walking':
        return {
          icon: <PersonStanding size={16} />,
          label: 'Walk',
          timeMultiplier: 1.2,
          costRange: 'Free'
        }
      case 'transit':
        return {
          icon: <Train size={16} />,
          label: 'Transit',
          timeMultiplier: 0.8,
          costRange: 'RM2-5'
        }
      default:
        return {
          icon: <CarFront size={16} />,
          label: 'Drive',
          timeMultiplier: 1,
          costRange: spot?.pricePerHour || 'RM5-10/hour'
        }
    }
  }
  
  const modeInfo = getModeInfo(travelMode)

  const toggleStepExpansion = (index: number) => {
    if (expandedSteps.includes(index)) {
      setExpandedSteps(expandedSteps.filter(i => i !== index));
    } else {
      setExpandedSteps([...expandedSteps, index]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-full p-3 overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="text-lg flex justify-between items-center">
            <span>Navigation to {spot.name}</span>
          </SheetTitle>
          <SheetDescription className="flex items-center text-sm">
            <span>{spot.address}</span>
          </SheetDescription>
        </SheetHeader>
        
        <div className="my-4">
          <Tabs defaultValue="directions" className="w-full">
            <TabsList className="grid grid-cols-2 mb-2 w-full">
              <TabsTrigger value="directions">Directions</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="directions" className="space-y-4">
              {/* Travel mode selector */}
              <div className="flex border rounded-md overflow-hidden w-full">
                <Button 
                  onClick={() => setTravelMode('driving')} 
                  variant={travelMode === 'driving' ? 'default' : 'ghost'}
                  className="flex-1 rounded-none h-9 gap-1 px-1 text-xs"
                >
                  <CarFront size={16} />
                  <span className="text-xs">Drive</span>
                </Button>
                <Button 
                  onClick={() => setTravelMode('walking')} 
                  variant={travelMode === 'walking' ? 'default' : 'ghost'}
                  className="flex-1 rounded-none h-9 gap-1 px-1 text-xs"
                >
                  <PersonStanding size={16} />
                  <span className="text-xs">Walk</span>
                </Button>
                <Button 
                  onClick={() => setTravelMode('transit')} 
                  variant={travelMode === 'transit' ? 'default' : 'ghost'}
                  className="flex-1 rounded-none h-9 gap-1 px-1 text-xs"
                >
                  <Train size={16} />
                  <span className="text-xs">Transit</span>
                </Button>
              </div>
              
              {/* Trip summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">{formatDistance(totalDistance)} total</div>
                      <div className="text-xs text-muted-foreground">{Math.round(totalTime * modeInfo.timeMultiplier)} min ({modeInfo.label})</div>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      <Clock size={12} className="mr-1" />
                      {spot.estimatedDriveTimeMin} min
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              {/* Directions steps */}
              <div className="space-y-2">
                {directions.map((direction, index) => {
                  const isExpanded = expandedSteps.includes(index);
                  const hasImage = direction.isKey && direction.imageKey && navigationImages[direction.imageKey];
                  
                  return (
                    <div key={index} className="border rounded-md overflow-hidden">
                      <div 
                        className={`p-3 flex justify-between items-center cursor-pointer ${hasImage ? 'hover:bg-gray-50' : ''}`}
                        onClick={() => hasImage ? toggleStepExpansion(index) : null}
                      >
                        <div className="flex items-center">
                          <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3 text-xs">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-sm">{direction.instruction}</div>
                            <div className="text-xs text-gray-500">{formatDistance(direction.distance)} · {direction.time} min</div>
                          </div>
                        </div>
                        {hasImage && (
                          <ChevronDown 
                            size={18} 
                            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          />
                        )}
                      </div>
                      
                      {/* Local image for key turns */}
                      {hasImage && isExpanded && direction.imageKey && navigationImages[direction.imageKey] && (
                        <div className="px-3 pb-3">
                          <div className="relative h-32 w-full rounded-md overflow-hidden">
                            <img 
                              src={navigationImages[direction.imageKey].url}
                              alt={navigationImages[direction.imageKey].caption}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="mt-2 text-xs">
                            <p className="font-medium">{navigationImages[direction.imageKey].caption}</p>
                            <p className="text-gray-500 mt-1">
                              {navigationImages[direction.imageKey].contributor} · {navigationImages[direction.imageKey].timestamp}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Disclaimer about community images */}
              <div className="bg-blue-50 p-2 rounded-md text-xs flex items-start">
                <Info size={14} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-blue-800">Images are provided by the ParkLah community to help with navigation.</p>
                  <p className="text-blue-600 mt-1">Want to contribute? Take photos of key locations when you park and share them with others!</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="space-y-4">
                {/* Parking entrances */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Entrances</h3>
                  {spot.entrances && spot.entrances.length > 0 ? (
                    <div className="space-y-2">
                      {spot.entrances.map((entrance, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-md">
                          <div className="font-medium text-sm">{entrance.name}</div>
                          <div className="text-xs text-gray-600">{entrance.description}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No entrance information available</div>
                  )}
                </div>
                
                {/* Pricing */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Pricing</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm">Hourly rate:</span>
                      <span className="text-sm font-medium">RM{spot.pricePerHour}.00</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm">Estimated 2 hours:</span>
                      <span className="text-sm font-medium">RM{spot.pricePerHour * 2}.00</span>
                    </div>
                  </div>
                </div>
                
                {/* Share location button */}
                <Button variant="outline" className="w-full">
                  Share this parking location
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <SheetFooter className="justify-center mt-2 pb-safe">
          <Button className="w-full h-10" size="sm">
            Open in Google Maps
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
