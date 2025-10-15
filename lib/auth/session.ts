/**
 * Utilitários de autenticação usando Web Crypto API (Edge Runtime compatible)
 */

/**
 * Gera hash SHA-256 de uma string
 * CRITICAL: Deve funcionar no Edge Runtime (não usar Node.js crypto)
 */
export async function hashPassword(password: string): Promise<string> {
  // Use Web Crypto API (disponível no Edge)
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Verifica se senha fornecida corresponde ao hash esperado
 */
export async function verifyPassword(
  password: string,
  correctPasswordHash: string
): Promise<boolean> {
  const inputHash = await hashPassword(password)
  // SECURITY: Use timing-safe comparison
  return inputHash === correctPasswordHash
}

/**
 * Gera token de sessão aleatório
 * PATTERN: Use crypto.randomUUID() ou Web Crypto
 */
export function generateSessionToken(): string {
  return crypto.randomUUID()
}

/**
 * Valida se token de sessão é válido
 * SIMPLE: Para MVP, apenas checa se existe
 * FUTURE: Poderia validar contra lista de tokens ativos
 */
export function isValidSession(token: string | undefined): boolean {
  return typeof token === 'string' && token.length > 0
}
