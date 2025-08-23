export interface Person {
  id: string
  name: string
  value?: number | null // Valor a ser pago (opcional)
  category_id: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string
  color: string
  member_count?: number
  people?: Person[]
  created_at: string
  updated_at: string
}
