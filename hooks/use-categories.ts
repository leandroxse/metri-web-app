"use client"

import { useState, useEffect } from "react"
import type { Category } from "@/types/category"
// Usar Supabase em vez do SQLite
import { categoryClientService } from "@/lib/supabase/client-services"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      
      // Usar o serviço local para obter categorias
      const data = await categoryClientService.getAll()
      setCategories(data)
    } catch (error) {
      console.error("Error loading categories:", error)
      setError(error instanceof Error ? error.message : "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Usar o serviço local para adicionar categoria
      const newCategory = await categoryClientService.create(categoryData)
      
      if (newCategory) {
        setCategories((prev) => [...prev, newCategory])
      }
    } catch (error) {
      console.error("Error adding category:", error)
      setError(error instanceof Error ? error.message : "Failed to add category")
    }
  }

  const updateCategory = async (id: string, categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Usar o serviço local para atualizar categoria
      const updatedCategory = await categoryClientService.update(id, categoryData)
      
      if (!updatedCategory) throw new Error("Failed to update category")

      setCategories((prev) =>
        prev.map((category) =>
          category.id === id ? updatedCategory : category
        )
      )
    } catch (error) {
      console.error("Error updating category:", error)
      setError(error instanceof Error ? error.message : "Failed to update category")
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      // Usar o serviço local para excluir categoria
      const success = await categoryClientService.delete(id)
      
      if (!success) throw new Error("Failed to delete category")

      setCategories((prev) => prev.filter((category) => category.id !== id))
    } catch (error) {
      console.error("Error deleting category:", error)
      setError(error instanceof Error ? error.message : "Failed to delete category")
    }
  }

  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id)
  }

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    refetch: loadCategories,
  }
}
