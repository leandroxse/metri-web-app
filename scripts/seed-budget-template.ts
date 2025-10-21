/**
 * @fileoverview Script para criar template de orçamento no Supabase
 * @module scripts/seed-budget-template
 *
 * COMO USAR:
 * 1. Certifique-se de que o arquivo orçamento1.pdf está na raiz do projeto
 * 2. Execute: npx tsx scripts/seed-budget-template.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedBudgetTemplate() {
  try {
    console.log('🚀 Iniciando seed de template de orçamento...\n')

    // STEP 1: Verificar se arquivo existe
    const pdfPath = path.join(process.cwd(), 'orçamento1.pdf')
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ Arquivo orçamento1.pdf não encontrado na raiz do projeto!')
      process.exit(1)
    }
    console.log('✅ Arquivo orçamento1.pdf encontrado')

    // STEP 2: Fazer upload do PDF para storage
    const pdfBuffer = fs.readFileSync(pdfPath)
    const fileName = 'orcamento-template-prime.pdf'
    const filePath = `templates/${fileName}`

    console.log('📤 Fazendo upload do template para storage...')

    // Deletar arquivo existente se houver
    const { data: existingFiles } = await supabase.storage
      .from('budget-templates')
      .list('templates')

    if (existingFiles?.some(file => file.name === fileName)) {
      console.log('🗑️  Deletando template existente...')
      await supabase.storage
        .from('budget-templates')
        .remove([filePath])
    }

    // Upload do novo template
    const { error: uploadError } = await supabase.storage
      .from('budget-templates')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Erro ao fazer upload:', uploadError)
      process.exit(1)
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('budget-templates')
      .getPublicUrl(filePath)

    console.log('✅ Upload concluído:', publicUrl)

    // STEP 3: Criar registro do template no banco
    console.log('💾 Criando registro do template no banco...')

    // Verificar se já existe template
    const { data: existingTemplates } = await supabase
      .from('budget_templates')
      .select('*')
      .eq('name', 'Orçamento Prime Buffet')

    if (existingTemplates && existingTemplates.length > 0) {
      console.log('🔄 Template já existe, atualizando...')
      const { error: updateError } = await supabase
        .from('budget_templates')
        .update({
          template_url: publicUrl,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTemplates[0].id)

      if (updateError) {
        console.error('❌ Erro ao atualizar template:', updateError)
        process.exit(1)
      }
      console.log('✅ Template atualizado com sucesso!')
    } else {
      console.log('➕ Criando novo template...')
      const { error: insertError } = await supabase
        .from('budget_templates')
        .insert([{
          name: 'Orçamento Prime Buffet',
          description: 'Template padrão de orçamento do Prime Buffet',
          template_url: publicUrl,
          fields_schema: {
            evento: 'text',
            data: 'text',
            cerimonialista: 'text',
            pessoas1: 'number',
            'preço2': 'number',
            pessoas2: 'number',
            preçotexto: 'number'
          },
          is_active: true
        }])

      if (insertError) {
        console.error('❌ Erro ao criar template:', insertError)
        process.exit(1)
      }
      console.log('✅ Template criado com sucesso!')
    }

    console.log('\n🎉 Seed concluído com sucesso!')
    console.log('📋 Template: Orçamento Prime Buffet')
    console.log('🔗 URL:', publicUrl)

  } catch (error) {
    console.error('❌ Erro no seed:', error)
    process.exit(1)
  }
}

seedBudgetTemplate()
