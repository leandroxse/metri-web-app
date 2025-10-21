/**
 * Script para verificar se há scripts ou cálculos automáticos no PDF
 */

import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

async function checkPDFScripts() {
  try {
    const pdfPath = path.join(process.cwd(), 'contrato2.pdf')

    if (!fs.existsSync(pdfPath)) {
      console.error('❌ Arquivo contrato2.pdf não encontrado!')
      return
    }

    const pdfBuffer = fs.readFileSync(pdfPath)
    const pdfDoc = await PDFDocument.load(pdfBuffer)

    const form = pdfDoc.getForm()
    const fields = form.getFields()

    console.log('🔍 VERIFICANDO SCRIPTS/CÁLCULOS NOS CAMPOS:\n')

    // Verificar campos específicos de data
    const dateFields = ['dia', 'data01', 'mes']

    dateFields.forEach(fieldName => {
      try {
        const field = form.getTextField(fieldName)
        const fieldDict = field.acroField.dict

        console.log(`\n📋 Campo: "${fieldName}"`)
        console.log('   Propriedades:')

        // Verificar se tem cálculo (Calculate action)
        const aa = fieldDict.get('AA')
        if (aa) {
          console.log('   ⚠️  TEM AÇÃO AUTOMÁTICA (AA)')
          console.log('   Conteúdo:', JSON.stringify(aa, null, 2))
        } else {
          console.log('   ✅ Sem ações automáticas')
        }

        // Verificar se tem fórmula (calculate)
        const calculate = fieldDict.get('Calculate')
        if (calculate) {
          console.log('   ⚠️  TEM CÁLCULO')
          console.log('   Conteúdo:', JSON.stringify(calculate, null, 2))
        }

        // Verificar valor padrão (DV)
        const dv = fieldDict.get('DV')
        if (dv) {
          console.log('   ⚠️  TEM VALOR PADRÃO (DV)')
          console.log('   Conteúdo:', dv)
        }

        // Verificar formatação (Format)
        const format = fieldDict.get('Format')
        if (format) {
          console.log('   ℹ️  Tem formatação especial')
        }

      } catch (e) {
        console.log(`\n❌ Campo "${fieldName}" não encontrado`)
      }
    })

    // Verificar actions no documento inteiro
    console.log('\n\n🔍 VERIFICANDO AÇÕES NO DOCUMENTO:\n')
    const catalog = pdfDoc.catalog
    const catalogDict = catalog.dict
    const aa = catalogDict.get('AA')
    if (aa) {
      console.log('⚠️  Documento tem ações automáticas!')
      console.log('Conteúdo:', JSON.stringify(aa, null, 2))
    } else {
      console.log('✅ Documento sem ações automáticas')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

checkPDFScripts()
