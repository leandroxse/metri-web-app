import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '../config/supabase'

const config = getSupabaseConfig()

// Cliente para uso no frontend (com anon key)
export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    persistSession: false, // Não vamos usar auth por enquanto
  },
  db: {
    schema: 'public'
  }
})

// Cliente para uso no backend/migrations (com service role key) 
export const supabaseAdmin = () => {
  const config = getSupabaseConfig()
  
  return createClient(config.url, config.serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    db: {
      schema: 'public'
    }
  })
}

// Tipos TypeScript para as tabelas
export interface Category {
  id: string
  name: string
  description: string
  color: string
  member_count: number
  created_at: string
  updated_at: string
}

export interface Person {
  id: string
  name: string
  value: number | null
  category_id: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  date: string
  start_time: string
  end_time: string
  location: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface EventStaff {
  id: string
  event_id: string
  category_id: string
  quantity: number
  created_at: string
}

export interface Payment {
  id: string
  event_id: string
  person_id: string
  amount: number
  is_paid: boolean
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}