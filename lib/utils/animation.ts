/**
 * Animation utilities for accessibility and performance
 */

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Animation variants that respect reduced motion preference
export const createAnimationVariants = (baseVariants: any) => {
  const shouldReduce = prefersReducedMotion()
  
  if (shouldReduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.1 }
    }
  }
  
  return baseVariants
}

// Stagger animation that respects reduced motion
export const createStaggerVariants = (staggerDelay = 0.1) => {
  const shouldReduce = prefersReducedMotion()
  
  return {
    animate: {
      transition: {
        staggerChildren: shouldReduce ? 0 : staggerDelay
      }
    }
  }
}

// Hover animations that respect reduced motion
export const createHoverVariants = (scale = 1.02, y = -6) => {
  const shouldReduce = prefersReducedMotion()
  
  if (shouldReduce) {
    return {}
  }
  
  return {
    y,
    scale,
    transition: { duration: 0.2, ease: "easeOut" }
  }
}