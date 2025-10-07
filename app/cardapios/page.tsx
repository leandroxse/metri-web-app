"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Archive, ArchiveRestore, ChefHat, BarChart3, CheckCircle2, FileText, Sparkles } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useMenus } from "@/hooks/use-menus"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedIcon } from "@/components/ui/animated-icon"
import { MenuForm } from "@/components/menu-form"
import { MenuSummaryDialog } from "@/components/menu-summary-dialog"
import { Menu } from "@/types/menu"

export default function CardapiosPage() {
  const router = useRouter()
  const { menus, loading, refetch, deleteMenu, updateMenu } = useMenus()
  const [searchTerm, setSearchTerm] = useState("")
  const [menuFormOpen, setMenuFormOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [archivingMenu, setArchivingMenu] = useState<Menu | null>(null)
  const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null)
  const [viewingMenu, setViewingMenu] = useState<Menu | null>(null)

  const filteredMenus = menus
    .filter(menu => menu.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(menu => showArchived ? menu.status === 'inactive' : menu.status === 'active')

  const activeMenus = menus.filter(m => m.status === 'active')
  const inactiveMenus = menus.filter(m => m.status === 'inactive')

  const handleOpenNew = () => {
    setEditingMenu(null)
    setMenuFormOpen(true)
  }

  const handleOpenEdit = (menu: Menu) => {
    router.push(`/admin/edit-menu-images?menuId=${menu.id}`)
  }

  const handleArchive = async (menu: Menu) => {
    setArchivingMenu(menu)
  }

  const handleConfirmArchive = async () => {
    if (archivingMenu) {
      await updateMenu(archivingMenu.id, { status: 'inactive' })
      setArchivingMenu(null)
      refetch()
    }
  }

  const handleUnarchive = async (menu: Menu) => {
    await updateMenu(menu.id, { status: 'active' })
    refetch()
  }

  const handleDelete = (menu: Menu) => {
    setDeletingMenu(menu)
  }

  const handleConfirmDelete = async () => {
    if (deletingMenu) {
      await deleteMenu(deletingMenu.id)
      setDeletingMenu(null)
      refetch()
    }
  }

  const handleFormSuccess = () => {
    refetch()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive mx-auto px-3 py-4 md:px-6 lg:px-8">
        {/* Header with Animation - NO TOPO */}
        <AnimatedContainer delay={0} direction="right" className="mb-4">
          <motion.h1
            className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </motion.div>
            <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              Cardápios
            </span>
          </motion.h1>

          <motion.div
            className="flex items-center gap-2 flex-wrap"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
              size="sm"
              className="gap-1.5 h-8 text-xs md:text-sm"
            >
              {showArchived ? <ArchiveRestore className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Archive className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              <span className="hidden sm:inline">{showArchived ? "Ver Ativos" : "Arquivados"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/cardapios/importar')}
              size="sm"
              className="gap-1.5 h-8 text-xs md:text-sm bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-300 dark:border-purple-700 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-700 dark:text-purple-300"
            >
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 animate-pulse" />
              <span className="hidden sm:inline">Cardápio com IA</span>
              <span className="sm:hidden">IA</span>
            </Button>
            <Button onClick={handleOpenNew} size="sm" className="gap-1.5 h-8 text-xs md:text-sm">
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Novo</span>
            </Button>
          </motion.div>
        </AnimatedContainer>

        {/* Modern Statistics - Mobile Optimized with Stagger Animation */}
        <AnimatedContainer delay={0.2} className="mb-4">
          <motion.div
            className="grid grid-cols-3 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6"
            initial={false}
            animate={"animate"}
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <motion.div
              className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 oled:from-orange-400/10 oled:to-orange-300/5 rounded-lg md:rounded-xl p-2.5 md:p-4 border border-orange-200/50 dark:border-orange-800/30 oled:border-orange-400/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center justify-between md:block">
                  <p className="text-[10px] md:text-xs font-medium text-orange-700 dark:text-orange-300 oled:text-orange-200 mb-0 md:mb-1">Total</p>
                  <p className="text-lg md:text-xl font-bold text-orange-900 dark:text-orange-100 oled:text-orange-100">
                    <AnimatedNumber value={menus.length} duration={1.5} />
                  </p>
                </div>
                <div className="hidden md:block p-2 bg-orange-500/10 dark:bg-orange-400/20 oled:bg-orange-400/30 rounded-lg">
                  <AnimatedIcon variant="bounce">
                    <ChefHat className="w-5 h-5 text-orange-600 dark:text-orange-400 oled:text-orange-300" />
                  </AnimatedIcon>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 oled:from-emerald-400/10 oled:to-emerald-300/5 rounded-lg md:rounded-xl p-2.5 md:p-4 border border-emerald-200/50 dark:border-emerald-800/30 oled:border-emerald-400/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center justify-between md:block">
                  <p className="text-[10px] md:text-xs font-medium text-emerald-700 dark:text-emerald-300 oled:text-emerald-200 mb-0 md:mb-1">Ativos</p>
                  <p className="text-lg md:text-xl font-bold text-emerald-900 dark:text-emerald-100 oled:text-emerald-100">
                    <AnimatedNumber value={activeMenus.length} duration={1.5} />
                  </p>
                </div>
                <div className="hidden md:block p-2 bg-emerald-500/10 dark:bg-emerald-400/20 oled:bg-emerald-400/30 rounded-lg">
                  <AnimatedIcon variant="pulse">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 oled:text-emerald-300" />
                  </AnimatedIcon>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20 oled:from-gray-400/10 oled:to-gray-300/5 rounded-lg md:rounded-xl p-2.5 md:p-4 border border-gray-200/50 dark:border-gray-800/30 oled:border-gray-400/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center justify-between md:block">
                  <p className="text-[10px] md:text-xs font-medium text-gray-700 dark:text-gray-300 oled:text-gray-200 mb-0 md:mb-1">Inativos</p>
                  <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 oled:text-gray-100">
                    <AnimatedNumber value={inactiveMenus.length} duration={1.5} />
                  </p>
                </div>
                <div className="hidden md:block p-2 bg-gray-500/10 dark:bg-gray-400/20 oled:bg-gray-400/30 rounded-lg">
                  <AnimatedIcon variant="wobble">
                    <Archive className="w-5 h-5 text-gray-600 dark:text-gray-400 oled:text-gray-300" />
                  </AnimatedIcon>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatedContainer>

        {/* Search with Animation */}
        <AnimatedContainer delay={0.4} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cardápios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </AnimatedContainer>

        {/* Loading */}
        {loading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="mt-4 text-muted-foreground">Carregando cardápios...</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && menus.length === 0 && (
          <AnimatedContainer delay={0.6}>
            <Card className="text-center py-12 border-dashed border-2">
              <CardContent>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                >
                  <ChefHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                </motion.div>
                <motion.h3
                  className="text-lg font-semibold mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  Nenhum cardápio cadastrado
                </motion.h3>
                <motion.p
                  className="text-muted-foreground mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  Crie seu primeiro cardápio para começar
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                >
                  <Button onClick={handleOpenNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Cardápio
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        )}

        {/* Menu List with Stagger Animation */}
        {!loading && filteredMenus.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6"
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
            {filteredMenus.map((menu, index) => (
              <motion.div
                key={menu.id}
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
                <Card className="group hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/30 bg-card">
                  <CardHeader className="pb-3 cursor-pointer" onClick={() => setViewingMenu(menu)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <motion.div
                            className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </motion.div>
                          <CardTitle className="text-base truncate">{menu.name}</CardTitle>
                        </div>
                        <CardDescription className="text-xs line-clamp-2">
                          {menu.description || 'Sem descrição'}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={menu.status === 'active' ? 'default' : 'secondary'}
                        className="flex-shrink-0"
                      >
                        {menu.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 transition-all hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleOpenEdit(menu)}
                      >
                        <Edit className="w-3 h-3 mr-1.5" />
                        Editar
                      </Button>
                      {menu.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="transition-all hover:bg-amber-500 hover:text-white"
                          onClick={() => handleArchive(menu)}
                          title="Arquivar cardápio"
                        >
                          <Archive className="w-3 h-3" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="transition-all hover:bg-green-500 hover:text-white"
                          onClick={() => handleUnarchive(menu)}
                          title="Desarquivar cardápio"
                        >
                          <ArchiveRestore className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="transition-all hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDelete(menu)}
                        title="Excluir cardápio"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Menu Form Dialog */}
      <MenuForm
        open={menuFormOpen}
        onOpenChange={setMenuFormOpen}
        menu={editingMenu}
        onSuccess={handleFormSuccess}
      />

      {/* Menu Summary Dialog */}
      <MenuSummaryDialog
        menu={viewingMenu}
        open={!!viewingMenu}
        onOpenChange={(open) => !open && setViewingMenu(null)}
      />

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={!!archivingMenu} onOpenChange={(open) => !open && setArchivingMenu(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-600" />
              Arquivar Cardápio
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  Você está prestes a arquivar o cardápio <strong>"{archivingMenu?.name}"</strong>.
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-1">
                    ⚠️ O que acontecerá:
                  </div>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                    <li>O cardápio ficará inativo e não aparecerá na lista principal</li>
                    <li>Eventos vinculados a este cardápio não serão afetados</li>
                    <li>Você pode restaurar este cardápio a qualquer momento</li>
                  </ul>
                </div>
                <div className="text-sm">
                  Deseja continuar?
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmArchive}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Sim, Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMenu} onOpenChange={(open) => !open && setDeletingMenu(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Excluir Cardápio
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  Você está prestes a excluir permanentemente o cardápio <strong>"{deletingMenu?.name}"</strong>.
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="text-sm text-red-900 dark:text-red-100 font-bold mb-1">
                    ⚠️ ATENÇÃO - Esta ação não pode ser desfeita!
                  </div>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
                    <li>O cardápio será excluído permanentemente</li>
                    <li>Todas as categorias e itens serão removidos</li>
                    <li>Eventos vinculados perderão o acesso a este cardápio</li>
                    <li>Não será possível recuperar estes dados</li>
                  </ul>
                </div>
                <div className="text-sm font-semibold">
                  Tem certeza absoluta que deseja excluir este cardápio?
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
