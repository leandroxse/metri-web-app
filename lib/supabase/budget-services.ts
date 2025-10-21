/**
 * @fileoverview Budget Services - CRUD de orçamentos e geração de PDF
 * @module lib/supabase/budget-services
 */

import { supabase } from './client'
import type { BudgetTemplate, FilledBudget, BudgetFormData } from '@/types/budget'

/**
 * Helper para logging de erros padronizado
 */
const logError = (operation: string, error: unknown, context?: unknown): void => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorDetails = error && typeof error === 'object' && 'details' in error ? error.details : null
  const errorHint = error && typeof error === 'object' && 'hint' in error ? error.hint : null

  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ BUDGET_SERVICE [${operation}]:`, {
      error: errorMessage,
      details: errorDetails,
      hint: errorHint,
      context: context || null,
      timestamp: new Date().toISOString()
    })
  } else {
    console.error(`❌ BUDGET_SERVICE [${operation}]:`, {
      error: errorMessage,
      details: errorDetails,
      hint: errorHint,
      context: context || null,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Helper para validação de UUID
 */
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// ============================================
// TEMPLATES
// ============================================
export const budgetTemplateService = {
  /**
   * Buscar todos os templates ativos de orçamento
   */
  async getAll(): Promise<BudgetTemplate[]> {
    const { data, error } = await supabase
      .from('budget_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      logError('templates.getAll', error)
      return []
    }

    return data || []
  },

  /**
   * Buscar template de orçamento por ID
   */
  async getById(id: string): Promise<BudgetTemplate | null> {
    if (!isValidUUID(id)) {
      logError('templates.getById', 'Invalid UUID format', { id })
      return null
    }

    const { data, error } = await supabase
      .from('budget_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logError('templates.getById', error, { id })
      return null
    }

    return data
  },

  /**
   * Criar template de orçamento
   */
  async create(template: Omit<BudgetTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetTemplate | null> {
    const { data, error } = await supabase
      .from('budget_templates')
      .insert([template])
      .select('*')
      .single()

    if (error) {
      logError('templates.create', error, { template })
      return null
    }

    return data
  }
}

// ============================================
// FILLED BUDGETS
// ============================================
export const filledBudgetService = {
  /**
   * Buscar todos os orçamentos
   */
  async getAll(): Promise<FilledBudget[]> {
    const { data, error } = await supabase
      .from('filled_budgets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logError('getAll', error)
      return []
    }

    return data || []
  },

  /**
   * Buscar orçamento por ID
   */
  async getById(id: string): Promise<FilledBudget | null> {
    if (!isValidUUID(id)) {
      logError('getById', 'Invalid UUID format', { id })
      return null
    }

    const { data, error } = await supabase
      .from('filled_budgets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logError('getById', error, { id })
      return null
    }

    return data
  },

  /**
   * Buscar orçamentos por evento
   */
  async getByEvent(eventId: string): Promise<FilledBudget[]> {
    if (!isValidUUID(eventId)) {
      logError('getByEvent', 'Invalid UUID format', { eventId })
      return []
    }

    const { data, error } = await supabase
      .from('filled_budgets')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) {
      logError('getByEvent', error, { eventId })
      return []
    }

    return data || []
  },

  /**
   * Criar orçamento (draft)
   */
  async create(budgetData: BudgetFormData): Promise<FilledBudget | null> {
    // Validar template_id
    if (budgetData.template_id && !isValidUUID(budgetData.template_id)) {
      logError('create', 'Invalid template_id UUID format', { template_id: budgetData.template_id })
      return null
    }

    // Validar event_id
    if (budgetData.event_id && !isValidUUID(budgetData.event_id)) {
      logError('create', 'Invalid event_id UUID format', { event_id: budgetData.event_id })
      return null
    }

    const { data, error } = await supabase
      .from('filled_budgets')
      .insert([budgetData])
      .select('*')
      .single()

    if (error) {
      logError('create', error, { budgetData })
      return null
    }

    console.log('✅ Budget created successfully:', data.id)
    return data
  },

  /**
   * Atualizar orçamento
   */
  async update(id: string, updates: Partial<BudgetFormData>): Promise<FilledBudget | null> {
    if (!isValidUUID(id)) {
      logError('update', 'Invalid UUID format', { id })
      return null
    }

    if (Object.keys(updates).length === 0) {
      logError('update', 'No updates provided', { id, updates })
      return null
    }

    const { data, error } = await supabase
      .from('filled_budgets')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      logError('update', error, { id, updates })
      return null
    }

    return data
  },

  /**
   * Gerar PDF do orçamento
   * (Usa pdf-utils.ts para preencher o template)
   */
  async generatePDF(budgetId: string): Promise<string | null> {
    try {
      if (!isValidUUID(budgetId)) {
        logError('generatePDF', 'Invalid UUID format', { budgetId })
        return null
      }

      // Buscar orçamento
      const budget = await this.getById(budgetId)
      if (!budget) {
        logError('generatePDF', 'Budget not found', { budgetId })
        return null
      }

      // Buscar template
      const template = budget.template_id
        ? await budgetTemplateService.getById(budget.template_id)
        : null

      if (!template) {
        logError('generatePDF', 'Template not found', { template_id: budget.template_id })
        return null
      }

      // Importar dinamicamente pdf-utils (para evitar erro no server-side)
      const { fillBudgetPDF } = await import('@/lib/utils/pdf-utils')

      // Gerar PDF preenchido
      const pdfBytes = await fillBudgetPDF(template.template_url, budget.filled_data)

      // Extrair nome do evento para nome do arquivo
      const eventName = budget.filled_data.evento || 'Orcamento'
      const safeName = eventName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]/g, '-') // Substitui caracteres especiais por hífen
        .replace(/-+/g, '-') // Remove hífens duplicados
        .substring(0, 30) // Limita tamanho

      // Upload para storage
      const timestamp = Date.now()
      const fileName = `orcamento-${safeName}-${timestamp}.pdf`
      const filePath = `budgets/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('filled-budgets')
        .upload(filePath, pdfBytes, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        logError('generatePDF - storage upload', uploadError, { filePath })
        return null
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('filled-budgets')
        .getPublicUrl(filePath)

      // Atualizar orçamento com URL do PDF gerado
      await this.update(budgetId, {
        generated_pdf_url: publicUrl,
        status: 'completed',
        filled_data: budget.filled_data,
        template_id: budget.template_id,
        event_id: budget.event_id,
        notes: budget.notes
      })

      console.log('✅ Budget PDF generated successfully:', publicUrl)
      return publicUrl
    } catch (error) {
      logError('generatePDF', error, { budgetId })
      return null
    }
  },

  /**
   * Deletar orçamento (e PDF gerado)
   */
  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) {
      logError('delete', 'Invalid UUID format', { id })
      return false
    }

    try {
      // Buscar orçamento para obter generated_pdf_url
      const { data: budget } = await supabase
        .from('filled_budgets')
        .select('generated_pdf_url')
        .eq('id', id)
        .single()

      // Deletar registro do banco
      const { error } = await supabase
        .from('filled_budgets')
        .delete()
        .eq('id', id)

      if (error) {
        logError('delete', error, { id })
        return false
      }

      // Tentar deletar PDF do storage
      if (budget?.generated_pdf_url) {
        try {
          const url = new URL(budget.generated_pdf_url)
          const pathParts = url.pathname.split('/filled-budgets/')
          if (pathParts.length > 1) {
            const filePath = pathParts[1]
            await supabase.storage.from('filled-budgets').remove([filePath])
          }
        } catch (storageError) {
          console.warn('Could not delete PDF from storage:', storageError)
        }
      }

      console.log('✅ Budget deleted successfully:', id)
      return true
    } catch (error) {
      logError('delete', error, { id })
      return false
    }
  }
}
