/**
 * @fileoverview Script para criar todos os templates de orçamento no Supabase
 * @module scripts/seed-all-budget-templates
 *
 * COMO USAR:
 * 1. Certifique-se de que todos os PDFs estão na raiz do projeto
 * 2. Execute: npx tsx scripts/seed-all-budget-templates.ts
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

/**
 * Templates de orçamento disponíveis
 * Todos usam os mesmos campos, apenas o PDF é diferente
 */
const templates = [
  {
    filename: 'orçamento1.pdf',
    storageName: 'orcamento-prime-001.pdf',
    name: 'Cardápio Prime 001',
    description: 'Template padrão de orçamento - Cardápio Prime 001'
  },
  {
    filename: 'CARDAPIO PRIME 002.pdf',
    storageName: 'orcamento-prime-002.pdf',
    name: 'Cardápio Prime 002',
    description: 'Template de orçamento - Cardápio Prime 002 (com bacalhau)'
  },
  {
    filename: 'acai.pdf',
    storageName: 'orcamento-acai.pdf',
    name: 'Açaí',
    description: 'Template de orçamento - Cardápio de Açaí'
  },
  {
    filename: 'ORÇAMENTO PRIME-COQUETEL-pontes tur congresso e eventos.pdf',
    storageName: 'orcamento-coquetel.pdf',
    name: 'Coquetel',
    description: 'Template de orçamento - Coquetel Prime'
  },
  {
    filename: 'MESA DE FRIOS PRIME 001.pdf',
    storageName: 'orcamento-mesa-frios.pdf',
    name: 'Mesa de Frios',
    description: 'Template de orçamento - Mesa de Frios Prime 001'
  }
]

/**
 * Schema de campos (todos os templates usam os mesmos campos)
 */
const fieldsSchema = {
  evento: 'text',
  data: 'text',
  cerimonialista: 'text',
  pessoas1: 'number',
  'preço2': 'number',
  pessoas2: 'number',
  preçotexto: 'number'
}

async function seedAllBudgetTemplates() {
  try {
    console.log('🚀 Iniciando seed de templates de orçamento...\n')

    for (const template of templates) {
      console.log(`📄 Processando: ${template.name}`)

      // STEP 1: Verificar se arquivo existe
      const pdfPath = path.join(process.cwd(), template.filename)
      if (!fs.existsSync(pdfPath)) {
        console.error(`❌ Arquivo ${template.filename} não encontrado na raiz do projeto!`)
        continue
      }
      console.log(`   ✅ Arquivo encontrado: ${template.filename}`)

      // STEP 2: Fazer upload do PDF para storage
      const pdfBuffer = fs.readFileSync(pdfPath)
      const filePath = `templates/${template.storageName}`

      console.log('   📤 Fazendo upload para storage...')

      // Deletar arquivo existente se houver
      const { data: existingFiles } = await supabase.storage
        .from('budget-templates')
        .list('templates')

      if (existingFiles?.some(file => file.name === template.storageName)) {
        console.log('   🗑️  Deletando template existente...')
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
        console.error(`   ❌ Erro ao fazer upload:`, uploadError)
        continue
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('budget-templates')
        .getPublicUrl(filePath)

      console.log(`   ✅ Upload concluído`)

      // STEP 3: Criar/Atualizar registro do template no banco
      console.log('   💾 Criando registro no banco...')

      // Verificar se já existe template com esse nome
      const { data: existingTemplates } = await supabase
        .from('budget_templates')
        .select('*')
        .eq('name', template.name)

      if (existingTemplates && existingTemplates.length > 0) {
        console.log('   🔄 Template já existe, atualizando...')
        const { error: updateError } = await supabase
          .from('budget_templates')
          .update({
            description: template.description,
            template_url: publicUrl,
            fields_schema: fieldsSchema,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTemplates[0].id)

        if (updateError) {
          console.error(`   ❌ Erro ao atualizar template:`, updateError)
          continue
        }
        console.log(`   ✅ Template atualizado!`)
      } else {
        console.log('   ➕ Criando novo template...')
        const { error: insertError } = await supabase
          .from('budget_templates')
          .insert([{
            name: template.name,
            description: template.description,
            template_url: publicUrl,
            fields_schema: fieldsSchema,
            is_active: true
          }])

        if (insertError) {
          console.error(`   ❌ Erro ao criar template:`, insertError)
          continue
        }
        console.log(`   ✅ Template criado!`)
      }

      console.log(`   🔗 URL: ${publicUrl}\n`)
    }

    console.log('🎉 Seed concluído com sucesso!')
    console.log(`📋 Total de templates processados: ${templates.length}`)

  } catch (error) {
    console.error('❌ Erro no seed:', error)
    process.exit(1)
  }
}

seedAllBudgetTemplates()
