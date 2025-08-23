// 🎯 SISTEMA INTELIGENTE DE STATUS DE EVENTOS
// Aplica Navalha de Occam: Lógica simples e automática

import { Event } from '@/types/event'

/**
 * 📅 REGRAS AUTOMÁTICAS DE STATUS (KISS):
 * 
 * 1. Evento no futuro = "planejado" 
 * 2. Evento hoje = "em_progresso"
 * 3. Evento no passado = "finalizado" (se não cancelado)
 */

export function getAutoStatus(event: Event): Event['status'] {
  const eventDate = new Date(event.date + 'T12:00:00')
  const today = new Date()
  
  // Normalizar datas para comparação apenas por dia (ignorar hora)
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  // Se evento foi cancelado, manter cancelado
  if (event.status === 'cancelado') {
    return 'cancelado'
  }
  
  // Se já está finalizado manualmente, manter
  if (event.status === 'finalizado') {
    return 'finalizado'
  }
  
  // Aplicar lógica temporal automática apenas se necessário
  if (eventDay > todayDay) {
    return event.status === 'em_progresso' ? 'em_progresso' : 'planejado'  // Futuro
  } else if (eventDay.getTime() === todayDay.getTime()) {
    return 'em_progresso'  // Hoje
  } else {
    // Passado - deve ser finalizado automaticamente
    return 'finalizado'
  }
}

/**
 * 🕐 Verifica se evento deveria ser finalizado automaticamente
 */
export function shouldAutoFinalize(event: Event): boolean {
  if (event.status === 'finalizado' || event.status === 'cancelado') {
    return false // Já está finalizado ou cancelado
  }
  
  const eventDate = new Date(event.date + 'T12:00:00')
  const today = new Date()
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  return eventDay < todayDay // Evento é de dias anteriores
}

/**
 * 🔄 FILTROS PARA DIFERENTES CONTEXTOS
 */

// Para aba de pagamentos - eventos ativos
export function isRelevantForPayments(event: Event): boolean {
  return event.status !== 'cancelado' && event.status !== 'finalizado'
}

// Para histórico de pagamentos - eventos finalizados
export function isRelevantForPaymentHistory(event: Event): boolean {
  return event.status === 'finalizado' || event.status === 'cancelado'
}

// Para aba de eventos - eventos ativos (padrão)
export function isActiveEvent(event: Event): boolean {
  const eventDate = new Date(event.date + 'T12:00:00')
  const today = new Date()
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  // Mostrar eventos de hoje e futuros que não estão cancelados/finalizados
  return (eventDay >= todayDay) && (event.status !== 'cancelado' && event.status !== 'finalizado')
}

// Para histórico de eventos
export function isHistoryEvent(event: Event): boolean {
  const eventDate = new Date(event.date + 'T12:00:00')
  const today = new Date()
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  // Eventos do passado OU finalizados/cancelados
  return (eventDay < todayDay) || (event.status === 'finalizado' || event.status === 'cancelado')
}

/**
 * 🎨 STATUS VISUAL
 */
export function getStatusDisplay(status: Event['status']) {
  const displays = {
    'planejado': { emoji: '🔄', text: 'Planejado', color: 'blue' },
    'planned': { emoji: '🔄', text: 'Planejado', color: 'blue' },
    'em_progresso': { emoji: '▶️', text: 'Em Progresso', color: 'green' },
    'finalizado': { emoji: '✅', text: 'Finalizado', color: 'gray' },
    'cancelado': { emoji: '❌', text: 'Cancelado', color: 'red' }
  }
  
  return displays[status] || displays['planejado']
}

/**
 * 📊 ATUALIZAR STATUS AUTOMATICAMENTE
 * Aplica as regras automáticas a um array de eventos
 */
export function updateEventsStatus(events: Event[]): Event[] {
  return events.map(event => ({
    ...event,
    status: getAutoStatus(event)
  }))
}