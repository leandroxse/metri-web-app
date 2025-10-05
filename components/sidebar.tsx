// Sidebar colapsável para tablet/desktop
// Mobile mantém bottom navigation

"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Calendar, Settings, DollarSign, ChefHat, FileText, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/lib/contexts/sidebar-context"
import { Button } from "./ui/button"

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar } = useSidebar()

  const navItems = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/eventos", icon: Calendar, label: "Eventos" },
    { href: "/pagamentos", icon: DollarSign, label: "Pagamentos" },
    { href: "/cardapios", icon: ChefHat, label: "Cardápios" },
    { href: "/docs", icon: FileText, label: "Docs" },
    { href: "/configuracoes", icon: Settings, label: "Configurações" }
  ]

  return (
    <aside
      className={cn(
        "hidden md:flex fixed left-0 top-0 bottom-0 bg-background border-r border-border flex-col z-40 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "border-b border-border flex items-center justify-between transition-all duration-300",
        isCollapsed ? "p-3" : "p-6"
      )}>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent whitespace-nowrap">
              METRI
            </h2>
            <p className="text-sm text-muted-foreground mt-1 whitespace-nowrap">Prime Buffet</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "flex-shrink-0",
            isCollapsed && "mx-auto"
          )}
          title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-1 overflow-y-auto transition-all duration-300",
        isCollapsed ? "p-2" : "p-4"
      )}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg transition-all duration-200",
                "hover:bg-muted/50",
                isCollapsed ? "gap-0 px-3 py-3 justify-center" : "gap-3 px-4 py-3",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            v1.0.0 • 2025
          </p>
        </div>
      )}
    </aside>
  )
}
