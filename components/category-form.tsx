"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "@/types/category"

interface CategoryFormProps {
  initialData?: Category
  onSubmit: (data: Omit<Category, "id" | "createdAt" | "updatedAt">) => void
}

const predefinedCategories = [
  { name: "Garçom", color: "#164e63", description: "Profissional responsável pelo atendimento às mesas" },
  { name: "Copeira", color: "#84cc16", description: "Profissional responsável pela limpeza e organização" },
  { name: "Segurança", color: "#dc2626", description: "Profissional responsável pela segurança do evento" },
  { name: "Bartender", color: "#7c3aed", description: "Profissional especializado em bebidas e coquetéis" },
  { name: "Recepcionista", color: "#f59e0b", description: "Profissional responsável pela recepção de convidados" },
  { name: "Cozinheiro", color: "#059669", description: "Profissional responsável pelo preparo de alimentos" },
]

const colorOptions = [
  "#164e63",
  "#84cc16",
  "#dc2626",
  "#7c3aed",
  "#f59e0b",
  "#059669",
  "#0891b2",
  "#e11d48",
  "#9333ea",
  "#ea580c",
  "#65a30d",
  "#0d9488",
]

export function CategoryForm({ initialData, onSubmit }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    color: initialData?.color || "#164e63",
    memberCount: initialData?.memberCount || 0,
  })

  const handlePredefinedSelect = (categoryName: string) => {
    const predefined = predefinedCategories.find((cat) => cat.name === categoryName)
    if (predefined) {
      setFormData((prev) => ({
        ...prev,
        name: predefined.name,
        description: predefined.description,
        color: predefined.color,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.description.trim()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Predefined Categories */}
      {!initialData && (
        <div className="space-y-2">
          <Label>Categorias Sugeridas</Label>
          <Select onValueChange={handlePredefinedSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria predefinida (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {predefinedCategories.map((category) => (
                <SelectItem key={category.name} value={category.name}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Categoria *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Garçom, Segurança, Copeira..."
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Descreva as responsabilidades desta categoria..."
          rows={3}
          required
        />
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <Label>Cor da Categoria</Label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                formData.color === color ? "border-foreground scale-110" : "border-border hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData((prev) => ({ ...prev, color }))}
            />
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="min-w-24">
          {initialData ? "Atualizar" : "Criar"} Categoria
        </Button>
      </div>
    </form>
  )
}
