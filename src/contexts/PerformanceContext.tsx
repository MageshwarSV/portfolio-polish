/**
 * Performance Context Provider
 * Provides device info and animation config to all components
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getDeviceInfo,
  getAnimationConfig,
  logDeviceInfo,
  DeviceInfo,
  AnimationConfig,
} from '@/lib/deviceDetection';

interface PerformanceContextType {
  deviceInfo: DeviceInfo;
  animationConfig: AnimationConfig;
  isLoading: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider = ({ children }: { children: ReactNode }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getDeviceInfo());
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig>(() =>
    getAnimationConfig(deviceInfo)
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect device on mount
    const info = getDeviceInfo();
    const config = getAnimationConfig(info);
    
    setDeviceInfo(info);
    setAnimationConfig(config);
    setIsLoading(false);
    
    // Log device info in development
    if (import.meta.env.DEV) {
      logDeviceInfo();
    }

    // Re-detect on window resize (for responsive changes)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newInfo = getDeviceInfo();
        const newConfig = getAnimationConfig(newInfo);
        setDeviceInfo(newInfo);
        setAnimationConfig(newConfig);
      }, 300); // Debounce resize
    };

    window.addEventListener('resize', handleResize);

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      const newInfo = getDeviceInfo();
      const newConfig = getAnimationConfig(newInfo);
      setDeviceInfo(newInfo);
      setAnimationConfig(newConfig);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleMotionChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMotionChange);
      } else {
        mediaQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  return (
    <PerformanceContext.Provider value={{ deviceInfo, animationConfig, isLoading }}>
      {children}
    </PerformanceContext.Provider>
  );
};

/**
 * Hook to access performance context
 */
export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

/**
 * Hook to get animation config only
 */
export const useAnimationConfig = (): AnimationConfig => {
  const { animationConfig } = usePerformance();
  return animationConfig;
};

/**
 * Hook to get device info only
 */
export const useDeviceInfo = (): DeviceInfo => {
  const { deviceInfo } = usePerformance();
  return deviceInfo;
};
