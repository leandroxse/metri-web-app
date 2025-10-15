// PDF Utils - Funções para preencher PDFs com pdf-lib usando form fields
import { PDFDocument } from 'pdf-lib'
import type { ContractFields } from '@/types/contract'
import { formatCurrency } from './contract-fields'

/**
 * Preenche um template de PDF com form fields usando os dados do contrato
 *
 * IMPORTANTE:
 * - Template deve ter form fields criados com os mesmos nomes dos campos
 * - Template deve ser carregado como ArrayBuffer (fetch primeiro)
 * - Os campos são preenchidos automaticamente pelo nome
 *
 * @param templateUrl - URL do PDF template com form fields
 * @param fields - Dados do contrato a preencher
 * @returns PDF preenchido como Uint8Array
 */
export async function fillContractPDF(
  templateUrl: string,
  fields: ContractFields
): Promise<Uint8Array> {
  try {
    // STEP 1: Carregar template como ArrayBuffer
    console.log('📄 Carregando template PDF...')
    const response = await fetch(templateUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`)
    }
    const templateBytes = await response.arrayBuffer()

    // STEP 2: Carregar PDF document
    console.log('📝 Carregando documento PDF...')
    const pdfDoc = await PDFDocument.load(templateBytes)

    // STEP 3: Pegar formulário do PDF
    const form = pdfDoc.getForm()
    const formFields = form.getFields()

    console.log(`📋 Encontrados ${formFields.length} campos no formulário`)

    // Log dos campos disponíveis (debug)
    formFields.forEach(field => {
      console.log(`  - Campo: ${field.getName()}`)
    })

    // STEP 4: Preencher campos do formulário
    console.log('✍️  Preenchendo campos...')

    // Helper para preencher campo de texto com segurança
    const fillTextField = (fieldName: string, value: string | number) => {
      try {
        const field = form.getTextField(fieldName)
        field.setText(String(value))
        console.log(`  ✅ ${fieldName}: ${value}`)
      } catch (error) {
        console.warn(`  ⚠️  Campo "${fieldName}" não encontrado no PDF`)
      }
    }

    // Mapeamento: nome do nosso sistema -> possíveis nomes no PDF
    // Nova estrutura com FormFields numéricos
    const fieldMappings = [
      // Contratante (campos numéricos)
      { ourName: '1', pdfNames: ['1'], value: fields['1'] },
      { ourName: '2', pdfNames: ['2'], value: fields['2'] },
      { ourName: '3', pdfNames: ['3'], value: fields['3'] },

      // Evento
      { ourName: 'dia', pdfNames: ['dia'], value: fields.dia },
      { ourName: '4', pdfNames: ['4'], value: fields['4'] },
      { ourName: '5', pdfNames: ['5'], value: fields['5'] },
      { ourName: 'local', pdfNames: ['local'], value: fields.local },

      // Equipe
      { ourName: '6', pdfNames: ['6'], value: fields['6'].toString() },
      { ourName: '7', pdfNames: ['7'], value: fields['7'].toString() },
      { ourName: '8', pdfNames: ['8'], value: fields['8'].toString() },

      // Valores
      { ourName: '9', pdfNames: ['9'], value: formatCurrency(fields['9']) },
      { ourName: '10', pdfNames: ['10'], value: fields['10'] },
      { ourName: '11', pdfNames: ['11'], value: formatCurrency(fields['11']) },
      { ourName: '12', pdfNames: ['12'], value: formatCurrency(fields['12']) },

      // Pagamento e Taxas
      { ourName: '13', pdfNames: ['13'], value: fields['13'].toString() },
      { ourName: '14', pdfNames: ['14'], value: fields['14'].toString() },
      { ourName: '15', pdfNames: ['15'], value: formatCurrency(fields['15']) },
      { ourName: 'pix', pdfNames: ['pix'], value: fields.pix },

      // Assinatura (última folha) - usar nomes diferentes para não conflitar
      { ourName: 'dia_assinatura', pdfNames: ['dia_assinatura', 'dia_ass'], value: fields.dia_assinatura.toString() },
      { ourName: 'mes', pdfNames: ['mes', 'mes_assinatura'], value: fields.mes },

      // Campos de assinatura digital (preenchidos automaticamente no PDF)
      { ourName: 'contratante', pdfNames: ['contratante'], value: fields['1'] },
      { ourName: 'contratado', pdfNames: ['contratado'], value: 'Prime Buffet' }
    ]

    // Preencher campos tentando todas as variações
    fieldMappings.forEach(mapping => {
      let filled = false
      for (const pdfName of mapping.pdfNames) {
        try {
          const field = form.getTextField(pdfName)
          field.setText(String(mapping.value))
          console.log(`  ✅ ${mapping.ourName} -> ${pdfName}: ${mapping.value}`)
          filled = true
          break // Achou! Não precisa tentar outras variações
        } catch (error) {
          // Campo não encontrado com esse nome, tenta próximo
        }
      }

      if (!filled) {
        console.warn(`  ⚠️  Campo "${mapping.ourName}" não encontrado com nenhuma variação: ${mapping.pdfNames.join(', ')}`)
      }
    })

    // STEP 5: Flatten form (torna campos não editáveis)
    console.log('🔒 Finalizando documento (flatten)...')
    form.flatten()

    // STEP 6: Serializar PDF preenchido
    console.log('💾 Salvando PDF...')
    const pdfBytes = await pdfDoc.save()

    console.log('✅ PDF preenchido com sucesso!')
    return pdfBytes
  } catch (error) {
    console.error('❌ Erro ao preencher PDF:', error)
    throw error
  }
}
