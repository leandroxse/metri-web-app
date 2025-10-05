// Hook para gerenciar documentos
import { useState, useEffect, useCallback } from 'react'
import { documentService } from '@/lib/supabase/document-services'
import type { Document, DocumentUpload } from '@/types/document'

export function useDocuments(eventId?: string) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Carregar documentos
  const loadDocuments = useCallback(async () => {
    setLoading(true)
    try {
      let data: Document[]
      if (eventId) {
        data = await documentService.getByEvent(eventId)
      } else {
        data = await documentService.getAll()
      }
      setDocuments(data)
    } catch (error) {
      console.error('Error loading documents:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [eventId])

  // Upload documento
  const uploadDocument = useCallback(async (uploadData: DocumentUpload): Promise<Document | null> => {
    setUploading(true)
    try {
      const doc = await documentService.upload(uploadData)
      if (doc) {
        setDocuments(prev => [doc, ...prev])
      }
      return doc
    } catch (error) {
      console.error('Error uploading document:', error)
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  // Deletar documento
  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    const success = await documentService.delete(id)
    if (success) {
      setDocuments(prev => prev.filter(doc => doc.id !== id))
    }
    return success
  }, [])

  // Atualizar documento
  const updateDocument = useCallback(async (
    id: string,
    updates: Partial<Omit<Document, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Document | null> => {
    const updated = await documentService.update(id, updates)
    if (updated) {
      setDocuments(prev => prev.map(doc => doc.id === id ? updated : doc))
    }
    return updated
  }, [])

  // Carregar ao montar
  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    updateDocument,
    refetch: loadDocuments
  }
}
