"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DatePickerMobile } from "@/components/ui/date-picker-mobile"
import { Plus, Minus, Calendar, Clock, FileText } from "lucide-react"
import type { Event } from "@/types/event"
import type { Category } from "@/types/category"
import { useContracts } from "@/hooks/use-contracts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EventFormProps {
  initialData?: Event
  onSubmit: (data: Omit<Event, "id" | "createdAt" | "updatedAt">) => void
  categories: Category[]
}

export function EventForm({ initialData, onSubmit, categories }: EventFormProps) {
  // Carregar contratos disponíveis
  const { contracts, loading: loadingContracts } = useContracts()

  // Puxar data atual como padrão
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    date: initialData?.date || today,
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    location: initialData?.location || "",
    status: initialData?.status || "planejado" as const,
    guestCount: initialData?.guest_count || null,
    pricePerPerson: initialData?.price_per_person || null,
    staffAssignments: initialData?.staffAssignments || [],
    linkedContractId: null as string | null,
  })

  // Carregar contrato vinculado quando editando
  useEffect(() => {
    if (initialData?.id) {
      // Buscar contrato vinculado a este evento
      const linkedContract = contracts.find(contract => contract.event_id === initialData.id)
      if (linkedContract) {
        setFormData(prev => ({ ...prev, linkedContractId: linkedContract.id }))
      }
    }
  }, [initialData?.id, contracts])

  const handleStaffAssignmentChange = (categoryId: string, count: number) => {
    setFormData((prev) => ({
      ...prev,
      staffAssignments:
        count === 0
          ? prev.staffAssignments.filter((assignment) => assignment.categoryId !== categoryId)
          : prev.staffAssignments.some((assignment) => assignment.categoryId === categoryId)
            ? prev.staffAssignments.map((assignment) =>
                assignment.categoryId === categoryId ? { ...assignment, count } : assignment,
              )
            : [...prev.staffAssignments, { categoryId, count }],
    }))
  }

  const getStaffCount = (categoryId: string) => {
    const assignment = formData.staffAssignments.find((a) => a.categoryId === categoryId)
    return assignment?.count || 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Horários não são mais obrigatórios
    if (formData.title.trim() && formData.date && formData.location.trim()) {
      onSubmit(formData)
    }
  }

  const totalStaff = formData.staffAssignments.reduce((sum, assignment) => sum + assignment.count, 0)
  // Removido cálculo de custo total pois hourlyRate foi removido

  return (
    <div className="bg-background rounded-lg p-4 border border-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header compacto */}
        <div className="mb-4">
          <h3 className="text-base font-medium text-foreground mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Informações Básicas
          </h3>
          <p className="text-sm text-muted-foreground">
            Defina os dados principais do evento
          </p>
        </div>

        {/* Basic Event Info - layout mais compacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">Título do Evento *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Casamento Silva, Festa Corporativa..."
              className="h-10 bg-background border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-foreground">Local *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Ex: Salão de Festas, Hotel..."
              className="h-10 bg-background border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestCount" className="text-sm font-medium text-foreground">Número de Pessoas</Label>
            <Input
              id="guestCount"
              type="number"
              min="1"
              value={formData.guestCount || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, guestCount: e.target.value ? Number(e.target.value) : null }))}
              placeholder="Ex: 100, 200..."
              className="h-10 bg-background border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerPerson" className="text-sm font-medium text-foreground">Preço por Pessoa (R$)</Label>
            <Input
              id="pricePerPerson"
              type="number"
              min="0"
              step="0.01"
              value={formData.pricePerPerson || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, pricePerPerson: e.target.value ? Number(e.target.value) : null }))}
              placeholder="Ex: 50.00, 75.50..."
              className="h-10 bg-background border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Section divider */}
        <div className="border-t border-border my-4"></div>

        {/* Header compacto para Data e Hora */}
        <div className="mb-4">
          <h3 className="text-base font-medium text-foreground mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Data e Horário
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure quando o evento irá acontecer
          </p>
        </div>

        {/* Date and Time - layout mais compacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">Data *</Label>
            <DatePickerMobile
              value={formData.date}
              onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium">Início</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium">Término</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status do Evento</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "planejado", label: "Planejado", color: "blue" },
                { value: "em_progresso", label: "Em Progresso", color: "green" },
                { value: "finalizado", label: "Finalizado", color: "gray" },
                { value: "cancelado", label: "Cancelado", color: "red" }
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: status.value as any }))}
                  className={`
                    p-2 rounded text-xs font-medium transition-all border text-center
                    ${formData.status === status.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      status.color === 'blue' ? 'bg-blue-500' :
                      status.color === 'green' ? 'bg-green-500' :
                      status.color === 'gray' ? 'bg-gray-500' : 'bg-red-500'
                    }`} />
                    {status.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section divider */}
        <div className="border-t border-border my-4"></div>

        {/* Header compacto para Descrição */}
        <div className="mb-4">
          <h3 className="text-base font-medium text-foreground mb-1 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Detalhes Adicionais
          </h3>
          <p className="text-sm text-muted-foreground">
            Adicione informações extras sobre o evento
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Detalhes adicionais sobre o evento, observações especiais, requisitos..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Section divider */}
        <div className="border-t border-border my-4"></div>

        {/* Header compacto para Contratos */}
        <div className="mb-4">
          <h3 className="text-base font-medium text-foreground mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Contrato Vinculado
          </h3>
          <p className="text-sm text-muted-foreground">
            Associe um contrato da aba DOCS ao evento
          </p>
        </div>

        {/* Contract Selector */}
        <div className="space-y-2">
          <Label htmlFor="linkedContract" className="text-sm font-medium">Contrato</Label>
          <Select
            value={formData.linkedContractId || "none"}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                linkedContractId: value === "none" ? null : value
              }))
            }
            disabled={loadingContracts}
          >
            <SelectTrigger className="h-10 bg-background border-2 border-input">
              <SelectValue placeholder={loadingContracts ? "Carregando..." : "Selecione um contrato (opcional)"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum contrato</SelectItem>
              {contracts
                .filter(contract => !contract.event_id || contract.event_id === initialData?.id)
                .sort((a, b) => b.created_at.localeCompare(a.created_at))
                .map((contract) => (
                  <SelectItem key={contract.id} value={contract.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        📄
                      </Badge>
                      <span className="truncate">
                        {contract.filled_data.Contratante || contract.filled_data.contratante_nome || "Contrato sem nome"}
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {contracts.length === 0
              ? "Nenhum contrato disponível. Crie contratos na aba DOCS primeiro."
              : `${contracts.filter(c => !c.event_id || c.event_id === initialData?.id).length} contrato(s) disponível(is)`
            }
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border">
          <Button type="submit" className="min-w-32">
            {initialData ? "Atualizar" : "Criar"} Evento
          </Button>
        </div>
      </form>
    </div>
  )
}
