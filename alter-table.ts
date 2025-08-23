import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lrgaiiuoljgjasyrqjzk.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODY3OSwiZXhwIjoyMDcxMjM0Njc5fQ.mf5tJtki9Hrn_GdjyB_XC0SVv7Pzr9i2UAOK5R8v95s'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function alterTable() {
  try {
    console.log('🔧 Alterando tabela events para tornar horários opcionais...')
    
    // Usar fetch direto para a API REST do Supabase com SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        sql: `
          ALTER TABLE events 
          ALTER COLUMN start_time DROP NOT NULL,
          ALTER COLUMN end_time DROP NOT NULL;
        `
      })
    })
    
    if (response.ok) {
      console.log('✅ Tabela alterada com sucesso!')
      console.log('📝 Horários start_time e end_time agora são opcionais')
    } else {
      const errorText = await response.text()
      console.log('⚠️ Método direto falhou:', errorText)
      
      // Método alternativo - usar SQL via query
      console.log('🔄 Tentando método alternativo...')
      console.log('📋 Copie e cole este SQL no Supabase SQL Editor:')
      console.log(`
ALTER TABLE events 
ALTER COLUMN start_time DROP NOT NULL,
ALTER COLUMN end_time DROP NOT NULL;
      `)
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
    console.log('📋 Execute manualmente no Supabase SQL Editor:')
    console.log(`
ALTER TABLE events 
ALTER COLUMN start_time DROP NOT NULL,
ALTER COLUMN end_time DROP NOT NULL;
    `)
  }
}

alterTable()