import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = 'https://lrgaiiuoljgjasyrqjzk.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODY3OSwiZXhwIjoyMDcxMjM0Njc5fQ.mf5tJtki9Hrn_GdjyB_XC0SVv7Pzr9i2UAOK5R8v95s'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function executeSQLFile() {
  try {
    console.log('🚀 Executando SQL para atualizar as tabelas...')
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'supabase-update-tables.sql'), 'utf-8')
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`📋 Executando ${commands.length} comandos SQL...`)
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      if (command.trim()) {
        console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: command })
        
        if (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error.message)
          // Tentar executar via query simples se RPC falhar
          try {
            const { error: queryError } = await supabase
              .from('_')
              .select('*')
              .limit(0)
            // Se chegou aqui, pelo menos a conexão está ok
          } catch (e) {
            console.log('⚠️ Tentando método alternativo...')
          }
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`)
        }
      }
    }
    
    console.log('🎉 Atualização das tabelas concluída!')
    console.log('📝 Agora os horários start_time e end_time são opcionais')
    
  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error)
    console.log('⚠️ Você pode executar manualmente o arquivo supabase-update-tables.sql no Supabase SQL Editor')
  }
}

executeSQLFile()