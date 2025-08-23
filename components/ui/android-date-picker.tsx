"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AndroidDatePickerProps {
  value: string
  onChange: (date: string) => void
  className?: string
}

export function AndroidDatePicker({ value, onChange, className }: AndroidDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Ano fixo em 2025
  const fixedYear = 2025
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const date = new Date(value)
      return new Date(fixedYear, date.getMonth(), 1)
    }
    return new Date(fixedYear, new Date().getMonth(), 1)
  })

  const [selectedDate, setSelectedDate] = useState(() => {
    if (value) {
      const date = new Date(value)
      return new Date(fixedYear, date.getMonth(), date.getDate())
    }
    return new Date(fixedYear, new Date().getMonth(), new Date().getDate())
  })

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${fixedYear}`
  }

  const handleConfirm = () => {
    // Usar formato local YYYY-MM-DD sem conversão de timezone
    const year = selectedDate.getFullYear()
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0')
    const day = selectedDate.getDate().toString().padStart(2, '0')
    const isoDate = `${year}-${month}-${day}`
    onChange(isoDate)
    setIsOpen(false)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = prev.getMonth() - 1
      if (newMonth < 0) {
        return new Date(fixedYear, 11, 1) // Dezembro
      }
      return new Date(fixedYear, newMonth, 1)
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = prev.getMonth() + 1
      if (newMonth > 11) {
        return new Date(fixedYear, 0, 1) // Janeiro
      }
      return new Date(fixedYear, newMonth, 1)
    })
  }

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(fixedYear, monthIndex, 1))
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  // Gerar calendário
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) // Domingo
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const dateFormat = "d"
  const rows = []
  let days = []
  let day = startDate
  let formattedDate = ""

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat)
      const cloneDay = day
      const isCurrentMonth = isSameMonth(day, monthStart)
      const isSelected = isSameDay(day, selectedDate)
      const isToday = isSameDay(day, new Date())

      days.push(
        <div
          key={day.toString()}
          className={`
            h-12 w-12 flex items-center justify-center rounded-lg cursor-pointer font-medium transition-all duration-200 text-sm
            ${!isCurrentMonth 
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
              : isSelected
                ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                : isToday
                  ? 'bg-primary/20 text-primary border-2 border-primary/40'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:scale-105'
            }
          `}
          onClick={() => isCurrentMonth && handleDateSelect(cloneDay)}
        >
          <span>{formattedDate}</span>
        </div>
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-1">
        {days}
      </div>
    )
    days = []
  }

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full justify-start text-left font-normal h-11 bg-white/80 dark:bg-gray-800/80 oled:bg-gray-900/80 border-gray-300/60 dark:border-gray-600/60 oled:border-gray-500/60"
      >
        <Calendar className="w-4 h-4 mr-2" />
        {value ? formatDate(new Date(value)) : "Selecionar data"}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Selecionar Data
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Ano: {fixedYear}
                </div>
              </div>
              
              {/* Seletor de mês */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 mx-2">
                  <select
                    value={currentMonth.getMonth()}
                    onChange={(e) => handleMonthSelect(parseInt(e.target.value))}
                    className="w-full p-2 text-center font-medium bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index} className="bg-white dark:bg-gray-900">
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendário */}
              <div className="space-y-1">
                {rows}
              </div>

              {/* Data selecionada */}
              <div className="mt-6 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data selecionada:</div>
                <div className="text-lg font-semibold text-primary">
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirm}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                >
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}