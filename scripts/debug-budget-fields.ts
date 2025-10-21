/**
 * Script para debugar os campos do PDF de orçamento
 * Lista todos os campos do template e seus nomes
 */

import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

async function debugBudgetPDFFields() {
  try {
    // Carregar o PDF local de orçamento
    const pdfPath = path.join(process.cwd(), 'orçamento1.pdf')

    if (!fs.existsSync(pdfPath)) {
      console.error('❌ Arquivo orçamento1.pdf não encontrado!')
      return
    }

    console.log('📄 Carregando orçamento1.pdf...\n')
    const pdfBuffer = fs.readFileSync(pdfPath)
    const pdfDoc = await PDFDocument.load(pdfBuffer)

    const form = pdfDoc.getForm()
    const fields = form.getFields()

    console.log('📋 CAMPOS ENCONTRADOS NO PDF DE ORÇAMENTO:\n')
    console.log(`Total de campos: ${fields.length}\n`)

    fields.forEach((field, index) => {
      const name = field.getName()
      const type = field.constructor.name

      console.log(`${index + 1}. Nome: "${name}"`)
      console.log(`   Tipo: ${type}`)

      // Tentar pegar o valor atual se for um campo de texto
      try {
        if (type === 'PDFTextField') {
          const textField = form.getTextField(name)
          const value = textField.getText()
          if (value) {
            console.log(`   Valor atual: "${value}"`)
          }
        }
      } catch (e) {
        // Ignorar
      }

      console.log('')
    })

    // Procurar especificamente pelos campos esperados do orçamento
    console.log('\n🔍 VERIFICAÇÃO DE CAMPOS ESPECÍFICOS DO ORÇAMENTO:\n')

    const expectedFields = [
      'evento',
      'data',
      'cerimonialista',
      'pessoas1',
      'preço',
      'pessoas2',
      'preçotexto'
    ]

    expectedFields.forEach(fieldName => {
      try {
        const field = form.getTextField(fieldName)
        console.log(`✅ Campo "${fieldName}" EXISTE`)
        const value = field.getText()
        if (value) {
          console.log(`   Valor atual: "${value}"`)
        }
      } catch (e) {
        console.log(`❌ Campo "${fieldName}" NÃO EXISTE`)
      }
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

debugBudgetPDFFields()
