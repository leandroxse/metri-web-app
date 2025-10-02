"use client"

import { useState, useEffect } from "react"
import type { Menu, MenuFormData } from "@/types/menu"
import { menuService } from "@/lib/supabase/menu-services"

export function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMenus()
  }, [])

  const loadMenus = async () => {
    try {
      setLoading(true)
      const data = await menuService.getAll()
      setMenus(data)
    } catch (error) {
      console.error("Error loading menus:", error)
      setError(error instanceof Error ? error.message : "Failed to load menus")
    } finally {
      setLoading(false)
    }
  }

  const addMenu = async (menuData: MenuFormData) => {
    try {
      const newMenu = await menuService.create(menuData)

      if (newMenu) {
        setMenus((prev) => [newMenu, ...prev])
      }
    } catch (error) {
      console.error("Error adding menu:", error)
      setError(error instanceof Error ? error.message : "Failed to add menu")
    }
  }

  const updateMenu = async (id: string, menuData: Partial<MenuFormData>) => {
    try {
      const updatedMenu = await menuService.update(id, menuData)

      if (!updatedMenu) throw new Error("Failed to update menu")

      setMenus((prev) =>
        prev.map((menu) => menu.id === id ? updatedMenu : menu)
      )
    } catch (error) {
      console.error("Error updating menu:", error)
      setError(error instanceof Error ? error.message : "Failed to update menu")
    }
  }

  const deleteMenu = async (id: string) => {
    try {
      const success = await menuService.delete(id)

      if (!success) throw new Error("Failed to delete menu")

      setMenus((prev) => prev.filter((menu) => menu.id !== id))
    } catch (error) {
      console.error("Error deleting menu:", error)
      setError(error instanceof Error ? error.message : "Failed to delete menu")
    }
  }

  const getMenuById = (id: string) => {
    return menus.find((menu) => menu.id === id)
  }

  return {
    menus,
    loading,
    error,
    addMenu,
    updateMenu,
    deleteMenu,
    getMenuById,
    refetch: loadMenus,
  }
}
