"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Calendar, MapPin, Clock, Users, Edit, Trash2, Search, UserCheck, TrendingUp, ChefHat, Eye } from "lucide-react"
import { CompactMetricCard } from "@/components/metric-card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedContainer } from "@/components/ui/animated-container"
import Link from "next/link"
import { EventForm } from "@/components/event-form"
import { EventCalendar } from "@/components/event-calendar"
import { TeamManager } from "@/components/team-manager"
import { EventMenuLink } from "@/components/event-menu-link"
import { EventMenuSelections } from "@/components/event-menu-selections"
import { useEvents } from "@/hooks/use-events"
import { useCategories } from "@/hooks/use-categories"
import type { Event } from "@/types/event"
import { format, isToday, isTomorrow, isPast } from "date-fns"
import { ptBR } from "date-fns/locale"
import { isActiveEvent, isHistoryEvent } from "@/lib/utils/event-status"
import { filledContractService } from "@/lib/supabase/contract-services"

export default function EventosPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents()
  const { categories } = useCategories()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"active" | "all" | "upcoming" | "today" | "past" | "history">("active")
  const [managingTeamEvent, setManagingTeamEvent] = useState<Event | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeView, setActiveView] = useState<"list" | "calendar">("list")
  const [menuLinkEvent, setMenuLinkEvent] = useState<Event | null>(null)
  const [isMenuLinkDialogOpen, setIsMenuLinkDialogOpen] = useState(false)
  const [viewingSelectionsEvent, setViewingSelectionsEvent] = useState<Event | null>(null)
  const [isSelectionsDialogOpen, setIsSelectionsDialogOpen] = useState(false)

  // Calculate statistics
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return eventDate >= today && eventDate <= nextWeek
  })

  const thisMonthEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    const today = new Date()
    return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear()
  })

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location || '').toLowerCase().includes(searchTerm.toLowerCase())

      const eventDate = new Date(event.date)
      let matchesStatus = true

      switch (statusFilter) {
        case "active":
          matchesStatus = isActiveEvent(event)
          break
        case "all":
          matchesStatus = true
          break
        case "today":
          matchesStatus = isToday(eventDate)
          break
        case "upcoming":
          matchesStatus = !isPast(eventDate) && !isToday(eventDate) && event.status !== 'finalizado' && event.status !== 'cancelado'
          break
        case "past":
          matchesStatus = isPast(eventDate) && !isToday(eventDate)
          break
        case "history":
          matchesStatus = isHistoryEvent(event)
          break
      }

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Para histórico, mostrar mais recente primeiro
      if (statusFilter === "history") {
        return new Date(b.date + 'T12:00:00').getTime() - new Date(a.date + 'T12:00:00').getTime()
      }
      // Para outros filtros, mostrar mais antigo primeiro
      return new Date(a.date + 'T12:00:00').getTime() - new Date(b.date + 'T12:00:00').getTime()
    })

  const handleAddEvent = async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt"> & { linkedContractId?: string | null }) => {
    const { linkedContractId, ...eventDataWithoutContract } = eventData
    await addEvent(eventDataWithoutContract)

    // Vincular contrato ao evento se selecionado
    if (linkedContractId) {
      // Obter o último evento criado (o que acabamos de adicionar)
      // Usar timeout curto para garantir que o evento foi criado
      setTimeout(async () => {
        const allEvents = await import('@/lib/supabase/client-services').then(m => m.eventClientService.getAll())
        const latestEvent = allEvents.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]

        if (latestEvent) {
          await filledContractService.update(linkedContractId, { event_id: latestEvent.id })
        }
      }, 500)
    }

    setIsAddDialogOpen(false)
  }

  const handleEditEvent = async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt"> & { linkedContractId?: string | null }) => {
    if (editingEvent) {
      const { linkedContractId, ...eventDataWithoutContract } = eventData
      await updateEvent(editingEvent.id, eventDataWithoutContract)

      // Atualizar vinculação de contrato
      if (linkedContractId) {
        await filledContractService.update(linkedContractId, { event_id: editingEvent.id })
      }

      setEditingEvent(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteEvent = () => {
    if (deletingEvent) {
      deleteEvent(deletingEvent.id)
      setDeletingEvent(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const getEventStatus = (event: Event) => {
    switch (event.status) {
      case "planejado":
        return { label: "🗓️ Planejado", variant: "secondary" as const, color: "bg-blue-100 text-blue-800" }
      case "em_progresso":
        return { label: "🚀 Em Progresso", variant: "default" as const, color: "bg-green-100 text-green-800" }
      case "finalizado":
        return { label: "✅ Finalizado", variant: "outline" as const, color: "bg-gray-100 text-gray-800" }
      case "cancelado":
        return { label: "❌ Cancelado", variant: "destructive" as const, color: "bg-red-100 text-red-800" }
      default:
        return { label: "🗓️ Planejado", variant: "secondary" as const, color: "bg-blue-100 text-blue-800" }
    }
  }

  const todayEvents = events.filter((event) => isToday(new Date(event.date)))

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive mx-auto px-3 py-4 md:px-6 lg:px-8">
        {/* Modern Statistics - Mobile Optimized with Stagger Animation */}
        <AnimatedContainer delay={0} className="mb-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6"
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
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 oled:text-blue-200 mb-1">Total de Eventos</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 oled:text-blue-100">{events.length}</p>
              </div>
              <div className="p-2 bg-blue-500/10 dark:bg-blue-400/20 oled:bg-blue-400/30 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 oled:text-blue-300" />
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
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 oled:text-emerald-200 mb-1">Próximos 7 dias</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 oled:text-emerald-100">{upcomingEvents.length}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 dark:bg-emerald-400/20 oled:bg-emerald-400/30 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 oled:text-emerald-300" />
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
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300 oled:text-amber-200 mb-1">Este mês</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 oled:text-amber-100">{thisMonthEvents.length}</p>
              </div>
              <div className="p-2 bg-amber-500/10 dark:bg-amber-400/20 oled:bg-amber-400/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400 oled:text-amber-300" />
              </div>
            </div>
          </motion.div>
          </motion.div>
        </AnimatedContainer>

        {/* Mobile-First Action Bar with Slide-in Animation */}
        <AnimatedContainer delay={0.2} direction="right" className="mb-4">
          <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={activeView === "list" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs font-medium"
              onClick={() => setActiveView("list")}
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Lista
            </Button>
            <Button
              variant={activeView === "calendar" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs font-medium"
              onClick={() => setActiveView("calendar")}
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Calendário
            </Button>
          </div>
          
          <div className="flex-1" />
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 px-4 text-sm font-medium">
                <Plus className="w-4 h-4 mr-1.5" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-3 border-b border-border">
                <DialogTitle className="flex items-center gap-2 text-lg font-medium">
                  <Plus className="w-4 h-4 text-primary" />
                  Novo Evento
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Crie um novo evento e configure todos os detalhes necessários
                </DialogDescription>
              </DialogHeader>
              <div className="pt-4">
                <EventForm onSubmit={handleAddEvent} categories={categories} />
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </AnimatedContainer>

        {/* Content Container */}
        <div className="space-y-4">
          {activeView === "calendar" ? (
            <Card className="shadow-sm border border-border">
              <CardContent className="p-4">
                <EventCalendar events={events} categories={categories} />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
            {/* Search and Filters - Compacto sem card grande */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs whitespace-nowrap"
                  onClick={() => setStatusFilter("active")}
                >
                  Ativos
                </Button>
                <Button
                  variant={statusFilter === "today" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs whitespace-nowrap"
                  onClick={() => setStatusFilter("today")}
                >
                  Hoje
                </Button>
                <Button
                  variant={statusFilter === "upcoming" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs whitespace-nowrap"
                  onClick={() => setStatusFilter("upcoming")}
                >
                  Próximos
                </Button>
                <Button
                  variant={statusFilter === "history" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs whitespace-nowrap"
                  onClick={() => setStatusFilter("history")}
                >
                  Histórico
                </Button>
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs whitespace-nowrap"
                  onClick={() => setStatusFilter("all")}
                >
                  Todos
                </Button>
              </div>
            </div>

            {/* Lista de Eventos - Cards individuais compactos */}
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-foreground mb-1">
                    {searchTerm || statusFilter !== "all" ? "Nenhum evento encontrado" : "Nenhum evento cadastrado"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Tente ajustar os filtros de busca"
                      : "Comece criando seu primeiro evento"}
                  </p>
                </div>
              ) : (
                <AnimatedContainer delay={0.4}>
                  <motion.div 
                    className="space-y-3"
                    initial={false}
                    animate={"animate"}
                    variants={{
                      animate: {
                        transition: {
                          staggerChildren: 0.08
                        }
                      }
                    }}
                  >
                      {filteredEvents.map((event, index) => {
                      const status = getEventStatus(event)
                      const eventDate = new Date(event.date)
                      const staffCount = event.staffAssignments.reduce((sum, assignment) => sum + assignment.count, 0)

                      return (
                        <motion.div 
                          key={event.id}
                          className="group relative p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-all duration-200 cursor-pointer"
                          variants={{
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0 }
                          }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05
                          }}
                          whileHover={{
                            y: -2,
                            transition: { duration: 0.2 }
                          }}
                          onClick={() => setManagingTeamEvent(event)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              {/* Título e Status - Layout horizontal compacto */}
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium text-base text-foreground truncate">
                                  {event.title}
                                </h3>
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs">
                                  <div className={`w-2 h-2 rounded-full ${
                                    status.color.includes('blue') ? 'bg-blue-500' :
                                    status.color.includes('green') ? 'bg-green-500' :
                                    status.color.includes('gray') ? 'bg-gray-500' : 'bg-red-500'
                                  }`} />
                                  <span className="text-muted-foreground">
                                    {status.label.replace('🗓️ ', '').replace('🚀 ', '').replace('✅ ', '').replace('❌ ', '')}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Info básica em linha */}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{format(eventDate, "dd/MM/yyyy")}</span>
                                </div>
                                {event.startTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{event.startTime}</span>
                                  </div>
                                )}
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate max-w-24">{event.location}</span>
                                  </div>
                                )}
                                {staffCount > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{staffCount}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Botões de ação compactos */}
                            <div className="flex items-center gap-2 flex-shrink-0 transition-all md:hover:scale-105">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setViewingSelectionsEvent(event)
                                  setIsSelectionsDialogOpen(true)
                                }}
                                title="Ver seleções do cliente"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setMenuLinkEvent(event)
                                  setIsMenuLinkDialogOpen(true)
                                }}
                                title="Gerar link do cardápio"
                              >
                                <ChefHat className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingEvent(event)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeletingEvent(event)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </AnimatedContainer>
              )}
            </div>
            </div>
          )}
        </div>


        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-3 border-b border-border">
              <DialogTitle className="flex items-center gap-2 text-lg font-medium">
                <Edit className="w-4 h-4 text-primary" />
                Editar Evento
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Atualize as informações e configurações do evento
              </DialogDescription>
            </DialogHeader>
            <div className="pt-4">
              {editingEvent && (
                <EventForm initialData={editingEvent} onSubmit={handleEditEvent} categories={categories} />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Team Manager Dialog */}
        <Dialog open={!!managingTeamEvent} onOpenChange={(open) => !open && setManagingTeamEvent(null)}>
          <DialogContent className="max-w-lg md:max-w-4xl lg:max-w-5xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {managingTeamEvent?.title}
              </DialogTitle>
              <DialogDescription>
                Gerencie o status e a equipe do evento
              </DialogDescription>
            </DialogHeader>
            {managingTeamEvent && (
              <TeamManager
                event={managingTeamEvent}
                categories={categories}
                onUpdateEvent={(updatedEvent: Event) => {
                  updateEvent(updatedEvent.id, updatedEvent)
                  setManagingTeamEvent(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Menu Link Dialog */}
        {menuLinkEvent && (
          <EventMenuLink
            open={isMenuLinkDialogOpen}
            onOpenChange={setIsMenuLinkDialogOpen}
            eventId={menuLinkEvent.id}
            eventName={menuLinkEvent.title}
          />
        )}

        {/* Menu Selections Dialog */}
        {viewingSelectionsEvent && (
          <EventMenuSelections
            open={isSelectionsDialogOpen}
            onOpenChange={setIsSelectionsDialogOpen}
            eventId={viewingSelectionsEvent.id}
            eventName={viewingSelectionsEvent.title}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-destructive" />
                Excluir Evento
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o evento <strong>"{deletingEvent?.title}"</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEvent}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
