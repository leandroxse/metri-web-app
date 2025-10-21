/**
 * Script para atualizar o template de contrato no Supabase
 * Faz upload do contrato2.pdf e atualiza o registro do template
 *
 * Uso: npx tsx scripts/update-contract-template.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateContractTemplate() {
  console.log('🚀 Iniciando atualização do template de contrato...\n')

  try {
    // 1. Ler o arquivo contrato2.pdf
    const pdfPath = path.join(process.cwd(), 'contrato2.pdf')

    if (!fs.existsSync(pdfPath)) {
      throw new Error('❌ Arquivo contrato2.pdf não encontrado na raiz do projeto!')
    }

    const pdfBuffer = fs.readFileSync(pdfPath)
    console.log(`✅ Arquivo contrato2.pdf carregado (${(pdfBuffer.length / 1024).toFixed(2)} KB)\n`)

    // 2. Fazer upload para o bucket 'contract-templates'
    const fileName = `prime-buffet-template-v2.pdf`

    console.log('📤 Fazendo upload para Supabase Storage...')
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('contract-templates')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true // Sobrescrever se já existir
      })

    if (uploadError) {
      throw new Error(`Erro ao fazer upload: ${uploadError.message}`)
    }

    console.log(`✅ Upload concluído: ${fileName}\n`)

    // 3. Obter URL pública do template
    const { data: urlData } = supabase
      .storage
      .from('contract-templates')
      .getPublicUrl(fileName)

    const templateUrl = urlData.publicUrl
    console.log(`🔗 URL pública: ${templateUrl}\n`)

    // 4. Atualizar registro do template no banco
    console.log('💾 Atualizando registro do template no banco...')

    // Primeiro, buscar o template existente
    const { data: existingTemplates, error: fetchError } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('name', 'Contrato Prime Buffet')

    if (fetchError) {
      throw new Error(`Erro ao buscar templates: ${fetchError.message}`)
    }

    if (!existingTemplates || existingTemplates.length === 0) {
      console.log('⚠️  Nenhum template encontrado com o nome "Contrato Prime Buffet"')
      console.log('✅ Upload do PDF concluído com sucesso!')
      console.log(`🔗 URL: ${templateUrl}`)
      console.log('\n💡 Você pode atualizar manualmente o registro do template no Supabase.')
      return
    }

    const templateId = existingTemplates[0].id

    const { data: template, error: updateError } = await supabase
      .from('contract_templates')
      .update({
        template_url: templateUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Erro ao atualizar template: ${updateError.message}`)
    }

    console.log('✅ Template atualizado com sucesso!\n')
    console.log('📋 Detalhes:')
    console.log(`   - ID: ${template.id}`)
    console.log(`   - Nome: ${template.name}`)
    console.log(`   - URL: ${template.template_url}`)
    console.log(`   - Atualizado em: ${new Date(template.updated_at).toLocaleString('pt-BR')}`)
    console.log('\n✨ Pronto! O novo template já está disponível para uso.')

  } catch (error) {
    console.error('\n❌ Erro:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

updateContractTemplate()
