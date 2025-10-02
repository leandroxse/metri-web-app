"use client"

import { usePathname } from "next/navigation"
import { BottomNavigation } from "./bottom-navigation"

export function ConditionalNav() {
  const pathname = usePathname()

  // Não mostrar navegação em rotas públicas (wizard de cardápio)
  const isPublicRoute = pathname?.includes('/cardapio/')

  if (isPublicRoute) {
    return null
  }

  return <BottomNavigation />
}
