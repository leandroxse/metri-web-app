/**
 * Script para atualizar apenas o template Cardápio Prime 001
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

async function updatePrime001() {
  try {
    console.log('🚀 Atualizando Cardápio Prime 001...\n')

    // Arquivo PDF
    const pdfPath = path.join(process.cwd(), 'pdf/CARDAPIO PRIME 001.pdf')
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ Arquivo não encontrado: pdf/CARDAPIO PRIME 001.pdf')
      process.exit(1)
    }

    const pdfBuffer = fs.readFileSync(pdfPath)
    const filePath = 'templates/orcamento-prime-001.pdf'

    // Deletar e fazer upload
    await supabase.storage.from('budget-templates').remove([filePath])

    const { error: uploadError } = await supabase.storage
      .from('budget-templates')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError)
      process.exit(1)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('budget-templates')
      .getPublicUrl(filePath)

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from('budget_templates')
      .update({
        template_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('name', 'Cardápio Prime 001')

    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError)
      process.exit(1)
    }

    console.log('✅ Cardápio Prime 001 atualizado com sucesso!')
    console.log('🔗 URL:', publicUrl)

  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }
}

updatePrime001()
