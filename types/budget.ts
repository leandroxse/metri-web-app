/**
 * @fileoverview Types para o sistema de orçamentos
 * @module types/budget
 */

/**
 * Campos do orçamento (mapeados para os nomes dos form fields no PDF)
 *
 * PDF Fields detectados:
 * - evento: Nome do evento
 * - data: Data formatada do evento
 * - cerimonialista: Nome do cerimonialista
 * - pessoas1: Quantidade de pessoas (campo no topo)
 * - preço2: Preço por pessoa em R$
 * - pessoas2: Quantidade de pessoas (campo para cálculo)
 * - preçotexto: Valor total (pessoas * preço)
 */
export interface BudgetFields {
  /** Nome do evento */
  evento: string

  /** Data do evento formatada (ex: "01 de outubro de 2025 - quinta-feira") */
  data: string

  /** Nome do cerimonialista responsável */
  cerimonialista: string

  /** Quantidade de pessoas (campo no topo do PDF) */
  pessoas1: number

  /** Preço por pessoa em R$ */
  "preço2": number

  /** Quantidade de pessoas (campo para cálculo do total) - mesmo valor de pessoas1 */
  pessoas2: number

  /** Valor total calculado (pessoas * preço) em R$ */
  preçotexto: number
}

/**
 * Valores padrão para orçamentos
 */
export const DEFAULT_BUDGET_VALUES: Partial<BudgetFields> = {
  pessoas1: 80,
  pessoas2: 80,
  "preço2": 15.00,
  preçotexto: 1200.00, // 80 * 15
}

/**
 * Template de orçamento
 */
export interface BudgetTemplate {
  id: string
  name: string
  description: string | null
  template_url: string
  fields_schema: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Orçamento preenchido
 */
export interface FilledBudget {
  id: string
  template_id: string | null
  event_id: string | null
  filled_data: BudgetFields
  generated_pdf_url: string | null
  status: 'draft' | 'completed' | 'sent' | 'approved' | 'rejected'
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * Type para formulário de orçamento
 */
export type BudgetFormData = Omit<FilledBudget, 'id' | 'created_at' | 'updated_at' | 'generated_pdf_url'>
