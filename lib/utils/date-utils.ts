/**
 * Utilitários para manipulação de datas no sistema
 *
 * IMPORTANTE: Sempre use parseEventDate() ao converter event.date para Date object
 * para evitar problemas de timezone.
 */

/**
 * Converte uma string de data YYYY-MM-DD para Date object de forma segura,
 * evitando problemas de timezone.
 *
 * Exemplo de problema:
 * - new Date("2025-10-10") → interpreta como UTC 00:00
 * - No Brasil (UTC-3) vira 2025-10-09T21:00 (dia 9!)
 *
 * Solução: Adicionar horário fixo (meio-dia) para garantir a data correta.
 *
 * @param dateString - String de data no formato YYYY-MM-DD
 * @returns Date object com a data correta, sempre ao meio-dia
 */
export function parseEventDate(dateString: string): Date {
  // Adicionar T12:00:00 para evitar problemas de timezone
  // Mesmo com ajuste de fuso horário, a data continuará correta
  return new Date(dateString + 'T12:00:00')
}

/**
 * Formata uma string de data YYYY-MM-DD para DD/MM/YYYY
 *
 * @param dateString - String de data no formato YYYY-MM-DD
 * @returns String formatada DD/MM/YYYY
 */
export function formatEventDate(dateString: string): string {
  const date = parseEventDate(dateString)
  return date.toLocaleDateString('pt-BR')
}

/**
 * Verifica se uma data está no passado (antes de hoje)
 *
 * @param dateString - String de data no formato YYYY-MM-DD
 * @returns true se a data está no passado
 */
export function isDateInPast(dateString: string): boolean {
  const eventDate = parseEventDate(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return eventDate < today
}

/**
 * Verifica se uma data é hoje
 *
 * @param dateString - String de data no formato YYYY-MM-DD
 * @returns true se a data é hoje
 */
export function isDateToday(dateString: string): boolean {
  const eventDate = parseEventDate(dateString)
  const today = new Date()
  return (
    eventDate.getDate() === today.getDate() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getFullYear() === today.getFullYear()
  )
}

/**
 * Formata uma data para o formato de orçamento com dia da semana
 *
 * Formato: "DD de MMMM de YYYY - dia_da_semana"
 * Exemplo: "01 de outubro de 2025 - quinta-feira"
 *
 * @param dateString - String de data no formato YYYY-MM-DD
 * @returns String formatada com dia da semana
 */
export function formatDateWithWeekday(dateString: string): string {
  const date = parseEventDate(dateString)

  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleDateString('pt-BR', { month: 'long' })
  const year = date.getFullYear()
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })

  return `${day} de ${month} de ${year} - ${weekday}`
}
