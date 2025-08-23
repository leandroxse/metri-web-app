// [ARQUIVO: use-people.ts]
// Função: Hook React para gerenciar pessoas por categoria
// Interações: usado por componentes de categoria e team-manager
// Observação: Fornece CRUD para pessoas via Supabase

"use client"

import { useState, useEffect } from 'react'
import type { Person } from '@/types/category'
// Usar Supabase em vez de API routes
import { personClientService } from '@/lib/supabase/client-services'

export function usePeople(categoryId?: string) {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar pessoas de uma categoria ou todas
  const loadPeople = async (catId?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Usar Supabase diretamente
      const data = catId 
        ? await personClientService.getByCategory(catId)
        : await personClientService.getAll()
      
      setPeople(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setPeople([])
    } finally {
      setLoading(false)
    }
  }

  // Adicionar nova pessoa
  const addPerson = async (personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Usar Supabase diretamente
      const newPerson = await personClientService.create(personData)
      
      if (!newPerson) {
        throw new Error('Erro ao adicionar pessoa')
      }

      setPeople(prev => [...prev, newPerson])
      return newPerson
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    }
  }

  // Atualizar pessoa existente
  const updatePerson = async (id: string, personData: Partial<Person>) => {
    try {
      // Usar Supabase diretamente
      const updatedPerson = await personClientService.update(id, personData)
      
      if (!updatedPerson) {
        throw new Error('Erro ao atualizar pessoa')
      }

      setPeople(prev => prev.map(person => 
        person.id === id ? updatedPerson : person
      ))
      return updatedPerson
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    }
  }

  // Excluir pessoa
  const deletePerson = async (id: string) => {
    try {
      // Usar Supabase diretamente
      const success = await personClientService.delete(id)
      
      if (!success) {
        throw new Error('Erro ao excluir pessoa')
      }

      setPeople(prev => prev.filter(person => person.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    }
  }

  // Carregar pessoas quando categoryId mudar ou na inicialização
  useEffect(() => {
    loadPeople(categoryId)
  }, [categoryId])

  return {
    people,
    loading,
    error,
    addPerson,
    updatePerson,
    deletePerson,
    loadPeople,
  }
}
