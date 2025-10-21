/**
 * @fileoverview Hook para gerenciar orçamentos
 * @module hooks/use-budgets
 */

import { useState, useEffect, useCallback } from 'react'
import { filledBudgetService, budgetTemplateService } from '@/lib/supabase/budget-services'
import type { FilledBudget, BudgetTemplate, BudgetFormData } from '@/types/budget'

/**
 * Hook customizado para gerenciar orçamentos
 *
 * Fornece funcionalidades CRUD completas para orçamentos, incluindo:
 * - Listagem de orçamentos e templates
 * - Criação e atualização de orçamentos
 * - Geração de PDF
 * - Deleção de orçamentos
 *
 * @param eventId - ID do evento para filtrar orçamentos (opcional)
 * @returns Objeto com dados e funções de gerenciamento de orçamentos
 */
export function useBudgets(eventId?: string) {
  const [budgets, setBudgets] = useState<FilledBudget[]>([])
  const [templates, setTemplates] = useState<BudgetTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  /**
   * Carregar orçamentos do Supabase
   * Filtra por evento se eventId for fornecido
   */
  const loadBudgets = useCallback(async () => {
    setLoading(true)
    try {
      let data: FilledBudget[]
      if (eventId) {
        data = await filledBudgetService.getByEvent(eventId)
      } else {
        data = await filledBudgetService.getAll()
      }
      setBudgets(data)
    } catch (error) {
      console.error('Error loading budgets:', error)
      setBudgets([])
    } finally {
      setLoading(false)
    }
  }, [eventId])

  /**
   * Carregar templates de orçamento ativos
   */
  const loadTemplates = useCallback(async () => {
    try {
      const data = await budgetTemplateService.getAll()
      setTemplates(data)
    } catch (error) {
      console.error('Error loading templates:', error)
      setTemplates([])
    }
  }, [])

  /**
   * Criar novo orçamento
   */
  const createBudget = useCallback(async (budgetData: BudgetFormData): Promise<FilledBudget | null> => {
    try {
      const budget = await filledBudgetService.create(budgetData)
      if (budget) {
        setBudgets(prev => [budget, ...prev])
      }
      return budget
    } catch (error) {
      console.error('Error creating budget:', error)
      return null
    }
  }, [])

  /**
   * Atualizar orçamento existente
   */
  const updateBudget = useCallback(async (
    id: string,
    updates: Partial<BudgetFormData>
  ): Promise<FilledBudget | null> => {
    const updated = await filledBudgetService.update(id, updates)
    if (updated) {
      setBudgets(prev => prev.map(b => b.id === id ? updated : b))
    }
    return updated
  }, [])

  /**
   * Gerar PDF do orçamento
   */
  const generatePDF = useCallback(async (budgetId: string): Promise<string | null> => {
    setGenerating(true)
    try {
      const pdfUrl = await filledBudgetService.generatePDF(budgetId)
      if (pdfUrl) {
        // Atualizar orçamento com URL do PDF gerado
        setBudgets(prev => prev.map(b =>
          b.id === budgetId
            ? { ...b, generated_pdf_url: pdfUrl, status: 'completed' as const }
            : b
        ))
      }
      return pdfUrl
    } catch (error) {
      console.error('Error generating PDF:', error)
      return null
    } finally {
      setGenerating(false)
    }
  }, [])

  /**
   * Deletar orçamento
   */
  const deleteBudget = useCallback(async (id: string): Promise<boolean> => {
    const success = await filledBudgetService.delete(id)
    if (success) {
      setBudgets(prev => prev.filter(b => b.id !== id))
    }
    return success
  }, [])

  /**
   * Carregar dados ao montar o componente
   */
  useEffect(() => {
    loadBudgets()
    loadTemplates()
  }, [loadBudgets, loadTemplates])

  return {
    budgets,
    templates,
    loading,
    generating,
    createBudget,
    updateBudget,
    generatePDF,
    deleteBudget,
    refetch: loadBudgets
  }
}
