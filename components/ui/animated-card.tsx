"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"

interface AnimatedCardProps {
  children: ReactNode
  index?: number
  className?: string
}

export function AnimatedCard({ children, index = 0, className = "" }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 20,
        scale: 0.95
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: {
          duration: 0.2,
          ease: "easeOut"
        }
      }}
      whileTap={{
        scale: 0.98,
        transition: {
          duration: 0.1
        }
      }}
      className="group"
    >
      <Card className={`transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 border-border/50 hover:border-border backdrop-blur-sm ${className}`}>
        {children}
      </Card>
    </motion.div>
  )
}