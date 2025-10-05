"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Loader2 } from "lucide-react"
import type { Menu } from "@/types/menu"
import { menuCategoryService, menuItemService } from "@/lib/supabase/menu-services"

interface MenuSummaryDialogProps {
  menu: Menu | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CategoryWithItems {
  id: string
  name: string
  items: Array<{
    id: string
    name: string
    description: string | null
  }>
}

export function MenuSummaryDialog({ menu, open, onOpenChange }: MenuSummaryDialogProps) {
  const [categories, setCategories] = useState<CategoryWithItems[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!menu || !open) {
      setCategories([])
      return
    }

    const loadMenuData = async () => {
      setLoading(true)
      try {
        // Carregar categorias
        const cats = await menuCategoryService.getByMenuId(menu.id)

        // Carregar itens de cada categoria
        const catsWithItems = await Promise.all(
          cats.map(async (cat) => {
            const items = await menuItemService.getByCategoryId(cat.id)
            return {
              id: cat.id,
              name: cat.name,
              items: items.map(item => ({
                id: item.id,
                name: item.name,
                description: item.description
              }))
            }
          })
        )

        setCategories(catsWithItems)
      } catch (error) {
        console.error("Erro ao carregar dados do cardápio:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMenuData()
  }, [menu, open])

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-7xl h-[92vh] p-0 gap-0 flex flex-col">
        {/* Header otimizado */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0 bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold truncate">{menu?.name}</h2>
                {menu?.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{menu.description}</p>
                )}
              </div>
            </DialogTitle>
            {/* Stats */}
            <div className="flex gap-3 shrink-0">
              <div className="text-center px-4 py-2 bg-background rounded-lg border">
                <p className="text-lg font-bold text-foreground">{categories.length}</p>
                <p className="text-xs text-muted-foreground">categorias</p>
              </div>
              <div className="text-center px-4 py-2 bg-background rounded-lg border">
                <p className="text-lg font-bold text-foreground">{totalItems}</p>
                <p className="text-xs text-muted-foreground">itens</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center flex-1 min-h-0">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-muted-foreground">
            <div className="text-center">
              <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-base">Nenhuma categoria encontrada</p>
            </div>
          </div>
        ) : (
          <>
            {/* MOBILE: Lista vertical tradicional */}
            <div className="md:hidden flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-3">
                    {/* Header categoria */}
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <h3 className="font-semibold text-base flex-1">
                        {category.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {category.items.length}
                      </Badge>
                    </div>

                    {/* Lista de itens */}
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-card rounded-lg p-3 border hover:border-primary/40 transition-colors"
                        >
                          <h4 className="font-medium text-sm text-foreground mb-1">
                            {item.name}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TABLET/DESKTOP: Layout horizontal tipo Trello */}
            <div className="hidden md:flex flex-1 min-h-0 overflow-x-auto overflow-y-hidden bg-muted/20">
              <div className="flex h-full gap-4 px-6 py-5">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex-shrink-0 w-[380px] lg:w-[400px] flex flex-col bg-background rounded-xl border-2 shadow-sm h-full"
                  >
                    {/* Header categoria */}
                    <div className="px-4 py-3 border-b bg-muted/50 flex-shrink-0 rounded-t-xl">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm flex-1 truncate">
                          {category.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs font-medium">
                          {category.items.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Lista de itens */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-card rounded-lg p-3 border hover:shadow-md hover:border-primary/40 transition-all cursor-default group"
                        >
                          <h4 className="font-medium text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
                            {item.name}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
