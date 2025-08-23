"use client"

import { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

interface AnimatedNumberProps {
  value: number
  duration?: number
  precision?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedNumber({ 
  value, 
  duration = 1,
  precision = 0,
  prefix = "",
  suffix = "",
  className = ""
}: AnimatedNumberProps) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const spring = useSpring(0, { 
    duration: duration * 1000,
    bounce: 0,
    damping: 30,
    stiffness: 100
  })
  
  const display = useTransform(spring, (current) => 
    prefix + Math.round(current * Math.pow(10, precision)) / Math.pow(10, precision) + suffix
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAnimated) {
        spring.set(value)
        setHasAnimated(true)
      } else {
        spring.set(value)
      }
    }, 100) // Small delay for better UX

    return () => clearTimeout(timer)
  }, [value, spring, hasAnimated])

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {display}
    </motion.span>
  )
}