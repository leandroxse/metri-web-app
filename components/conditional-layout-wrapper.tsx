"use client"

import { usePathname } from "next/navigation"
import type React from "react"
import { useSidebar } from "@/lib/contexts/sidebar-context"
import { cn } from "@/lib/utils"

export function ConditionalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isCollapsed } = useSidebar()

  // Rotas públicas (wizard) não têm padding lateral
  const isPublicRoute = pathname?.includes('/cardapio/')

  if (isPublicRoute) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div
      className={cn(
        "min-h-screen pb-20 md:pb-0 pt-safe-or-4 transition-all duration-300 ease-in-out",
        isCollapsed ? "md:pl-16" : "md:pl-64"
      )}
    >
      {children}
    </div>
  )
}
