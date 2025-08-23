// [ARQUIVO: date-picker-mobile.tsx]
// Função: Seletor de data inteligente que detecta iOS vs Android
// Interações: usado por event-form.tsx
// Observação: Interface adaptativa com ano fixo em 2025

"use client"

import { AndroidDatePicker } from "./android-date-picker"

interface DatePickerMobileProps {
  value: string
  onChange: (date: string) => void
  className?: string
}

export function DatePickerMobile({ value, onChange, className }: DatePickerMobileProps) {
  // Usar sempre o calendário do Android para todos os dispositivos
  return (
    <AndroidDatePicker
      value={value}
      onChange={onChange}
      className={className}
    />
  )
}
