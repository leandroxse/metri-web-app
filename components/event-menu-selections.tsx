"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Check } from "lucide-react"

interface EventMenuSelectionsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  eventName: string
}

interface CategoryWithSelections {
  id: string
  name: string
  recommended_count: number
  order_index: number
  selectedItems: Array<{
    id: string
    name: string
  }>
}

export function EventMenuSelections({
  open,
  onOpenChange,
  eventId,
  eventName
}: EventMenuSelectionsProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryWithSelections[]>([])
  const [menuName, setMenuName] = useState<string>("")

  useEffect(() => {
    if (open) {
      loadSelections()
    }
  }, [open, eventId])

  const loadSelections = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Buscar event_menu do evento
      const { data: eventMenu, error: eventMenuError } = await supabase
        .from('event_menus')
        .select('id, menu_id, menus(name)')
        .eq('event_id', eventId)
        .single()

      if (eventMenuError || !eventMenu) {
        setError('Nenhum cardápio vinculado a este evento')
        setLoading(false)
        return
      }

      setMenuName((eventMenu as any).menus.name)

      // 2. Buscar seleções do cliente
      const { data: selections, error: selectionsError } = await supabase
        .from('menu_selections')
        .select('item_id')
        .eq('event_menu_id', eventMenu.id)

      if (selectionsError) throw selectionsError

      const selectedItemIds = new Set(selections?.map(s => s.item_id) || [])

      // 3. Buscar categorias com todos os itens
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select(`
          id,
          name,
          recommended_count,
          order_index,
          items:menu_items(
            id,
            name,
            order_index
          )
        `)
        .eq('menu_id', eventMenu.menu_id)
        .order('order_index', { ascending: true })

      if (categoriesError) throw categoriesError

      // 4. Filtrar apenas itens selecionados
      const categoriesWithSelections = categoriesData
        .map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          recommended_count: cat.recommended_count,
          order_index: cat.order_index,
          selectedItems: cat.items
            .filter((item: any) => selectedItemIds.has(item.id))
            .sort((a: any, b: any) => a.order_index - b.order_index)
        }))
        .filter(cat => cat.selectedItems.length > 0) // Mostrar apenas categorias com seleções

      setCategories(categoriesWithSelections)
    } catch (err) {
      console.error('Erro ao carregar seleções:', err)
      setError('Erro ao carregar as seleções do cliente')
    } finally {
      setLoading(false)
    }
  }

  const totalSelections = categories.reduce((sum, cat) => sum + cat.selectedItems.length, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            Seleções do Cliente - {eventName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-1">Nenhuma seleção ainda</p>
            <p className="text-xs text-muted-foreground">
              O cliente ainda não fez suas escolhas no cardápio
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Header com resumo */}
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">{menuName}</p>
                <p className="text-xs text-muted-foreground">
                  {totalSelections} {totalSelections === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
            </div>

            {/* Lista de categorias com seleções */}
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {category.selectedItems.length} selecionado{category.selectedItems.length !== 1 ? 's' : ''}
                    </Badge>
                    {category.recommended_count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Recomendado: {category.recommended_count}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {category.selectedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <span className="text-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
