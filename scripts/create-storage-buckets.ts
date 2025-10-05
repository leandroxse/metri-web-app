/**
 * Script para criar os storage buckets necessários para o sistema DOCS
 *
 * Buckets criados:
 * - documents: Para PDFs e documentos gerais
 * - contract-templates: Para templates de contratos
 * - filled-contracts: Para contratos preenchidos e gerados
 *
 * Executar: npx tsx scripts/create-storage-buckets.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lrgaiiuoljgjasyrqjzk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODY3OSwiZXhwIjoyMDcxMjM0Njc5fQ.mf5tJtki9Hrn_GdjyB_XC0SVv7Pzr9i2UAOK5R8v95s'

const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKETS = [
  {
    id: 'documents',
    name: 'documents',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
  },
  {
    id: 'contract-templates',
    name: 'contract-templates',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['application/pdf']
  },
  {
    id: 'filled-contracts',
    name: 'filled-contracts',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['application/pdf']
  }
]

async function createStorageBuckets() {
  console.log('🗂️  Criando storage buckets no Supabase...\n')

  for (const bucket of BUCKETS) {
    console.log(`📦 Criando bucket: ${bucket.name}`)

    const { data, error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes
    })

    if (error) {
      // Bucket já existe?
      if (error.message.includes('already exists')) {
        console.log(`   ⚠️  Bucket "${bucket.name}" já existe - pulando`)
      } else {
        console.error(`   ❌ Erro ao criar bucket "${bucket.name}":`, error.message)
      }
    } else {
      console.log(`   ✅ Bucket "${bucket.name}" criado com sucesso!`)
    }
  }

  console.log('\n🎉 Processo concluído!')
  console.log('\n📋 Próximos passos:')
  console.log('   1. Execute: npx tsx scripts/seed-contract-template.ts')
  console.log('   2. Isso fará upload do template de contrato e criará o registro inicial')
}

createStorageBuckets().catch(console.error)
