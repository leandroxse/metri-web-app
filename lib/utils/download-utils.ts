/**
 * Utilitários para download de arquivos
 */

/**
 * Força o download de um arquivo a partir de uma URL
 * Tenta múltiplas estratégias para garantir que o download aconteça
 */
export async function forceDownload(url: string, filename: string): Promise<boolean> {
  try {
    // ESTRATÉGIA 1: Adicionar parâmetro download na URL do Supabase
    // O Supabase Storage suporta o parâmetro ?download=filename
    const downloadUrl = `${url}${url.includes('?') ? '&' : '?'}download=${encodeURIComponent(filename)}`

    // Criar link temporário e clicar
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
    }, 100)

    return true
  } catch (error) {
    console.error('Erro na estratégia 1 (parâmetro download):', error)

    // ESTRATÉGIA 2: Tentar fetch com blob (fallback)
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      }, 100)

      return true
    } catch (fetchError) {
      console.error('Erro na estratégia 2 (fetch blob):', fetchError)

      // ESTRATÉGIA 3: Abrir em nova aba como último recurso
      window.open(url, '_blank')
      return false
    }
  }
}

/**
 * Gera nome de arquivo seguro (remove caracteres especiais)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_') // Remove caracteres especiais
    .replace(/_{2,}/g, '_') // Remove underscores duplicados
    .replace(/^_|_$/g, '') // Remove underscores no início/fim
}
