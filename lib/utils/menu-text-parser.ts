// Parser para texto de cardápio formatado pelo ChatGPT
// Formato esperado:
// CARDÁPIO: [Nome]
// CATEGORIA: [Nome]
// - [Item] :: [Descrição]

interface ParsedMenuItem {
  name: string
  description: string
}

interface ParsedCategory {
  name: string
  items: ParsedMenuItem[]
}

export interface ParsedMenu {
  menuName: string
  categories: ParsedCategory[]
}

export function parseMenuFromText(text: string): ParsedMenu {
  // Normalizar o texto: adicionar quebras de linha antes de CATEGORIA e CARDÁPIO
  let normalizedText = text
    // Adicionar quebra antes de CATEGORIA (se não tiver)
    .replace(/\s*CATEGORIA:/g, '\nCATEGORIA:')
    // Adicionar quebra antes de CARDÁPIO/CARDAPIO (se não tiver)
    .replace(/\s*CARDÁPIO:/g, '\nCARDÁPIO:')
    .replace(/\s*CARDAPIO:/g, '\nCARDAPIO:')
    // Adicionar quebra antes de itens (-)
    .replace(/\s+-\s+/g, '\n- ')

  const lines = normalizedText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  let menuName = ""
  const categories: ParsedCategory[] = []
  let currentCategory: ParsedCategory | null = null

  for (const line of lines) {
    // Detectar nome do cardápio
    if (line.toUpperCase().startsWith('CARDÁPIO:') || line.toUpperCase().startsWith('CARDAPIO:')) {
      menuName = line.substring(line.indexOf(':') + 1).trim()
      continue
    }

    // Detectar categoria
    if (line.toUpperCase().startsWith('CATEGORIA:')) {
      // Salvar categoria anterior se existir
      if (currentCategory && currentCategory.items.length > 0) {
        categories.push(currentCategory)
      }

      // Criar nova categoria
      const categoryName = line.substring(line.indexOf(':') + 1).trim()
      currentCategory = {
        name: categoryName,
        items: []
      }
      continue
    }

    // Detectar item (começa com -)
    if (line.startsWith('-') && currentCategory) {
      const itemText = line.substring(1).trim()

      // Separar nome e descrição pelo ::
      const separatorIndex = itemText.indexOf('::')

      if (separatorIndex !== -1) {
        const name = itemText.substring(0, separatorIndex).trim()
        const description = itemText.substring(separatorIndex + 2).trim()

        currentCategory.items.push({
          name,
          description
        })
      } else {
        // Se não tiver ::, usar o texto todo como nome
        currentCategory.items.push({
          name: itemText,
          description: ""
        })
      }
    }
  }

  // Adicionar última categoria
  if (currentCategory && currentCategory.items.length > 0) {
    categories.push(currentCategory)
  }

  // Validações
  if (!menuName) {
    throw new Error("Nome do cardápio não encontrado. Certifique-se de ter 'CARDÁPIO: [nome]' no início.")
  }

  if (categories.length === 0) {
    throw new Error("Nenhuma categoria encontrada. Use 'CATEGORIA: [nome]' para definir categorias.")
  }

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0)
  if (totalItems === 0) {
    throw new Error("Nenhum item encontrado. Use '- [nome] :: [descrição]' para adicionar itens.")
  }

  return {
    menuName,
    categories
  }
}

// Função auxiliar para preview antes de importar
export function validateMenuText(text: string): { valid: boolean; error?: string; preview?: ParsedMenu } {
  try {
    const parsed = parseMenuFromText(text)
    return { valid: true, preview: parsed }
  } catch (error: any) {
    return { valid: false, error: error.message }
  }
}
