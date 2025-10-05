/**
 * Sistema de Notificações Push para PWA
 * Envia notificações quando convidados finalizam seleção de cardápio
 */

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

/**
 * Solicita permissão para enviar notificações
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

/**
 * Envia notificação local (não requer servidor)
 * Perfeito para notificar sobre seleções de cardápio
 */
export async function sendLocalNotification(options: NotificationOptions): Promise<void> {
  console.log('🔔 [NOTIFICAÇÃO] Tentando enviar notificação:', options.title)

  // Verificar se notificações estão disponíveis
  if (!('Notification' in window)) {
    console.error('❌ [NOTIFICAÇÃO] Notificações não suportadas neste navegador')
    return
  }

  // Verificar permissão
  console.log('📋 [NOTIFICAÇÃO] Permissão atual:', Notification.permission)
  if (Notification.permission !== 'granted') {
    console.error('❌ [NOTIFICAÇÃO] Permissão não concedida')
    return
  }

  // Tentar usar Service Worker primeiro (essencial para PWA Android)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      console.log('🔧 [NOTIFICAÇÃO] Service Worker pronto')

      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        badge: options.badge || '/icon-192.png',
        tag: options.tag || 'menu-selection',
        data: options.data,
        vibrate: [200, 100, 200],
        requireInteraction: false,
        silent: false,
      })

      console.log('✅ [NOTIFICAÇÃO] Notificação enviada via Service Worker!')
      return
    } catch (error) {
      console.warn('⚠️ [NOTIFICAÇÃO] Erro ao enviar via SW, tentando fallback:', error)
    }
  }

  // Fallback: notificação simples (pode não funcionar em PWA Android)
  console.log('🔄 [NOTIFICAÇÃO] Usando notificação simples (fallback)...')
  try {
    new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
      tag: options.tag || 'menu-selection',
      data: options.data,
    })
    console.log('✅ [NOTIFICAÇÃO] Notificação simples enviada!')
  } catch (error) {
    console.error('❌ [NOTIFICAÇÃO] Erro ao enviar notificação:', error)
  }
}

/**
 * Envia notificação quando convidado finaliza seleção de cardápio
 */
export async function notifyMenuSelectionCompleted(
  eventTitle: string,
  guestName?: string,
  itemCount?: number
): Promise<void> {
  const title = '🍽️ Nova Seleção de Cardápio!'

  let body = `Seleção finalizada para: ${eventTitle}`
  if (guestName) {
    body = `${guestName} finalizou a seleção para: ${eventTitle}`
  }
  if (itemCount) {
    body += ` (${itemCount} itens selecionados)`
  }

  await sendLocalNotification({
    title,
    body,
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: `menu-${Date.now()}`, // Tag única para cada seleção
    data: {
      type: 'menu-selection',
      eventTitle,
      guestName,
      itemCount,
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Verifica se o dispositivo suporta notificações
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator
}

/**
 * Retorna o status atual da permissão de notificação
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!('Notification' in window)) {
    return null
  }
  return Notification.permission
}
