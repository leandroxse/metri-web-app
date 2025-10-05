"use client"

import { usePathname } from "next/navigation"
import type React from "react"

export function ConditionalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Rotas públicas (wizard) não têm padding lateral
  const isPublicRoute = pathname?.includes('/cardapio/')

  if (isPublicRoute) {
    return <div className="min-h-screen">{children}</div>
  }

  return <div className="min-h-screen pb-20 md:pb-0 pt-safe-or-4 md:pl-64">{children}</div>
}
