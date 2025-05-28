/**
 * A client component that adds a base tag to the head to ensure paths are correctly resolved
 * when the app is served from a subdirectory like GitHub Pages
 */
'use client';

import { useEffect } from 'react';
import { getBasePath } from '../lib/pathUtils';

export default function BasePathProvider() {
  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      // Create a base element if one doesn't exist
      let baseElement = document.querySelector('base');
      if (!baseElement) {
        baseElement = document.createElement('base');
        document.head.appendChild(baseElement);
      }
      
      // Set the href to the base path
      baseElement.setAttribute('href', `${getBasePath()}/`);
    }
  }, []);

  return null;
}
