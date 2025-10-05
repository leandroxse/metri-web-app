// Contract Fields Utils - Formatação e helpers para campos do contrato

/**
 * Formata valor monetário em BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

/**
 * Formata CPF (000.000.000-00)
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/)
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`
  }
  return cpf
}

/**
 * Converte número para extenso (simplificado)
 * Para valores mais complexos, considerar biblioteca como 'numero-por-extenso'
 */
export function numberToWords(value: number): string {
  if (value === 0) return 'zero reais'

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

  function converterGrupo(num: number): string {
    const c = Math.floor(num / 100)
    const d = Math.floor((num % 100) / 10)
    const u = num % 10

    let resultado = ''

    // Centenas
    if (c > 0) {
      if (num === 100) {
        resultado = 'cem'
      } else {
        resultado = centenas[c]
      }
    }

    // Dezenas especiais (10-19)
    if (d === 1) {
      if (resultado) resultado += ' e '
      resultado += especiais[u]
      return resultado
    }

    // Dezenas normais
    if (d > 1) {
      if (resultado) resultado += ' e '
      resultado += dezenas[d]
    }

    // Unidades
    if (u > 0 && d !== 1) {
      if (resultado) resultado += ' e '
      resultado += unidades[u]
    }

    return resultado
  }

  // Separar em milhares e resto
  const milhares = Math.floor(value / 1000)
  const resto = value % 1000

  let extenso = ''

  if (milhares > 0) {
    if (milhares === 1) {
      extenso = 'mil'
    } else {
      extenso = converterGrupo(milhares) + ' mil'
    }
  }

  if (resto > 0) {
    if (extenso) extenso += ' e '
    extenso += converterGrupo(resto)
  }

  extenso += ' reais'

  return extenso
}

/**
 * Formata data para extenso (ex: "15 de fevereiro de 2025")
 */
export function formatDateExtended(date: Date): string {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} de ${month} de ${year}`
}

/**
 * Formata horário (HH:MM)
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Valida CPF
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length !== 11) return false
  if (/^(\d)\1+$/.test(cleaned)) return false // Verifica se todos os dígitos são iguais

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleaned.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleaned.charAt(10))) return false

  return true
}

/**
 * Obtém nome do mês por extenso
 */
export function getMonthName(monthIndex: number): string {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]
  return months[monthIndex] || ''
}
