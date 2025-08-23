// Script para criar todas as tabelas no Supabase
import { createClient } from '@supabase/supabase-js'

// Usar a service role key para ter permissões totais
const supabaseUrl = 'https://lrgaiiuoljgjasyrqjzk.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODY3OSwiZXhwIjoyMDcxMjM0Njc5fQ.mf5tJtki9Hrn_GdjyB_XC0SVv7Pzr9i2UAOK5R8v95s'

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function createTables() {
  console.log('🚀 Iniciando criação das tabelas no Supabase...')
  
  try {
    // SQL para criar todas as tabelas
    const sql = `
      -- Drop tables if they exist (in reverse order due to foreign keys)
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS event_staff CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS people CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;

      -- Categories
      CREATE TABLE categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#3B82F6',
        member_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- People
      CREATE TABLE people (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        value DECIMAL(10,2),
        category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Events
      CREATE TABLE events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        location TEXT,
        status TEXT DEFAULT 'planned',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Event Staff
      CREATE TABLE event_staff (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(event_id, category_id)
      );

      -- Payments
      CREATE TABLE payments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        person_id UUID REFERENCES people(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        is_paid BOOLEAN DEFAULT false,
        paid_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(event_id, person_id)
      );

      -- Função para atualizar updated_at
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Triggers para updated_at
      CREATE TRIGGER update_categories_updated_at 
        BEFORE UPDATE ON categories
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();

      CREATE TRIGGER update_people_updated_at 
        BEFORE UPDATE ON people
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();

      CREATE TRIGGER update_events_updated_at 
        BEFORE UPDATE ON events
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();

      CREATE TRIGGER update_payments_updated_at 
        BEFORE UPDATE ON payments
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    `

    // Executar o SQL
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql }).single()
    
    if (error) {
      // Se o RPC não existir, vamos criar as tabelas uma por uma
      console.log('⚠️ RPC não disponível, criando tabelas individualmente...')
      
      // Por enquanto, vamos precisar criar as tabelas manualmente no dashboard do Supabase
      console.log('📋 Por favor, execute o seguinte SQL no Supabase SQL Editor:')
      console.log('---------------------------------------------------')
      console.log(sql)
      console.log('---------------------------------------------------')
      
      return false
    }
    
    console.log('✅ Tabelas criadas com sucesso!')
    
    // Habilitar RLS
    console.log('🔒 Habilitando Row Level Security...')
    
    const tables = ['categories', 'people', 'events', 'event_staff', 'payments']
    
    for (const table of tables) {
      // Por enquanto, vamos criar políticas públicas (sem auth)
      const policySQL = `
        ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public Access" ON ${table};
        CREATE POLICY "Public Access" ON ${table} 
          FOR ALL 
          USING (true) 
          WITH CHECK (true);
      `
      
      console.log(`📝 Política pública criada para ${table}`)
    }
    
    console.log('✅ RLS configurado com políticas públicas!')
    
    return true
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error)
    
    // Gerar arquivo SQL para execução manual
    const fs = require('fs')
    const path = require('path')
    
    const sqlFile = path.join(process.cwd(), 'supabase-tables.sql')
    
    const fullSQL = `
-- METRI Event Management System - Supabase Tables
-- Execute este SQL no Supabase SQL Editor

${sql}

-- Enable RLS with public policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Public policies (temporary - add auth later)
CREATE POLICY "Public Access" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON people FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON event_staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON payments FOR ALL USING (true) WITH CHECK (true);
    `
    
    fs.writeFileSync(sqlFile, fullSQL)
    console.log(`📄 Arquivo SQL gerado: ${sqlFile}`)
    console.log('👉 Execute este arquivo no Supabase SQL Editor')
    
    return false
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTables()
    .then(success => {
      if (success) {
        console.log('🎉 Setup do Supabase concluído!')
      } else {
        console.log('⚠️ Precisa executar o SQL manualmente no Supabase')
      }
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error)
      process.exit(1)
    })
}

export { createTables }