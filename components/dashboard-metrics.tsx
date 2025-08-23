// [ARQUIVO: dashboard-metrics.tsx]
// Função: Componente de métricas do dashboard principal
// Interações: usa useEvents, usePayments para estatísticas
// Observação: Cards com métricas operacionais, temporais, financeiras e de eficiência

"use client"

import { useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedSkeleton } from "@/components/ui/animated-skeleton"
import { AnimatedIcon } from "@/components/ui/animated-icon"
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Target,
  BarChart3,
  Zap
} from "lucide-react"
import { useEvents } from "@/hooks/use-events"
import { usePayments } from "@/hooks/use-payments"
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { eventTeamClientService } from "@/lib/supabase/client-services"

export function DashboardMetrics() {
  const { events } = useEvents()
  const { payments, getPaymentStats } = usePayments()
  const [teamCounts, setTeamCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Carregar contagens de equipe do Supabase
  useEffect(() => {
    const loadTeamCounts = async () => {
      console.log('📊 Loading team counts from Supabase for dashboard...')
      const counts: Record<string, number> = {}
      
      try {
        for (const event of events) {
          const eventTeam = await eventTeamClientService.getEventTeam(event.id)
          counts[event.id] = eventTeam ? eventTeam.length : 0
        }
        setTeamCounts(counts)
        console.log('✅ Team counts loaded:', counts)
        setIsLoading(false)
      } catch (error) {
        console.error('❌ Error loading team counts:', error)
        setTeamCounts({})
        setIsLoading(false)
      }
    }

    if (events.length > 0) {
      loadTeamCounts()
    } else {
      setIsLoading(false)
    }
  }, [events])

  // Métricas de eventos
  const eventMetrics = useMemo(() => {
    const today = new Date()
    
    const eventsToday = events.filter(event => isToday(parseISO(event.date)))
    const eventsTomorrow = events.filter(event => isTomorrow(parseISO(event.date)))
    const eventsThisWeek = events.filter(event => isThisWeek(parseISO(event.date)))
    const eventsThisMonth = events.filter(event => isThisMonth(parseISO(event.date)))
    
    const eventsByStatus = {
      planejado: events.filter(e => e.status === "planejado").length,
      em_progresso: events.filter(e => e.status === "em_progresso").length,
      finalizado: events.filter(e => e.status === "finalizado").length,
      cancelado: events.filter(e => e.status === "cancelado").length
    }

    const totalStaff = events.reduce((sum, event) => {
      const teamCount = teamCounts[event.id] || 0
      return sum + teamCount
    }, 0)

    const avgStaffPerEvent = events.length > 0 ? (totalStaff / events.length).toFixed(1) : "0"

    return {
      total: events.length,
      today: eventsToday.length,
      tomorrow: eventsTomorrow.length,
      thisWeek: eventsThisWeek.length,
      thisMonth: eventsThisMonth.length,
      byStatus: eventsByStatus,
      totalStaff,
      avgStaffPerEvent
    }
  }, [events, teamCounts])

  // Métricas de pagamentos
  const paymentMetrics = useMemo(() => {
    const stats = getPaymentStats()
    const completionRate = stats.totalCount > 0 ? ((stats.paidCount / stats.totalCount) * 100).toFixed(1) : "0"
    
    return {
      ...stats,
      completionRate: parseFloat(completionRate)
    }
  }, [getPaymentStats])

  // Métricas de eficiência
  const efficiencyMetrics = useMemo(() => {
    const finishedEvents = events.filter(e => e.status === "finalizado")
    const canceledEvents = events.filter(e => e.status === "cancelado")
    
    const successRate = events.length > 0 ? 
      ((finishedEvents.length / (finishedEvents.length + canceledEvents.length)) * 100).toFixed(1) : "0"
    
    const avgPaymentPerEvent = finishedEvents.length > 0 ? 
      (paymentMetrics.totalAmount / finishedEvents.length).toFixed(2) : "0"

    return {
      successRate: parseFloat(successRate),
      avgPaymentPerEvent: parseFloat(avgPaymentPerEvent),
      eventsCompleted: finishedEvents.length,
      eventsCanceled: canceledEvents.length
    }
  }, [events, paymentMetrics.totalAmount])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Loading States */}
        {["Métricas Operacionais", "Métricas Temporais", "Métricas Financeiras", "Status dos Eventos"].map((section, sectionIndex) => (
          <div key={section}>
            <motion.h2 
              className="text-xl font-semibold mb-4 flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <BarChart3 className="w-5 h-5 text-blue-600" />
              {section}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (sectionIndex * 4 + index) * 0.05 }}
                >
                  <AnimatedSkeleton />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas Operacionais */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 
          className="text-xl font-semibold mb-4 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </motion.div>
          Métricas Operacionais
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedCard index={0}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AnimatedIcon variant="bounce">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </AnimatedIcon>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Eventos</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={eventMetrics.total} duration={1.2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={1}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AnimatedIcon variant="pulse">
                  <Users className="w-5 h-5 text-green-600" />
                </AnimatedIcon>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Pessoas</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={eventMetrics.totalStaff} duration={1.2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={2}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AnimatedIcon variant="wobble">
                  <Target className="w-5 h-5 text-purple-600" />
                </AnimatedIcon>
                <div>
                  <p className="text-sm text-muted-foreground">Média Pessoas/Evento</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={parseFloat(eventMetrics.avgStaffPerEvent)} precision={1} duration={1.2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={3}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AnimatedIcon variant="bounce">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </AnimatedIcon>
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={efficiencyMetrics.successRate} precision={1} suffix="%" duration={1.2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </motion.div>

      {/* Métricas Temporais */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.h2 
          className="text-xl font-semibold mb-4 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Clock className="w-5 h-5 text-orange-600" />
          </motion.div>
          Métricas Temporais
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedCard index={4}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Zap className="w-5 h-5 text-red-600" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Eventos Hoje</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={eventMetrics.today} duration={1.2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={5}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Eventos Amanhã</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={eventMetrics.tomorrow} duration={1.2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={6}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Calendar className="w-5 h-5 text-blue-600" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Esta Semana</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={eventMetrics.thisWeek} duration={1.2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={7}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Calendar className="w-5 h-5 text-purple-600" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={eventMetrics.thisMonth} duration={1.2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </motion.div>

      {/* Métricas Financeiras */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <motion.h2 
          className="text-xl font-semibold mb-4 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <DollarSign className="w-5 h-5 text-green-600" />
          </motion.div>
          Métricas Financeiras
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedCard index={8}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <DollarSign className="w-5 h-5 text-green-600" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Total a Pagar</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={paymentMetrics.totalAmount} precision={2} prefix="R$ " duration={1.5} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={9}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pago</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={paymentMetrics.paidAmount} precision={2} prefix="R$ " duration={1.5} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={10}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendente</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={paymentMetrics.unpaidAmount} precision={2} prefix="R$ " duration={1.5} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={11}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Média/Evento</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={efficiencyMetrics.avgPaymentPerEvent} precision={2} prefix="R$ " duration={1.5} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </motion.div>

      {/* Status dos Eventos */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <motion.h2 
          className="text-xl font-semibold mb-4 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Target className="w-5 h-5 text-indigo-600" />
          </motion.div>
          Status dos Eventos
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedCard index={12}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Planejados</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={eventMetrics.byStatus.planejado} duration={1.2} />
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    📋 Planejado
                  </Badge>
                </motion.div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={13}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Progresso</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={eventMetrics.byStatus.em_progresso} duration={1.2} />
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    ⚡ Em Progresso
                  </Badge>
                </motion.div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={14}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Finalizados</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={eventMetrics.byStatus.finalizado} duration={1.2} />
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✅ Finalizado
                  </Badge>
                </motion.div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={15}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cancelados</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={eventMetrics.byStatus.cancelado} duration={1.2} />
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    ❌ Cancelado
                  </Badge>
                </motion.div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </motion.div>

      {/* Resumo de Pagamentos */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <motion.h2 
          className="text-xl font-semibold mb-4 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4 }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </motion.div>
          Resumo de Pagamentos
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedCard index={16}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Users className="w-5 h-5 text-blue-600" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Pagamentos</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={paymentMetrics.totalCount} duration={1.2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={17}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagamentos Realizados</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={paymentMetrics.paidCount} duration={1.2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={18}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={paymentMetrics.completionRate} precision={1} suffix="%" duration={1.2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </motion.div>
    </div>
  )
}
