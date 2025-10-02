"use client"

import { usePathname } from "next/navigation"
import type React from "react"

export function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Rotas públicas não têm padding
  const isPublicRoute = pathname?.includes('/cardapio/')

  if (isPublicRoute) {
    return <main>{children}</main>
  }

  return <main className="px-4">{children}</main>
}
