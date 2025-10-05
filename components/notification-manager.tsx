"use client"

import { useEffect, useState } from "react"
import { requestNotificationPermission, isNotificationSupported, getNotificationPermission } from "@/lib/utils/notifications"

/**
 * Componente que gerencia permissões de notificação
 * Solicita permissão automaticamente quando o PWA é instalado/aberto
 */
export function NotificationManager() {
  const [hasAskedPermission, setHasAskedPermission] = useState(false)

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === 'undefined') return

    // Verificar se já pediu permissão nesta sessão
    if (hasAskedPermission) return

    // Verificar se navegador suporta notificações
    if (!isNotificationSupported()) {
      console.log('Notificações não suportadas neste navegador')
      return
    }

    // Verificar se está rodando como PWA (standalone mode)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true

    // Solicitar permissão após 2 segundos (melhor UX)
    const timer = setTimeout(async () => {
      const currentPermission = getNotificationPermission()

      // Só pedir se ainda não foi decidido
      if (currentPermission === 'default') {
        console.log('📲 Solicitando permissão de notificação...')
        const granted = await requestNotificationPermission()

        if (granted) {
          console.log('✅ Permissão de notificação concedida!')
        } else {
          console.log('❌ Permissão de notificação negada')
        }

        setHasAskedPermission(true)
      } else if (currentPermission === 'granted') {
        console.log('✅ Permissão de notificação já concedida')
        setHasAskedPermission(true)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [hasAskedPermission])

  // Este componente não renderiza nada visualmente
  return null
}
