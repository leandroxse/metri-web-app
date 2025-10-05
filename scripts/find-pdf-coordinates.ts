/**
 * Script para encontrar coordenadas exatas no PDF
 *
 * Este script abre o PDF original e desenha uma GRADE com números
 * para você identificar as coordenadas exatas de cada campo
 *
 * Executar: npx tsx scripts/find-pdf-coordinates.ts
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as fs from 'fs'
import * as path from 'path'

async function createCoordinateGrid() {
  console.log('📐 Criando grade de coordenadas no PDF...\n')

  // Carregar o PDF original
  const pdfPath = path.join(process.cwd(), 'contrato.pdf')
  const existingPdfBytes = fs.readFileSync(pdfPath)

  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const pages = pdfDoc.getPages()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  console.log(`📄 PDF carregado: ${pages.length} páginas\n`)

  // Para cada página
  for (let pageNum = 0; pageNum < pages.length; pageNum++) {
    const page = pages[pageNum]
    const { width, height } = page.getSize()

    console.log(`Página ${pageNum + 1}: ${width}x${height}`)

    // Desenhar linhas verticais a cada 50 pixels
    for (let x = 0; x <= width; x += 50) {
      page.drawLine({
        start: { x, y: 0 },
        end: { x, y: height },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9),
        opacity: 0.5
      })

      // Números no topo e no rodapé
      if (x % 100 === 0) {
        page.drawText(`${x}`, {
          x: x - 10,
          y: height - 20,
          size: 8,
          font,
          color: rgb(1, 0, 0)
        })
        page.drawText(`${x}`, {
          x: x - 10,
          y: 10,
          size: 8,
          font,
          color: rgb(1, 0, 0)
        })
      }
    }

    // Desenhar linhas horizontais a cada 50 pixels
    for (let y = 0; y <= height; y += 50) {
      page.drawLine({
        start: { x: 0, y },
        end: { x: width, y },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9),
        opacity: 0.5
      })

      // Números na esquerda e na direita
      if (y % 100 === 0) {
        page.drawText(`${y}`, {
          x: 10,
          y: y - 5,
          size: 8,
          font,
          color: rgb(0, 0, 1)
        })
        page.drawText(`${y}`, {
          x: width - 30,
          y: y - 5,
          size: 8,
          font,
          color: rgb(0, 0, 1)
        })
      }
    }
  }

  // Salvar PDF com grade
  const pdfBytes = await pdfDoc.save()
  const outputPath = path.join(process.cwd(), 'contrato-com-grade.pdf')
  fs.writeFileSync(outputPath, pdfBytes)

  console.log(`\n✅ PDF com grade criado: contrato-com-grade.pdf`)
  console.log(`\n📋 COMO USAR:`)
  console.log(`1. Abra o arquivo: contrato-com-grade.pdf`)
  console.log(`2. Você verá uma GRADE com números VERMELHOS (eixo X) e AZUIS (eixo Y)`)
  console.log(`3. Para cada campo que deseja preencher, anote as coordenadas X,Y`)
  console.log(`4. Me informe as coordenadas e eu ajusto o código!`)
  console.log(`\nLEMBRE-SE:`)
  console.log(`- Eixo X (horizontal): Números VERMELHOS no topo/rodapé`)
  console.log(`- Eixo Y (vertical): Números AZUIS nas laterais`)
  console.log(`- Origem (0,0) fica no CANTO INFERIOR ESQUERDO`)
}

createCoordinateGrid().catch(console.error)
