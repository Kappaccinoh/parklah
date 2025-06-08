"use client";

import React from 'react';

interface ValetBadgeIconProps {
  className?: string;
}

const ValetBadgeIcon: React.FC<ValetBadgeIconProps> = ({ className }) => {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="8" cy="8" r="7.5" fill="#5856D6" stroke="white"/>
      <path 
        d="M4.67188 11V5H8.04688C8.62396 5 9.10677 5.0974 9.49531 5.29219C9.88646 5.48698 10.1818 5.75677 10.3813 6.10156C10.5807 6.44375 10.6805 6.8401 10.6805 7.29062C10.6805 7.74375 10.5781 8.14271 10.3735 8.4875C10.1688 8.82969 9.86823 9.09948 9.47188 9.29688C9.07552 9.49427 8.58229 9.59297 7.99219 9.59297H5.89062V8.51797H7.85156C8.21615 8.51797 8.51042 8.46589 8.73438 8.36172C8.95833 8.25755 9.12187 8.10885 9.225 7.91562C9.33073 7.72239 9.38359 7.48854 9.38359 7.21406C9.38359 6.9349 9.33073 6.69583 9.225 6.49688C9.11927 6.29792 8.95312 6.14661 8.72656 6.04297C8.5 5.93932 8.20052 5.8875 7.82812 5.8875H5.95312V11H4.67188Z" 
        fill="white"
      />
    </svg>
  );
};

export default ValetBadgeIcon;
