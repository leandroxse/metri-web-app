"use client"

import { useOffline } from "@/hooks/use-offline"
import { Wifi, WifiOff } from "lucide-react"
import { useState, useEffect } from "react"

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOffline()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || (isOnline && !wasOffline)) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium text-center transition-colors ${
        isOnline ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            Conexão restaurada - Dados sincronizados
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            Você está offline - Alguns recursos podem estar limitados
          </>
        )}
      </div>
    </div>
  )
}
