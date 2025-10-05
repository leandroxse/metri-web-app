// Types para o sistema de documentos

export interface Document {
  id: string
  name: string
  description: string | null
  category: 'contract' | 'invoice' | 'receipt' | 'photo' | 'other'
  file_url: string
  file_type: string
  file_size: number | null
  event_id: string | null
  created_at: string
  updated_at: string
}

// Type para formulário de upload
export type DocumentFormData = Omit<Document, 'id' | 'created_at' | 'updated_at'>

// Type para upload com File
export interface DocumentUpload extends Omit<DocumentFormData, 'file_url' | 'file_size' | 'file_type'> {
  file: File
}
