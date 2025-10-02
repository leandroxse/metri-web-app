"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ImageIcon, Search, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ImageSearchModal } from "@/components/image-search-modal"
import { supabase } from "@/lib/supabase/client"

interface MenuItem {
  id: string
  name: string
  description: string | null
  image_url: string | null
}

interface MenuItemGridProps {
  items: MenuItem[]
  selections: Set<string>
  onToggleItem: (itemId: string) => void
  adminMode?: boolean
  onImageChange?: (itemId: string, imageUrl: string) => void
  onEditItem?: (item: MenuItem) => void
  onDeleteItem?: (item: MenuItem) => void
}

export function MenuItemGrid({ items, selections, onToggleItem, adminMode, onImageChange, onEditItem, onDeleteItem }: MenuItemGridProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const selectedItem = items.find(i => i.id === selectedItemId)
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Nenhum item disponível nesta categoria</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {items.map((item) => {
        const isSelected = selections.has(item.id)

        return (
          <Card
            key={item.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-primary bg-primary/5"
            )}
            onClick={() => onToggleItem(item.id)}
          >
            <CardContent className="p-3 md:p-4">
              {/* Image */}
              <div className="relative group">
                {item.image_url ? (
                  <div className="relative w-full aspect-square md:aspect-[4/3] mb-2 md:mb-3 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square md:aspect-[4/3] mb-2 md:mb-3 rounded-lg bg-muted flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/50" />
                  </div>
                )}

                {/* Admin: Action Buttons */}
                {adminMode && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItemId(item.id)
                        setSearchOpen(true)
                      }}
                      title="Buscar imagem"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </Button>
                    {onEditItem && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditItem(item)
                        }}
                        title="Editar item"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {onDeleteItem && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteItem(item)
                        }}
                        title="Excluir item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-1.5 md:space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm md:text-base leading-tight flex-1">
                    {item.name}
                  </h3>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 md:h-5 md:w-5"
                  />
                </div>

                {item.description && (
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>

    {/* Admin: Image Search Modal */}
    {adminMode && selectedItem && (
      <ImageSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        itemName={selectedItem.name}
        onSelect={async (imageUrl) => {
          // Salvar URL direto (sem upload)
          const { error } = await supabase
            .from('menu_items')
            .update({ image_url: imageUrl })
            .eq('id', selectedItemId)

          if (!error && onImageChange) {
            onImageChange(selectedItemId!, imageUrl)
          }
        }}
      />
    )}
  </>
  )
}
