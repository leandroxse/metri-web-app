'use server'

import { cookies } from 'next/headers'
import { verifyPassword, generateSessionToken } from '@/lib/auth/session'
import { AUTH_COOKIE_NAME, SESSION_DURATION } from '@/lib/auth/constants'

/**
 * Server Action para autenticação
 * PATTERN: Validar senha, criar cookie de sessão
 */
export async function authenticate(password: string): Promise<{ success: boolean }> {
  try {
    // CRITICAL: Obter hash da senha da env var
    const correctPasswordHash = process.env.APP_PASSWORD_HASH

    if (!correctPasswordHash) {
      console.error('APP_PASSWORD_HASH not configured')
      return { success: false }
    }

    // Verificar senha
    const isValid = await verifyPassword(password, correctPasswordHash)

    if (!isValid) {
      return { success: false }
    }

    // Gerar token de sessão
    const sessionToken = generateSessionToken()

    // CRITICAL: Criar cookie com configurações seguras
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,                    // Previne XSS
      secure: process.env.NODE_ENV === 'production', // HTTPS only em prod
      sameSite: 'lax',                   // Previne CSRF
      maxAge: SESSION_DURATION / 1000,   // 7 dias em segundos
      path: '/',                         // Disponível em todas rotas
    })

    return { success: true }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false }
  }
}

/**
 * Server Action para logout
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}
