// Contract Services - CRUD de contratos e geração de PDF
import { supabase } from './client'
import type { ContractTemplate, FilledContract, ContractFormData, ContractFields } from '@/types/contract'

// Helper para logging de erros padronizado
const logError = (operation: string, error: any, context?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ CONTRACT_SERVICE [${operation}]:`, {
      error: error.message || error,
      details: error.details || null,
      hint: error.hint || null,
      context: context || null,
      timestamp: new Date().toISOString()
    })
  } else {
    console.error(`❌ CONTRACT_SERVICE [${operation}]:`, {
      error: error.message || error,
      details: error.details || null,
      hint: error.hint || null,
      context: context || null,
      timestamp: new Date().toISOString()
    })
  }
}

// Helper para validação de UUID
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// ============================================
// TEMPLATES
// ============================================
export const contractTemplateService = {
  /**
   * Buscar todos os templates ativos
   */
  async getAll(): Promise<ContractTemplate[]> {
    const { data, error } = await supabase
      .from('contract_templates')
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
   * Buscar template por ID
   */
  async getById(id: string): Promise<ContractTemplate | null> {
    if (!isValidUUID(id)) {
      logError('templates.getById', 'Invalid UUID format', { id })
      return null
    }

    const { data, error } = await supabase
      .from('contract_templates')
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
   * Criar template
   */
  async create(template: Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ContractTemplate | null> {
    const { data, error } = await supabase
      .from('contract_templates')
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
// FILLED CONTRACTS
// ============================================
export const filledContractService = {
  /**
   * Buscar todos os contratos
   */
  async getAll(): Promise<FilledContract[]> {
    const { data, error } = await supabase
      .from('filled_contracts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logError('getAll', error)
      return []
    }

    return data || []
  },

  /**
   * Buscar contrato por ID
   */
  async getById(id: string): Promise<FilledContract | null> {
    if (!isValidUUID(id)) {
      logError('getById', 'Invalid UUID format', { id })
      return null
    }

    const { data, error } = await supabase
      .from('filled_contracts')
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
   * Buscar contratos por evento
   */
  async getByEvent(eventId: string): Promise<FilledContract[]> {
    if (!isValidUUID(eventId)) {
      logError('getByEvent', 'Invalid UUID format', { eventId })
      return []
    }

    const { data, error } = await supabase
      .from('filled_contracts')
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
   * Criar contrato (draft)
   */
  async create(contractData: ContractFormData): Promise<FilledContract | null> {
    // Validar template_id
    if (contractData.template_id && !isValidUUID(contractData.template_id)) {
      logError('create', 'Invalid template_id UUID format', { template_id: contractData.template_id })
      return null
    }

    // Validar event_id
    if (contractData.event_id && !isValidUUID(contractData.event_id)) {
      logError('create', 'Invalid event_id UUID format', { event_id: contractData.event_id })
      return null
    }

    const { data, error } = await supabase
      .from('filled_contracts')
      .insert([contractData])
      .select('*')
      .single()

    if (error) {
      logError('create', error, { contractData })
      return null
    }

    console.log('✅ Contract created successfully:', data.id)
    return data
  },

  /**
   * Atualizar contrato
   */
  async update(id: string, updates: Partial<ContractFormData>): Promise<FilledContract | null> {
    if (!isValidUUID(id)) {
      logError('update', 'Invalid UUID format', { id })
      return null
    }

    if (Object.keys(updates).length === 0) {
      logError('update', 'No updates provided', { id, updates })
      return null
    }

    const { data, error } = await supabase
      .from('filled_contracts')
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
   * Gerar PDF do contrato
   * (Usa pdf-utils.ts para preencher o template)
   */
  async generatePDF(contractId: string): Promise<string | null> {
    try {
      if (!isValidUUID(contractId)) {
        logError('generatePDF', 'Invalid UUID format', { contractId })
        return null
      }

      // Buscar contrato
      const contract = await this.getById(contractId)
      if (!contract) {
        logError('generatePDF', 'Contract not found', { contractId })
        return null
      }

      // Buscar template
      const template = contract.template_id
        ? await contractTemplateService.getById(contract.template_id)
        : null

      if (!template) {
        logError('generatePDF', 'Template not found', { template_id: contract.template_id })
        return null
      }

      // Importar dinamicamente pdf-utils (para evitar erro no server-side)
      const { fillContractPDF } = await import('@/lib/utils/pdf-utils')

      // Gerar PDF preenchido
      const pdfBytes = await fillContractPDF(template.template_url, contract.filled_data)

      // Extrair primeiro nome do contratante
      const fullName = contract.filled_data['1'] || 'Contratante'
      const firstName = fullName.split(' ')[0].toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais

      // Upload para storage
      const timestamp = Date.now()
      const fileName = `contrato-${firstName}-${timestamp}.pdf`
      const filePath = `contracts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('filled-contracts')
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
        .from('filled-contracts')
        .getPublicUrl(filePath)

      // Atualizar contrato com URL do PDF gerado
      await this.update(contractId, {
        generated_pdf_url: publicUrl,
        status: 'completed',
        filled_data: contract.filled_data,
        template_id: contract.template_id,
        event_id: contract.event_id,
        notes: contract.notes
      })

      console.log('✅ PDF generated successfully:', publicUrl)
      return publicUrl
    } catch (error) {
      logError('generatePDF', error, { contractId })
      return null
    }
  },

  /**
   * Deletar contrato (e PDF gerado)
   */
  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) {
      logError('delete', 'Invalid UUID format', { id })
      return false
    }

    try {
      // Buscar contrato para obter generated_pdf_url
      const { data: contract } = await supabase
        .from('filled_contracts')
        .select('generated_pdf_url')
        .eq('id', id)
        .single()

      // Deletar registro do banco
      const { error } = await supabase
        .from('filled_contracts')
        .delete()
        .eq('id', id)

      if (error) {
        logError('delete', error, { id })
        return false
      }

      // Tentar deletar PDF do storage
      if (contract?.generated_pdf_url) {
        try {
          const url = new URL(contract.generated_pdf_url)
          const pathParts = url.pathname.split('/filled-contracts/')
          if (pathParts.length > 1) {
            const filePath = pathParts[1]
            await supabase.storage.from('filled-contracts').remove([filePath])
          }
        } catch (storageError) {
          console.warn('Could not delete PDF from storage:', storageError)
        }
      }

      console.log('✅ Contract deleted successfully:', id)
      return true
    } catch (error) {
      logError('delete', error, { id })
      return false
    }
  }
}
