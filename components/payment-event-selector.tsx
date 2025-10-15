"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Users,
  ChevronRight
} from "lucide-react"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { formatCurrency } from "@/components/metric-card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getStatusDisplay } from "@/lib/utils/event-status"
import { parseEventDate } from "@/lib/utils/date-utils"
import type { Event } from "@/types/event"

interface EventStats {
  total: number
  paid: number
  pending: number
  paidCount: number
  totalCount: number
}

interface PaymentEventSelectorProps {
  events: Event[]
  selectedEvent: string | null
  onSelectEvent: (eventId: string) => void
  showHistory: boolean
  onToggleHistory: (show: boolean) => void
  getEventStats: (eventId: string) => EventStats
  eventPaymentsCount: Map<string, number>
}

export function PaymentEventSelector({
  events,
  selectedEvent,
  onSelectEvent,
  showHistory,
  onToggleHistory,
  getEventStats,
  eventPaymentsCount
}: PaymentEventSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Header dos Eventos */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h2 className="text-base font-medium">
            {showHistory ? "Histórico" : "Eventos Ativos"}
          </h2>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            <AnimatedNumber value={events.length} />
          </Badge>
        </div>

        {/* Toggle Histórico */}
        <div className="flex items-center bg-muted rounded-lg p-1">
          <Button
            variant={!showHistory ? "default" : "ghost"}
            size="sm"
            className="h-6 px-3 text-xs font-medium"
            onClick={() => onToggleHistory(false)}
          >
            Ativos
          </Button>
          <Button
            variant={showHistory ? "default" : "ghost"}
            size="sm"
            className="h-6 px-3 text-xs font-medium"
            onClick={() => onToggleHistory(true)}
          >
            Histórico
          </Button>
        </div>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-3">
        {events.length === 0 ? (
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
          events.map((event, index) => {
            const stats = getEventStats(event.id)
            const isSelected = selectedEvent === event.id
            const hasPayments = (eventPaymentsCount.get(event.id) || 0) > 0
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
                onClick={() => onSelectEvent(event.id)}
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
                    {/* Título e Status */}
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

                    {/* Info básica */}
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 oled:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(parseEventDate(event.date), "dd/MM", { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.startTime}</span>
                      </div>
                      {hasPayments && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{eventPaymentsCount.get(event.id)}</span>
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
    </div>
  )
}
