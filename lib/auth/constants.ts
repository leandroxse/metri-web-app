/**
 * Constantes de autenticação
 */

export const AUTH_COOKIE_NAME = 'metri_session'
export const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 dias em ms

// Rotas públicas que NÃO requerem autenticação
export const PUBLIC_ROUTES = [
  '/access',                              // Página de login
  '/eventos/[id]/cardapio/[token]',      // Cardápios públicos
]

// Rotas protegidas (tudo dentro de /central)
export const PROTECTED_PREFIX = '/central'

// Rota de autenticação
export const AUTH_ROUTE = '/access'

// Rota padrão após login
export const DEFAULT_REDIRECT = '/central'
