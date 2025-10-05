"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Check, Download } from "lucide-react"

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

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Seleção de Cardápio - ${eventName}</title>
          <style>
            @page { size: A4; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              padding: 20px 30px;
              line-height: 1.3;
              color: #333;
              height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .header {
              border-bottom: 2px solid #059669;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            h1 {
              color: #059669;
              font-size: 22px;
              margin-bottom: 4px;
            }
            .subtitle {
              color: #666;
              font-size: 13px;
              line-height: 1.2;
            }
            .summary {
              background: #f3f4f6;
              padding: 8px 12px;
              border-radius: 6px;
              margin-bottom: 15px;
              display: flex;
              gap: 25px;
            }
            .summary-item {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .summary-label {
              font-size: 11px;
              color: #666;
              text-transform: uppercase;
            }
            .summary-value {
              font-size: 16px;
              font-weight: bold;
              color: #059669;
            }
            .content {
              flex: 1;
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 12px;
              margin-bottom: 10px;
            }
            .category {
              break-inside: avoid;
            }
            .category-header {
              background: #059669;
              color: white;
              padding: 6px 10px;
              border-radius: 4px;
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .category-name {
              font-size: 14px;
              font-weight: 600;
            }
            .category-count {
              background: rgba(255,255,255,0.25);
              padding: 2px 8px;
              border-radius: 10px;
              font-size: 11px;
            }
            .items-list {
              list-style: none;
            }
            .item {
              padding: 4px 8px;
              border-left: 2px solid #10b981;
              margin-bottom: 4px;
              background: #f9fafb;
              font-size: 12px;
            }
            .item-name {
              font-weight: 500;
              color: #111827;
            }
            .footer {
              border-top: 1px solid #e5e7eb;
              padding-top: 8px;
              text-align: center;
              color: #6b7280;
              font-size: 10px;
            }
            @media print {
              body {
                padding: 20px 30px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Seleção de Cardápio</h1>
            <div class="subtitle">${eventName}${menuName ? ` • ${menuName}` : ''}</div>
          </div>

          <div class="summary">
            <div class="summary-item">
              <span class="summary-label">Total:</span>
              <span class="summary-value">${totalSelections}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Categorias:</span>
              <span class="summary-value">${categories.length}</span>
            </div>
          </div>

          <div class="content">
            ${categories.map(cat => `
              <div class="category">
                <div class="category-header">
                  <div class="category-name">${cat.name}</div>
                  <div class="category-count">
                    ${cat.selectedItems.length}
                  </div>
                </div>
                <ul class="items-list">
                  ${cat.selectedItems.map(item => `
                    <li class="item">
                      <div class="item-name">✓ ${item.name}</div>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            ${new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleShareWhatsApp = () => {
    // Gerar texto formatado com as seleções
    let message = `*Seleção de Cardápio*\n`
    message += `Evento: ${eventName}\n`
    if (menuName) message += `Cardápio: ${menuName}\n`
    message += `\n📊 Total: ${totalSelections} ${totalSelections === 1 ? 'item selecionado' : 'itens selecionados'}\n`
    message += `\n---\n\n`

    categories.forEach(cat => {
      message += `*${cat.name}* (${cat.selectedItems.length})\n`
      cat.selectedItems.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`
      })
      message += `\n`
    })

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar PDF
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShareWhatsApp}
                  title="Compartilhar seleções no WhatsApp"
                  className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_mwbHX3hY1L0K0i2JkhhpxGonRGb5WclhTg&s"
                    alt="WhatsApp"
                    className="w-5 h-5"
                  />
                </Button>
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
