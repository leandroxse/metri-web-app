"use client"

import { useEffect, useState } from "react"

/**
 * Hook para gerenciar modo fullscreen
 * Auto-ativa fullscreen no primeiro clique/toque (apenas em navegador, não PWA)
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    // Detectar se está em modo PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  window.matchMedia('(display-mode: fullscreen)').matches ||
                  (window.navigator as any).standalone === true

    // Só ativar auto-fullscreen se NÃO for PWA
    if (isPWA) {
      console.log('📱 Modo PWA detectado - fullscreen automático desativado')
      return
    }

    // Handler para ativar fullscreen no primeiro toque/clique
    const triggerFullscreen = async () => {
      if (hasTriggered) return

      try {
        // Tentar entrar em fullscreen
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen({
            navigationUI: "hide" // Esconde UI de navegação se possível
          })
          setIsFullscreen(true)
          setHasTriggered(true)
          console.log('✅ Fullscreen ativado')
        }
      } catch (error) {
        console.warn('⚠️ Fullscreen não suportado ou bloqueado:', error)
        setHasTriggered(true) // Não tentar novamente
      }
    }

    // Listener para mudanças no estado de fullscreen
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    // Adicionar listeners
    document.addEventListener('click', triggerFullscreen, { once: true })
    document.addEventListener('touchstart', triggerFullscreen, { once: true })
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    // Cleanup
    return () => {
      document.removeEventListener('click', triggerFullscreen)
      document.removeEventListener('touchstart', triggerFullscreen)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [hasTriggered])

  // Função para sair do fullscreen manualmente
  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }

  // Função para entrar em fullscreen manualmente
  const enterFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen({
        navigationUI: "hide"
      })
    }
  }

  return {
    isFullscreen,
    exitFullscreen,
    enterFullscreen,
  }
}
