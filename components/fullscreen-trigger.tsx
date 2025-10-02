"use client"

import { useFullscreen } from "@/hooks/use-fullscreen"

/**
 * Componente que ativa fullscreen automaticamente no navegador (não PWA)
 * Ativa no primeiro toque/clique do usuário
 */
export function FullscreenTrigger() {
  useFullscreen()

  // Componente invisível, apenas para executar o hook
  return null
}
