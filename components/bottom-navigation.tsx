// [ARQUIVO: bottom-navigation.tsx]
// Função: Navegação inferior com blur para layout mobile-first
// Interações: usado por layout.tsx
// Observação: Sistema de abas com efeito blur e ícones

"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Calendar, Users, Settings, Download, DollarSign, ChefHat, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function BottomNavigation() {
  const pathname = usePathname()
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as PWAInstallPrompt)
      setShowInstallButton(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  if (!mounted) {
    return null
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstallButton(false)
    }
    
    setDeferredPrompt(null)
  }

  const navItems = [
    {
      href: "/central",
      icon: Home,
      label: "Início",
      active: pathname === "/central"
    },
    {
      href: "/central/eventos",
      icon: Calendar,
      label: "Eventos",
      active: pathname === "/central/eventos"
    },
    {
      href: "/central/pagamentos",
      icon: DollarSign,
      label: "Pagamentos",
      active: pathname === "/central/pagamentos"
    },
    {
      href: "/central/cardapios",
      icon: ChefHat,
      label: "Cardápios",
      active: pathname === "/central/cardapios"
    },
    {
      href: "/central/docs",
      icon: FileText,
      label: "Docs",
      active: pathname.startsWith("/central/docs")
    },
    {
      href: "/central/configuracoes",
      icon: Settings,
      label: "Config",
      active: pathname === "/central/configuracoes"
    }
  ]

  return (
    <>
      {/* Botão de Instalação PWA */}
      {showInstallButton && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className="bg-primary/90 backdrop-blur-md rounded-lg p-3 shadow-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-primary-foreground" />
                <div>
                  <p className="text-sm font-medium text-primary-foreground">Instalar Metri</p>
                  <p className="text-xs text-primary-foreground/80">Adicione à tela inicial</p>
                </div>
              </div>
              <Button
                onClick={handleInstallClick}
                size="sm"
                variant="secondary"
                className="bg-background/20 hover:bg-background/30 text-primary-foreground border-primary-foreground/20"
              >
                Instalar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navegação Inferior - Apenas Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-border safe-bottom-nav">
        <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 px-1.5 rounded-lg transition-colors min-w-0 ${
                  item.active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-[10px] font-medium leading-tight truncate max-w-[48px]">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
