"use client"

import React, { useState, useEffect } from "react"
import { Bell, Car, Map, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ParkingSpot } from "@/lib/parkingData"

interface LiveUpdateNotification {
  id: string
  parkingId: number
  parkingName: string
  message: string
  timestamp: Date
  read: boolean
}

interface LiveParkingUpdatesProps {
  userLocation: { lat: number; lng: number } | null
  parkingSpots: ParkingSpot[]
  radius?: number // radius in kilometers for nearby parking spots
  maxNotifications?: number
  isSubscribed?: boolean // Whether user has premium subscription
}

export const LiveParkingUpdates: React.FC<LiveParkingUpdatesProps> = ({
  userLocation,
  parkingSpots,
  radius = 2, // Default 2km radius
  maxNotifications = 10,
  isSubscribed = false
}) => {
  const [notifications, setNotifications] = useState<LiveUpdateNotification[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const { toast } = useToast()

  // Function to calculate distance between two points (Haversine formula)
  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371 // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Get nearby parking spots based on user location
  const getNearbyParkingSpots = (): ParkingSpot[] => {
    if (!userLocation) return []
    
    return parkingSpots.filter(spot => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        spot.lat,
        spot.lng
      )
      return distance <= radius
    })
  }

  // Simulate parking availability changes
  useEffect(() => {
    if (!userLocation || !notificationsEnabled || !isSubscribed) return

    const nearbySpots = getNearbyParkingSpots()
    if (nearbySpots.length === 0) return
    
    const interval = setInterval(() => {
      // Randomly select a nearby parking spot
      const randomIndex = Math.floor(Math.random() * nearbySpots.length)
      const randomSpot = nearbySpots[randomIndex]
      
      // Generate a notification (20% chance)
      if (Math.random() < 0.2) {
        const availabilityChange = Math.random() < 0.5
        
        // Calculate spots available (based on capacity and traffic frequency)
        const hour = new Date().getHours()
        const trafficIndex = randomSpot.trafficFrequency[hour] || 50 // Default to 50% if no data
        const spotsAvailable = Math.max(0, 
          Math.floor(randomSpot.capacity * (1 - trafficIndex/100))
        )
        
        const newNotification: LiveUpdateNotification = {
          id: `notif-${Date.now()}-${randomSpot.id}`,
          parkingId: randomSpot.id,
          parkingName: randomSpot.name,
          message: availabilityChange 
            ? `${spotsAvailable} spots just became available at ${randomSpot.name}`
            : `${randomSpot.name} is filling up quickly! Only ${spotsAvailable} spots left`,
          timestamp: new Date(),
          read: false
        }
        
        setNotifications(prev => {
          // Add new notification at the beginning, limit to maxNotifications
          const updated = [newNotification, ...prev].slice(0, maxNotifications)
          return updated
        })
        
        // Show toast for new notification
        toast({
          title: availabilityChange ? "New Parking Available!" : "Parking Alert!",
          description: newNotification.message,
          duration: 5000,
        })
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [userLocation, parkingSpots, notificationsEnabled, isSubscribed, radius])

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isSubscribed) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <h3 className="font-semibold">Live Parking Updates</h3>
            <p className="text-sm text-muted-foreground">
              Upgrade to premium to receive notifications about parking availability near you.
            </p>
            <Button className="mt-2" variant="default">
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {/* Removed duplicate title header since it's already in the Sheet header */}
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
            id="notifications-toggle"
          />
          <label 
            htmlFor="notifications-toggle"
            className="text-xs cursor-pointer"
          >
            {notificationsEnabled ? "On" : "Off"}
          </label>
        </div>
      </div>
      
      {/* Notifications list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`${notification.read ? 'bg-background' : 'bg-accent/20'} transition-colors`}
              >
                <CardContent className="p-2 text-sm">
                  <div className="relative">
                    <div 
                      className="cursor-pointer pr-6" 
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Car className="h-3 w-3" />
                        <span className="font-medium">{notification.parkingName}</span>
                      </div>
                      <p className="text-xs">{notification.message}</p>
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    {/* Smaller, more subtle delete button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 absolute top-0 right-0 opacity-60 hover:opacity-100"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-2 w-2" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {notifications.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs w-full"
                onClick={clearAllNotifications}
              >
                Clear all notifications
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            {notificationsEnabled
              ? "No parking updates yet. We'll notify you when spaces become available nearby."
              : "Notifications are currently disabled"}
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveParkingUpdates
