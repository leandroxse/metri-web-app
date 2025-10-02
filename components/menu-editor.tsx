"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, GripVertical } from "lucide-react"
import { MenuItemGrid } from "@/components/wizard/menu-item-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface MenuEditorProps {
  menuId: string
  onUpdate?: () => void
}

export function MenuEditor({ menuId, onUpdate }: MenuEditorProps) {
  const [menu, setMenu] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [selections] = useState(new Set())

  // Estados para edição
  const [isEditingMenuName, setIsEditingMenuName] = useState(false)
  const [editedMenuName, setEditedMenuName] = useState("")
  const [editedMenuDescription, setEditedMenuDescription] = useState("")

  // Estados para categoria
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [categoryRecommendedCount, setCategoryRecommendedCount] = useState(0)

  // Estados para item
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isEditingItem, setIsEditingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemName, setItemName] = useState("")
  const [itemDescription, setItemDescription] = useState("")

  // Estados para exclusão
  const [deletingCategory, setDeletingCategory] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)

  useEffect(() => {
    if (menuId) {
      loadMenu()
      loadCategories()
    }
  }, [menuId])

  const loadMenu = async () => {
    const { data } = await supabase
      .from('menus')
      .select('*')
      .eq('id', menuId)
      .single()

    if (data) {
      setMenu(data)
      setEditedMenuName(data.name)
      setEditedMenuDescription(data.description || '')
    }
  }

  const loadCategories = async () => {
    const { data } = await supabase
      .from('menu_categories')
      .select(`
        *,
        items:menu_items(*)
      `)
      .eq('menu_id', menuId)
      .order('order_index')

    setCategories(data || [])
  }

  const handleUpdateMenuInfo = async () => {
    const { error } = await supabase
      .from('menus')
      .update({
        name: editedMenuName,
        description: editedMenuDescription
      })
      .eq('id', menuId)

    if (!error) {
      setIsEditingMenuName(false)
      loadMenu()
      onUpdate?.()
    }
  }

  const handleImageChange = (itemId: string, imageUrl: string) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item =>
        item.id === itemId ? { ...item, image_url: imageUrl } : item
      )
    })))
  }

  const handleAddCategory = async () => {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert({
        menu_id: menuId,
        name: categoryName,
        recommended_count: categoryRecommendedCount,
        order_index: categories.length
      })
      .select()
      .single()

    if (!error && data) {
      setCategories([...categories, { ...data, items: [] }])
      setIsAddingCategory(false)
      setCategoryName("")
      setCategoryRecommendedCount(0)
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategoryId) return

    const { error } = await supabase
      .from('menu_categories')
      .update({
        name: categoryName,
        recommended_count: categoryRecommendedCount
      })
      .eq('id', editingCategoryId)

    if (!error) {
      setCategories(prev => prev.map(cat =>
        cat.id === editingCategoryId
          ? { ...cat, name: categoryName, recommended_count: categoryRecommendedCount }
          : cat
      ))
      setIsEditingCategory(false)
      setEditingCategoryId(null)
      setCategoryName("")
      setCategoryRecommendedCount(0)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return

    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', deletingCategory.id)

    if (!error) {
      setCategories(prev => prev.filter(cat => cat.id !== deletingCategory.id))
      if (activeIndex >= categories.length - 1) {
        setActiveIndex(Math.max(0, activeIndex - 1))
      }
      setDeletingCategory(null)
    }
  }

  const handleAddItem = async () => {
    const activeCategory = categories[activeIndex]
    if (!activeCategory) return

    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        category_id: activeCategory.id,
        name: itemName,
        description: itemDescription,
        order_index: activeCategory.items.length
      })
      .select()
      .single()

    if (!error && data) {
      setCategories(prev => prev.map((cat, idx) =>
        idx === activeIndex
          ? { ...cat, items: [...cat.items, data] }
          : cat
      ))
      setIsAddingItem(false)
      setItemName("")
      setItemDescription("")
    }
  }

  const handleEditItem = async () => {
    if (!editingItemId) return

    const { error } = await supabase
      .from('menu_items')
      .update({
        name: itemName,
        description: itemDescription
      })
      .eq('id', editingItemId)

    if (!error) {
      setCategories(prev => prev.map(cat => ({
        ...cat,
        items: cat.items.map(item =>
          item.id === editingItemId
            ? { ...item, name: itemName, description: itemDescription }
            : item
        )
      })))
      setIsEditingItem(false)
      setEditingItemId(null)
      setItemName("")
      setItemDescription("")
    }
  }

  const handleDeleteItem = async () => {
    if (!deletingItem) return

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', deletingItem.id)

    if (!error) {
      setCategories(prev => prev.map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.id !== deletingItem.id)
      })))
      setDeletingItem(null)
    }
  }

  const openEditCategory = (category: any) => {
    setEditingCategoryId(category.id)
    setCategoryName(category.name)
    setCategoryRecommendedCount(category.recommended_count || 0)
    setIsEditingCategory(true)
  }

  const openEditItem = (item: any) => {
    setEditingItemId(item.id)
    setItemName(item.name)
    setItemDescription(item.description || "")
    setIsEditingItem(true)
  }

  const activeCategory = categories[activeIndex]

  if (!menu) return <div>Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Informações do Cardápio - Compacto */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Cardápio</p>
              <p className="font-semibold text-lg">{menu.name}</p>
            </div>
            {menu.description && (
              <>
                <div className="h-8 w-px bg-border" />
                <p className="text-sm text-muted-foreground max-w-md truncate">{menu.description}</p>
              </>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditingMenuName(true)}
          className="flex-shrink-0"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar Info
        </Button>
      </div>

      {/* Categorias */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Categorias</h3>
          <Button onClick={() => setIsAddingCategory(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Categoria
          </Button>
        </div>

        {categories.length > 0 && (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="flex items-center gap-1">
                  <Button
                    variant={idx === activeIndex ? "default" : "outline"}
                    onClick={() => setActiveIndex(idx)}
                    className="whitespace-nowrap"
                  >
                    {cat.name}
                    {cat.recommended_count > 0 && (
                      <span className="ml-2 text-xs opacity-70">
                        ({cat.recommended_count})
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditCategory(cat)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingCategory(cat)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Itens da Categoria */}
            {activeCategory && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Itens de {activeCategory.name}</h4>
                  <Button onClick={() => setIsAddingItem(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                <MenuItemGrid
                  items={activeCategory.items}
                  selections={selections}
                  onToggleItem={() => {}}
                  adminMode={true}
                  onImageChange={handleImageChange}
                  onEditItem={openEditItem}
                  onDeleteItem={setDeletingItem}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialog: Editar Nome do Menu */}
      <Dialog open={isEditingMenuName} onOpenChange={setIsEditingMenuName}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Informações do Cardápio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Cardápio</Label>
              <Input
                value={editedMenuName}
                onChange={(e) => setEditedMenuName(e.target.value)}
                placeholder="Nome do cardápio"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={editedMenuDescription}
                onChange={(e) => setEditedMenuDescription(e.target.value)}
                placeholder="Descrição do cardápio"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditingMenuName(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateMenuInfo}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Adicionar/Editar Categoria */}
      <Dialog open={isAddingCategory || isEditingCategory} onOpenChange={(open) => {
        if (!open) {
          setIsAddingCategory(false)
          setIsEditingCategory(false)
          setCategoryName("")
          setCategoryRecommendedCount(0)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingCategory ? "Editar Categoria" : "Adicionar Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Categoria</Label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Entradas, Pratos Principais..."
              />
            </div>
            <div>
              <Label>Quantidade Recomendada</Label>
              <Input
                type="number"
                value={categoryRecommendedCount}
                onChange={(e) => setCategoryRecommendedCount(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingCategory(false)
                  setIsEditingCategory(false)
                  setCategoryName("")
                  setCategoryRecommendedCount(0)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={isEditingCategory ? handleEditCategory : handleAddCategory}>
                {isEditingCategory ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Adicionar/Editar Item */}
      <Dialog open={isAddingItem || isEditingItem} onOpenChange={(open) => {
        if (!open) {
          setIsAddingItem(false)
          setIsEditingItem(false)
          setItemName("")
          setItemDescription("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingItem ? "Editar Item" : "Adicionar Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Item</Label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Ex: Salmão Grelhado"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Descrição do prato..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingItem(false)
                  setIsEditingItem(false)
                  setItemName("")
                  setItemDescription("")
                }}
              >
                Cancelar
              </Button>
              <Button onClick={isEditingItem ? handleEditItem : handleAddItem}>
                {isEditingItem ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Excluir Categoria */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  Tem certeza que deseja excluir a categoria <strong>"{deletingCategory?.name}"</strong>?
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="text-sm text-red-900 dark:text-red-100 font-bold mb-1">
                    ⚠️ ATENÇÃO
                  </div>
                  <div className="text-sm text-red-800 dark:text-red-200">
                    Todos os itens desta categoria também serão excluídos permanentemente.
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Excluir Item */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item <strong>"{deletingItem?.name}"</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
