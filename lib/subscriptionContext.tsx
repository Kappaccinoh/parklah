"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define subscription levels
export type SubscriptionTier = 'free' | 'premium';

// Define subscription context value interface
interface SubscriptionContextValue {
  subscriptionStatus: SubscriptionTier;
  isSubscribed: boolean;
  subscriptionExpiry: Date | null;
  upgradeSubscription: () => void;
  cancelSubscription: () => void;
}

// Create context with default values
const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscriptionStatus: 'free',
  isSubscribed: false,
  subscriptionExpiry: null,
  upgradeSubscription: () => {},
  cancelSubscription: () => {},
});

// Custom hook to use subscription context
export const useSubscription = () => useContext(SubscriptionContext);

// Props interface for the provider component
interface SubscriptionProviderProps {
  children: ReactNode;
}

// Provider component
export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  // State for subscription status and expiry
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionTier>('free');
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<Date | null>(null);
  
  // Compute whether user is subscribed based on status and expiry
  const isSubscribed = subscriptionStatus === 'premium' && 
    (subscriptionExpiry ? new Date() < subscriptionExpiry : false);
  
  // Function to upgrade subscription (in actual implementation, this would integrate with payment gateway)
  const upgradeSubscription = () => {
    setSubscriptionStatus('premium');
    
    // Set expiry to 30 days from now
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    setSubscriptionExpiry(expiry);
    
    // In a real app, this would make an API call to save the subscription
    localStorage.setItem('parklah_subscription', JSON.stringify({
      status: 'premium',
      expiry: expiry.toISOString()
    }));
  };
  
  // Function to cancel subscription
  const cancelSubscription = () => {
    setSubscriptionStatus('free');
    setSubscriptionExpiry(null);
    
    // In a real app, this would make an API call to cancel the subscription
    localStorage.removeItem('parklah_subscription');
  };
  
  // Load subscription from localStorage on component mount
  useEffect(() => {
    const savedSubscription = localStorage.getItem('parklah_subscription');
    
    if (savedSubscription) {
      try {
        const { status, expiry } = JSON.parse(savedSubscription);
        
        if (status === 'premium') {
          const expiryDate = new Date(expiry);
          
          // Only restore subscription if it's not expired
          if (expiryDate > new Date()) {
            setSubscriptionStatus('premium');
            setSubscriptionExpiry(expiryDate);
          } else {
            // Clear expired subscription
            localStorage.removeItem('parklah_subscription');
          }
        }
      } catch (error) {
        console.error('Error parsing subscription data:', error);
      }
    }
  }, []);
  
  // Context value object
  const contextValue: SubscriptionContextValue = {
    subscriptionStatus,
    isSubscribed,
    subscriptionExpiry,
    upgradeSubscription,
    cancelSubscription,
  };
  
  // Provide context to children
  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};
