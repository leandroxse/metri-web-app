import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, AUTH_ROUTE, PROTECTED_PREFIX, DEFAULT_REDIRECT } from '@/lib/auth/constants'
import { isValidSession } from '@/lib/auth/session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CRITICAL: Permitir assets estáticos sempre
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/cardapio/') ||  // Cardápios públicos
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/splash/')
  ) {
    return NextResponse.next()
  }

  // Obter token de sessão do cookie
  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const isAuthenticated = isValidSession(sessionToken)

  // Se está tentando acessar /access e já está autenticado → redirecionar para painel
  if (pathname === AUTH_ROUTE && isAuthenticated) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url))
  }

  // Se está tentando acessar rota protegida sem estar autenticado → redirecionar para /access
  if (pathname.startsWith(PROTECTED_PREFIX) && !isAuthenticated) {
    return NextResponse.redirect(new URL(AUTH_ROUTE, request.url))
  }

  // SECURITY: Bloquear qualquer rota que não seja / ou /access quando não autenticado
  // Permite apenas: /, /access, e rotas públicas já verificadas acima
  if (!isAuthenticated && pathname !== '/' && pathname !== AUTH_ROUTE) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Permitir acesso
  return NextResponse.next()
}

// CRITICAL: Matcher exclui assets estáticos para performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
