"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  recommended_count: number
  items: Array<{ id: string }>
}

interface CategoryStepperProps {
  categories: Category[]
  activeIndex: number
  onSelectCategory: (index: number) => void
  selections: Set<string>
  variant: "horizontal" | "vertical"
}

export function CategoryStepper({
  categories,
  activeIndex,
  onSelectCategory,
  selections,
  variant
}: CategoryStepperProps) {
  const getSelectionCount = (category: Category) => {
    return category.items.filter(item => selections.has(item.id)).length
  }

  if (variant === "horizontal") {
    return (
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          {categories.map((category, index) => {
            const selectionCount = getSelectionCount(category)
            const isActive = index === activeIndex
            const hasSelections = selectionCount > 0

            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-shrink-0 transition-all",
                  hasSelections && !isActive && "border-primary/50"
                )}
                onClick={() => onSelectCategory(index)}
              >
                <span>{category.name}</span>
                {hasSelections && (
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    {selectionCount}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  // Vertical variant for desktop sidebar
  return (
    <div className="space-y-2">
      {categories.map((category, index) => {
        const selectionCount = getSelectionCount(category)
        const isActive = index === activeIndex
        const hasSelections = selectionCount > 0

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(index)}
            className={cn(
              "w-full text-left p-3 rounded-lg transition-all",
              "hover:bg-muted/50",
              isActive && "bg-primary/10 border-l-4 border-primary",
              !isActive && "border-l-4 border-transparent"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {category.name}
                </div>
                {category.recommended_count > 0 && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Recomendado: {category.recommended_count}
                  </div>
                )}
              </div>
              {hasSelections && (
                <Badge variant="outline" className="ml-2 flex-shrink-0">
                  {selectionCount}
                </Badge>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
