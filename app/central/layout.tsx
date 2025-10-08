import type React from "react"
import { SidebarProvider } from "@/lib/contexts/sidebar-context"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ConditionalSidebar } from "@/components/conditional-sidebar"
import { ConditionalNav } from "@/components/conditional-nav"
import { ConditionalMain } from "@/components/conditional-main"
import { ConditionalLayoutWrapper } from "@/components/conditional-layout-wrapper"

/**
 * Layout específico do painel /central
 * PATTERN: Contém toda navegação (Sidebar, BottomNav)
 */
export default function CentralLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <ConditionalSidebar />
      <ConditionalLayoutWrapper>
        <ConditionalNav />
        <ConditionalMain>
          {children}
        </ConditionalMain>
        <BottomNavigation />
      </ConditionalLayoutWrapper>
    </SidebarProvider>
  )
}
