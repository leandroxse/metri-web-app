"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, GripVertical, ChefHat } from "lucide-react"
import { Menu, MenuFormData, MenuCategoryFormData, MenuItemFormData } from "@/types/menu"
import { menuService } from "@/lib/supabase/menu-services"

interface MenuFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu?: Menu | null
  onSuccess: () => void
}

export function MenuForm({ open, onOpenChange, menu, onSuccess }: MenuFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<MenuFormData>({
    name: menu?.name || "",
    description: menu?.description || "",
    status: (menu?.status as "active" | "inactive") || "active"
  })

  const [categories, setCategories] = useState<MenuCategoryFormData[]>([])
  const [items, setItems] = useState<Record<number, MenuItemFormData[]>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (menu) {
        // Editar cardápio existente
        await menuService.update(menu.id, formData)
      } else {
        // Criar novo cardápio
        await menuService.create(formData)
      }

      onSuccess()
      onOpenChange(false)

      // Reset form
      setFormData({ name: "", description: "", status: "active" })
      setCategories([])
      setItems({})
    } catch (error) {
      console.error("Erro ao salvar cardápio:", error)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        name: "",
        recommended_count: 1,
        order_index: categories.length
      }
    ])
  }

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index))
    // Remove itens da categoria também
    const newItems = { ...items }
    delete newItems[index]
    setItems(newItems)
  }

  const updateCategory = (index: number, field: keyof MenuCategoryFormData, value: any) => {
    const newCategories = [...categories]
    newCategories[index] = { ...newCategories[index], [field]: value }
    setCategories(newCategories)
  }

  const addItem = (categoryIndex: number) => {
    const categoryItems = items[categoryIndex] || []
    setItems({
      ...items,
      [categoryIndex]: [
        ...categoryItems,
        {
          name: "",
          description: "",
          order_index: categoryItems.length
        }
      ]
    })
  }

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const categoryItems = items[categoryIndex] || []
    setItems({
      ...items,
      [categoryIndex]: categoryItems.filter((_, i) => i !== itemIndex)
    })
  }

  const updateItem = (categoryIndex: number, itemIndex: number, field: keyof MenuItemFormData, value: any) => {
    const categoryItems = items[categoryIndex] || []
    const newItems = [...categoryItems]
    newItems[itemIndex] = { ...newItems[itemIndex], [field]: value }
    setItems({
      ...items,
      [categoryIndex]: newItems
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            {menu ? "Editar Cardápio" : "Novo Cardápio"}
          </DialogTitle>
          <DialogDescription>
            {menu ? "Edite as informações do cardápio" : "Crie um novo cardápio reutilizável"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Cardápio*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cardápio Premium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do cardápio..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categorias e Itens */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Categorias e Itens</Label>
              <Button type="button" onClick={addCategory} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Categoria
              </Button>
            </div>

            {categories.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <ChefHat className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma categoria adicionada</p>
                  <p className="text-sm">Clique em "Adicionar Categoria" para começar</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {categories.map((category, catIndex) => (
                <Card key={catIndex} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-muted-foreground mt-1" />
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={category.name}
                            onChange={(e) => updateCategory(catIndex, "name", e.target.value)}
                            placeholder="Nome da categoria (ex: Entradas)"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            min="0"
                            value={category.recommended_count}
                            onChange={(e) => updateCategory(catIndex, "recommended_count", parseInt(e.target.value))}
                            placeholder="Recomendado"
                            className="w-32"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCategory(catIndex)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Itens ({(items[catIndex] || []).length})
                          </span>
                          <Button
                            type="button"
                            onClick={() => addItem(catIndex)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Item
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {(items[catIndex] || []).length > 0 && (
                    <CardContent className="space-y-2 pt-0">
                      {(items[catIndex] || []).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex gap-2 p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1 space-y-2">
                            <Input
                              value={item.name}
                              onChange={(e) => updateItem(catIndex, itemIndex, "name", e.target.value)}
                              placeholder="Nome do item"
                              className="bg-background"
                            />
                            <Textarea
                              value={item.description || ""}
                              onChange={(e) => updateItem(catIndex, itemIndex, "description", e.target.value)}
                              placeholder="Descrição do item"
                              rows={2}
                              className="bg-background"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(catIndex, itemIndex)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name}>
              {loading ? "Salvando..." : menu ? "Salvar Alterações" : "Criar Cardápio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
