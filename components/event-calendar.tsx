"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import type { Event } from "@/types/event"
import type { Category } from "@/types/category"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EventCalendarProps {
  events: Event[]
  categories: Category[]
}

export function EventCalendar({ events = [], categories }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week">("month")

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const weekStart = startOfWeek(currentDate, { locale: ptBR })
  const weekEnd = endOfWeek(currentDate, { locale: ptBR })
  
  const calendarDays = viewMode === "month" 
    ? eachDayOfInterval({ start: monthStart, end: monthEnd })
    : eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getEventsForDate = (date: Date) => {
    if (!events || !Array.isArray(events)) return []
    return events.filter((event) => isSameDay(new Date(event.date), date))
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const navigate = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (viewMode === "month") {
        newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1))
      } else {
        newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7))
      }
      return newDate
    })
  }

  const getViewTitle = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })
    } else {
      const weekStart = startOfWeek(currentDate, { locale: ptBR })
      const weekEnd = endOfWeek(currentDate, { locale: ptBR })
      return `${format(weekStart, "dd MMM", { locale: ptBR })} - ${format(weekEnd, "dd MMM yyyy", { locale: ptBR })}`
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-xl">{getViewTitle()}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => navigate("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigate("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button 
                variant={viewMode === "month" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("month")}
              >
                Mês
              </Button>
              <Button 
                variant={viewMode === "week" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("week")}
              >
                Semana
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className={`grid gap-1 ${viewMode === "month" ? "grid-cols-7" : "grid-cols-7"}`}>
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDate(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isCurrentMonth = viewMode === "month" ? isSameMonth(day, currentDate) : true

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      p-2 ${viewMode === "month" ? "min-h-[60px]" : "min-h-[80px]"} text-left border border-border rounded-lg transition-colors
                      ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                      ${!isCurrentMonth ? "opacity-50" : ""}
                      ${isToday(day) ? "ring-2 ring-primary ring-offset-2" : ""}
                    `}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, "d")}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="space-y-1">
                        {dayEvents.slice(0, viewMode === "week" ? 3 : 2).map((event) => (
                          <div key={event.id} className="text-xs p-1 bg-secondary/20 rounded truncate">
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > (viewMode === "week" ? 3 : 2) && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - (viewMode === "week" ? 3 : 2)} mais
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Events */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum evento nesta data</p>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div key={event.id} className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium mb-1">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.startTime} - {event.endTime}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">📍 {event.location}</p>

                      {event.staffAssignments.length > 0 && (
                        <div className="space-y-1">
                          {event.staffAssignments.map((assignment) => {
                            const category = categories.find((c) => c.id === assignment.categoryId)
                            return category ? (
                              <Badge key={assignment.categoryId} variant="outline" className="text-xs">
                                <div
                                  className="w-2 h-2 rounded-full mr-1"
                                  style={{ backgroundColor: category.color }}
                                />
                                {assignment.count} {category.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Clique em uma data no calendário para ver os eventos
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
