"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChefHat, Calendar, AlertCircle, Check } from "lucide-react"
import { CategoryStepper } from "@/components/wizard/category-stepper"
import { MenuItemGrid } from "@/components/wizard/menu-item-grid"
import { SelectionSummary } from "@/components/wizard/selection-summary"

interface MenuData {
  menu: {
    id: string
    name: string
    description: string
  }
  event: {
    id: string
    title: string
    date: string
  }
  categories: Array<{
    id: string
    name: string
    recommended_count: number
    order_index: number
    items: Array<{
      id: string
      name: string
      description: string
      image_url: string | null
      order_index: number
    }>
  }>
}

export default function MenuWizardPage() {
  const params = useParams()
  const eventId = params.id as string
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [selections, setSelections] = useState<Set<string>>(new Set())
  const [eventMenuId, setEventMenuId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadMenuData()
  }, [eventId, token])

  const loadMenuData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Verificar token e obter event_menu
      const { data: eventMenu, error: eventMenuError } = await supabase
        .from('event_menus')
        .select('id, event_id, menu_id')
        .eq('event_id', eventId)
        .eq('share_token', token)
        .single()

      if (eventMenuError || !eventMenu) {
        setError('Link inválido ou expirado')
        return
      }

      setEventMenuId(eventMenu.id)

      // 2. Buscar dados do evento
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, title, date')
        .eq('id', eventMenu.event_id)
        .single()

      if (eventError) throw eventError

      // 3. Buscar dados do menu
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .select('id, name, description')
        .eq('id', eventMenu.menu_id)
        .single()

      if (menuError) throw menuError

      // 4. Buscar categorias com itens
      const { data: categories, error: categoriesError } = await supabase
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
            image_url,
            order_index
          )
        `)
        .eq('menu_id', eventMenu.menu_id)
        .order('order_index', { ascending: true })

      if (categoriesError) throw categoriesError

      // Ordenar itens dentro de cada categoria
      const sortedCategories = categories.map(cat => ({
        ...cat,
        items: cat.items.sort((a: any, b: any) => a.order_index - b.order_index)
      }))

      setMenuData({
        menu,
        event,
        categories: sortedCategories as any
      })

      // 5. Carregar seleções existentes (se houver)
      const { data: existingSelections } = await supabase
        .from('menu_selections')
        .select('item_id')
        .eq('event_menu_id', eventMenu.id)

      if (existingSelections && existingSelections.length > 0) {
        setSelections(new Set(existingSelections.map(s => s.item_id)))
      }

    } catch (err) {
      console.error('Erro ao carregar cardápio:', err)
      setError('Erro ao carregar o cardápio')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleItem = (itemId: string) => {
    const newSelections = new Set(selections)
    if (newSelections.has(itemId)) {
      newSelections.delete(itemId)
    } else {
      newSelections.add(itemId)
    }
    setSelections(newSelections)
  }

  const handleSubmit = async () => {
    if (!eventMenuId) return

    try {
      // 1. Deletar seleções antigas
      await supabase
        .from('menu_selections')
        .delete()
        .eq('event_menu_id', eventMenuId)

      // 2. Inserir novas seleções
      if (selections.size > 0) {
        const selectionsData = Array.from(selections).map(itemId => ({
          event_menu_id: eventMenuId,
          item_id: itemId
        }))

        await supabase
          .from('menu_selections')
          .insert(selectionsData)
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Erro ao salvar seleções:', error)
      alert('Erro ao salvar suas escolhas. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-responsive mx-auto px-3 py-6 md:px-6 lg:px-8">
          <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ops!</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Seleções Enviadas!</h2>
            <p className="text-muted-foreground mb-4">
              Suas escolhas foram salvas com sucesso.
            </p>
            <p className="text-sm text-muted-foreground">
              Você selecionou {selections.size} {selections.size === 1 ? 'item' : 'itens'}.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!menuData) return null

  const activeCategory = menuData.categories[activeCategoryIndex]
  const categorySelections = activeCategory?.items.filter(item => selections.has(item.id)).length || 0

  return (
    <div className="min-h-screen bg-background !pb-24 md:!pb-6 !pt-0">
      {/* Clean Header */}
      <div className="bg-card border-b sticky top-0 z-30 shadow-sm">
        <div className="container-responsive mx-auto px-4 py-3 md:py-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg md:text-xl font-bold text-foreground">
                  Monte seu Cardápio
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {menuData.event.title}
                </p>
              </div>
            </div>

            {/* Título da Categoria - Centralizado */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {activeCategory.name}
                </h2>
                {activeCategory.recommended_count > 0 && (
                  <Badge variant="secondary" className="text-xs md:text-sm">
                    Recomendado: {activeCategory.recommended_count}
                  </Badge>
                )}
              </div>
            </div>

            <Badge variant="outline" className="hidden md:flex flex-shrink-0">
              {menuData.menu.name}
            </Badge>
          </div>

          {/* Mobile: Event title */}
          <p className="md:hidden text-xs text-muted-foreground mt-2 text-center">
            {menuData.event.title}
          </p>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-card border-b shadow-sm sticky top-[68px] md:top-[76px] z-20">
        <div className="container-responsive mx-auto px-4 py-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {menuData.categories.map((cat, index) => {
              const isActive = index === activeCategoryIndex
              const isPast = index < activeCategoryIndex
              const selectionCount = cat.items.filter(item => selections.has(item.id)).length
              const isSkipped = isPast && selectionCount === 0

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryIndex(index)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full transition-all flex-shrink-0
                    ${isActive ? 'bg-primary text-primary-foreground shadow-lg scale-105' :
                      isSkipped ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-2 border-amber-400/50' :
                      isPast ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      'bg-muted text-muted-foreground hover:bg-muted/80'}
                  `}
                >
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${isActive ? 'bg-primary-foreground/20' :
                      isSkipped ? 'bg-amber-500 text-white' :
                      isPast ? 'bg-green-600 text-white' : 'bg-background'}
                  `}>
                    {isPast ? (isSkipped ? '!' : '✓') : index + 1}
                  </div>
                  <span className="font-medium text-sm whitespace-nowrap">{cat.name}</span>
                  {selectionCount > 0 && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-bold
                      ${isActive ? 'bg-primary-foreground/20' : 'bg-primary text-primary-foreground'}
                    `}>
                      {selectionCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-responsive mx-auto px-4 py-6 md:px-8 lg:px-12">
        {/* Items Grid */}
        <MenuItemGrid
          items={activeCategory.items}
          selections={selections}
          onToggleItem={handleToggleItem}
        />

      </main>

      {/* Selection Summary - Fixed Bottom */}
      <SelectionSummary
        categories={menuData.categories}
        selections={selections}
        onSubmit={handleSubmit}
        totalItems={menuData.categories.reduce((sum, cat) => sum + cat.items.length, 0)}
        eventTitle={menuData.event.title}
        menuName={menuData.menu.name}
        activeCategoryIndex={activeCategoryIndex}
        onPrevCategory={() => setActiveCategoryIndex(Math.max(0, activeCategoryIndex - 1))}
        onNextCategory={() => setActiveCategoryIndex(Math.min(menuData.categories.length - 1, activeCategoryIndex + 1))}
        totalCategories={menuData.categories.length}
      />
    </div>
  )
}
