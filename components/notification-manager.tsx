"use client"

import { useEffect, useState } from "react"
import { requestNotificationPermission, isNotificationSupported, getNotificationPermission } from "@/lib/utils/notifications"

/**
 * Componente que gerencia permissões de notificação
 * Solicita permissão automaticamente quando o PWA é instalado/aberto
 */
export function NotificationManager() {
  const [hasAskedPermission, setHasAskedPermission] = useState(false)
  const [swReady, setSwReady] = useState(false)

  // Garantir que Service Worker está ativo e controlando a página
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const ensureServiceWorkerControl = async () => {
      try {
        // Esperar SW estar pronto
        const registration = await navigator.serviceWorker.ready
        console.log('🔧 [SW] Service Worker registrado e pronto!')

        // Verificar se há controller
        if (!navigator.serviceWorker.controller) {
          console.log('⚠️ [SW] Sem controller - registrando novamente...')

          // Registrar SW se não estiver registrado
          const reg = await navigator.serviceWorker.register('/sw.js')

          // Aguardar instalação
          if (reg.installing) {
            console.log('📥 [SW] Instalando...')
            await new Promise((resolve) => {
              reg.installing!.addEventListener('statechange', (e) => {
                if ((e.target as ServiceWorker).state === 'activated') {
                  console.log('✅ [SW] Ativado!')
                  resolve(true)
                }
              })
            })
          }

          // Forçar reload para que o SW tome controle
          console.log('🔄 [SW] Recarregando página para ativar controller...')
          window.location.reload()
          return
        }

        console.log('✅ [SW] Controller ativo!')
        setSwReady(true)
      } catch (error) {
        console.error('❌ [SW] Erro ao garantir controle:', error)
      }
    }

    ensureServiceWorkerControl()
  }, [])

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === 'undefined') return

    // Aguardar SW estar pronto
    if (!swReady) return

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
  }, [hasAskedPermission, swReady])

  // Este componente não renderiza nada visualmente
  return null
}
