// Sidebar moderna para tablet/desktop
// Mobile mantém bottom navigation

"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Calendar, Users, Settings, DollarSign, ChefHat, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/eventos", icon: Calendar, label: "Eventos" },
    { href: "/pagamentos", icon: DollarSign, label: "Pagamentos" },
    { href: "/cardapios", icon: ChefHat, label: "Cardápios" },
    { href: "/docs", icon: FileText, label: "Docs" },
    { href: "/configuracoes", icon: Settings, label: "Configurações" }
  ]

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border flex-col z-40">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          METRI
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Prime Buffet</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-muted/50",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          v1.0.0 • 2025
        </p>
      </div>
    </aside>
  )
}
