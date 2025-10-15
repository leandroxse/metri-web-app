/**
 * Script para gerar hash SHA-256 de senha
 *
 * Uso:
 *   node scripts/generate-password-hash.js SuaSenhaAqui
 *
 * O hash gerado deve ser adicionado ao .env.local como:
 *   APP_PASSWORD_HASH=<hash_gerado>
 */

async function generatePasswordHash(password) {
  if (!password) {
    console.error('❌ Erro: Forneça uma senha como argumento')
    console.log('\nUso: node scripts/generate-password-hash.js SuaSenhaAqui')
    process.exit(1)
  }

  // Usar Web Crypto API (compatível com código do middleware)
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  console.log('\n✅ Hash gerado com sucesso!')
  console.log('\n📋 Adicione ao seu .env.local:')
  console.log(`\nAPP_PASSWORD_HASH=${hashHex}\n`)
}

// Obter senha do argumento
const password = process.argv[2]
generatePasswordHash(password)
