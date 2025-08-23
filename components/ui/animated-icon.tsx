"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedIconProps {
  children: ReactNode
  variant?: "pulse" | "bounce" | "rotate" | "scale" | "wobble"
  className?: string
}

const iconVariants = {
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  bounce: {
    y: [0, -4, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  rotate: {
    rotate: 360,
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  },
  scale: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  wobble: {
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: 0.8,
      ease: "easeInOut"
    }
  }
}

export function AnimatedIcon({ 
  children, 
  variant = "scale", 
  className = "" 
}: AnimatedIconProps) {
  return (
    <motion.div
      className={`inline-flex ${className}`}
      whileHover={variant === "rotate" ? iconVariants.rotate : iconVariants[variant]}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {children}
    </motion.div>
  )
}