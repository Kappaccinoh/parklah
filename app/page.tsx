"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Search, Navigation, AlertTriangle, CheckCircle, Filter, Route, Clock, TrendingUp, Map, BarChart2, Bell, ChevronDown, ChevronUp, Cog, Compass, Delete, DollarSign, FileText, Home, Menu, MessageSquare, QrCode, Ticket, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GoogleMapComponent from "@/components/GoogleMap"
import { NavigationSheet } from "@/components/NavigationSheet"
import AnonymousMessaging from "@/components/AnonymousMessaging"
import CouponReminder, { CouponItem } from "@/components/CouponReminder"
import LiveParkingUpdates from "@/components/LiveParkingUpdates"
import { parkingSpots, type ParkingSpot } from "@/lib/parkingData"
import useGeolocation from "@/hooks/useGeolocation"
import { calculateDistance, estimateTravelTime, formatDistance } from "@/lib/distanceUtils"
import { useSubscription } from "@/lib/subscriptionContext"
import { useToast } from "@/components/ui/use-toast"

// The parking spots data is now imported from lib/parkingData.ts

// Interface for parking spots with distance data
interface ParkingSpotWithDistance extends ParkingSpot {
  distanceKm?: number;
  estimatedDriveTimeMin?: number;
}

export default function ParkingFinderApp() {
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpotWithDistance | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Enhanced filtering options
  const [legalFilter, setLegalFilter] = useState<"all" | "legal" | "illegal">("all")
  
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [expandedView, setExpandedView] = useState<'map' | 'list'>('map')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const mapRef = useRef<any>(null) // Reference to the Google Maps instance
  const [coupons, setCoupons] = useState<CouponItem[]>([])
  const [showUpdatesSheet, setShowUpdatesSheet] = useState(false);
  const [showCouponSheet, setShowCouponSheet] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showFeatureMenu, setShowFeatureMenu] = useState(false);
  
  // Callback functions for the anonymous messaging component
  const [openMessagesDialog, setOpenMessagesDialog] = useState<(() => void) | null>(null);
  const [openQRScanner, setOpenQRScanner] = useState<(() => void) | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(2); // Show 2 unread messages
  
  // Get subscription status
  const { isSubscribed } = useSubscription()
  
  // Note: Coupon handlers already exist later in this file
  const { toast } = useToast()
  
  // Add a new coupon handler
  const handleAddCoupon = (newCoupon: Omit<CouponItem, "id">) => {
    const couponWithId = {
      ...newCoupon,
      id: `coupon-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }
    
    console.log("Adding new coupon:", couponWithId); // Debug log
    
    // Use functional update to ensure we're working with the latest state
    setCoupons(prevCoupons => {
      const updatedCoupons = [...prevCoupons, couponWithId];
      console.log("Updated coupons:", updatedCoupons); // Debug log
      return updatedCoupons;
    });
    
    // Show a success toast
    toast({
      title: "Coupon Added",
      description: `${newCoupon.label} at ${newCoupon.location} will expire at ${newCoupon.expiryTime.toLocaleTimeString([], {
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true
      })}`,
    });
    
    // Close the coupon sheet after adding
    setShowCouponSheet(false);
  }

  // Delete coupon handler
  const handleDeleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(coupon => coupon.id !== id))
  }
  
  // Get user's current location
  const userLocation = useGeolocation()

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate distances and sort by nearest first
  const spotsWithDistance: ParkingSpotWithDistance[] = useMemo(() => {
    return parkingSpots.map(spot => {
      // Calculate distance if user location is available
      const distanceKm = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        spot.lat,
        spot.lng
      );
      
      // Estimate drive time in minutes
      const estimatedDriveTimeMin = estimateTravelTime(distanceKm, 'driving');
      
      return {
        ...spot,
        distanceKm,
        estimatedDriveTimeMin
      };
    }).sort((a, b) => {
      // Sort by distance (nearest first)
      return (a.distanceKm || 99999) - (b.distanceKm || 99999);
    });
  }, [userLocation.latitude, userLocation.longitude]);

  // Filter spots based on search query and filter type
  const filteredSpots = useMemo(() => {
    return spotsWithDistance.filter((spot) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
          spot.name.toLowerCase().includes(query) ||
          spot.address.toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }
      
      // Apply legal status filter
      if (legalFilter !== "all") {
        if (legalFilter === "legal" && !spot.isLegal) return false;
        if (legalFilter === "illegal" && spot.isLegal) return false;
      }
      return true;
    });
  }, [spotsWithDistance, searchQuery, legalFilter]);

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "bg-green-500"
    if (probability >= 50) return "bg-yellow-500"
    if (probability >= 30) return "bg-orange-500"
    return "bg-red-500"
  }

  const getProbabilityTextColor = (probability: number) => {
    if (probability >= 70) return "text-green-600"
    if (probability >= 50) return "text-yellow-600"
    if (probability >= 30) return "text-orange-600"
    return "text-red-600"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Low":
        return "text-green-600"
      case "Moderate":
        return "text-yellow-600"
      case "High":
        return "text-orange-600"
      case "Very High":
        return "text-red-600"
      case "High Risk":
      case "Moderate Risk":
      case "Low Risk":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // Calculate current success rate based on traffic frequency
  const getCurrentSuccessRate = (spot: ParkingSpot) => {
    const currentHour = currentTime.getHours()
    const trafficLevel = spot.trafficFrequency[currentHour]

    // Higher traffic = lower success rate
    // Base success rate adjusted by traffic (inverted relationship)
    const baseRate = spot.findingProbability
    const trafficAdjustment = (100 - trafficLevel) / 100
    const currentRate = Math.round(baseRate * trafficAdjustment)

    return Math.max(5, Math.min(95, currentRate)) // Keep between 5-95%
  }

  // Get current time position for the chart (0-23 hours mapped to 0-100%)
  const getCurrentTimePosition = () => {
    const currentHour = currentTime.getHours()
    const currentMinutes = currentTime.getMinutes()
    return ((currentHour + currentMinutes / 60) / 24) * 100
  }

  return (
    <div className="flex flex-col h-screen bg-background w-full max-w-md mx-auto overflow-hidden">
        {/* Mobile Header */}
      <div className="flex items-center gap-2 p-2 border-b bg-white sticky top-0 z-20">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Find parking near..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              variant="outline"
              className="h-10 w-12 px-2"
            >
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[380px] sm:h-[480px] sm:max-w-lg sm:rounded-lg sm:border">
            <SheetHeader>
              <SheetTitle>Filter Parking Spots</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium">Legal Status</h3>
                <div className="flex gap-2">
                  <Button
                    variant={legalFilter === "all" ? "default" : "outline"}
                    className="flex-1 h-9"
                    onClick={() => setLegalFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={legalFilter === "legal" ? "default" : "outline"}
                    className="flex-1 h-9"
                    onClick={() => setLegalFilter("legal")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Legal
                  </Button>
                  <Button
                    variant={legalFilter === "illegal" ? "default" : "outline"}
                    className="flex-1 h-9"
                    onClick={() => setLegalFilter("illegal")}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Illegal
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium">Sort By</h3>
                <Select defaultValue="distance">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="price">Price (Low to High)</SelectItem>
                    <SelectItem value="success">Success Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    setLegalFilter("all");
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Map Controls Toolbar (moved out of the map) */}
      <div className="sticky top-[56px] z-10 bg-white border-b border-gray-200 p-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showHeatmap ? "default" : "outline"}
            className="text-xs flex items-center h-8"
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            <BarChart2 className="h-3.5 w-3.5 mr-1" />
            Traffic Heatmap
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => setExpandedView(expandedView === 'map' ? 'list' : 'map')}
          >
            {expandedView === 'map' ? (
              <>
                <Map className="h-3.5 w-3.5 mr-1" />
                View List
              </>
            ) : (
              <>
                <Map className="h-3.5 w-3.5 mr-1" />
                View Map
              </>
            )}
          </Button>
        </div>
        
        <Button 
          className="rounded-full w-8 h-8 p-0" 
          variant="outline" 
          size="icon"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
        
      {/* Google Maps Area */}
      <div 
        className={`relative bg-gray-100 transition-all duration-300 ${expandedView === 'map' ? 'h-[60vh]' : 'h-[20vh]'}`}
      >
        <GoogleMapComponent 
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} 
          parkingSpots={filteredSpots} 
          selectedSpotId={selectedSpot?.id} 
          onSpotSelect={(spot) => setSelectedSpot(spot as ParkingSpotWithDistance)}
          userLocation={userLocation} 
          showHeatmap={showHeatmap}
          onMapLoad={(map) => {
            mapRef.current = map;
          }}
        />
      </div>

      {/* Mobile Bottom Sheet */}
      <div className={`bg-white border-t overflow-y-auto transition-all duration-300 ${expandedView === 'list' ? 'flex-1 max-h-[80vh]' : 'max-h-80'}`}>
        <div className="flex justify-between items-center p-2 sticky top-0 z-10 bg-white border-b">
          <h3 className="font-medium text-sm flex items-center h-8">Parking Knowledge Base</h3>
        </div>
        {selectedSpot ? (
          <div className="p-4 mb-20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-base">{selectedSpot.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{selectedSpot.address}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedSpot.isLegal ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Legal
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Unauthorized
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {selectedSpot.type}
                  </Badge>
                </div>
              </div>
              <Button onClick={() => setSelectedSpot(null)} variant="ghost" size="sm" className="h-8 w-8 p-0">
                ×
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div
                  className={`text-lg font-bold ${getProbabilityTextColor(getCurrentSuccessRate(selectedSpot))}`}
                >
                  {getCurrentSuccessRate(selectedSpot)}%
                </div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">RM{selectedSpot.pricePerHour}</div>
                <div className="text-xs text-muted-foreground">Per Hour</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{selectedSpot.walkTime}min</div>
                <div className="text-xs text-muted-foreground">Walk</div>
              </div>
            </div>

            {/* Traffic Frequency Chart */}
            <div className="mb-4 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Traffic Frequency
                </h4>
                <div className="text-xs text-gray-600">
                  {currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="relative">
                <div className="flex items-end gap-px h-16 mb-1">
                  {selectedSpot.trafficFrequency.map((frequency, index) => (
                    <div
                      key={index}
                      className="bg-blue-400 rounded-t flex-1 min-w-0 transition-all"
                      style={{ height: `${(frequency / 100) * 100}%` }}
                      title={`${index}:00 - ${frequency}% busy`}
                    />
                  ))}
                </div>

                {/* Current Time Indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-[5]"
                  style={{ left: `${getCurrentTimePosition()}%` }}
                >
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </div>

                {/* Time Labels */}
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>12AM</span>
                  <span>6AM</span>
                  <span>12PM</span>
                  <span>6PM</span>
                  <span>12AM</span>
                </div>
              </div>

              <div className="text-xs text-gray-600 mt-2">
                Current traffic: {selectedSpot.trafficFrequency[currentTime.getHours()]}% busy
              </div>
            </div>

            {/* Availability Description */}
            <div className="mb-4 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">{selectedSpot.availabilityDescription}</span>
              </div>
            </div>

            {/* Entrances Section */}
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <Route className="w-4 h-4 mr-1" />
                Entrances & Access
              </h4>
              <div className="space-y-2">
                {selectedSpot.entrances.map((entrance, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-2">
                    <div className="font-medium text-xs">{entrance.name}</div>
                    <div className="text-xs text-gray-600">{entrance.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            <div className="mb-4 bg-blue-50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-1 text-blue-800">💡 Local Tips</h4>
              <p className="text-xs text-blue-700">{selectedSpot.tips}</p>
            </div>

            {showAnalytics && (
              <Tabs defaultValue="busy-times" className="mb-4">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="busy-times" className="text-xs">
                    Busy Times
                  </TabsTrigger>
                  <TabsTrigger value="info" className="text-xs">
                    Details
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="busy-times" className="mt-3">
                  <div className="space-y-2">
                    <div className="text-xs font-medium flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Typical Busy Periods
                    </div>
                    {selectedSpot.busyTimes.map((period, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span>{period.time}</span>
                        <span className={`font-medium ${getStatusColor(period.status)}`}>{period.status}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="info" className="mt-3">
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Peak Hours: {selectedSpot.peakHours}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedSpot.isLegal
                        ? `Standard rate: RM${selectedSpot.pricePerHour}/hour`
                        : "Risk of fines: RM50-150"}
                    </div>
                    <div className="text-xs text-muted-foreground">Capacity: {selectedSpot.capacity} vehicles</div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            <Button
              variant={showHeatmap ? "default" : "outline"}
              size="sm"
              onClick={() => {
                // Simple toggle with minimal extra code
                setShowHeatmap(!showHeatmap);
                
                // Force map to refresh by triggering a quick redraw
                if (mapRef.current) {
                  try {
                    // Brief timeout to let React finish its updates
                    setTimeout(() => {
                      if (mapRef.current) {
                        // Force a redraw of the map
                        google.maps.event.trigger(mapRef.current, 'resize');
                      }
                    }, 10);
                  } catch (err) {
                    console.error('Error refreshing map:', err);
                  }
                }
              }}
              className={showHeatmap ? "bg-primary text-primary-foreground" : "bg-white dark:bg-gray-800"}
              title={showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-xs">{showHeatmap ? "Hide" : "Show"} Heatmap</span>
            </Button>
            <div className="flex space-x-2 mt-2">
              <Button 
                onClick={() => setNavigationOpen(true)} 
                className="flex-1 h-9 text-sm"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Directions
              </Button>
            </div>
            
            {/* Navigation Sheet with directions and local images */}
            <NavigationSheet 
              open={navigationOpen} 
              onOpenChange={setNavigationOpen} 
              spot={selectedSpot} 
              userLocation={userLocation}
            />
          </div>
        ) : (
          <div className="p-4">
            <div className="space-y-2 mb-20">
              {filteredSpots.map((spot) => (
                <Card
                  key={spot.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedSpot(spot)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{spot.name}</div>
                        <div className="text-xs text-gray-600 truncate mb-1">{spot.address}</div>
                        <div className="flex flex-1 justify-between items-center mb-1">
                          {spot.isLegal ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Legal
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Risk
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{spot.walkTime}min walk</span>
                        </div>
                        <div className="text-xs text-gray-600">{spot.availabilityDescription}</div>
                      </div>
                      <div className="text-right ml-2">
                        <div
                          className={`font-semibold text-sm ${getProbabilityTextColor(getCurrentSuccessRate(spot))}`}
                        >
                          {getCurrentSuccessRate(spot)}%
                        </div>
                        <div className="text-xs text-muted-foreground">RM{spot.pricePerHour}/hr</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Feature Menu Button - positioned correctly in mobile container */}
      <div className="fixed bottom-16 right-4 z-30 md:absolute md:bottom-20 md:right-4">
        {/* Expandable Menu Button */}
        <div className="relative">
          <Button 
            size="icon" 
            className={`h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground transition-all duration-200 ${showFeatureMenu ? 'rotate-45' : ''}`}
            onClick={() => setShowFeatureMenu(!showFeatureMenu)}
            aria-label="Toggle feature menu"
          >
            {!showFeatureMenu ? (
              <Menu className="h-6 w-6" />
            ) : (
              <X className="h-6 w-6" />
            )}
          </Button>
          
          {/* Dropdown Feature Menu */}
          {showFeatureMenu && (
            <div className="absolute bottom-16 right-0 flex flex-col-reverse space-y-2 space-y-reverse">
              {/* Coupon Button */}
              <div className="flex items-center mb-2">
                <div className="mr-2 bg-white dark:bg-gray-800 shadow-md px-2 py-1 rounded-lg text-sm hidden md:block">
                  Coupons
                </div>
                <Button 
                  size="icon" 
                  className="h-10 w-10 rounded-full shadow-md bg-white dark:bg-gray-800 relative"
                  onClick={() => {
                    setShowCouponSheet(true);
                    setShowFeatureMenu(false);
                  }}
                >
                  <Ticket className="h-5 w-5 text-primary" />
                  {coupons.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {coupons.length}
                    </span>
                  )}
                </Button>
              </div>
              
              {/* Updates Button Removed */}
              
              {/* Messages Button */}
              <div className="flex items-center mb-2">
                <div className="mr-2 bg-white dark:bg-gray-800 shadow-md px-2 py-1 rounded-lg text-sm hidden md:block">
                  Messages
                </div>
                <Button 
                  size="icon" 
                  className="h-10 w-10 rounded-full shadow-md bg-white dark:bg-gray-800 relative"
                  onClick={() => {
                    if (openMessagesDialog) openMessagesDialog();
                    setShowFeatureMenu(false);
                  }}
                  disabled={!openMessagesDialog}
                >
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {unreadMessageCount}
                    </span>
                  )}
                </Button>
              </div>
              
              {/* QR Scan Button */}
              <div className="flex items-center mb-2">
                <div className="mr-2 bg-white dark:bg-gray-800 shadow-md px-2 py-1 rounded-lg text-sm hidden md:block">
                  Scan QR
                </div>
                <Button 
                  size="icon" 
                  className="h-10 w-10 rounded-full shadow-md bg-white dark:bg-gray-800"
                  onClick={() => {
                    if (openQRScanner) openQRScanner();
                    setShowFeatureMenu(false);
                  }}
                  disabled={!openQRScanner}
                  aria-label="Scan QR code"
                >
                  <QrCode className="h-5 w-5 text-primary" />
                  {/* No notification badge for QR button */}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coupon Reminder Sheet */}
      <Sheet open={showCouponSheet} onOpenChange={setShowCouponSheet}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <Ticket className="mr-2 h-5 w-5" /> 
              Parking Coupons
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <CouponReminder 
              userCoupons={coupons}
              onAddCoupon={handleAddCoupon}
              onDeleteCoupon={handleDeleteCoupon}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Live Updates Sheet */}
      <Sheet open={showUpdatesSheet} onOpenChange={setShowUpdatesSheet}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" /> 
              Live Parking Updates
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <LiveParkingUpdates
              userLocation={userLocation.latitude && userLocation.longitude ? {
                lat: userLocation.latitude,
                lng: userLocation.longitude
              } : null}
              parkingSpots={parkingSpots}
              radius={2}
              isSubscribed={isSubscribed}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Anonymous Messaging System */}
      <AnonymousMessaging 
        onOpenMessages={(openFn) => {
          setOpenMessagesDialog(() => openFn);
        }}
        onOpenScanner={(openFn) => {
          setOpenQRScanner(() => openFn);
        }}
        onUnreadCountChange={(count) => {
          setUnreadMessageCount(count);
        }}
      />
    </div>
  )
}
