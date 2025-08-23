// [ARQUIVO: person-form.tsx]
// Função: Formulário para adicionar pessoas a uma categoria
// Interações: usado por category-form.tsx e páginas de categorias
// Observação: Campo valor é opcional

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Person } from "@/types/category"

interface PersonFormProps {
  categoryId: string
  initialData?: Person
  onSubmit: (data: Omit<Person, "id" | "createdAt" | "updatedAt">) => void
  onCancel?: () => void
}

export function PersonForm({ categoryId, initialData, onSubmit, onCancel }: PersonFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    value: initialData?.value?.toString() || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSubmit({
        name: formData.name.trim(),
        value: formData.value ? parseFloat(formData.value) : undefined,
        categoryId,
      })
      setFormData({ name: "", value: "" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Pessoa *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: João Silva"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Valor a ser Pago (opcional)</Label>
        <Input
          id="value"
          type="number"
          step="0.01"
          min="0"
          value={formData.value}
          onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
          placeholder="Ex: 150.00"
        />
        <p className="text-xs text-muted-foreground">
          Deixe em branco se não quiser definir um valor
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Adicionar Pessoa
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
