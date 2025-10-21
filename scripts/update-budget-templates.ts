/**
 * @fileoverview Script para atualizar templates específicos de orçamento
 * @module scripts/update-budget-templates
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const templatesToUpdate = [
  {
    filename: 'PDF/MESA DE FRIOS PRIME 001.pdf',
    storageName: 'orcamento-mesa-frios.pdf',
    name: 'Mesa de Frios'
  },
  {
    filename: 'PDF/acai.pdf',
    storageName: 'orcamento-acai.pdf',
    name: 'Açaí'
  },
  {
    filename: 'PDF/ORÇAMENTO PRIME-COQUETEL-pontes tur congresso e eventos.pdf',
    storageName: 'orcamento-coquetel.pdf',
    name: 'Coquetel'
  },
  {
    filename: 'PDF/CARDAPIO PRIME 002.pdf',
    storageName: 'orcamento-prime-002.pdf',
    name: 'Cardápio Prime 002'
  }
]

async function updateTemplates() {
  try {
    console.log('🚀 Atualizando templates de orçamento...\n')

    for (const template of templatesToUpdate) {
      console.log(`📄 Atualizando: ${template.name}`)

      // Verificar se arquivo existe
      const pdfPath = path.join(process.cwd(), template.filename)
      if (!fs.existsSync(pdfPath)) {
        console.error(`   ❌ Arquivo não encontrado: ${template.filename}`)
        continue
      }

      // Upload do PDF
      const pdfBuffer = fs.readFileSync(pdfPath)
      const filePath = `templates/${template.storageName}`

      // Deletar arquivo existente
      await supabase.storage.from('budget-templates').remove([filePath])

      // Upload do novo
      const { error: uploadError } = await supabase.storage
        .from('budget-templates')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error(`   ❌ Erro no upload:`, uploadError)
        continue
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('budget-templates')
        .getPublicUrl(filePath)

      // Atualizar registro no banco
      const { error: updateError } = await supabase
        .from('budget_templates')
        .update({
          template_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('name', template.name)

      if (updateError) {
        console.error(`   ❌ Erro ao atualizar banco:`, updateError)
        continue
      }

      console.log(`   ✅ Atualizado com sucesso!`)
    }

    console.log('\n🎉 Atualização concluída!')

  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }
}

updateTemplates()
