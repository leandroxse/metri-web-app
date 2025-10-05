/**
 * Script para fazer upload do template de contrato Prime Buffet
 *
 * IMPORTANTE: Antes de executar este script, você precisa:
 * 1. Criar os storage buckets no Supabase Dashboard:
 *    - documents (public)
 *    - contract-templates (public)
 *    - filled-contracts (public)
 *
 * Como criar buckets:
 * 1. Acesse o Supabase Dashboard (https://supabase.com/dashboard)
 * 2. Vá em Storage
 * 3. Clique em "New bucket"
 * 4. Nome: contract-templates
 * 5. Marque "Public bucket"
 * 6. Clique em "Create bucket"
 * 7. Repita para os buckets "documents" e "filled-contracts"
 *
 * Executar: npx tsx scripts/seed-contract-template.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = 'https://lrgaiiuoljgjasyrqjzk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODY3OSwiZXhwIjoyMDcxMjM0Njc5fQ.mf5tJtki9Hrn_GdjyB_XC0SVv7Pzr9i2UAOK5R8v95s'

const supabase = createClient(supabaseUrl, supabaseKey)

// Schema de campos do contrato Prime Buffet
// Nomes dos campos correspondem aos form fields criados no PDF (FormFields numéricos)
const PRIME_CONTRACT_FIELDS_SCHEMA = {
  // Dados do Contratante (campos numéricos)
  '1': { type: 'string', label: 'Nome do Contratante', required: true },
  '2': { type: 'string', label: 'CPF', required: true },
  '3': { type: 'string', label: 'Endereço', required: true },

  // Dados do Evento
  'dia': { type: 'string', label: 'Data do Evento', required: true },
  '4': { type: 'string', label: 'Horário Início', required: true },
  '5': { type: 'string', label: 'Horário Fim', required: true },
  'local': { type: 'string', label: 'Local do Evento', required: true },

  // Equipe (Cláusula 5)
  '6': { type: 'number', label: 'Garçons', required: false, default: 4 },
  '7': { type: 'number', label: 'Copeiros', required: false, default: 2 },
  '8': { type: 'number', label: 'Maître', required: false, default: 1 },

  // Valores
  '9': { type: 'number', label: 'Valor Total', required: true },
  '10': { type: 'string', label: 'Valor Total por Extenso', required: true },
  '11': { type: 'number', label: 'Sinal', required: true },
  '12': { type: 'number', label: 'Saldo', required: true },

  // Pagamento e Taxas
  '13': { type: 'number', label: 'Dias antes do evento para quitação', required: false, default: 7 },
  '14': { type: 'number', label: 'Número de Convidados Excedentes', required: false, default: 0 },
  '15': { type: 'number', label: 'Taxa de Atraso por Hora', required: false, default: 150.00 },
  'pix': { type: 'string', label: 'Chave PIX', required: false, default: '51.108.023/0001-55' },

  // Data de Assinatura (última folha)
  'dia_assinatura': { type: 'number', label: 'Dia da Assinatura', default: new Date().getDate() },
  'mes': { type: 'string', label: 'Mês da Assinatura (sem acento)', default: 'janeiro' }
}

async function seedContractTemplate() {
  console.log('📄 Iniciando seed do template de contrato Prime Buffet...\n')

  // 1. Verificar se o arquivo contrato2.pdf existe
  const contractPath = path.join(process.cwd(), 'contrato2.pdf')

  if (!fs.existsSync(contractPath)) {
    console.error('❌ Arquivo contrato2.pdf não encontrado na raiz do projeto!')
    console.log('   Certifique-se de que o arquivo contrato2.pdf está no diretório raiz.')
    return
  }

  console.log('✅ Arquivo contrato2.pdf encontrado')

  // 2. Ler o arquivo
  const contractFile = fs.readFileSync(contractPath)
  console.log(`📦 Tamanho do arquivo: ${(contractFile.length / 1024 / 1024).toFixed(2)} MB`)

  // 3. Fazer upload para o Supabase Storage
  console.log('\n📤 Fazendo upload para Supabase Storage...')

  const fileName = 'prime-buffet-template.pdf'
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('contract-templates')
    .upload(fileName, contractFile, {
      contentType: 'application/pdf',
      upsert: true // Substituir se já existir
    })

  if (uploadError) {
    console.error('❌ Erro ao fazer upload:', uploadError)
    if (uploadError.message.includes('not found')) {
      console.log('\n⚠️  O bucket "contract-templates" não existe!')
      console.log('   Por favor, crie os buckets manualmente no Supabase Dashboard:')
      console.log('   1. Acesse: https://supabase.com/dashboard/project/lrgaiiuoljgjasyrqjzk/storage/buckets')
      console.log('   2. Crie os buckets: contract-templates, documents, filled-contracts')
      console.log('   3. Marque todos como "Public bucket"')
    }
    return
  }

  console.log('✅ Upload realizado com sucesso!')

  // 4. Obter URL pública do arquivo
  const { data: urlData } = supabase.storage
    .from('contract-templates')
    .getPublicUrl(fileName)

  const templateUrl = urlData.publicUrl
  console.log(`🔗 URL do template: ${templateUrl}`)

  // 5. Criar registro na tabela contract_templates
  console.log('\n💾 Criando registro na tabela contract_templates...')

  const { data: template, error: templateError } = await supabase
    .from('contract_templates')
    .insert({
      name: 'Contrato Prime Buffet',
      description: 'Template padrão de contrato de prestação de serviços do Prime Buffet',
      template_url: templateUrl,
      fields_schema: PRIME_CONTRACT_FIELDS_SCHEMA,
      is_active: true
    })
    .select()
    .single()

  if (templateError) {
    console.error('❌ Erro ao criar template:', templateError)
    return
  }

  console.log('✅ Template criado com sucesso!')
  console.log(`   ID: ${template.id}`)
  console.log(`   Nome: ${template.name}`)
  console.log(`   Campos: ${Object.keys(PRIME_CONTRACT_FIELDS_SCHEMA).length}`)

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📋 Próximos passos:')
  console.log('   1. Acesse /docs/contratos/novo para criar um contrato')
  console.log('   2. Preencha os campos e gere o PDF')
  console.log('   3. Ajuste as posições dos campos no arquivo types/contract.ts (FIELD_POSITIONS)')
  console.log('   4. Teste até os campos ficarem alinhados corretamente')
}

// Executar
seedContractTemplate().catch(console.error)
