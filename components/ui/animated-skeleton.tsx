"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export function AnimatedSkeleton() {
  return (
    <Card className="overflow-hidden border-border/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-5 h-5 bg-gradient-to-r from-muted to-muted-foreground/20 rounded"
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="space-y-2 flex-1">
            <motion.div
              className="h-3 bg-gradient-to-r from-muted to-muted-foreground/20 rounded w-3/4"
              animate={{
                opacity: [0.4, 0.8, 0.4],
                x: [0, 2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
            />
            <motion.div
              className="h-6 bg-gradient-to-r from-muted to-muted-foreground/20 rounded w-1/2"
              animate={{
                opacity: [0.4, 0.8, 0.4],
                x: [0, -2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}