import { supabase } from './client'
import type { Menu, MenuCategory, MenuItem, MenuFormData, MenuCategoryFormData, MenuItemFormData } from '@/types/menu'

// ============= MENUS =============
export const menuService = {
  async getAll(): Promise<Menu[]> {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar cardápios:', error)
      return []
    }

    return data || []
  },

  async getById(id: string): Promise<Menu | null> {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar cardápio:', error)
      return null
    }

    return data
  },

  async create(menuData: MenuFormData): Promise<Menu | null> {
    const { data, error } = await supabase
      .from('menus')
      .insert(menuData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar cardápio:', error)
      return null
    }

    return data
  },

  async update(id: string, menuData: Partial<MenuFormData>): Promise<Menu | null> {
    const { data, error } = await supabase
      .from('menus')
      .update({ ...menuData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar cardápio:', error)
      return null
    }

    return data
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar cardápio:', error)
      return false
    }

    return true
  }
}

// ============= CATEGORIES =============
export const menuCategoryService = {
  async getByMenuId(menuId: string): Promise<MenuCategory[]> {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('menu_id', menuId)
      .order('order_index')

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return []
    }

    return data || []
  },

  async create(categoryData: MenuCategoryFormData): Promise<MenuCategory | null> {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar categoria:', error)
      return null
    }

    return data
  },

  async update(id: string, categoryData: Partial<MenuCategoryFormData>): Promise<MenuCategory | null> {
    const { data, error } = await supabase
      .from('menu_categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar categoria:', error)
      return null
    }

    return data
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar categoria:', error)
      return false
    }

    return true
  }
}

// ============= ITEMS =============
export const menuItemService = {
  async getByCategoryId(categoryId: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index')

    if (error) {
      console.error('Erro ao buscar itens:', error)
      return []
    }

    return data || []
  },

  async create(itemData: MenuItemFormData): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(itemData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar item:', error)
      return null
    }

    return data
  },

  async update(id: string, itemData: Partial<MenuItemFormData>): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from('menu_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar item:', error)
      return null
    }

    return data
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar item:', error)
      return false
    }

    return true
  }
}
