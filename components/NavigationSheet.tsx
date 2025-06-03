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
import { Card, CardContent } from '@/components/ui/card';
import { CarFront, Clock, PersonStanding, Train, ChevronRight, ChevronDown, Info } from 'lucide-react';
import { formatDistance } from '@/lib/distanceUtils';
import { 
  NavigationImage, 
  NavigationImagesType, 
  DirectionStep,
  navigationImages, 
  getDirections 
} from '@/lib/directions';

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
  
  // Get the current directions based on travel mode and spot ID
  const directionsData = useMemo(() => {
    if (!spot) return []
    return getDirections(spot.id, spot.name, travelMode);
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
