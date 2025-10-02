"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface MenuViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuId: string
  menuName: string
}

interface CategoryWithItems {
  id: string
  name: string
  recommended_count: number
  order_index: number
  items: Array<{
    id: string
    name: string
    description: string | null
    order_index: number
  }>
}

export function MenuViewer({ open, onOpenChange, menuId, menuName }: MenuViewerProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryWithItems[]>([])

  useEffect(() => {
    if (open && menuId) {
      loadMenuData()
    }
  }, [open, menuId])

  const loadMenuData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select(`
          id,
          name,
          recommended_count,
          order_index,
          items:menu_items(
            id,
            name,
            description,
            order_index
          )
        `)
        .eq('menu_id', menuId)
        .order('order_index', { ascending: true })

      if (error) throw error

      // Ordenar itens dentro de cada categoria
      const sortedCategories = (data || []).map(cat => ({
        ...cat,
        items: (cat.items || []).sort((a: any, b: any) => a.order_index - b.order_index)
      }))

      setCategories(sortedCategories as CategoryWithItems[])
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            {menuName}
          </DialogTitle>
          <DialogDescription>
            Visualização do cardápio completo
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma categoria encontrada neste cardápio
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <Card key={category.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.recommended_count > 0 && (
                      <Badge variant="outline">
                        Recomendado: {category.recommended_count}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {category.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum item nesta categoria</p>
                  ) : (
                    <ul className="space-y-2">
                      {category.items.map((item, index) => (
                        <li key={item.id} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground font-medium min-w-[1.5rem]">
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span>
                            {item.description && (
                              <p className="text-muted-foreground text-xs mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
