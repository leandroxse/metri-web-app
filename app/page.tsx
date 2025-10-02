"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedIcon } from "@/components/ui/animated-icon"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  TrendingUp, 
  CalendarDays,
  Activity,
  BarChart3,
  ArrowRight,
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle,
  Play
} from "lucide-react"
import { useEvents } from "@/hooks/use-events"
import { useCategories } from "@/hooks/use-categories"
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameDay,
  isToday,
  addDays,
  isAfter,
  isBefore
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts"
import { isActiveEvent } from "@/lib/utils/event-status"

// Chart configuration for modern styling
const chartConfig = {
  events: {
    label: "Eventos",
    color: "hsl(var(--chart-1))",
  },
  people: {
    label: "Pessoas",
    color: "hsl(var(--chart-2))",
  },
}

export default function HomePage() {
  const { events } = useEvents()
  const { categories } = useCategories()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'overview'>('week')
  
  // Smart week detection
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  // Filter events intelligently
  const activeEvents = events.filter(event => 
    event.status !== 'cancelado' && event.status !== 'finalizado'
  )
  
  const weeklyEvents = activeEvents.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= weekStart && eventDate <= weekEnd
  })
  
  const selectedDayEvents = weeklyEvents.filter(event => 
    isSameDay(new Date(event.date), selectedDate)
  )
  
  const upcomingEvents = activeEvents.filter(event => {
    const eventDate = new Date(event.date)
    return isAfter(eventDate, today)
  }).slice(0, 5) // Next 5 upcoming events
  
  // Calculate key metrics
  const totalActiveEvents = activeEvents.length
  const totalPeopleToday = selectedDayEvents.reduce((sum, event) => {
    return sum + (event.staffAssignments?.reduce((staffSum, assignment) => staffSum + assignment.count, 0) || 0)
  }, 0)
  
  const totalPeopleWeek = weeklyEvents.reduce((sum, event) => {
    return sum + (event.staffAssignments?.reduce((staffSum, assignment) => staffSum + assignment.count, 0) || 0)
  }, 0)
  
  // Chart data with enhanced metrics
  const getEventCount = (date: Date) => {
    return weeklyEvents.filter(event => 
      isSameDay(new Date(event.date), date)
    ).length
  }
  
  const getPeopleCount = (date: Date) => {
    return weeklyEvents
      .filter(event => isSameDay(new Date(event.date), date))
      .reduce((sum, event) => {
        return sum + (event.staffAssignments?.reduce((staffSum, assignment) => staffSum + assignment.count, 0) || 0)
      }, 0)
  }
  
  const chartData = weekDays.map((day) => {
    const dayAbbr = format(day, "EEE", { locale: ptBR }).substring(0, 3)
    // Garantir que segunda-feira apareça como "Seg" 
    const formattedDay = dayAbbr === "seg" ? "Seg" : 
                        dayAbbr === "ter" ? "Ter" : 
                        dayAbbr === "qua" ? "Qua" : 
                        dayAbbr === "qui" ? "Qui" : 
                        dayAbbr === "sex" ? "Sex" : 
                        dayAbbr === "sáb" ? "Sáb" : 
                        dayAbbr === "dom" ? "Dom" : dayAbbr
    
    return {
      date: formattedDay,
      fullDate: format(day, "dd/MM"),
      events: getEventCount(day),
      people: getPeopleCount(day),
      isToday: isToday(day)
    }
  })
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive mx-auto p-4 pb-20 md:px-6 lg:px-8">
        {/* Header Integrado */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-background/95 backdrop-blur-sm sticky top-0 z-10 mb-6 pb-6 border-b border-border/50"
        >
          {/* Header compacto */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">METRI</h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
            
            {/* Botões modo - apenas ícones */}
            <div className="flex items-center bg-muted rounded-md p-0.5">
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="h-7 w-7 p-0"
              >
                <CalendarDays className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('overview')}
                className="h-7 w-7 p-0"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Métricas integradas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <AnimatedNumber 
                value={totalActiveEvents} 
                className="text-xl font-bold text-primary"
              />
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/5 border border-secondary/10">
              <AnimatedNumber 
                value={weeklyEvents.length} 
                className="text-xl font-bold text-secondary"
              />
              <p className="text-xs text-muted-foreground">Semana</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-chart-3/5 border border-chart-3/10">
              <AnimatedNumber 
                value={totalPeopleWeek} 
                className="text-xl font-bold text-chart-3"
              />
              <p className="text-xs text-muted-foreground">Pessoas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-chart-4/5 border border-chart-4/10">
              <AnimatedNumber 
                value={selectedDayEvents.length} 
                className="text-xl font-bold text-chart-4"
              />
              <p className="text-xs text-muted-foreground">Hoje</p>
            </div>
          </div>
        </motion.header>
        <AnimatePresence mode="wait">
          {viewMode === 'week' && (
            <motion.div
              key="week-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Week Selector Integrado */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {format(weekStart, "dd MMM", { locale: ptBR })} - {format(weekEnd, "dd MMM yyyy", { locale: ptBR })}
                  </h2>
                  <Badge variant="secondary" className="font-medium">
                    {weeklyEvents.length} eventos
                  </Badge>
                </div>
                
                <div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3">
                  {weekDays.map((day, index) => {
                    const eventCount = getEventCount(day)
                    const peopleCount = getPeopleCount(day)
                    const isSelected = isSameDay(day, selectedDate)
                    const isTodayDate = isToday(day)
                    
                    return (
                      <motion.button
                        key={day.toISOString()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.3 }}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          relative flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-h-[70px]
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground shadow-lg' 
                            : isTodayDate
                            ? 'bg-primary/10 border-2 border-primary/30'
                            : 'bg-muted/50 hover:bg-muted border-2 border-transparent hover:border-primary/20'
                          }
                        `}
                      >
                        <div className={`text-xs font-medium mb-1 ${
                          isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {format(day, "EEE", { locale: ptBR }).substring(0, 3)}
                        </div>
                        
                        <div className={`text-lg font-bold mb-2 ${
                          isSelected ? 'text-primary-foreground' : isTodayDate ? 'text-primary' : 'text-foreground'
                        }`}>
                          {format(day, "dd")}
                        </div>
                        
                        {/* Indicadores melhorados */}
                        <div className="flex items-center gap-2">
                          {eventCount > 0 && (
                            <div className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-primary-foreground' : 'bg-primary'
                            }`} />
                          )}
                          {peopleCount > 0 && (
                            <span className={`text-xs font-medium ${
                              isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {peopleCount}
                            </span>
                          )}
                        </div>
                        
                        {isTodayDate && !isSelected && (
                          <motion.div 
                            className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 }}
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
      
              {/* Chart Integrado */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <AnimatedIcon variant="pulse">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                    </AnimatedIcon>
                    <div>
                      <h3 className="font-semibold">Visão Semanal</h3>
                      <p className="text-sm text-muted-foreground font-medium">Eventos e equipe</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      <AnimatedNumber value={chartData.reduce((sum, day) => sum + day.events, 0)} />
                    </div>
                    <p className="text-xs text-muted-foreground">Total de eventos</p>
                  </div>
                </div>
                
                <ChartContainer config={chartConfig} className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                      <defs>
                        {/* Gradiente para Eventos - Verde vibrante no OLED */}
                        <linearGradient id="eventsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} className="oled:!opacity-90" />
                          <stop offset="50%" stopColor="#10b981" stopOpacity={0.4} className="oled:!opacity-60" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} className="oled:!opacity-20" />
                        </linearGradient>
                        {/* Gradiente para Pessoas - Verde secundário vibrante no OLED */}
                        <linearGradient id="peopleGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#059669" stopOpacity={0.7} className="oled:!opacity-80" />
                          <stop offset="50%" stopColor="#059669" stopOpacity={0.3} className="oled:!opacity-50" />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.05} className="oled:!opacity-15" />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ 
                          fontSize: 13, 
                          fill: 'hsl(var(--foreground))',
                          fontWeight: 500
                        }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ 
                          fontSize: 11, 
                          fill: 'hsl(var(--muted-foreground))',
                          fontWeight: 400
                        }}
                        width={30}
                      />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
                                <p className="font-medium text-foreground mb-2">{label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                                    {entry.name}: {entry.value}
                                  </p>
                                ))}
                              </div>
                            )
                          }
                          return null
                        }}
                        cursor={{ 
                          stroke: 'hsl(var(--border))', 
                          strokeWidth: 2,
                          strokeDasharray: '5 5'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="people"
                        stroke="#059669"
                        fill="url(#peopleGradient)"
                        strokeWidth={3}
                        name="Pessoas"
                        className="oled:stroke-[#10b981]"
                      />
                      <Area
                        type="monotone"
                        dataKey="events"
                        stroke="#10b981"
                        fill="url(#eventsGradient)"
                        strokeWidth={4}
                        name="Eventos"
                        className="oled:stroke-[#00f5a0]"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </motion.div>
          )}
          
          {viewMode === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
            >
              {/* Próximos Eventos Integrado */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-5 h-5 text-chart-3" />
                  <h3 className="font-semibold">Próximos Eventos</h3>
                </div>
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.date), "dd MMM", { locale: ptBR })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Status Integrado */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-5 h-5 text-chart-4" />
                  <h3 className="font-semibold">Status dos Eventos</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { status: 'planejado', label: 'Planejados', icon: Clock, count: activeEvents.filter(e => e.status === 'planejado').length },
                    { status: 'em_progresso', label: 'Em Progresso', icon: Play, count: activeEvents.filter(e => e.status === 'em_progresso').length },
                    { status: 'finalizado', label: 'Finalizados', icon: CheckCircle2, count: events.filter(e => e.status === 'finalizado').length },
                  ].map((item, index) => (
                    <motion.div
                      key={item.status}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <AnimatedNumber 
                        value={item.count} 
                        className="text-lg font-bold text-primary"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Eventos do Dia Integrado */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AnimatedIcon variant="bounce">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
              </AnimatedIcon>
              <div>
                <h3 className="font-semibold text-lg">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "EEEE", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalPeopleToday > 0 && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Users className="w-3 h-3" />
                  <AnimatedNumber value={totalPeopleToday} />
                </Badge>
              )}
              <Badge variant="secondary" className="gap-1 text-xs">
                <CalendarDays className="w-3 h-3" />
                <AnimatedNumber value={selectedDayEvents.length} />
              </Badge>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {selectedDayEvents.length === 0 ? (
              <motion.div
                key="no-events"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-muted-foreground mb-2">
                  Nenhum evento para este dia
                </h3>
                <p className="text-sm text-muted-foreground/80">
                  Selecione outro dia ou crie um novo evento
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="events-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                  {selectedDayEvents.map((event, index) => {
                    const totalPeople = event.staffAssignments?.reduce(
                      (sum, assignment) => sum + assignment.count, 0
                    ) || 0
                    
                    const statusConfig = {
                      'planejado': { icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/80 dark:bg-blue-900/20 oled:bg-blue-400/5', border: 'border-l-blue-500' },
                      'em_progresso': { icon: Play, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50/80 dark:bg-green-900/20 oled:bg-green-400/5', border: 'border-l-green-500' },
                      'finalizado': { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/80 dark:bg-emerald-900/20 oled:bg-emerald-400/5', border: 'border-l-emerald-500' },
                      'cancelado': { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50/80 dark:bg-red-900/20 oled:bg-red-400/5', border: 'border-l-red-500' }
                    }
                    
                    const config = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.planejado
                    const StatusIcon = config.icon
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: index * 0.05,
                          duration: 0.3,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        whileHover={{ y: -1, scale: 1.005 }}
                        className="group"
                      >
                        <div className={`${config.bg} ${config.border} border-l-4 rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:shadow-primary/5 border border-border/50`}>
                          {/* Header do Evento */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center border border-border/50">
                                <StatusIcon className={`w-6 h-6 ${config.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-xl leading-tight mb-2 text-foreground">{event.title}</h3>
                                {event.description && (
                                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <Badge variant="outline" className={`${config.color} border-current shrink-0 ml-3`}>
                              {event.status === 'finalizado' ? 'Finalizado' : 
                               event.status === 'em_progresso' ? 'Em Progresso' : 
                               event.status === 'cancelado' ? 'Cancelado' : 'Planejado'}
                            </Badge>
                          </div>
                          
                          {/* Informações do Evento */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">Horário</p>
                                <p className="text-sm font-semibold text-foreground">{event.startTime} - {event.endTime}</p>
                              </div>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center">
                                  <MapPin className="w-4 h-4 text-secondary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-muted-foreground font-medium">Local</p>
                                  <p className="text-sm font-semibold text-foreground truncate">{event.location}</p>
                                </div>
                              </div>
                            )}
                            
                            {totalPeople > 0 && (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-chart-3/15 flex items-center justify-center">
                                  <Users className="w-4 h-4 text-chart-3" />
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground font-medium">Equipe</p>
                                  <p className="text-sm font-semibold text-foreground">
                                    <AnimatedNumber value={totalPeople} /> pessoas
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Categorias da Equipe */}
                          {event.staffAssignments && event.staffAssignments.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-3">EQUIPE POR CATEGORIA</p>
                              <div className="flex flex-wrap gap-2">
                                {event.staffAssignments.map((assignment) => {
                                  const category = categories.find(c => c.id === assignment.categoryId)
                                  if (!category) return null
                                  
                                  return (
                                    <motion.div
                                      key={assignment.categoryId}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.2 + index * 0.05 }}
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      <Badge 
                                        variant="secondary"
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                                        style={{ 
                                          backgroundColor: `${category.color}20`,
                                          borderColor: `${category.color}30`,
                                          color: category.color,
                                          border: '1px solid'
                                        }}
                                      >
                                        <AnimatedNumber value={assignment.count} className="mr-1.5 font-bold" />
                                        {category.name}
                                      </Badge>
                                    </motion.div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}