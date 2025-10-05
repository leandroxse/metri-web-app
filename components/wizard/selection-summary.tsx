"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronUp, Check, ShoppingBag, Download, Share2, Sparkles, List, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  recommended_count: number
  items: Array<{
    id: string
    name: string
    description?: string | null
  }>
}

interface SelectionSummaryProps {
  categories: Category[]
  selections: Set<string>
  onSubmit: () => void
  totalItems: number
  eventTitle?: string
  menuName?: string
  activeCategoryIndex: number
  onPrevCategory: () => void
  onNextCategory: () => void
  totalCategories: number
}

export function SelectionSummary({
  categories,
  selections,
  onSubmit,
  totalItems,
  eventTitle,
  menuName,
  activeCategoryIndex,
  onPrevCategory,
  onNextCategory,
  totalCategories
}: SelectionSummaryProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDesktopOpen, setIsDesktopOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const selectedByCategory = categories.map(cat => ({
    name: cat.name,
    recommended: cat.recommended_count,
    selected: cat.items.filter(item => selections.has(item.id)),
    total: cat.items.length
  })).filter(cat => cat.selected.length > 0)

  const totalSelected = selections.size
  const totalRecommended = categories.reduce((sum, cat) => sum + cat.recommended_count, 0)

  const handleConfirmSubmit = () => {
    setIsConfirmOpen(false)
    onSubmit()
  }

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Seleção de Cardápio - ${eventTitle || 'Evento'}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
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
            <div class="subtitle">${eventTitle || 'Evento'}${menuName ? ` • ${menuName}` : ''}</div>
          </div>

          <div class="summary">
            <div class="summary-item">
              <span class="summary-label">Total:</span>
              <span class="summary-value">${totalSelected}</span>
            </div>
            ${totalRecommended > 0 ? `
              <div class="summary-item">
                <span class="summary-label">Recomendado:</span>
                <span class="summary-value">${totalRecommended}</span>
              </div>
            ` : ''}
            <div class="summary-item">
              <span class="summary-label">Categorias:</span>
              <span class="summary-value">${selectedByCategory.length}</span>
            </div>
          </div>

          <div class="content">
            ${selectedByCategory.map(cat => `
              <div class="category">
                <div class="category-header">
                  <div class="category-name">${cat.name}</div>
                  <div class="category-count">
                    ${cat.selected.length}${cat.recommended > 0 ? `/${cat.recommended}` : ''}
                  </div>
                </div>
                <ul class="items-list">
                  ${cat.selected.map(item => `
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

  return (
    <>
      {/* Mobile/Tablet - Bottom Sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-sm">
        <div className="container-responsive mx-auto px-3 md:px-2.5 py-2 md:py-1.5">
          <div className="relative">
            {/* Logo Marca d'água - Mobile */}
            <img
              src="/prime-logo.png"
              alt="Prime Buffet"
              className="absolute right-2 bottom-1 md:right-1.5 md:bottom-1 h-6 md:h-5 w-auto opacity-10 pointer-events-none"
            />

            <div className="flex items-center justify-between gap-2 md:gap-2 mb-2 md:mb-1.5 relative z-10">
              <div className="flex items-center gap-2 md:gap-1.5">
                <Sparkles className="w-5 h-5 md:w-3.5 md:h-3.5 text-emerald-600" />
                <div>
                  <p className="font-bold text-base md:text-sm leading-tight text-gray-900">{totalSelected} selecionados</p>
                  {totalRecommended > 0 && (
                    <p className="text-xs md:text-[9px] text-gray-600 leading-tight mt-0.5">Recomendado: {totalRecommended}</p>
                  )}
                </div>
              </div>
              <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 md:h-7 text-xs md:text-[11px] px-3 md:px-2">
                    Ver Todos <ChevronUp className="w-4 h-4 md:w-3 md:h-3 ml-1 md:ml-1" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-gray-900">Suas Seleções</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    {selectedByCategory.length === 0 ? (
                      <p className="text-center text-gray-600 py-8">
                        Nenhum item selecionado ainda
                      </p>
                    ) : (
                      selectedByCategory.map((cat, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                            <Badge variant="outline" className="border-gray-300 text-gray-700">
                              {cat.selected.length}
                              {cat.recommended > 0 && ` / ${cat.recommended}`}
                            </Badge>
                          </div>
                          <ul className="space-y-1 pl-4">
                            {cat.selected.map((item) => (
                              <li key={item.id} className="text-sm flex items-center gap-2 text-gray-900">
                                <Check className="w-3 h-3 text-emerald-600" />
                                {item.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-2 md:gap-1 relative z-10">
              {/* Navegação */}
              <div className="flex gap-1.5 md:gap-0.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevCategory}
                  disabled={activeCategoryIndex === 0}
                  className="h-8 w-8 md:h-6 md:w-6 p-0"
                >
                  <ChevronLeft className="w-4 h-4 md:w-3 md:h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNextCategory}
                  disabled={activeCategoryIndex === totalCategories - 1}
                  className="h-8 w-8 md:h-6 md:w-6 p-0"
                >
                  <ChevronRight className="w-4 h-4 md:w-3 md:h-3" />
                </Button>
              </div>

              {/* Ações */}
              <div className="grid grid-cols-2 gap-1.5 md:gap-1 flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                  disabled={totalSelected === 0}
                  className="h-8 md:h-6 text-xs md:text-[11px] px-3 md:px-2"
                >
                  <Download className="w-4 h-4 md:w-3 md:h-3 mr-1 md:mr-1" />
                  PDF
                </Button>
                <Button
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={totalSelected === 0}
                  size="sm"
                  className="h-8 md:h-6 text-xs md:text-[11px] px-3 md:px-2"
                >
                  <Check className="w-4 h-4 md:w-3 md:h-3 mr-1 md:mr-1" />
                  Finalizar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet - Sticky Footer */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-sm">
        <div className="container-responsive mx-auto px-4 py-2 relative">
          {/* Logo Marca d'água - Desktop */}
          <img
            src="/prime-logo.png"
            alt="Prime Buffet"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-auto opacity-15 pointer-events-none"
          />

          <div className="flex items-center justify-between">
            {/* Summary Info */}
            <div className="flex items-center gap-4 ml-20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-[10px] text-gray-600 leading-none">Total Selecionado</div>
                  <div className="text-xl font-bold text-emerald-600 leading-none mt-1">
                    {totalSelected}
                  </div>
                </div>
              </div>
              {totalRecommended > 0 && (
                <>
                  <div className="h-8 w-px bg-gray-200" />
                  <div>
                    <div className="text-[10px] text-gray-600 leading-none">Recomendado</div>
                    <div className="text-xl font-bold text-emerald-600 leading-none mt-1">{totalRecommended}</div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Navegação Desktop */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onPrevCategory}
                  disabled={activeCategoryIndex === 0}
                  className="h-7 w-7"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onNextCategory}
                  disabled={activeCategoryIndex === totalCategories - 1}
                  className="h-7 w-7"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-7 w-px bg-gray-200" />

              <Dialog open={isDesktopOpen} onOpenChange={setIsDesktopOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={totalSelected === 0}
                    className="h-7"
                  >
                    <List className="w-3.5 h-3.5 mr-1.5" />
                    Ver Todos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-gray-900">Suas Seleções</DialogTitle>
                  </DialogHeader>
                  <div className="mt-6 space-y-6">
                    {selectedByCategory.length === 0 ? (
                      <p className="text-center text-gray-600 py-12">
                        Nenhum item selecionado ainda
                      </p>
                    ) : (
                      selectedByCategory.map((cat, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                            <h3 className="font-bold text-lg text-gray-900">{cat.name}</h3>
                            <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-700">
                              {cat.selected.length} selecionado{cat.selected.length !== 1 ? 's' : ''}
                              {cat.recommended > 0 && ` • Recomendado: ${cat.recommended}`}
                            </Badge>
                          </div>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cat.selected.map((item) => (
                              <li key={item.id} className="text-sm flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <span className="text-gray-900">{item.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                disabled={totalSelected === 0}
                className="h-7"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Exportar PDF
              </Button>
              <Button
                size="sm"
                onClick={() => setIsConfirmOpen(true)}
                disabled={totalSelected === 0}
                className="h-7"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Finalizar Seleção
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação - Resumo Final */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl text-gray-900">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
              Confirmar Seleção
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Resumo Geral */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-6 border-2 border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Resumo da sua seleção</h3>
                  <p className="text-sm text-gray-600">{eventTitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-600">{totalSelected}</div>
                  <div className="text-xs text-gray-600">itens selecionados</div>
                </div>
              </div>

              {totalRecommended > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">
                    Recomendação do evento: {totalRecommended} itens
                  </span>
                </div>
              )}
            </div>

            {/* Lista de Categorias e Itens */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                <List className="w-5 h-5 text-gray-700" />
                Itens selecionados por categoria
              </h4>

              {selectedByCategory.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  Nenhum item selecionado
                </div>
              ) : (
                selectedByCategory.map((cat, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                      <h5 className="font-semibold text-base text-gray-900">{cat.name}</h5>
                      <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-700">
                        {cat.selected.length} {cat.selected.length === 1 ? 'item' : 'itens'}
                        {cat.recommended > 0 && ` • Recomendado: ${cat.recommended}`}
                      </Badge>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {cat.selected.map((item) => (
                        <li key={item.id} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-gray-600 line-clamp-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>

            {/* Mensagem de Confirmação */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">!</span>
                </div>
                <div>
                  <h5 className="font-semibold text-amber-900 mb-1">
                    Tem certeza que deseja finalizar?
                  </h5>
                  <p className="text-sm text-amber-800">
                    Ao confirmar, suas escolhas serão enviadas para o organizador do evento.
                    Você poderá alterar suas seleções posteriormente acessando o mesmo link.
                  </p>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1"
              >
                Revisar Seleção
              </Button>
              <Button
                size="lg"
                onClick={handleConfirmSubmit}
                disabled={totalSelected === 0}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Check className="w-5 h-5 mr-2" />
                Confirmar e Finalizar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
