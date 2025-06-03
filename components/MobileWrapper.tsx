"use client";

import { useEffect, useState } from 'react';

interface MobileWrapperProps {
  children: React.ReactNode;
}

export default function MobileWrapper({ children }: MobileWrapperProps) {
  const [isMobile, setIsMobile] = useState(true);
  
  useEffect(() => {
    // Check if the screen width is greater than mobile breakpoint
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // If actual mobile device, render children normally
  if (isMobile) {
    return <>{children}</>;
  }
  
  // For desktop, create a mobile container that properly contains fixed elements
  return (
    <div className="min-h-screen w-full bg-gray-800 flex items-center justify-center py-6">
      <div className="bg-white rounded-lg shadow-md mobile-container">
        {/* Mobile container with relative positioning to contain absolute elements - without scrolling */}
        <div 
          className="w-[390px] relative" 
          style={{ 
            height: 'calc(100vh - 80px)',
            maxHeight: '800px',
          }}
        >
          {/* App content with extra padding at bottom for repositioned buttons - no overflow scrolling */}
          <div className="h-full overflow-hidden pb-20">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
