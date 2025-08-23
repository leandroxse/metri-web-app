"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { prefersReducedMotion } from "@/lib/utils/animation"

interface AnimatedContainerProps {
  children: ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  className?: string
}

export function AnimatedContainer({ 
  children, 
  delay = 0, 
  direction = "up", 
  className = "" 
}: AnimatedContainerProps) {
  const shouldReduce = prefersReducedMotion()

  const getInitialPosition = () => {
    if (shouldReduce) return {}
    
    switch (direction) {
      case "up":
        return { y: 30 }
      case "down":
        return { y: -30 }
      case "left":
        return { x: -30 }
      case "right":
        return { x: 30 }
      default:
        return { y: 30 }
    }
  }

  const getAnimatePosition = () => {
    if (shouldReduce) return {}
    
    switch (direction) {
      case "up":
      case "down":
        return { y: 0 }
      case "left":
      case "right":
        return { x: 0 }
      default:
        return { y: 0 }
    }
  }

  return (
    <motion.div
      initial={{ 
        opacity: 0,
        ...getInitialPosition()
      }}
      animate={{ 
        opacity: 1,
        ...getAnimatePosition()
      }}
      transition={{
        duration: shouldReduce ? 0.1 : 0.6,
        delay: shouldReduce ? 0 : delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}