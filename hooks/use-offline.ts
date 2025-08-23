"use client"

import { useState, useEffect } from "react"

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        // Trigger data refresh when coming back online
        window.location.reload()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    // Listen for online/offline events
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Listen for service worker messages
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === "BACKGROUND_SYNC_COMPLETE") {
        console.log("[App] Background sync completed")
      }
    }

    navigator.serviceWorker?.addEventListener("message", handleSWMessage)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      navigator.serviceWorker?.removeEventListener("message", handleSWMessage)
    }
  }, [wasOffline])

  const registerBackgroundSync = async () => {
    if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register("background-sync")
        console.log("[App] Background sync registered")
      } catch (error) {
        console.error("[App] Background sync registration failed:", error)
      }
    }
  }

  return {
    isOnline,
    wasOffline,
    registerBackgroundSync,
  }
}
