/**
 * Custom hook for adaptive Framer Motion animation variants
 * Automatically adjusts animation properties based on device performance
 */

import { useAnimationConfig } from '@/contexts/PerformanceContext';
import { Variants, Transition } from 'framer-motion';

export const useAdaptiveAnimation = () => {
  const config = useAnimationConfig();

  /**
   * Adjusts transition duration based on device performance
   */
  const adjustTransition = (transition?: Transition): Transition => {
    if (!transition) {
      return { duration: 0.5 * config.animationDuration };
    }

    return {
      ...transition,
      duration: transition.duration
        ? transition.duration * config.animationDuration
        : 0.5 * config.animationDuration,
      delay: transition.delay
        ? transition.delay * config.animationDuration
        : undefined,
    };
  };

  /**
   * Adjusts animation variants based on device performance
   */
  const adjustVariants = (variants: Variants): Variants => {
    const adjusted: Variants = {};

    Object.keys(variants).forEach((key) => {
      const variant = variants[key];
      if (typeof variant === 'object' && variant !== null) {
        adjusted[key] = {
          ...variant,
          transition: variant.transition
            ? adjustTransition(variant.transition)
            : undefined,
        };
      } else {
        adjusted[key] = variant;
      }
    });

    return adjusted;
  };

  /**
   * Common fade-in animation (adaptive)
   */
  const fadeIn = (delay = 0): Variants => ({
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: adjustTransition({ duration: 0.6, delay }),
    },
  });

  /**
   * Common slide-up animation (adaptive)
   */
  const slideUp = (delay = 0, distance = 30): Variants => {
    if (!config.enableComplexAnimations) {
      // Simple fade for low-performance devices
      return fadeIn(delay);
    }

    return {
      initial: { opacity: 0, y: distance },
      animate: {
        opacity: 1,
        y: 0,
        transition: adjustTransition({ duration: 0.6, delay }),
      },
    };
  };

  /**
   * Common scale animation (adaptive)
   */
  const scale = (delay = 0): Variants => {
    if (!config.enableComplexAnimations) {
      return fadeIn(delay);
    }

    return {
      initial: { opacity: 0, scale: 0.95 },
      animate: {
        opacity: 1,
        scale: 1,
        transition: adjustTransition({ duration: 0.5, delay }),
      },
    };
  };

  /**
   * Stagger children animation (adaptive)
   */
  const staggerChildren = (staggerDelay = 0.1): Transition => {
    return adjustTransition({
      staggerChildren: staggerDelay,
    });
  };

  /**
   * Hover animation (adaptive or disabled)
   */
  const hover = (scaleAmount = 1.05): any => {
    if (!config.enableComplexAnimations) {
      return {}; // No hover effect on low-performance devices
    }

    return {
      scale: scaleAmount,
      transition: adjustTransition({ duration: 0.2 }),
    };
  };

  /**
   * Tap animation (adaptive or disabled)
   */
  const tap = (scaleAmount = 0.95): any => {
    if (!config.enableComplexAnimations) {
      return {};
    }

    return {
      scale: scaleAmount,
      transition: adjustTransition({ duration: 0.1 }),
    };
  };

  return {
    config,
    adjustTransition,
    adjustVariants,
    fadeIn,
    slideUp,
    scale,
    staggerChildren,
    hover,
    tap,
  };
};
