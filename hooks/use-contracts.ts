// Hook para gerenciar contratos
import { useState, useEffect, useCallback } from 'react'
import { filledContractService, contractTemplateService } from '@/lib/supabase/contract-services'
import type { FilledContract, ContractTemplate, ContractFormData } from '@/types/contract'

export function useContracts(eventId?: string) {
  const [contracts, setContracts] = useState<FilledContract[]>([])
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Carregar contratos
  const loadContracts = useCallback(async () => {
    setLoading(true)
    try {
      let data: FilledContract[]
      if (eventId) {
        data = await filledContractService.getByEvent(eventId)
      } else {
        data = await filledContractService.getAll()
      }
      setContracts(data)
    } catch (error) {
      console.error('Error loading contracts:', error)
      setContracts([])
    } finally {
      setLoading(false)
    }
  }, [eventId])

  // Carregar templates
  const loadTemplates = useCallback(async () => {
    try {
      const data = await contractTemplateService.getAll()
      setTemplates(data)
    } catch (error) {
      console.error('Error loading templates:', error)
      setTemplates([])
    }
  }, [])

  // Criar contrato
  const createContract = useCallback(async (contractData: ContractFormData): Promise<FilledContract | null> => {
    try {
      const contract = await filledContractService.create(contractData)
      if (contract) {
        setContracts(prev => [contract, ...prev])
      }
      return contract
    } catch (error) {
      console.error('Error creating contract:', error)
      return null
    }
  }, [])

  // Atualizar contrato
  const updateContract = useCallback(async (
    id: string,
    updates: Partial<ContractFormData>
  ): Promise<FilledContract | null> => {
    const updated = await filledContractService.update(id, updates)
    if (updated) {
      setContracts(prev => prev.map(c => c.id === id ? updated : c))
    }
    return updated
  }, [])

  // Gerar PDF do contrato
  const generatePDF = useCallback(async (contractId: string): Promise<string | null> => {
    setGenerating(true)
    try {
      const pdfUrl = await filledContractService.generatePDF(contractId)
      if (pdfUrl) {
        // Atualizar contrato com URL do PDF gerado
        setContracts(prev => prev.map(c =>
          c.id === contractId
            ? { ...c, generated_pdf_url: pdfUrl, status: 'completed' as const }
            : c
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

  // Deletar contrato
  const deleteContract = useCallback(async (id: string): Promise<boolean> => {
    const success = await filledContractService.delete(id)
    if (success) {
      setContracts(prev => prev.filter(c => c.id !== id))
    }
    return success
  }, [])

  // Carregar ao montar
  useEffect(() => {
    loadContracts()
    loadTemplates()
  }, [loadContracts, loadTemplates])

  return {
    contracts,
    templates,
    loading,
    generating,
    createContract,
    updateContract,
    generatePDF,
    deleteContract,
    refetch: loadContracts
  }
}
