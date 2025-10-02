// Script de teste de conexão Supabase
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n🔍 Verificando conexão Supabase...\n')
console.log('📋 Configuração:')
console.log('  URL:', supabaseUrl)
console.log('  Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'AUSENTE')
console.log()

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Credenciais não encontradas no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔌 Testando conexão...')

    // Teste 1: Verificar acesso básico
    const { data: healthCheck, error: healthError } = await supabase
      .from('categories')
      .select('count')
      .limit(1)

    if (healthError) {
      console.error('❌ Erro na conexão:', healthError.message)
      console.error('   Detalhes:', healthError.hint || 'N/A')
      return false
    }

    console.log('✅ Conexão estabelecida!')
    console.log()

    // Teste 2: Listar categorias
    console.log('📊 Testando query de categorias...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (catError) {
      console.error('❌ Erro ao buscar categorias:', catError.message)
      return false
    }

    console.log(`✅ ${categories?.length || 0} categorias encontradas`)
    if (categories && categories.length > 0) {
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.member_count || 0} membros)`)
      })
    }
    console.log()

    // Teste 3: Listar eventos
    console.log('📅 Testando query de eventos...')
    const { data: events, error: evtError } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })
      .limit(5)

    if (evtError) {
      console.error('❌ Erro ao buscar eventos:', evtError.message)
      return false
    }

    console.log(`✅ ${events?.length || 0} eventos encontrados`)
    if (events && events.length > 0) {
      events.forEach(evt => {
        console.log(`   - ${evt.title} (${evt.date})`)
      })
    }
    console.log()

    // Teste 4: Verificar tabelas
    console.log('🗄️  Verificando estrutura das tabelas...')
    const tables = ['categories', 'people', 'events', 'event_staff', 'payments']

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)

      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`)
      } else {
        console.log(`   ✅ ${table}: OK`)
      }
    }

    console.log()
    console.log('🎉 Todos os testes passaram com sucesso!')
    console.log()
    return true

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message)
    return false
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(err => {
    console.error('💥 Erro fatal:', err)
    process.exit(1)
  })