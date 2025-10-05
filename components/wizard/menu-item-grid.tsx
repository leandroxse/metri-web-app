"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageIcon, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

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

export function MenuItemGrid({ items, selections, onToggleItem, adminMode, onEditItem }: MenuItemGridProps) {
  if (items.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-12 text-center text-gray-600">
          <p>Nenhum item disponível nesta categoria</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
      {items.map((item) => {
        const isSelected = selections.has(item.id)

        return (
          <Card
            key={item.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md border-gray-200",
              isSelected && "ring-2 ring-emerald-600 bg-emerald-50"
            )}
            onClick={() => {
              if (adminMode && onEditItem) {
                onEditItem(item)
              } else {
                onToggleItem(item.id)
              }
            }}
          >
            <CardContent className="p-2 md:p-2.5">
              {/* Image */}
              <div className="relative group">
                {item.image_url ? (
                  <div className="relative w-full aspect-square md:aspect-[4/3] mb-1.5 md:mb-2 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square md:aspect-[4/3] mb-1.5 md:mb-2 rounded-md bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  </div>
                )}

                {/* Ícone de editar ao passar o mouse (só em adminMode) */}
                {adminMode && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                    <Pencil className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-1 md:space-y-1.5">
                <div className="flex items-start justify-between gap-1.5">
                  <h3 className="font-semibold text-xs md:text-sm leading-tight flex-1 text-gray-900">
                    {item.name}
                  </h3>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 md:h-4 md:w-4"
                  />
                </div>

                {item.description && (
                  <p className="text-[10px] md:text-xs text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  </>
  )
}
