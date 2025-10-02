"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Users, Edit, Trash2, Search, UserPlus, Tag, BarChart3 } from "lucide-react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedIcon } from "@/components/ui/animated-icon"
import Link from "next/link"
import { CategoryForm } from "@/components/category-form"
import { PeopleManager } from "@/components/people-manager"
import { useCategories } from "@/hooks/use-categories"
import type { Category } from "@/types/category"

export default function CategoriasPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [managingPeopleCategory, setManagingPeopleCategory] = useState<Category | null>(null)
  const [isPeopleDialogOpen, setIsPeopleDialogOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const filteredCategories = categories.filter(
    (category) =>
      (category.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddCategory = (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    addCategory(categoryData)
    setIsAddDialogOpen(false)
  }

  const handleEditCategory = (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData)
      setEditingCategory(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteCategory = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id)
      setDeletingCategory(null)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive mx-auto px-3 py-4 md:px-6 lg:px-8">
        {/* Statistics Cards with Stagger Animation */}
        <AnimatedContainer delay={0} className="mb-4">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            initial="initial"
            animate="animate"
            variants={{
              initial: {},
              animate: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 oled:from-blue-400/10 oled:to-blue-300/5 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30 oled:border-blue-400/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
              variants={{
                initial: { opacity: 0, y: 20, scale: 0.95 },
                animate: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{
                y: -4,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 oled:text-blue-200 mb-1">Total de Categorias</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 oled:text-blue-100">
                    <AnimatedNumber value={categories.length} duration={1.2} />
                  </p>
                </div>
                <div className="p-2 bg-blue-500/10 dark:bg-blue-400/20 oled:bg-blue-400/30 rounded-lg">
                  <AnimatedIcon variant="bounce">
                    <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400 oled:text-blue-300" />
                  </AnimatedIcon>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 oled:from-emerald-400/10 oled:to-emerald-300/5 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30 oled:border-emerald-400/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
              variants={{
                initial: { opacity: 0, y: 20, scale: 0.95 },
                animate: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{
                y: -4,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 oled:text-emerald-200 mb-1">Total de Pessoas</p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 oled:text-emerald-100">
                    <AnimatedNumber value={categories.reduce((sum, cat) => sum + (cat.member_count || 0), 0)} duration={1.2} />
                  </p>
                </div>
                <div className="p-2 bg-emerald-500/10 dark:bg-emerald-400/20 oled:bg-emerald-400/30 rounded-lg">
                  <AnimatedIcon variant="pulse">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 oled:text-emerald-300" />
                  </AnimatedIcon>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 oled:from-amber-400/10 oled:to-amber-300/5 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30 oled:border-amber-400/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
              variants={{
                initial: { opacity: 0, y: 20, scale: 0.95 },
                animate: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{
                y: -4,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 oled:text-amber-200 mb-1">Média por Categoria</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 oled:text-amber-100">
                    <AnimatedNumber 
                      value={categories.length > 0 ? categories.reduce((sum, cat) => sum + (cat.member_count || 0), 0) / categories.length : 0} 
                      precision={1} 
                      duration={1.2} 
                    />
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 dark:bg-amber-400/20 oled:bg-amber-400/30 rounded-lg">
                  <AnimatedIcon variant="wobble">
                    <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400 oled:text-amber-300" />
                  </AnimatedIcon>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatedContainer>

        {/* Header and Actions */}
        <AnimatedContainer delay={0.2} direction="right" className="mb-4">
          <div className="flex items-center justify-between">
            <motion.h1 
              className="text-2xl font-bold flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Tag className="w-6 h-6 text-emerald-600" />
              </motion.div>
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                Categorias
              </span>
            </motion.h1>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Categoria</DialogTitle>
                  <DialogDescription>Crie uma nova categoria profissional para organizar sua equipe</DialogDescription>
                </DialogHeader>
                <CategoryForm onSubmit={handleAddCategory} />
              </DialogContent>
            </Dialog>
          </div>
        </AnimatedContainer>

        {/* Search with Animation */}
        <AnimatedContainer delay={0.4} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </AnimatedContainer>

        {/* Categories Grid with Stagger */}
        {filteredCategories.length === 0 ? (
          <AnimatedContainer delay={0.6}>
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
              >
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                {searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Tente ajustar os termos de busca"
                  : "Comece criando sua primeira categoria de profissional"}
              </p>
              {!searchTerm && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeira Categoria
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Categoria</DialogTitle>
                      <DialogDescription>Crie uma nova categoria de profissional para seus eventos</DialogDescription>
                    </DialogHeader>
                    <CategoryForm onSubmit={handleAddCategory} />
                  </DialogContent>
                </Dialog>
              )}
            </motion.div>
          </AnimatedContainer>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            animate="animate"
            variants={{
              initial: { opacity: 0, y: 30 },
              animate: { 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.6,
                  delay: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  staggerChildren: 0.08,
                  delayChildren: 0.8
                }
              }
            }}
          >
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  variants={{
                    initial: { opacity: 0, y: 20, scale: 0.95 },
                    animate: { opacity: 1, y: 0, scale: 1 }
                  }}
                  transition={{
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  whileTap={{
                    scale: 0.98,
                    transition: { duration: 0.1 }
                  }}
                >
                  <Card
                    className="hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer border-border/50 hover:border-border backdrop-blur-sm group"
                    onClick={() => {
                      setManagingPeopleCategory(category)
                      setIsPeopleDialogOpen(true)
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            <motion.div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                              whileHover={{ scale: 1.2 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            />
                            {category.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">{category.description}</CardDescription>
                        </div>
                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingCategory(category)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeletingCategory(category)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <AnimatedNumber value={category.member_count || 0} />
                            {" "}membro{(category.member_count || 0) !== 1 ? "s" : ""}
                          </Badge>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </motion.div>
        )}

        {/* Edit Dialog with Animation */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-white to-slate-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 oled:from-black oled:via-black oled:to-gray-900/20 border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50 oled:ring-gray-600/30">
            <DialogHeader className="pb-6 border-b border-gray-100 dark:border-gray-800 oled:border-gray-700">
              <DialogTitle className="flex items-center gap-3 text-xl font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 oled:from-emerald-300 oled:to-emerald-400 bg-clip-text text-transparent">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 oled:from-emerald-400 oled:to-emerald-500 rounded-lg shadow-md">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                Editar Categoria
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 oled:text-gray-300 mt-2">
                Atualize as informações da categoria profissional
              </DialogDescription>
            </DialogHeader>
            <div className="pt-6">
              {editingCategory && <CategoryForm initialData={editingCategory} onSubmit={handleEditCategory} />}
            </div>
          </DialogContent>
        </Dialog>

        {/* People Management Dialog with Animation */}
        <Dialog open={isPeopleDialogOpen} onOpenChange={setIsPeopleDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white via-white to-slate-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 oled:from-black oled:via-black oled:to-gray-900/20 border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50 oled:ring-gray-600/30">
            <DialogHeader className="pb-6 border-b border-gray-100 dark:border-gray-800 oled:border-gray-700">
              <DialogTitle className="flex items-center gap-3 text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 oled:from-blue-300 oled:to-blue-400 bg-clip-text text-transparent">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 oled:from-blue-400 oled:to-blue-500 rounded-lg shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Gerenciar Pessoas
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 oled:text-gray-300 mt-2">
                Adicione e gerencie pessoas da categoria {managingPeopleCategory?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="pt-6">
              {managingPeopleCategory && (
                <PeopleManager category={managingPeopleCategory} />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog with Animation */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-white via-white to-slate-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 oled:from-black oled:via-black oled:to-gray-900/20 border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50 oled:ring-gray-600/30">
            <DialogHeader className="pb-6 border-b border-gray-100 dark:border-gray-800 oled:border-gray-700">
              <DialogTitle className="flex items-center gap-3 text-xl font-semibold bg-gradient-to-r from-red-600 to-red-700 dark:from-red-400 dark:to-red-500 oled:from-red-300 oled:to-red-400 bg-clip-text text-transparent">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 oled:from-red-400 oled:to-red-500 rounded-lg shadow-md">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                Excluir Categoria
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 oled:text-gray-300 mt-2">
                Tem certeza que deseja excluir a categoria "{deletingCategory?.name}"? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="destructive" onClick={handleDeleteCategory}>
                  Excluir
                </Button>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
