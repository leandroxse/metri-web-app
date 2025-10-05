// Document Services - CRUD e Upload de documentos
import { supabase } from './client'
import type { Document, DocumentFormData, DocumentUpload } from '@/types/document'

// Helper para logging de erros padronizado
const logError = (operation: string, error: any, context?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ DOCUMENT_SERVICE [${operation}]:`, {
      error: error.message || error,
      details: error.details || null,
      hint: error.hint || null,
      context: context || null,
      timestamp: new Date().toISOString()
    })
  } else {
    console.error(`❌ DOCUMENT_SERVICE [${operation}]:`, {
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

export const documentService = {
  /**
   * Buscar todos os documentos
   */
  async getAll(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logError('getAll', error)
      return []
    }

    return data || []
  },

  /**
   * Buscar documento por ID
   */
  async getById(id: string): Promise<Document | null> {
    if (!isValidUUID(id)) {
      logError('getById', 'Invalid UUID format', { id })
      return null
    }

    const { data, error } = await supabase
      .from('documents')
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
   * Buscar documentos por evento
   */
  async getByEvent(eventId: string): Promise<Document[]> {
    if (!isValidUUID(eventId)) {
      logError('getByEvent', 'Invalid UUID format', { eventId })
      return []
    }

    const { data, error } = await supabase
      .from('documents')
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
   * Buscar documentos por categoria
   */
  async getByCategory(category: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      logError('getByCategory', error, { category })
      return []
    }

    return data || []
  },

  /**
   * Upload de arquivo e criar documento
   */
  async upload(uploadData: DocumentUpload): Promise<Document | null> {
    try {
      const { file, name, description, category, event_id } = uploadData

      // Validar arquivo
      if (!file) {
        logError('upload', 'No file provided')
        return null
      }

      // Validar tamanho (10MB max)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        logError('upload', 'File too large', { size: file.size, maxSize })
        return null
      }

      // Validar event_id se fornecido
      if (event_id && !isValidUUID(event_id)) {
        logError('upload', 'Invalid event_id UUID format', { event_id })
        return null
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${category}/${fileName}`

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        logError('upload - storage', uploadError, { filePath })
        return null
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // Criar registro no banco
      const documentData: DocumentFormData = {
        name,
        description,
        category,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        event_id: event_id || null
      }

      const { data, error } = await supabase
        .from('documents')
        .insert([documentData])
        .select('*')
        .single()

      if (error) {
        logError('upload - database', error, { documentData })

        // Tentar deletar arquivo do storage se falhou criar registro
        await supabase.storage.from('documents').remove([filePath])

        return null
      }

      console.log('✅ Document uploaded successfully:', data.id)
      return data
    } catch (error) {
      logError('upload', error, { uploadData })
      return null
    }
  },

  /**
   * Atualizar documento
   */
  async update(id: string, updates: Partial<DocumentFormData>): Promise<Document | null> {
    if (!isValidUUID(id)) {
      logError('update', 'Invalid UUID format', { id })
      return null
    }

    if (Object.keys(updates).length === 0) {
      logError('update', 'No updates provided', { id, updates })
      return null
    }

    // Validar event_id se estiver sendo atualizado
    if (updates.event_id && updates.event_id !== null && !isValidUUID(updates.event_id)) {
      logError('update', 'Invalid event_id UUID format', { id, event_id: updates.event_id })
      return null
    }

    const { data, error } = await supabase
      .from('documents')
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
   * Deletar documento (e arquivo do storage)
   */
  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) {
      logError('delete', 'Invalid UUID format', { id })
      return false
    }

    try {
      // Buscar documento para obter file_url
      const { data: doc } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', id)
        .single()

      // Deletar registro do banco
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) {
        logError('delete', error, { id })
        return false
      }

      // Tentar deletar arquivo do storage
      if (doc?.file_url) {
        try {
          // Extrair path do file_url
          const url = new URL(doc.file_url)
          const pathParts = url.pathname.split('/documents/')
          if (pathParts.length > 1) {
            const filePath = pathParts[1]
            await supabase.storage.from('documents').remove([filePath])
          }
        } catch (storageError) {
          console.warn('Could not delete file from storage:', storageError)
          // Não falhar a operação se não conseguir deletar do storage
        }
      }

      console.log('✅ Document deleted successfully:', id)
      return true
    } catch (error) {
      logError('delete', error, { id })
      return false
    }
  }
}
