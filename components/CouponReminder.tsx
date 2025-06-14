"use client"

import React, { useState, useEffect } from "react"
import { Clock, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { useToast } from "@/components/ui/use-toast"

export interface CouponItem {
  id: string
  label: string
  expiryTime: Date
  location: string
  notifiedAt?: Date[]
}

interface CouponReminderProps {
  userCoupons?: CouponItem[]
  onAddCoupon?: (coupon: Omit<CouponItem, "id">) => void
  onDeleteCoupon?: (id: string) => void
}

export const CouponReminder: React.FC<CouponReminderProps> = ({ 
  userCoupons = [], 
  onAddCoupon,
  onDeleteCoupon
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [expiryTime, setExpiryTime] = useState<Date>(new Date())
  const [location, setLocation] = useState("")
  const [label, setLabel] = useState("")
  const { toast } = useToast()

  // Check for expiring coupons and show notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      userCoupons.forEach((coupon) => {
        const timeDiff = coupon.expiryTime.getTime() - now.getTime()
        const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60))
        
        // Show notification for 3-hour, 1-hour, and 30-minute warnings if not already notified
        if (
          (hoursRemaining === 3 || hoursRemaining === 1 || 
           (timeDiff > 0 && timeDiff <= 30 * 60 * 1000)) && 
          !hasRecentNotification(coupon)
        ) {
          const timeString = hoursRemaining > 0 
            ? `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}` 
            : `${Math.floor(timeDiff / (1000 * 60))} minutes`
          
          toast({
            title: "Coupon Expiring Soon!",
            description: `Your parking coupon at ${coupon.location} will expire in ${timeString}. Top up to avoid getting fined.`,
            variant: "destructive",
            duration: 10000,
          })
          
          // Update the notification history by adding current time to notifiedAt array
          if (onAddCoupon) {
            // Create a new notifiedAt array with the current time added
            const newNotifiedAt = [...(coupon.notifiedAt || []), new Date()]
            
            // Create updated coupon with the new notifiedAt array
            const updatedCoupon = {
              label: coupon.label,
              expiryTime: coupon.expiryTime,
              location: coupon.location,
              notifiedAt: newNotifiedAt
            }
            
            // First delete the old coupon
            if (onDeleteCoupon) {
              onDeleteCoupon(coupon.id)
              // Then add the updated coupon
              onAddCoupon(updatedCoupon)
            }
          }
          
          // Auto-delete expired coupons
          if (onDeleteCoupon && coupon.expiryTime < now) {
            onDeleteCoupon(coupon.id)
          }
        }
      })
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [userCoupons, toast, onAddCoupon, onDeleteCoupon])
  
  // Helper to check if notification was recently sent to avoid duplicates
  const hasRecentNotification = (coupon: CouponItem) => {
    if (!coupon.notifiedAt || coupon.notifiedAt.length === 0) return false
    
    const now = new Date()
    const lastNotification = coupon.notifiedAt[coupon.notifiedAt.length - 1]
    // Don't notify more than once every 15 minutes
    return (now.getTime() - lastNotification.getTime()) < 15 * 60 * 1000
  }

  const handleAddCoupon = () => {
    if (!label.trim()) {
      toast({
        title: "Error",
        description: "Please enter a label for your coupon",
        variant: "destructive",
      })
      return
    }
    
    if (!location.trim()) {
      toast({
        title: "Error",
        description: "Please enter the parking location",
        variant: "destructive",
      })
      return
    }
    
    // Validate that the expiry time is in the future
    if (expiryTime.getTime() <= new Date().getTime()) {
      toast({
        title: "Error",
        description: "Expiry time must be in the future",
        variant: "destructive",
      })
      return
    }
    
    if (onAddCoupon) {
      onAddCoupon({
        label: label.trim(),
        expiryTime,
        location: location.trim(),
        notifiedAt: []
      })
      
      toast({
        title: "Coupon Added",
        description: `You'll be reminded before ${label} expires`,
      })
    }
    
    // Reset form and close dialog
    setLabel("")
    setLocation("")
    setExpiryTime(new Date())
    setIsAddOpen(false)
  }
  
  // Sort coupons by expiry time (closest to expiry first)
  const sortedCoupons = [...userCoupons].sort((a, b) => a.expiryTime.getTime() - b.expiryTime.getTime())
  
  return (
    <>
      {/* Coupon List */}
      <div className="flex flex-col space-y-3 mt-4">
        {sortedCoupons.length > 0 ? (
          sortedCoupons.map((coupon) => {
            const isExpiringSoon = coupon.expiryTime.getTime() - new Date().getTime() < 3600000 // 1 hour
            return (
              <Card key={coupon.id} className="relative overflow-hidden">
                <CardContent className="p-3">
                  <div className="relative">
                    <div className="pr-6">
                      <h3 className="font-semibold text-sm">{coupon.label}</h3>
                      <p className="text-xs text-muted-foreground">{coupon.location}</p>
                      <div className="flex items-center mt-1 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>
                          Expires: {coupon.expiryTime.toLocaleTimeString([], {
                            hour: "2-digit", 
                            minute: "2-digit",
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {isExpiringSoon && (
                      <div className="flex items-center text-red-500 absolute top-0 right-7">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    
                    {onDeleteCoupon && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteCoupon(coupon.id)}
                        className="h-5 w-5 absolute top-0 right-0 opacity-60 hover:opacity-100"
                      >
                        <X className="h-2 w-2" />
                        <span className="sr-only">Delete coupon</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No active parking coupons to display
          </div>
        )}
      </div>
      
      {/* Add button */}
      <Button 
        variant="outline" 
        className="w-full mt-3"
        onClick={() => setIsAddOpen(true)}
      >
        Add Parking Coupon
      </Button>
      
      {/* Add Coupon Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-[350px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Parking Coupon</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <label htmlFor="label" className="text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                id="label"
                className="border rounded p-2 text-sm"
                placeholder="e.g., Car at KLCC"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="location" className="text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                id="location"
                className="border rounded p-2 text-sm"
                placeholder="e.g., KLCC P2 Basement"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Expiry Time</label>
              <DateTimePicker 
                value={expiryTime} 
                onChange={setExpiryTime} 
                className="w-full"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCoupon}>Add Coupon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CouponReminder
