"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"

export function ConditionalSidebar() {
  const pathname = usePathname()

  // Não mostrar sidebar em rotas públicas (wizard de cardápio)
  const isPublicRoute = pathname?.includes('/cardapio/')

  if (isPublicRoute) {
    return null
  }

  return <Sidebar />
}
