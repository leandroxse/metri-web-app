// Services do Supabase - Substitui o SQLite mantendo a mesma interface
// Otimizado para performance e error handling robusto
import { supabase } from './client'
import type { Category, Person, Event, EventStaff, Payment } from './client'

// Estender window para flag de recálculo
declare global {
  interface Window {
    __categoryCountersRecalculated?: boolean
  }
}

// Helper para logging de erros padronizado
const logError = (operation: string, error: any, context?: any) => {
  // Usar console.warn para evitar webpack errors em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ SUPABASE [${operation}]:`, {
      error: error.message || error,
      details: error.details || null,
      hint: error.hint || null,
      context: context || null,
      timestamp: new Date().toISOString()
    })
  } else {
    console.error(`❌ SUPABASE [${operation}]:`, {
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

// Helper para verificar conexão Supabase
let connectionChecked = false
const checkSupabaseConnection = async () => {
  if (connectionChecked) return
  
  try {
    const { error } = await supabase.from('categories').select('count').limit(1)
    if (error) {
      console.warn('🔒 Supabase:', error.hint || 'Conexão não disponível')
    } else {
      console.log('✅ Supabase conectado')
    }
    connectionChecked = true
  } catch (err) {
    console.warn('🔒 Supabase: Conexão não disponível')
    connectionChecked = true
  }
}

// Verificar conexão uma vez
if (typeof window !== 'undefined') {
  checkSupabaseConnection()
}

// Serviço de Categorias
export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, color, member_count, created_at, updated_at')
      .order('name')
    
    if (error) {
      logError('categoryService.getAll', error)
      return []
    }

    // Recalcular contadores uma vez (em background)
    if (typeof window !== 'undefined' && !window.__categoryCountersRecalculated) {
      window.__categoryCountersRecalculated = true
      setTimeout(() => {
        recalculateAllCategoryCounters()
      }, 1000) // Aguardar 1 segundo para não bloquear o carregamento
    }
    
    return data || []
  },

  async getById(id: string): Promise<Category | null> {
    if (!isValidUUID(id)) {
      logError('categoryService.getById', 'Invalid UUID format', { id })
      return null
    }

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, color, member_count, created_at, updated_at')
      .eq('id', id)
      .single()
    
    if (error) {
      logError('categoryService.getById', error, { id })
      return null
    }
    
    return data
  },

  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> {
    // Validações básicas
    if (!category.name?.trim()) {
      logError('categoryService.create', 'Name is required', { category })
      return null
    }

    // Mapear campos camelCase para snake_case
    const { memberCount, ...restCategory } = category as any
    const categoryData = {
      ...restCategory,
      member_count: memberCount || (category as any).member_count || 0
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select('id, name, description, color, member_count, created_at, updated_at')
      .single()
    
    if (error) {
      logError('categoryService.create', error, { category })
      return null
    }
    
    return data
  },

  async update(id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category | null> {
    if (!isValidUUID(id)) {
      logError('categoryService.update', 'Invalid UUID format', { id })
      return null
    }

    if (Object.keys(updates).length === 0) {
      logError('categoryService.update', 'No updates provided', { id, updates })
      return null
    }

    // Mapear campos camelCase para snake_case
    const { memberCount, ...restUpdates } = updates as any
    const categoryUpdates = {
      ...restUpdates,
      ...(memberCount !== undefined && { member_count: memberCount })
    }

    const { data, error } = await supabase
      .from('categories')
      .update(categoryUpdates)
      .eq('id', id)
      .select('id, name, description, color, member_count, created_at, updated_at')
      .single()
    
    if (error) {
      logError('categoryService.update', error, { id, updates })
      return null
    }
    
    return data
  },

  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) {
      logError('categoryService.delete', 'Invalid UUID format', { id })
      return false
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) {
      logError('categoryService.delete', error, { id })
      return false
    }
    
    return true
  }
}

// Helper para atualizar contador de pessoas na categoria
const updateCategoryMemberCount = async (categoryId: string) => {
  if (!isValidUUID(categoryId)) return

  try {
    // Contar pessoas nesta categoria
    const { data: people, error: countError } = await supabase
      .from('people')
      .select('id')
      .eq('category_id', categoryId)
    
    if (countError) {
      logError('updateCategoryMemberCount - count', countError, { categoryId })
      return
    }

    const memberCount = people?.length || 0

    // Atualizar o contador na categoria
    const { error: updateError } = await supabase
      .from('categories')
      .update({ member_count: memberCount })
      .eq('id', categoryId)

    if (updateError) {
      logError('updateCategoryMemberCount - update', updateError, { categoryId, memberCount })
    } else {
      console.log(`✅ Updated category ${categoryId} member_count to ${memberCount}`)
    }
  } catch (error) {
    logError('updateCategoryMemberCount', error, { categoryId })
  }
}

// Helper para recalcular todos os contadores (usar uma vez para corrigir dados existentes)
const recalculateAllCategoryCounters = async () => {
  try {
    console.log('🔄 Recalculando todos os contadores de categorias...')
    
    // Buscar todas as categorias
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
    
    if (categoriesError) {
      logError('recalculateAllCategoryCounters - categories', categoriesError)
      return
    }

    // Atualizar contador de cada categoria
    for (const category of categories || []) {
      await updateCategoryMemberCount(category.id)
    }
    
    console.log('✅ Todos os contadores recalculados!')
  } catch (error) {
    logError('recalculateAllCategoryCounters', error)
  }
}

// Serviço de Pessoas
export const personService = {
  async getAll(): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('id, name, value, category_id, created_at, updated_at')
      .order('name')
    
    if (error) {
      logError('personService.getAll', error)
      return []
    }
    
    return data || []
  },

  async getByCategory(categoryId: string): Promise<Person[]> {
    if (!isValidUUID(categoryId)) {
      logError('personService.getByCategory', 'Invalid UUID format', { categoryId })
      return []
    }

    const { data, error } = await supabase
      .from('people')
      .select('id, name, value, category_id, created_at, updated_at')
      .eq('category_id', categoryId)
      .order('name')
    
    if (error) {
      logError('personService.getByCategory', error, { categoryId })
      return []
    }
    
    return data || []
  },

  async getById(id: string): Promise<Person | null> {
    if (!isValidUUID(id)) {
      logError('personService.getById', 'Invalid UUID format', { id })
      return null
    }

    const { data, error } = await supabase
      .from('people')
      .select('id, name, value, category_id, created_at, updated_at')
      .eq('id', id)
      .single()
    
    if (error) {
      logError('personService.getById', error, { id })
      return null
    }
    
    return data
  },

  async create(person: Omit<Person, 'id' | 'created_at' | 'updated_at'>): Promise<Person | null> {
    // Validações básicas
    if (!person.name?.trim()) {
      logError('personService.create', 'Name is required', { person })
      return null
    }

    // Mapear campos camelCase para snake_case e validar
    const { categoryId, ...restPerson } = person as any
    const categoryIdValue = categoryId || person.category_id
    
    console.log('🔍 Person data received:', { person, categoryId, categoryIdValue })
    
    if (!isValidUUID(categoryIdValue)) {
      logError('personService.create', 'Invalid category_id UUID format', { person, categoryId, categoryIdValue })
      return null
    }

    const personData = {
      ...restPerson,
      category_id: categoryIdValue
    }

    const { data, error } = await supabase
      .from('people')
      .insert([personData])
      .select('id, name, value, category_id, created_at, updated_at')
      .single()
    
    if (error) {
      logError('personService.create', error, { person })
      return null
    }

    if (data) {
      // Atualizar contador da categoria
      await updateCategoryMemberCount(categoryIdValue)
    }
    
    return data
  },

  async update(id: string, updates: Partial<Omit<Person, 'id' | 'created_at' | 'updated_at'>>): Promise<Person | null> {
    if (!isValidUUID(id)) {
      logError('personService.update', 'Invalid UUID format', { id })
      return null
    }

    if (Object.keys(updates).length === 0) {
      logError('personService.update', 'No updates provided', { id, updates })
      return null
    }

    // Mapear campos camelCase para snake_case
    const { categoryId, ...restUpdates } = updates as any
    const personUpdates = {
      ...restUpdates,
      ...(categoryId !== undefined && { category_id: categoryId })
    }

    // Validar category_id se estiver sendo atualizado
    const categoryIdToValidate = personUpdates.category_id || updates.category_id
    if (categoryIdToValidate && !isValidUUID(categoryIdToValidate)) {
      logError('personService.update', 'Invalid category_id UUID format', { id, updates, categoryIdToValidate })
      return null
    }

    // Se está mudando de categoria, obter a categoria anterior
    let oldCategoryId = null
    if (personUpdates.category_id) {
      const { data: oldData } = await supabase
        .from('people')
        .select('category_id')
        .eq('id', id)
        .single()
      oldCategoryId = oldData?.category_id
    }

    const { data, error } = await supabase
      .from('people')
      .update(personUpdates)
      .eq('id', id)
      .select('id, name, value, category_id, created_at, updated_at')
      .single()
    
    if (error) {
      logError('personService.update', error, { id, updates })
      return null
    }

    if (data && personUpdates.category_id) {
      // Atualizar contador da categoria nova
      await updateCategoryMemberCount(data.category_id)
      
      // Se mudou de categoria, atualizar contador da categoria anterior
      if (oldCategoryId && oldCategoryId !== data.category_id) {
        await updateCategoryMemberCount(oldCategoryId)
      }
    }
    
    return data
  },

  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) {
      logError('personService.delete', 'Invalid UUID format', { id })
      return false
    }

    // Obter a categoria antes de deletar
    const { data: personData } = await supabase
      .from('people')
      .select('category_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id)
    
    if (error) {
      logError('personService.delete', error, { id })
      return false
    }

    // Atualizar contador da categoria
    if (personData?.category_id) {
      await updateCategoryMemberCount(personData.category_id)
    }
    
    return true
  }
}

// Serviço de Eventos
export const eventService = {
  async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id, title, description, date, start_time, end_time, location, status, guest_count, price_per_person, created_at, updated_at,
        event_staff (
          category_id,
          quantity
        )
      `)
      .order('date', { ascending: false })
      .order('start_time')

    if (error) {
      logError('eventService.getAll', error)
      return []
    }

    // Transformar os dados para incluir staffAssignments
    const events = (data || []).map(event => ({
      ...event,
      staffAssignments: (event.event_staff || []).map(staff => ({
        category_id: staff.category_id,
        count: staff.quantity
      }))
    }))

    // Remover event_staff do objeto final
    return events.map(({ event_staff, ...event }) => event) as Event[]
  },

  async getById(id: string): Promise<Event | null> {
    if (!isValidUUID(id)) {
      logError('eventService.getById', 'Invalid UUID format', { id })
      return null
    }

    const { data, error } = await supabase
      .from('events')
      .select(`
        id, title, description, date, start_time, end_time, location, status, guest_count, price_per_person, created_at, updated_at,
        event_staff (
          category_id,
          quantity
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      logError('eventService.getById', error, { id })
      return null
    }

    if (!data) return null

    // Transformar os dados para incluir staffAssignments
    const event = {
      ...data,
      staffAssignments: (data.event_staff || []).map(staff => ({
        category_id: staff.category_id,
        count: staff.quantity
      }))
    }

    // Remover event_staff do objeto final
    const { event_staff, ...finalEvent } = event
    return finalEvent as Event
  },

  async create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> {
    // Validações básicas
    if (!event.title?.trim()) {
      logError('eventService.create', 'Title is required', { event })
      return null
    }
    if (!event.date) {
      logError('eventService.create', 'Date is required', { event })
      return null
    }

    // Separar staffAssignments do event e converter campos camelCase para snake_case
    const { staffAssignments, startTime, endTime, guestCount, pricePerPerson, ...restEventData } = event as any
    const eventData = {
      ...restEventData,
      start_time: startTime || event.start_time || null,
      end_time: endTime || event.end_time || null,
      guest_count: guestCount !== undefined ? guestCount : event.guest_count || null,
      price_per_person: pricePerPerson !== undefined ? pricePerPerson : event.price_per_person || null
    }

    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select('id, title, description, date, start_time, end_time, location, status, guest_count, price_per_person, created_at, updated_at')
      .single()

    if (error) {
      logError('eventService.create', error, { event })
      return null
    }

    if (!data) return null

    // Se há staff assignments, criar os registros na tabela event_staff
    if (staffAssignments && staffAssignments.length > 0) {
      const staffData = staffAssignments.map(staff => ({
        event_id: data.id,
        category_id: staff.category_id || (staff as any).categoryId,
        quantity: staff.count
      }))

      const { error: staffError } = await supabase
        .from('event_staff')
        .insert(staffData)

      if (staffError) {
        logError('eventService.create - staff assignments', staffError, { eventId: data.id, staffData })
        // Continuar mesmo com erro no staff, o evento foi criado
      }
    }

    // Retornar o evento com staffAssignments
    return {
      ...data,
      staffAssignments: staffAssignments || []
    } as Event
  },

  async update(id: string, updates: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>): Promise<Event | null> {
    if (!isValidUUID(id)) {
      logError('eventService.update', 'Invalid UUID format', { id })
      return null
    }

    if (Object.keys(updates).length === 0) {
      logError('eventService.update', 'No updates provided', { id, updates })
      return null
    }

    // Separar staffAssignments dos updates e converter campos camelCase para snake_case
    const { staffAssignments, startTime, endTime, guestCount, pricePerPerson, ...restUpdates } = updates as any
    const eventUpdates = {
      ...restUpdates,
      ...(startTime !== undefined && { start_time: startTime || null }),
      ...(endTime !== undefined && { end_time: endTime || null }),
      ...(guestCount !== undefined && { guest_count: guestCount }),
      ...(pricePerPerson !== undefined && { price_per_person: pricePerPerson })
    }

    const { data, error } = await supabase
      .from('events')
      .update(eventUpdates)
      .eq('id', id)
      .select(`
        id, title, description, date, start_time, end_time, location, status, guest_count, price_per_person, created_at, updated_at,
        event_staff (
          category_id,
          quantity
        )
      `)
      .single()

    if (error) {
      logError('eventService.update', error, { id, updates })
      return null
    }

    if (!data) return null

    // Se staffAssignments foram fornecidos, atualizar na tabela event_staff
    if (staffAssignments !== undefined) {
      // Primeiro, deletar todos os staff assignments existentes
      await supabase
        .from('event_staff')
        .delete()
        .eq('event_id', id)

      // Depois, inserir os novos (se houver)
      if (staffAssignments.length > 0) {
        const staffData = staffAssignments.map(staff => ({
          event_id: id,
          category_id: staff.category_id || (staff as any).categoryId,
          quantity: staff.count
        }))

        const { error: staffError } = await supabase
          .from('event_staff')
          .insert(staffData)

        if (staffError) {
          logError('eventService.update - staff assignments', staffError, { eventId: id, staffData })
        }
      }
    }

    // Transformar os dados para incluir staffAssignments
    const event = {
      ...data,
      staffAssignments: staffAssignments !== undefined
        ? staffAssignments
        : (data.event_staff || []).map(staff => ({
            category_id: staff.category_id,
            count: staff.quantity
          }))
    }

    // Remover event_staff do objeto final
    const { event_staff, ...finalEvent } = event
    return finalEvent as Event
  },

  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) {
      logError('eventService.delete', 'Invalid UUID format', { id })
      return false
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
    
    if (error) {
      logError('eventService.delete', error, { id })
      return false
    }
    
    return true
  }
}

// Serviço de Staff do Evento
export const eventStaffService = {
  async getByEvent(eventId: string): Promise<EventStaff[]> {
    if (!isValidUUID(eventId)) {
      logError('eventStaffService.getByEvent', 'Invalid UUID format', { eventId })
      return []
    }

    const { data, error } = await supabase
      .from('event_staff')
      .select('id, event_id, category_id, quantity, created_at')
      .eq('event_id', eventId)
    
    if (error) {
      logError('eventStaffService.getByEvent', error, { eventId })
      return []
    }
    
    return data || []
  },

  async upsert(eventId: string, categoryId: string, quantity: number): Promise<EventStaff | null> {
    if (!isValidUUID(eventId)) {
      logError('eventStaffService.upsert', 'Invalid eventId UUID format', { eventId, categoryId, quantity })
      return null
    }
    if (!isValidUUID(categoryId)) {
      logError('eventStaffService.upsert', 'Invalid categoryId UUID format', { eventId, categoryId, quantity })
      return null
    }
    if (quantity <= 0) {
      logError('eventStaffService.upsert', 'Quantity must be positive', { eventId, categoryId, quantity })
      return null
    }

    const { data, error } = await supabase
      .from('event_staff')
      .upsert([
        {
          event_id: eventId,
          category_id: categoryId,
          quantity
        }
      ])
      .select('id, event_id, category_id, quantity, created_at')
      .single()
    
    if (error) {
      logError('eventStaffService.upsert', error, { eventId, categoryId, quantity })
      return null
    }
    
    return data
  },

  async deleteByEvent(eventId: string): Promise<boolean> {
    if (!isValidUUID(eventId)) {
      logError('eventStaffService.deleteByEvent', 'Invalid UUID format', { eventId })
      return false
    }

    const { error } = await supabase
      .from('event_staff')
      .delete()
      .eq('event_id', eventId)
    
    if (error) {
      logError('eventStaffService.deleteByEvent', error, { eventId })
      return false
    }
    
    return true
  }
}

// Serviço de Pagamentos
export const paymentService = {
  async getAll(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('id, event_id, person_id, amount, is_paid, paid_at, notes, created_at, updated_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      logError('paymentService.getAll', error)
      return []
    }
    
    return data || []
  },

  async getByEvent(eventId: string): Promise<Payment[]> {
    if (!isValidUUID(eventId)) {
      logError('paymentService.getByEvent', 'Invalid UUID format', { eventId })
      return []
    }

    const { data, error } = await supabase
      .from('payments')
      .select('id, event_id, person_id, amount, is_paid, paid_at, notes, created_at, updated_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    
    if (error) {
      logError('paymentService.getByEvent', error, { eventId })
      return []
    }
    
    return data || []
  },

  async create(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> {
    // Validações básicas
    if (!isValidUUID(payment.event_id)) {
      logError('paymentService.create', 'Invalid event_id UUID format', { payment })
      return null
    }
    if (!isValidUUID(payment.person_id)) {
      logError('paymentService.create', 'Invalid person_id UUID format', { payment })
      return null
    }
    if (payment.amount <= 0) {
      logError('paymentService.create', 'Amount must be positive', { payment })
      return null
    }

    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select('id, event_id, person_id, amount, is_paid, paid_at, notes, created_at, updated_at')
      .single()
    
    if (error) {
      logError('paymentService.create', error, { payment })
      return null
    }
    
    return data
  },

  async update(id: string, updates: Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>): Promise<Payment | null> {
    if (!isValidUUID(id)) {
      logError('paymentService.update', 'Invalid UUID format', { id })
      return null
    }

    if (Object.keys(updates).length === 0) {
      logError('paymentService.update', 'No updates provided', { id, updates })
      return null
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select('id, event_id, person_id, amount, is_paid, paid_at, notes, created_at, updated_at')
      .single()
    
    if (error) {
      logError('paymentService.update', error, { id, updates })
      return null
    }
    
    return data
  },

  async markAsPaid(id: string): Promise<Payment | null> {
    if (!isValidUUID(id)) {
      logError('paymentService.markAsPaid', 'Invalid UUID format', { id })
      return null
    }

    const { data, error } = await supabase
      .from('payments')
      .update({
        is_paid: true,
        paid_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, event_id, person_id, amount, is_paid, paid_at, notes, created_at, updated_at')
      .single()
    
    if (error) {
      logError('paymentService.markAsPaid', error, { id })
      return null
    }
    
    return data
  },

  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) {
      logError('paymentService.delete', 'Invalid UUID format', { id })
      return false
    }

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
    
    if (error) {
      logError('paymentService.delete', error, { id })
      return false
    }
    
    return true
  }
}

// 🏆 EVENT TEAMS SERVICE - Gerenciar equipes dos eventos
export const eventTeamService = {
  // Buscar equipe de um evento específico
  async getEventTeam(eventId: string): Promise<Person[]> {
    if (!isValidUUID(eventId)) {
      logError('eventTeamService.getEventTeam', 'Invalid UUID format', { eventId })
      return []
    }

    try {
      // 1. Buscar person_ids da equipe do evento
      const { data: teamData, error: teamError } = await supabase
        .from('event_teams')
        .select('person_id')
        .eq('event_id', eventId)

      if (teamError) {
        logError('eventTeamService.getEventTeam - team query', teamError, { eventId })
        return []
      }

      if (!teamData || teamData.length === 0) {
        return []
      }

      // 2. Buscar os dados completos das pessoas
      const personIds = teamData.map(item => item.person_id)
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('id, name, value, category_id, created_at, updated_at')
        .in('id', personIds)

      if (peopleError) {
        logError('eventTeamService.getEventTeam - people query', peopleError, { eventId, personIds })
        return []
      }

      return peopleData || []
    } catch (error) {
      logError('eventTeamService.getEventTeam', error, { eventId })
      return []
    }
  },

  // Salvar equipe completa de um evento (substitui localStorage)
  async saveEventTeam(eventId: string, personIds: string[]): Promise<boolean> {
    if (!isValidUUID(eventId)) {
      logError('eventTeamService.saveEventTeam', 'Invalid UUID format', { eventId })
      return false
    }

    try {
      // 1. Deletar equipe atual do evento
      const { error: deleteError } = await supabase
        .from('event_teams')
        .delete()
        .eq('event_id', eventId)

      if (deleteError) {
        logError('eventTeamService.saveEventTeam - delete', deleteError, { eventId })
        return false
      }

      // 2. Inserir nova equipe (se houver pessoas)
      if (personIds.length > 0) {
        const teamData = personIds.map(personId => ({
          event_id: eventId,
          person_id: personId
        }))

        const { error: insertError } = await supabase
          .from('event_teams')
          .insert(teamData)

        if (insertError) {
          logError('eventTeamService.saveEventTeam - insert', insertError, { eventId, personIds })
          return false
        }
      }

      return true
    } catch (error) {
      logError('eventTeamService.saveEventTeam', error, { eventId, personIds })
      return false
    }
  },

  // Adicionar pessoa à equipe
  async addPersonToTeam(eventId: string, personId: string): Promise<boolean> {
    if (!isValidUUID(eventId) || !isValidUUID(personId)) {
      logError('eventTeamService.addPersonToTeam', 'Invalid UUID format', { eventId, personId })
      return false
    }

    try {
      const { error } = await supabase
        .from('event_teams')
        .insert([{
          event_id: eventId,
          person_id: personId
        }])

      if (error) {
        logError('eventTeamService.addPersonToTeam', error, { eventId, personId })
        return false
      }

      return true
    } catch (error) {
      logError('eventTeamService.addPersonToTeam', error, { eventId, personId })
      return false
    }
  },

  // Remover pessoa da equipe
  async removePersonFromTeam(eventId: string, personId: string): Promise<boolean> {
    if (!isValidUUID(eventId) || !isValidUUID(personId)) {
      logError('eventTeamService.removePersonFromTeam', 'Invalid UUID format', { eventId, personId })
      return false
    }

    try {
      const { error } = await supabase
        .from('event_teams')
        .delete()
        .eq('event_id', eventId)
        .eq('person_id', personId)

      if (error) {
        logError('eventTeamService.removePersonFromTeam', error, { eventId, personId })
        return false
      }

      return true
    } catch (error) {
      logError('eventTeamService.removePersonFromTeam', error, { eventId, personId })
      return false
    }
  }
}

// Exportar todos os services
export default {
  categories: categoryService,
  people: personService,
  events: eventService,
  eventStaff: eventStaffService,
  payments: paymentService,
  eventTeams: eventTeamService
}