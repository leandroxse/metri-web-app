// Types para o sistema de cardápios

export interface Menu {
  id: string
  name: string
  description: string | null
  status: 'active' | 'inactive' | 'archived'
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: string
  menu_id: string
  name: string
  recommended_count: number
  order_index: number
  created_at: string
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string | null
  image_url: string | null
  order_index: number
  created_at: string
}

export interface EventMenu {
  id: string
  event_id: string
  menu_id: string
  share_token: string
  created_at: string
}

export interface MenuSelection {
  id: string
  event_menu_id: string
  item_id: string
  notes: string | null
  created_at: string
}

// Types para formulários
export type MenuFormData = Omit<Menu, 'id' | 'created_at' | 'updated_at'>
export type MenuCategoryFormData = Omit<MenuCategory, 'id' | 'created_at'>
export type MenuItemFormData = Omit<MenuItem, 'id' | 'created_at'>
