/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  largeFont: boolean;
  toggleLargeFont: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fairshift_high_contrast') === 'true';
    } catch {
      return false;
    }
  });

  const [largeFont, setLargeFont] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fairshift_large_font') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fairshift_high_contrast', String(highContrast));
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    } catch {
      // ignore
    }
  }, [highContrast]);

  useEffect(() => {
    try {
      localStorage.setItem('fairshift_large_font', String(largeFont));
      if (largeFont) {
        document.documentElement.classList.add('large-font');
      } else {
        document.documentElement.classList.remove('large-font');
      }
    } catch {
      // ignore
    }
  }, [largeFont]);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast: () => setHighContrast((prev) => !prev),
        largeFont,
        toggleLargeFont: () => setLargeFont((prev) => !prev),
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
