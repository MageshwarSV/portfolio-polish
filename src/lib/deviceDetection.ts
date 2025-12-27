/**
 * Device Detection and Performance Scoring System
 * Detects device type, capabilities, and calculates a performance score
 * to intelligently adapt animations and effects
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  isTouchDevice: boolean;
  isLowPerformance: boolean;
  performanceScore: number; // 0-100
  screenSize: 'small' | 'medium' | 'large';
  prefersReducedMotion: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
  cores: number;
  memory: number; // in GB
  hasGPU: boolean;
  gpuTier: 'low' | 'medium' | 'high';
  supportsHighRefreshRate: boolean; // 120Hz support
}

export interface AnimationConfig {
  enableParticles: boolean;
  enableCustomCursor: boolean;
  enableComplexAnimations: boolean;
  enableSmoothScroll: boolean;
  enableLoadingScreen: boolean;
  animationDuration: number; // multiplier: 1 = normal, 0.5 = faster, 1.5 = slower
  particleCount: number;
  targetFPS: number; // 60 or 120
  useGPUAcceleration: boolean;
}

/**
 * Detects if the device is a mobile phone
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Check for mobile user agents - more specific regex
  const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(userAgent);

  // Specifically detect iPads/Tablets if they are in "Mobile" mode
  const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(userAgent);

  // Check screen size - focus on small screens for mobile
  const isSmallScreen = window.innerWidth <= 768;

  // Check for touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // A device is mobile only if it has a mobile UA OR is a small screen with touch
  // Large touch screens (like Laptops) should NOT be classified as mobile
  return (isMobileUA && !isTabletUA) || (isSmallScreen && hasTouch);
};

/**
 * Detects if the device is a tablet
 */
export const isTabletDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor;
  const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  const isTabletSize = window.innerWidth > 768 && window.innerWidth <= 1024;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return isTabletUA || (isTabletSize && hasTouch && !isMobileDevice());
};

/**
 * Detects device type
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobileDevice()) return 'mobile';
  if (isTabletDevice()) return 'tablet';
  return 'desktop';
};

/**
 * Gets screen size category
 */
export const getScreenSize = (): 'small' | 'medium' | 'large' => {
  if (typeof window === 'undefined') return 'large';

  const width = window.innerWidth;
  if (width < 768) return 'small';
  if (width < 1280) return 'medium';
  return 'large';
};

/**
 * Checks if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Estimates device performance score (0-100)
 * Higher score = better performance
 */
export const calculatePerformanceScore = (): number => {
  if (typeof window === 'undefined') return 50;

  let score = 40; // Reduced base score (was 60)

  // CPU cores (navigator.hardwareConcurrency)
  const cores = navigator.hardwareConcurrency || 2;
  if (cores >= 8) score += 25;
  else if (cores >= 6) score += 15;
  else if (cores >= 4) score += 10;
  else score += 0; // Dual core or less gets nothing

  // Memory (if available, typical defaults to 4 or 8 in browsers to prevent fingerprinting)
  // But we can check for low values
  const memory = (navigator as any).deviceMemory || 4;
  if (memory >= 16) score += 20;
  else if (memory >= 8) score += 15;
  else if (memory >= 4) score += 5;
  else score -= 10; // 2GB or less is penalty

  // GPU Tier Impact (Estimated)
  const gpuInfo = detectGPU();
  if (gpuInfo.gpuTier === 'high') score += 20;
  if (gpuInfo.gpuTier === 'low') score -= 10; // Integrated/Weak GPU penalty

  // Screen resolution penalty for high-res on weak hardware
  const pixelRatio = window.devicePixelRatio || 1;
  const screenPixels = window.innerWidth * window.innerHeight * pixelRatio;
  if (screenPixels > 2560 * 1440 * 2) score -= 10;

  // Connection speed
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === '4g') score += 10;
    else if (effectiveType === '3g') score += 0;
    else if (effectiveType === '2g' || effectiveType === 'slow-2g') score -= 15;
  }

  // Device type penalty
  const deviceType = getDeviceType();
  if (deviceType === 'mobile') score -= 20;
  else if (deviceType === 'tablet') score -= 10;
  else if (deviceType === 'desktop') score += 10; // Bonus for desktop

  // Touch device penalty - only apply if it's also a small screen/mobile type
  if ('ontouchstart' in window && deviceType !== 'desktop') score -= 5;

  // Prefer reduced motion penalty
  if (prefersReducedMotion()) score -= 30;

  // Clamp score between 0-100
  return Math.max(0, Math.min(100, score));
};

/**
 * Gets connection speed category
 */
export const getConnectionSpeed = (): 'slow' | 'medium' | 'fast' => {
  if (typeof window === 'undefined') return 'medium';

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (!connection) return 'medium';

  const effectiveType = connection.effectiveType;
  if (effectiveType === '4g') return 'fast';
  if (effectiveType === '3g') return 'medium';
  return 'slow';
};

/**
 * Detects GPU capabilities (Mali, Adreno, Apple GPU, etc.)
 */
export const detectGPU = (): { hasGPU: boolean; gpuTier: 'low' | 'medium' | 'high' } => {
  if (typeof window === 'undefined') return { hasGPU: false, gpuTier: 'medium' };

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) return { hasGPU: false, gpuTier: 'low' };

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

      // High-end GPUs (Adreno 7xx+, Mali G7x+, Apple A15+, Desktop GPUs)
      if (renderer.includes('adreno (tm) 7') ||
        renderer.includes('adreno (tm) 8') ||
        renderer.includes('mali-g7') ||
        renderer.includes('mali-g8') ||
        renderer.includes('apple a15') ||
        renderer.includes('apple a16') ||
        renderer.includes('apple a17') ||
        renderer.includes('nvidia') ||
        renderer.includes('rtx') ||
        renderer.includes('radeon')) {
        return { hasGPU: true, gpuTier: 'high' };
      }

      // Mid-range GPUs (Adreno 6xx, Mali G5x/G6x, Apple A12-A14)
      if (renderer.includes('adreno (tm) 6') ||
        renderer.includes('mali-g5') ||
        renderer.includes('mali-g6') ||
        renderer.includes('apple a12') ||
        renderer.includes('apple a13') ||
        renderer.includes('apple a14')) {
        return { hasGPU: true, gpuTier: 'medium' };
      }
    }

    // Default: has GPU but unknown tier
    return { hasGPU: true, gpuTier: 'medium' };
  } catch (e) {
    return { hasGPU: false, gpuTier: 'low' };
  }
};

/**
 * Detects if device supports high refresh rate (120Hz+)
 */
export const supportsHighRefreshRate = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check for high refresh rate support
  // Most modern flagships: iPhone 13 Pro+, Samsung S21+, OnePlus 9 Pro+, Pixel 6+
  const isHighRefreshDevice = window.screen && (
    // High resolution + high pixel ratio often means flagship with 120Hz
    (window.devicePixelRatio >= 3 && window.innerWidth >= 390) ||
    // iPad Pro with ProMotion
    (/iPad/i.test(navigator.userAgent) && window.devicePixelRatio >= 2)
  );

  return isHighRefreshDevice;
};

/**
 * Gets complete device information
 */
export const getDeviceInfo = (): DeviceInfo => {
  const performanceScore = calculatePerformanceScore();
  const deviceType = getDeviceType();
  const gpuInfo = detectGPU();
  const highRefreshRate = supportsHighRefreshRate();

  return {
    type: deviceType,
    isTouchDevice: 'ontouchstart' in window,
    isLowPerformance: performanceScore < 40,
    performanceScore,
    screenSize: getScreenSize(),
    prefersReducedMotion: prefersReducedMotion(),
    connectionSpeed: getConnectionSpeed(),
    cores: navigator.hardwareConcurrency || 2,
    memory: (navigator as any).deviceMemory || 4,
    hasGPU: gpuInfo.hasGPU,
    gpuTier: gpuInfo.gpuTier,
    supportsHighRefreshRate: highRefreshRate,
  };
};

/**
 * Generates animation configuration based on device capabilities
 */
export const getAnimationConfig = (deviceInfo?: DeviceInfo): AnimationConfig => {
  const info = deviceInfo || getDeviceInfo();
  const { performanceScore, type, prefersReducedMotion: reducedMotion } = info;

  // Mobile: Only basic slide and component load animations
  if (type === 'mobile' || type === 'tablet') {
    return {
      enableParticles: true, // Enable for ALL phones
      enableCustomCursor: false,
      enableComplexAnimations: true, // Keep slide animations
      enableSmoothScroll: false,
      enableLoadingScreen: true,
      animationDuration: 0.6,
      particleCount: 6, // Low count for battery savings
      targetFPS: 60,
      useGPUAcceleration: true,
    };
  }

  // Desktop: High Performance (Gaming PC / MacBook Pro)
  if (performanceScore >= 80 && !reducedMotion) {
    return {
      enableParticles: true,
      enableCustomCursor: true,
      enableComplexAnimations: true,
      enableSmoothScroll: true,
      enableLoadingScreen: true,
      animationDuration: 1,
      particleCount: 25, // Richer particles
      targetFPS: info.supportsHighRefreshRate ? 120 : 60,
      useGPUAcceleration: info.hasGPU,
    };
  }

  // Desktop: Medium Performance (Office Laptop / MacBook Air)
  if (performanceScore >= 50 && !reducedMotion) {
    return {
      enableParticles: true,
      enableCustomCursor: true,
      enableComplexAnimations: true, // Keep the nice slides
      enableSmoothScroll: false, // Disable smooth scroll to save resources
      enableLoadingScreen: true,
      animationDuration: 0.8,
      particleCount: 12, // Moderate particles
      targetFPS: 60,
      useGPUAcceleration: info.hasGPU,
    };
  }

  // Desktop: Low Performance (Potato Laptop / Old Chromebook)
  // key change: Enable animations but limit COUNT and DURATION
  return {
    enableParticles: true, // KEEP particles!
    enableCustomCursor: false, // System cursor is smoother on laggy screens
    enableComplexAnimations: true, // KEEP slide animations!
    enableSmoothScroll: false,
    enableLoadingScreen: true,
    animationDuration: 0.6, // Fast transitions feel snappier on slow devices
    particleCount: 4, // Very few particles, but they exist!
    targetFPS: 60, // Try for 60
    useGPUAcceleration: true, // Force GPU usage to help CPU
  };
};

/**
 * Logs device information to console (for debugging)
 */
export const logDeviceInfo = (): void => {
  if (typeof window === 'undefined') return;

  const info = getDeviceInfo();
  const config = getAnimationConfig(info);

  console.group('🔍 Device Detection Info');
  console.log('Device Type:', info.type);
  console.log('Screen Size:', info.screenSize);
  console.log('Touch Device:', info.isTouchDevice);
  console.log('Performance Score:', info.performanceScore);
  console.log('Low Performance:', info.isLowPerformance);
  console.log('Prefers Reduced Motion:', info.prefersReducedMotion);
  console.log('Connection Speed:', info.connectionSpeed);
  console.log('CPU Cores:', info.cores);
  console.log('Memory (GB):', info.memory);
  console.log('🎮 GPU Available:', info.hasGPU);
  console.log('🎮 GPU Tier:', info.gpuTier);
  console.log('📱 High Refresh Rate (120Hz):', info.supportsHighRefreshRate);
  console.groupEnd();

  console.group('⚙️ Animation Configuration');
  console.log('Particles:', config.enableParticles);
  console.log('Custom Cursor:', config.enableCustomCursor);
  console.log('Complex Animations:', config.enableComplexAnimations);
  console.log('Smooth Scroll:', config.enableSmoothScroll);
  console.log('Loading Screen:', config.enableLoadingScreen);
  console.log('Animation Duration Multiplier:', config.animationDuration);
  console.log('Particle Count:', config.particleCount);
  console.log('🚀 Target FPS:', config.targetFPS);
  console.log('🎮 GPU Acceleration:', config.useGPUAcceleration);
  console.groupEnd();
};
