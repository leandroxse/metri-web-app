import { supabase } from './client'
import type { Menu, MenuCategory, MenuItem, MenuFormData, MenuCategoryFormData, MenuItemFormData } from '@/types/menu'
import type { ParsedMenu } from '@/lib/utils/menu-text-parser'

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
  },

  // Criar cardápio completo a partir de texto parseado
  async createFromParsedText(parsedData: ParsedMenu): Promise<string | null> {
    try {
      // 1. Criar o cardápio
      const menu = await this.create({
        name: parsedData.menuName,
        description: `Importado via texto - ${parsedData.categories.length} categorias`,
        status: 'active'
      })

      if (!menu) {
        throw new Error('Falha ao criar cardápio')
      }

      // 2. Criar categorias e itens
      for (let catIndex = 0; catIndex < parsedData.categories.length; catIndex++) {
        const parsedCategory = parsedData.categories[catIndex]

        const category = await menuCategoryService.create({
          menu_id: menu.id,
          name: parsedCategory.name,
          order_index: catIndex
        })

        if (!category) {
          throw new Error(`Falha ao criar categoria: ${parsedCategory.name}`)
        }

        // 3. Criar itens da categoria
        for (let itemIndex = 0; itemIndex < parsedCategory.items.length; itemIndex++) {
          const parsedItem = parsedCategory.items[itemIndex]

          await menuItemService.create({
            category_id: category.id,
            name: parsedItem.name,
            description: parsedItem.description || null,
            image_url: null,
            order_index: itemIndex
          })
        }
      }

      return menu.id
    } catch (error) {
      console.error('Erro ao criar cardápio completo:', error)
      throw error
    }
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
