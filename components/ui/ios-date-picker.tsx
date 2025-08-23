"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface IOSDatePickerProps {
  value: string
  onChange: (date: string) => void
  className?: string
}

export function IOSDatePicker({ value, onChange, className }: IOSDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    if (value) {
      return new Date(value)
    }
    return new Date()
  })

  const dayRef = useRef<HTMLDivElement>(null)
  const monthRef = useRef<HTMLDivElement>(null)
  
  // Ano fixo em 2025
  const fixedYear = 2025

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const days = Array.from({ 
    length: getDaysInMonth(selectedDate.getMonth(), fixedYear) 
  }, (_, i) => i + 1)

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, items: any[], setValue: (value: any) => void) => {
    if (!ref.current) return
    
    const scrollTop = ref.current.scrollTop
    const itemHeight = 50 // Altura consistente
    const index = Math.round(scrollTop / itemHeight)
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1))
    
    // Garantir que o scroll pare exatamente no item
    ref.current.scrollTop = clampedIndex * itemHeight
    setValue(items[clampedIndex])
  }

  const scrollToValue = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (!ref.current) return
    ref.current.scrollTop = index * 50
  }

  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      const currentDate = new Date(fixedYear, today.getMonth(), today.getDate())
      setSelectedDate(currentDate)
      
      setTimeout(() => {
        scrollToValue(dayRef, today.getDate() - 1)
        scrollToValue(monthRef, today.getMonth())
      }, 150)
    }
  }, [isOpen])

  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${fixedYear}`
  }

  const handleConfirm = () => {
    // Usar formato local YYYY-MM-DD sem conversão de timezone
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0')
    const day = selectedDate.getDate().toString().padStart(2, '0')
    const isoDate = `${fixedYear}-${month}-${day}`
    onChange(isoDate)
    setIsOpen(false)
  }

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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <Card className="w-full rounded-t-2xl rounded-b-none max-h-[60vh] border-0 shadow-2xl bg-white dark:bg-gray-900 oled:bg-black">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 oled:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white oled:text-gray-100">
                  Selecionar Data
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 oled:text-gray-300 font-medium">
                  Ano: {fixedYear}
                </div>
              </div>

              {/* iOS Style Scroll Wheels */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-6 h-60">
                  {/* Dias */}
                  <div className="relative">
                    <div className="text-center text-sm font-medium mb-3 text-gray-600 dark:text-gray-400 oled:text-gray-300">
                      Dia
                    </div>
                    <div
                      ref={dayRef}
                      className="h-[250px] overflow-y-scroll scrollbar-hide"
                      style={{
                        scrollSnapType: 'y mandatory',
                        scrollBehavior: 'smooth'
                      }}
                      onScroll={() => handleScroll(dayRef, days, (day) => {
                        setSelectedDate(new Date(fixedYear, selectedDate.getMonth(), day))
                      })}
                    >
                      <div className="py-[100px]">
                        {days.map((day) => (
                          <div
                            key={day}
                            className="h-[50px] flex items-center justify-center text-lg font-medium cursor-pointer transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 oled:hover:bg-primary/30 text-gray-900 dark:text-white oled:text-gray-100"
                            style={{ scrollSnapAlign: 'center' }}
                            onClick={() => {
                              setSelectedDate(new Date(fixedYear, selectedDate.getMonth(), day))
                              scrollToValue(dayRef, day - 1)
                            }}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Selection indicator */}
                    <div className="absolute top-[125px] left-0 right-0 h-[50px] bg-primary/10 dark:bg-primary/20 oled:bg-primary/30 border-y-2 border-primary/40 dark:border-primary/50 oled:border-primary/60 pointer-events-none rounded-lg" />
                  </div>

                  {/* Meses */}
                  <div className="relative">
                    <div className="text-center text-sm font-medium mb-3 text-gray-600 dark:text-gray-400 oled:text-gray-300">
                      Mês
                    </div>
                    <div
                      ref={monthRef}
                      className="h-[250px] overflow-y-scroll scrollbar-hide"
                      style={{
                        scrollSnapType: 'y mandatory',
                        scrollBehavior: 'smooth'
                      }}
                      onScroll={() => handleScroll(monthRef, months, (month) => {
                        const monthIndex = months.indexOf(month)
                        setSelectedDate(new Date(fixedYear, monthIndex, selectedDate.getDate()))
                      })}
                    >
                      <div className="py-[100px]">
                        {months.map((month, index) => (
                          <div
                            key={month}
                            className="h-[50px] flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 oled:hover:bg-primary/30 px-2 text-gray-900 dark:text-white oled:text-gray-100"
                            style={{ scrollSnapAlign: 'center' }}
                            onClick={() => {
                              setSelectedDate(new Date(fixedYear, index, selectedDate.getDate()))
                              scrollToValue(monthRef, index)
                            }}
                          >
                            {month}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Selection indicator */}
                    <div className="absolute top-[125px] left-0 right-0 h-[50px] bg-primary/10 dark:bg-primary/20 oled:bg-primary/30 border-y-2 border-primary/40 dark:border-primary/50 oled:border-primary/60 pointer-events-none rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Footer com botões */}
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 oled:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 oled:bg-gray-900/50">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 border-gray-300 dark:border-gray-600 oled:border-gray-500 text-gray-700 dark:text-gray-300 oled:text-gray-200"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirm}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 text-white"
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