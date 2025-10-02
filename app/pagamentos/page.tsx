"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  CircleDollarSign,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  ChevronRight,
  Calendar,
  MapPin,
  Banknote,
  DollarSign,
  BarChart3
} from "lucide-react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedIcon } from "@/components/ui/animated-icon"
import { CompactMetricCard, formatCurrency } from "@/components/metric-card"
import { useEvents } from "@/hooks/use-events"
import { useCategories } from "@/hooks/use-categories"
import { usePeople } from "@/hooks/use-people"
import { usePayments } from "@/hooks/use-payments"
import { eventTeamClientService } from "@/lib/supabase/client-services"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { isRelevantForPayments, getStatusDisplay, isRelevantForPaymentHistory } from "@/lib/utils/event-status"

interface PersonPayment {
  personId: string
  personName: string
  categoryId: string
  categoryName: string
  categoryColor: string
  eventId: string
  amount: number
  isPaid: boolean
  paymentId?: string
}

export default function PagamentosPage() {
  const { events } = useEvents()
  const { categories } = useCategories()
  const { people } = usePeople()
  const { payments, createPayment, updatePayment, loading } = usePayments()
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [localPayments, setLocalPayments] = useState<Map<string, PersonPayment[]>>(new Map())
  const [showHistory, setShowHistory] = useState(false)

  // 🎯 FILTRO INTELIGENTE: Alternar entre eventos ativos e histórico
  const relevantEvents = useMemo(() => {
    if (showHistory) {
      // Mostrar eventos finalizados/cancelados (histórico)
      return events.filter(isRelevantForPaymentHistory)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Mais recente primeiro
    } else {
      // Mostrar eventos ativos (padrão)
      return events.filter(isRelevantForPayments)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Mais antigo primeiro
    }
  }, [events, showHistory])

  // Auto-selecionar o primeiro evento quando trocar de modo ou carregar dados
  useEffect(() => {
    if (relevantEvents.length > 0) {
      if (showHistory) {
        // No histórico, selecionar o primeiro (mais recente)
        setSelectedEvent(relevantEvents[0].id)
      } else {
        // Nos ativos, priorizar evento em progresso/hoje
        const emProgressoEvent = relevantEvents.find(event => event.status === 'em_progresso')
        
        if (emProgressoEvent) {
          setSelectedEvent(emProgressoEvent.id)
        } else {
          const today = new Date().toISOString().split('T')[0]
          const todayEvent = relevantEvents.find(event => event.date === today)
          
          if (todayEvent) {
            setSelectedEvent(todayEvent.id)
          } else {
            setSelectedEvent(relevantEvents[0].id)
          }
        }
      }
    } else {
      setSelectedEvent(null)
    }
  }, [relevantEvents, showHistory])

  // Estado para dados de pagamento processados
  const [eventPaymentData, setEventPaymentData] = useState<Map<string, PersonPayment[]>>(new Map())
  
  // Processar eventos e pessoas para criar estrutura de pagamentos
  useEffect(() => {
    const loadEventPaymentData = async () => {
      const data = new Map<string, PersonPayment[]>()
      
      for (const event of relevantEvents) {
        const eventPeople: PersonPayment[] = []
        
        try {
          // Carregar equipe específica do Supabase
          const eventTeam = await eventTeamClientService.getEventTeam(event.id)
          
          if (eventTeam && eventTeam.length > 0) {
            eventTeam.forEach((person: any) => {
              // Usar category_id do Supabase (sempre snake_case)
              const categoryId = person.category_id
              const category = categories.find(c => c.id === categoryId)
              
              if (category) {
                const existingPayment = payments.find(
                  p => p.event_id === event.id && p.person_id === person.id
                )
                
                const personPayment = {
                  personId: person.id,
                  personName: person.name,
                  categoryId: categoryId,
                  categoryName: category.name,
                  categoryColor: category.color,
                  eventId: event.id,
                  amount: person.value || 50, // Valor padrão se não definido
                  isPaid: existingPayment?.is_paid || false,
                  paymentId: existingPayment?.id
                }
                
                eventPeople.push(personPayment)
              }
            })
          } else if (event.staffAssignments && Array.isArray(event.staffAssignments)) {
            // Fallback para eventos antigos sem equipe específica
            event.staffAssignments.forEach(assignment => {
              const category = categories.find(c => c.id === assignment.categoryId)
              if (category) {
                const categoryPeople = people.filter(p => p.categoryId === category.id)
                
                categoryPeople.slice(0, assignment.count).forEach(person => {
                  const existingPayment = payments.find(
                    p => p.event_id === event.id && p.person_id === person.id
                  )
                  
                  eventPeople.push({
                    personId: person.id,
                    personName: person.name,
                    categoryId: category.id,
                    categoryName: category.name,
                    categoryColor: category.color,
                    eventId: event.id,
                    amount: person.value || 50, // Valor padrão se não definido
                    isPaid: existingPayment?.is_paid || false,
                    paymentId: existingPayment?.id
                  })
                })
              }
            })
          }
        } catch (error) {
          console.error(`Erro ao carregar equipe para ${event.title}:`, error)
        }
        
        data.set(event.id, eventPeople)
      }
      
      setEventPaymentData(data)
    }
    
    if (relevantEvents.length > 0 && categories.length > 0) {
      loadEventPaymentData()
    }
  }, [relevantEvents, categories, payments])

  useEffect(() => {
    setLocalPayments(new Map(eventPaymentData))
  }, [eventPaymentData])

  // Atualizar valor do pagamento
  const handleAmountChange = (eventId: string, personId: string, amount: number) => {
    const eventPayments = localPayments.get(eventId)
    if (eventPayments) {
      const updated = eventPayments.map(p => 
        p.personId === personId ? { ...p, amount } : p
      )
      const newMap = new Map(localPayments)
      newMap.set(eventId, updated)
      setLocalPayments(newMap)
    }
  }

  // Toggle status de pagamento
  const handlePaymentToggle = async (eventId: string, personId: string) => {
    const eventPayments = localPayments.get(eventId)
    if (!eventPayments) return
    
    const payment = eventPayments.find(p => p.personId === personId)
    if (!payment) return
    
    const newIsPaid = !payment.isPaid
    
    // Atualizar o estado local IMEDIATAMENTE para responsividade
    const updated = eventPayments.map(p => 
      p.personId === personId ? { ...p, isPaid: newIsPaid } : p
    )
    const newMap = new Map(localPayments)
    newMap.set(eventId, updated)
    setLocalPayments(newMap)
    
    try {
      if (payment.paymentId) {
        // Atualizar pagamento existente
        await updatePayment(payment.paymentId, { 
          is_paid: newIsPaid,
          amount: payment.amount 
        })
      } else {
        // Verificar se amount é válido antes de criar
        if (payment.amount <= 0) {
          alert('Erro: O valor do pagamento deve ser maior que zero.')
          // Reverter estado local se erro
          const reverted = eventPayments.map(p => 
            p.personId === personId ? { ...p, isPaid: !newIsPaid } : p
          )
          newMap.set(eventId, reverted)
          setLocalPayments(newMap)
          return
        }
        
        // Criar novo pagamento
        const newPayment = await createPayment({
          event_id: eventId,
          person_id: personId,
          amount: payment.amount,
          is_paid: newIsPaid
        })
        
        if (newPayment) {
          // Atualizar com o ID do pagamento criado
          const updatedWithId = eventPayments.map(p => 
            p.personId === personId ? { ...p, isPaid: newIsPaid, paymentId: newPayment.id } : p
          )
          newMap.set(eventId, updatedWithId)
          setLocalPayments(newMap)
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error)
      // Reverter estado local em caso de erro
      const reverted = eventPayments.map(p => 
        p.personId === personId ? { ...p, isPaid: !newIsPaid } : p
      )
      newMap.set(eventId, reverted)
      setLocalPayments(newMap)
      alert('Erro ao atualizar pagamento. Tente novamente.')
    }
  }

  // Calcular estatísticas por evento
  const getEventStats = (eventId: string) => {
    const eventPayments = localPayments.get(eventId) || []
    const total = eventPayments.reduce((sum, p) => sum + p.amount, 0)
    const paid = eventPayments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0)
    const pending = total - paid
    const paidCount = eventPayments.filter(p => p.isPaid).length
    const totalCount = eventPayments.length
    
    return { total, paid, pending, paidCount, totalCount }
  }

  // Calcular estatísticas globais de todos os eventos
  const globalStats = useMemo(() => {
    let totalAmount = 0
    let paidAmount = 0
    let totalPeople = 0
    let paidPeople = 0
    
    for (const [eventId, eventPayments] of localPayments) {
      eventPayments.forEach(payment => {
        totalAmount += payment.amount
        totalPeople += 1
        if (payment.isPaid) {
          paidAmount += payment.amount
          paidPeople += 1
        }
      })
    }
    
    return {
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
      totalPeople,
      paidPeople,
      pendingPeople: totalPeople - paidPeople,
      completionRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    }
  }, [localPayments])

  // Calcular estatísticas do evento selecionado
  const selectedEventStats = useMemo(() => {
    if (!selectedEvent) {
      return {
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        totalPeople: 0,
        paidPeople: 0,
        pendingPeople: 0
      }
    }

    const eventPayments = localPayments.get(selectedEvent) || []
    let totalAmount = 0
    let paidAmount = 0
    let totalPeople = eventPayments.length
    let paidPeople = 0
    
    eventPayments.forEach(payment => {
      totalAmount += payment.amount
      if (payment.isPaid) {
        paidAmount += payment.amount
        paidPeople += 1
      }
    })
    
    return {
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
      totalPeople,
      paidPeople,
      pendingPeople: totalPeople - paidPeople
    }
  }, [localPayments, selectedEvent])

  // Agrupar pessoas por categoria
  const groupByCategory = (eventPayments: PersonPayment[]) => {
    const grouped = new Map<string, PersonPayment[]>()
    
    eventPayments.forEach(payment => {
      const key = payment.categoryId
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(payment)
    })
    
    return Array.from(grouped.entries()).map(([categoryId, payments]) => ({
      categoryId,
      categoryName: payments[0].categoryName,
      categoryColor: payments[0].categoryColor,
      payments
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive mx-auto px-3 py-4 md:px-6 lg:px-8">
        {/* Statistics Cards with Stagger Animation */}
        <AnimatedContainer delay={0} className="mb-4">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-4 gap-3"
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
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 oled:text-blue-200 mb-1">Total Geral</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100 oled:text-blue-100">
                    <AnimatedNumber value={globalStats.totalAmount} prefix="R$ " precision={2} duration={1.5} />
                  </p>
                </div>
                <div className="p-2 bg-blue-500/10 dark:bg-blue-400/20 oled:bg-blue-400/30 rounded-lg">
                  <AnimatedIcon variant="bounce">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 oled:text-blue-300" />
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
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 oled:text-emerald-200 mb-1">Pagamentos Realizados</p>
                  <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100 oled:text-emerald-100">
                    <AnimatedNumber value={globalStats.paidAmount} prefix="R$ " precision={2} duration={1.5} />
                  </p>
                </div>
                <div className="p-2 bg-emerald-500/10 dark:bg-emerald-400/20 oled:bg-emerald-400/30 rounded-lg">
                  <AnimatedIcon variant="pulse">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 oled:text-emerald-300" />
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
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 oled:text-amber-200 mb-1">Pendentes</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-amber-100 oled:text-amber-100">
                    <AnimatedNumber value={globalStats.pendingAmount} prefix="R$ " precision={2} duration={1.5} />
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 dark:bg-amber-400/20 oled:bg-amber-400/30 rounded-lg">
                  <AnimatedIcon variant="wobble">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 oled:text-amber-300" />
                  </AnimatedIcon>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 oled:from-purple-400/10 oled:to-purple-300/5 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30 oled:border-purple-400/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
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
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 oled:text-purple-200 mb-1">Taxa de Conclusão</p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100 oled:text-purple-100">
                    <AnimatedNumber value={globalStats.completionRate} precision={1} suffix="%" duration={1.5} />
                  </p>
                </div>
                <div className="p-2 bg-purple-500/10 dark:bg-purple-400/20 oled:bg-purple-400/30 rounded-lg">
                  <AnimatedIcon variant="bounce">
                    <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400 oled:text-purple-300" />
                  </AnimatedIcon>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatedContainer>

        {/* Header with Animation */}
        <AnimatedContainer delay={0.2} direction="right" className="mb-4">
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
              <CircleDollarSign className="w-6 h-6 text-emerald-600" />
            </motion.div>
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              Pagamentos
            </span>
          </motion.h1>
        </AnimatedContainer>

        {/* Conteúdo Principal */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Header dos Eventos - Sem card grande */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-base font-medium">
                {showHistory ? "Histórico" : "Eventos Ativos"}
              </h2>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                <AnimatedNumber value={relevantEvents.length} />
              </Badge>
            </div>
            
            {/* Toggle Histórico - Consistente com o tema */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={!showHistory ? "default" : "ghost"}
                size="sm"
                className="h-6 px-3 text-xs font-medium"
                onClick={() => setShowHistory(false)}
              >
                Ativos
              </Button>
              <Button
                variant={showHistory ? "default" : "ghost"}
                size="sm"
                className="h-6 px-3 text-xs font-medium"
                onClick={() => setShowHistory(true)}
              >
                Histórico
              </Button>
            </div>
          </div>

          {/* Lista de Eventos - Cada evento como card individual */}
          <div className="space-y-3">
            {relevantEvents.length === 0 ? (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-2">
                  {showHistory ? "Nenhum evento no histórico" : "Nenhum evento ativo"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {showHistory 
                    ? "Não há eventos finalizados ou cancelados para mostrar"
                    : "Eventos planejados ou em progresso aparecerão aqui"
                  }
                </p>
              </motion.div>
            ) : (
              relevantEvents.map((event, index) => {
                const eventPayments = localPayments.get(event.id) || []
                const stats = getEventStats(event.id)
                const isSelected = selectedEvent === event.id
                const hasPayments = eventPayments.length > 0
                const statusDisplay = getStatusDisplay(event.status)
                const today = new Date().toISOString().split('T')[0]
                const isToday = event.date === today

                return (
                  <motion.div 
                    key={event.id}
                    className={`
                      group relative p-4 transition-all duration-200 cursor-pointer
                      bg-card border border-border rounded-lg hover:shadow-sm
                      ${isSelected 
                        ? `ring-2 ring-primary/20 border-primary/50` 
                        : 'hover:border-primary/30'
                      }
                    `}
                    onClick={() => setSelectedEvent(event.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                  >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              {/* Título e Status - Layout horizontal */}
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-sm text-gray-900 dark:text-white oled:text-gray-100 truncate">
                                  {event.title}
                                </h3>
                                {isToday && (
                                  <Badge className="bg-green-500 text-white text-xs px-1.5 py-0">
                                    HOJE
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 oled:bg-gray-900 rounded text-xs">
                                  <span>{statusDisplay.emoji}</span>
                                  <span className="text-gray-600 dark:text-gray-400 oled:text-gray-300">{statusDisplay.text}</span>
                                </div>
                              </div>
                              
                              {/* Info básica em linha */}
                              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 oled:text-gray-300">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{format(new Date(event.date), "dd/MM", { locale: ptBR })}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{event.startTime}</span>
                                </div>
                                {hasPayments && (
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{eventPayments.length}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Valor e seta */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {hasPayments && (
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-gray-900 dark:text-white oled:text-gray-100">
                                    {formatCurrency(stats.total)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {stats.paidCount}/{stats.totalCount} pagos
                                  </div>
                                </div>
                              )}
                              
                              <ChevronRight className={`w-4 h-4 transition-transform ${
                                isSelected 
                                  ? 'rotate-90 text-emerald-600' 
                                  : 'text-gray-400 group-hover:text-emerald-500'
                              }`} />
                            </div>
                          </div>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Painel de Pagamento - Mobile Otimizado */}
          {selectedEvent && (
            <AnimatedContainer delay={0.8}>
              <Card className="shadow-sm border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <CircleDollarSign className="w-4 h-4 text-emerald-600" />
                    </motion.div>
                    Gerenciar Pagamentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <motion.div 
                    className="space-y-4"
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
                    {(() => {
                      const eventPayments = localPayments.get(selectedEvent) || []
                      const categoryGroups = groupByCategory(eventPayments)
                      
                      if (categoryGroups.length === 0) {
                        return (
                          <motion.div 
                            className="text-center py-8"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                              <Users className="w-8 h-8 mx-auto text-gray-400 oled:text-gray-300 mb-2" />
                            </motion.div>
                            <p className="text-sm text-gray-600 dark:text-muted-foreground oled:text-gray-300">
                              Este evento não possui equipe atribuída
                            </p>
                          </motion.div>
                        )
                      }

                      return categoryGroups.map((group, groupIndex) => (
                        <motion.div 
                          key={group.categoryId} 
                          className="space-y-3"
                          variants={{
                            initial: { opacity: 0, x: -20 },
                            animate: { opacity: 1, x: 0 }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <motion.div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: group.categoryColor }}
                              whileHover={{ scale: 1.3 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            />
                            <h4 className="font-medium text-sm text-gray-900 dark:text-foreground oled:text-white">
                              {group.categoryName}
                            </h4>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 + groupIndex * 0.1 }}
                            >
                              <Badge variant="outline" className="text-xs">
                                <AnimatedNumber value={group.payments.length} />
                              </Badge>
                            </motion.div>
                          </div>
                          
                          <motion.div 
                            className="space-y-2"
                            initial="initial"
                            animate="animate"
                            variants={{
                              initial: {},
                              animate: {
                                transition: {
                                  staggerChildren: 0.05
                                }
                              }
                            }}
                          >
                            {group.payments.map((payment, paymentIndex) => (
                              <motion.div 
                                key={payment.personId}
                                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                                  payment.isPaid 
                                    ? 'bg-green-50 dark:bg-green-950/20 oled:bg-green-400/10 border border-green-200 dark:border-green-800 oled:border-green-400/30' 
                                    : 'bg-gray-50 dark:bg-card oled:bg-white/5 border border-gray-200 dark:border-border oled:border-white/20'
                                }`}
                                variants={{
                                  initial: { opacity: 0, y: 10, scale: 0.95 },
                                  animate: { opacity: 1, y: 0, scale: 1 }
                                }}
                                whileHover={{
                                  scale: 1.02,
                                  transition: { duration: 0.2 }
                                }}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <motion.button
                                    onClick={() => handlePaymentToggle(selectedEvent, payment.personId)}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                      payment.isPaid
                                        ? 'bg-green-500 border-green-500 text-white oled:bg-green-400 oled:border-green-400'
                                        : 'border-gray-300 hover:border-emerald-400 oled:border-gray-500 oled:hover:border-emerald-400'
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                  >
                                    {payment.isPaid && <CheckCircle2 className="w-3 h-3" />}
                                  </motion.button>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm text-gray-900 dark:text-foreground oled:text-white truncate">
                                      {payment.personName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-muted-foreground oled:text-gray-400">
                                      {payment.categoryName}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-xs text-gray-600 dark:text-muted-foreground oled:text-gray-400">R$</span>
                                  <motion.input
                                    type="number"
                                    value={payment.amount}
                                    onChange={(e) => handleAmountChange(
                                      selectedEvent, 
                                      payment.personId, 
                                      parseFloat(e.target.value) || 0
                                    )}
                                    className="w-16 h-7 text-right text-xs border border-gray-300 dark:border-border oled:border-white/30 rounded px-2 bg-white dark:bg-background oled:bg-black oled:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    step="0.01"
                                    min="0"
                                    whileFocus={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                  />
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        </motion.div>
                      ))
                    })()}
                  </motion.div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          )}

            {/* Instrução quando nenhum evento selecionado */}
            {!selectedEvent && (
              <AnimatedContainer delay={0.8}>
                <Card className="shadow-sm border border-border">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    >
                      <CircleDollarSign className="w-12 h-12 mx-auto text-gray-300 oled:text-gray-400 mb-3" />
                    </motion.div>
                    <motion.p 
                      className="text-gray-600 dark:text-muted-foreground oled:text-gray-300"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                    >
                      Selecione um evento para gerenciar pagamentos
                    </motion.p>
                    <motion.p 
                      className="text-sm text-gray-500 dark:text-muted-foreground oled:text-gray-400 mt-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 }}
                    >
                      Toque em um evento da lista ao lado
                    </motion.p>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            )}
        </motion.div>
      </div>
    </div>
  )
}