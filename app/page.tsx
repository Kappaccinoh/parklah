"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Navigation, AlertTriangle, CheckCircle, Filter, Route, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GoogleMapComponent from "@/components/GoogleMap"
import { parkingSpots, type ParkingSpot } from "@/lib/parkingData"
import useGeolocation from "@/hooks/useGeolocation"
import { calculateDistance, estimateTravelTime, formatDistance } from "@/lib/distanceUtils"

// The parking spots data is now imported from lib/parkingData.ts

// Interface for parking spots with distance data
interface ParkingSpotWithDistance extends ParkingSpot {
  distanceKm?: number;
  estimatedDriveTimeMin?: number;
}

export default function ParkingFinderApp() {
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpotWithDistance | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
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
  const filteredSpots = spotsWithDistance.filter((spot) => {
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterType === "all" ||
      (filterType === "legal" && spot.isLegal) ||
      (filterType === "street" && spot.type === "street") ||
      (filterType === "mall" && spot.type === "mall")

    return matchesSearch && matchesFilter
  })

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "bg-green-500"
    if (probability >= 50) return "bg-yellow-500"
    if (probability >= 30) return "bg-orange-500"
    return "bg-red-500"
  }

  const getProbabilityTextColor = (probability) => {
    if (probability >= 70) return "text-green-600"
    if (probability >= 50) return "text-yellow-600"
    if (probability >= 30) return "text-orange-600"
    return "text-red-600"
  }

  const getStatusColor = (status) => {
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
  const getCurrentSuccessRate = (spot) => {
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
    <div className="flex flex-col h-screen bg-background max-w-sm mx-auto">
      {/* Mobile Header */}
      <div className="flex items-center gap-2 p-3 border-b bg-white">
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
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Parking</SelectItem>
                    <SelectItem value="legal">Legal Only</SelectItem>
                    <SelectItem value="illegal">Unauthorized Zones</SelectItem>
                    <SelectItem value="high-chance">High Success Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowAnalytics(!showAnalytics)} variant="outline" className="w-full">
                {showAnalytics ? "Hide" : "Show"} Insights
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Google Maps Area */}
      <div className="flex-1 relative bg-gray-100">
        <GoogleMapComponent 
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} 
          parkingSpots={filteredSpots} 
          selectedSpotId={selectedSpot?.id} 
          onSpotSelect={(spot) => setSelectedSpot(spot as ParkingSpotWithDistance)}
          userLocation={userLocation} 
        />

        {/* Floating Navigation Button */}
        <Button className="absolute bottom-4 right-4 rounded-full w-12 h-12 shadow-lg" size="icon">
          <Navigation className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="bg-white border-t max-h-80 overflow-y-auto">
        {selectedSpot ? (
          <div className="p-4">
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
                <div className={`text-lg font-bold ${getProbabilityTextColor(getCurrentSuccessRate(selectedSpot))}`}>
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
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
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

            <div className="flex gap-2">
              <Button className="flex-1 h-9 text-sm">
                <Navigation className="w-4 h-4 mr-2" />
                Navigate
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <h3 className="font-semibold mb-3 text-sm">Parking Knowledge Base</h3>
            <div className="space-y-2">
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
                        <div className="flex items-center gap-2 mb-1">
                          {spot.isLegal ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Legal
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Risk
                            </Badge>
                          )}
                          {userLocation.latitude ? (
                            <span className="text-xs text-muted-foreground">
                              <Route className="h-3 w-3 inline mr-1" />
                              {formatDistance(spot.distanceKm || 0)} • {spot.estimatedDriveTimeMin}min
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">{spot.walkTime}min walk</span>
                          )}
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
    </div>
  )
}
