"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  CircleDollarSign,
  CheckCircle2,
  Clock,
  DollarSign,
  BarChart3
} from "lucide-react"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { PaymentEventSelector } from "@/components/payment-event-selector"
import { PaymentList } from "@/components/payment-list"
import { useEvents } from "@/hooks/use-events"
import { useCategories } from "@/hooks/use-categories"
import { usePeople } from "@/hooks/use-people"
import { usePayments } from "@/hooks/use-payments"
import { eventTeamClientService } from "@/lib/supabase/client-services"
import { isRelevantForPayments, isRelevantForPaymentHistory } from "@/lib/utils/event-status"

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

  // Filtro de eventos: alternar entre ativos e histórico
  const relevantEvents = useMemo(() => {
    if (showHistory) {
      return events.filter(isRelevantForPaymentHistory)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else {
      return events.filter(isRelevantForPayments)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
  }, [events, showHistory])

  // Auto-selecionar primeiro evento
  useEffect(() => {
    if (relevantEvents.length > 0) {
      if (showHistory) {
        setSelectedEvent(relevantEvents[0].id)
      } else {
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
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // 🔄 REVALIDAÇÃO AO TROCAR DE ABA - Atualiza quando volta para a página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Aba ficou visível - recarregar dados
        setRefreshTrigger(prev => prev + 1)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Processar eventos e pessoas para criar estrutura de pagamentos
  useEffect(() => {
    const loadEventPaymentData = async () => {
      const data = new Map<string, PersonPayment[]>()

      for (const event of relevantEvents) {
        const eventPeople: PersonPayment[] = []

        try {
          const eventTeam = await eventTeamClientService.getEventTeam(event.id)

          if (eventTeam && eventTeam.length > 0) {
            eventTeam.forEach((person: any) => {
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
                  amount: existingPayment?.amount || person.value || 50,
                  isPaid: existingPayment?.is_paid || false,
                  paymentId: existingPayment?.id
                }

                eventPeople.push(personPayment)
              }
            })
          } else if (event.staffAssignments && Array.isArray(event.staffAssignments)) {
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
                    amount: person.value || 50,
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
  }, [relevantEvents, categories, payments, people, refreshTrigger])

  useEffect(() => {
    setLocalPayments(new Map(eventPaymentData))
  }, [eventPaymentData])

  // Atualizar valor do pagamento
  const handleAmountChange = (eventId: string, personId: string, amount: number) => {
    setLocalPayments(prevMap => {
      const prevEventPayments = prevMap.get(eventId)
      if (!prevEventPayments) return prevMap

      const updated = prevEventPayments.map(p =>
        p.personId === personId ? { ...p, amount } : p
      )
      const newMap = new Map(prevMap)
      newMap.set(eventId, updated)
      return newMap
    })
  }

  // Controle de requisições pendentes (evita race conditions em múltiplos toggles simultâneos)
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set())

  /**
   * Toggle status de pagamento com Optimistic UI
   *
   * IMPORTANTE: Usa functional updates (prevMap => newMap) em vez de updates diretos
   * para evitar race conditions quando múltiplos toggles acontecem simultaneamente.
   *
   * Sem functional update: cada toggle lê o MESMO estado antigo e sobrescreve um ao outro.
   * Com functional update: cada toggle recebe o estado MAIS RECENTE e aplica mudanças incrementalmente.
   */
  const handlePaymentToggle = async (eventId: string, personId: string) => {
    const toggleKey = `${eventId}-${personId}`

    // Bloquear se já há toggle pendente para este item específico
    if (pendingToggles.has(toggleKey)) return

    // Adicionar à lista de toggles pendentes
    setPendingToggles(prev => new Set(prev).add(toggleKey))

    // Obter dados ANTES do setState (usando o state atual)
    const currentEventPayments = localPayments.get(eventId)
    if (!currentEventPayments) {
      setPendingToggles(prev => {
        const updated = new Set(prev)
        updated.delete(toggleKey)
        return updated
      })
      return
    }

    const currentPayment = currentEventPayments.find(p => p.personId === personId)
    if (!currentPayment) {
      setPendingToggles(prev => {
        const updated = new Set(prev)
        updated.delete(toggleKey)
        return updated
      })
      return
    }

    // Calcular novo estado
    const newIsPaid = !currentPayment.isPaid

    // Dados para salvar no banco
    const paymentData = {
      paymentId: currentPayment.paymentId,
      amount: currentPayment.amount,
      isPaid: newIsPaid
    }

    // 1. OPTIMISTIC UPDATE - Atualiza UI IMEDIATAMENTE
    setLocalPayments(prevMap => {
      const prevEventPayments = prevMap.get(eventId)
      if (!prevEventPayments) return prevMap

      const updated = prevEventPayments.map(p =>
        p.personId === personId ? { ...p, isPaid: newIsPaid } : p
      )
      const newMap = new Map(prevMap)
      newMap.set(eventId, updated)
      return newMap
    })

    // 2. BACKEND UPDATE - Roda em BACKGROUND (não bloqueia UI)
    if (paymentData.paymentId) {
      // Fire-and-forget: salva mas não espera resposta
      updatePayment(paymentData.paymentId, {
        is_paid: paymentData.isPaid,
        amount: paymentData.amount
      }).then(updated => {
        if (!updated) {
          // Reverter optimistic update
          setLocalPayments(prevMap => {
            const prevEventPayments = prevMap.get(eventId)
            if (!prevEventPayments) return prevMap

            const reverted = prevEventPayments.map(p =>
              p.personId === personId ? { ...p, isPaid: !newIsPaid } : p
            )
            const newMap = new Map(prevMap)
            newMap.set(eventId, reverted)
            return newMap
          })
          alert('Erro ao salvar pagamento. Tente novamente.')
        }
      }).catch(() => {
        // Reverter optimistic update
        setLocalPayments(prevMap => {
          const prevEventPayments = prevMap.get(eventId)
          if (!prevEventPayments) return prevMap

          const reverted = prevEventPayments.map(p =>
            p.personId === personId ? { ...p, isPaid: !newIsPaid } : p
          )
          const newMap = new Map(prevMap)
          newMap.set(eventId, reverted)
          return newMap
        })
        alert('Erro ao salvar pagamento. Tente novamente.')
      }).finally(() => {
        // Remover da lista de toggles pendentes
        setPendingToggles(prev => {
          const updated = new Set(prev)
          updated.delete(toggleKey)
          return updated
        })
      })
    } else {
      // Criar novo pagamento (primeira vez)
      if (paymentData.amount <= 0) {
        // Reverter optimistic update
        setLocalPayments(prevMap => {
          const prevEventPayments = prevMap.get(eventId)
          if (!prevEventPayments) return prevMap

          const reverted = prevEventPayments.map(p =>
            p.personId === personId ? { ...p, isPaid: !newIsPaid } : p
          )
          const newMap = new Map(prevMap)
          newMap.set(eventId, reverted)
          return newMap
        })
        setPendingToggles(prev => {
          const updated = new Set(prev)
          updated.delete(toggleKey)
          return updated
        })
        alert('Erro: O valor do pagamento deve ser maior que zero.')
        return
      }

      // Fire-and-forget: cria mas não espera resposta
      createPayment({
        event_id: eventId,
        person_id: personId,
        amount: paymentData.amount,
        is_paid: paymentData.isPaid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).then(newPayment => {
        if (newPayment) {
          // Atualizar com ID do payment criado
          setLocalPayments(prevMap => {
            const prevEventPayments = prevMap.get(eventId)
            if (!prevEventPayments) return prevMap

            const updatedWithId = prevEventPayments.map(p =>
              p.personId === personId ? { ...p, paymentId: newPayment.id } : p
            )
            const newMap = new Map(prevMap)
            newMap.set(eventId, updatedWithId)
            return newMap
          })
        } else {
          // Reverter optimistic update
          setLocalPayments(prevMap => {
            const prevEventPayments = prevMap.get(eventId)
            if (!prevEventPayments) return prevMap

            const reverted = prevEventPayments.map(p =>
              p.personId === personId ? { ...p, isPaid: !newIsPaid } : p
            )
            const newMap = new Map(prevMap)
            newMap.set(eventId, reverted)
            return newMap
          })
          alert('Erro ao criar pagamento. Tente novamente.')
        }
      }).catch(() => {
        // Reverter optimistic update
        setLocalPayments(prevMap => {
          const prevEventPayments = prevMap.get(eventId)
          if (!prevEventPayments) return prevMap

          const reverted = prevEventPayments.map(p =>
            p.personId === personId ? { ...p, isPaid: !newIsPaid } : p
          )
          const newMap = new Map(prevMap)
          newMap.set(eventId, reverted)
          return newMap
        })
        alert('Erro ao criar pagamento. Tente novamente.')
      }).finally(() => {
        // Remover da lista de toggles pendentes
        setPendingToggles(prev => {
          const updated = new Set(prev)
          updated.delete(toggleKey)
          return updated
        })
      })
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

  // Calcular estatísticas do evento selecionado
  const globalStats = useMemo(() => {
    if (!selectedEvent) {
      return {
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        totalPeople: 0,
        paidPeople: 0,
        pendingPeople: 0,
        completionRate: 0
      }
    }

    const eventPayments = localPayments.get(selectedEvent) || []
    let totalAmount = 0
    let paidAmount = 0
    let totalPeople = 0
    let paidPeople = 0

    eventPayments.forEach(payment => {
      totalAmount += payment.amount
      totalPeople += 1
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
      pendingPeople: totalPeople - paidPeople,
      completionRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    }
  }, [localPayments, selectedEvent])

  // Contador de pagamentos por evento
  const eventPaymentsCount = useMemo(() => {
    const count = new Map<string, number>()
    localPayments.forEach((payments, eventId) => {
      count.set(eventId, payments.length)
    })
    return count
  }, [localPayments])

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive mx-auto px-3 py-4 md:px-6 lg:px-8">
        {/* Statistics Cards */}
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
                    R$ {globalStats.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/10 dark:bg-blue-400/20 oled:bg-blue-400/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 oled:text-blue-300" />
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
                    R$ {globalStats.paidAmount.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-emerald-500/10 dark:bg-emerald-400/20 oled:bg-emerald-400/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 oled:text-emerald-300" />
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
                    R$ {globalStats.pendingAmount.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 dark:bg-amber-400/20 oled:bg-amber-400/30 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 oled:text-amber-300" />
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
                    {globalStats.completionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 bg-purple-500/10 dark:bg-purple-400/20 oled:bg-purple-400/30 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400 oled:text-purple-300" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatedContainer>

        {/* Header */}
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

        {/* Main Content - Side by Side em Desktop */}
        <motion.div
          className="flex flex-col lg:flex-row gap-4 lg:gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Event Selector - 30% em desktop */}
          <div className="lg:w-1/3">
            <PaymentEventSelector
              events={relevantEvents}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
              showHistory={showHistory}
              onToggleHistory={setShowHistory}
              getEventStats={getEventStats}
              eventPaymentsCount={eventPaymentsCount}
            />
          </div>

          {/* Payment List - 70% em desktop */}
          <div className="lg:w-2/3">
            <PaymentList
              selectedEvent={selectedEvent}
              payments={localPayments.get(selectedEvent || '') || []}
              onPaymentToggle={(personId) => {
                if (selectedEvent) {
                  handlePaymentToggle(selectedEvent, personId)
                }
              }}
              onAmountChange={(personId, amount) => {
                if (selectedEvent) {
                  handleAmountChange(selectedEvent, personId, amount)
                }
              }}
              pendingToggles={pendingToggles}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
