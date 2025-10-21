/**
 * Script para debugar os campos do PDF
 * Lista todos os campos do template e seus nomes
 */

import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

async function debugPDFFields() {
  try {
    // Carregar o PDF local
    const pdfPath = path.join(process.cwd(), 'contrato2.pdf')

    if (!fs.existsSync(pdfPath)) {
      console.error('❌ Arquivo contrato2.pdf não encontrado!')
      return
    }

    const pdfBuffer = fs.readFileSync(pdfPath)
    const pdfDoc = await PDFDocument.load(pdfBuffer)

    const form = pdfDoc.getForm()
    const fields = form.getFields()

    console.log('📋 CAMPOS ENCONTRADOS NO PDF:\n')
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
          console.log(`   Valor atual: "${value}"`)
        }
      } catch (e) {
        // Ignorar
      }

      console.log('')
    })

    // Procurar especificamente pelos campos problemáticos
    console.log('\n🔍 VERIFICAÇÃO DE CAMPOS ESPECÍFICOS:\n')

    const criticalFields = ['dia', 'dia 2', 'data01', '2', 'cpf', 'CPF']

    criticalFields.forEach(fieldName => {
      try {
        const field = form.getTextField(fieldName)
        console.log(`✅ Campo "${fieldName}" EXISTE`)
      } catch (e) {
        console.log(`❌ Campo "${fieldName}" NÃO EXISTE`)
      }
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

debugPDFFields()
