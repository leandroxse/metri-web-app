// [ARQUIVO: people-manager.tsx]
// Função: Gerencia pessoas dentro de uma categoria específica
// Interações: usado por categorias/page.tsx
// Observação: Permite adicionar, editar e remover pessoas de uma categoria

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Users, Edit, Trash2, DollarSign } from "lucide-react"
import { PersonForm } from "@/components/person-form"
import { usePeople } from "@/hooks/use-people"
import type { Category, Person } from "@/types/category"

interface PeopleManagerProps {
  category: Category
}

export function PeopleManager({ category }: PeopleManagerProps) {
  const { people, loading, addPerson, updatePerson, deletePerson } = usePeople(category.id)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleAddPerson = async (personData: Omit<Person, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addPerson(personData)
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Erro ao adicionar pessoa:', error)
    }
  }

  const handleEditPerson = async (personData: Omit<Person, "id" | "createdAt" | "updatedAt">) => {
    if (!editingPerson) return
    
    try {
      await updatePerson(editingPerson.id, personData)
      setEditingPerson(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Erro ao editar pessoa:', error)
    }
  }

  const handleDeletePerson = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta pessoa?")) {
      try {
        await deletePerson(id)
      } catch (error) {
        console.error('Erro ao excluir pessoa:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pessoas - {category.name}
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando pessoas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header simplificado */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full shadow-sm" 
            style={{ backgroundColor: category.color }}
          />
          <h3 className="text-xl font-semibold text-foreground">
            {category.name}
          </h3>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              Adicionar Pessoa
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Adicionar Pessoa</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Adicione uma nova pessoa à categoria {category.name}
              </DialogDescription>
            </DialogHeader>
            <PersonForm 
              categoryId={category.id} 
              onSubmit={handleAddPerson}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* People List */}
      {people.length === 0 ? (
        <Card className="border-dashed border-2 border-muted bg-muted/20">
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              Nenhuma pessoa cadastrada
            </h4>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Esta categoria ainda não possui pessoas. Use o botão "Adicionar Pessoa" acima para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => (
            <Card key={person.id} className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base text-card-foreground">{person.name}</CardTitle>
                    {person.value && (
                      <div className="flex items-center gap-1 mt-1">
                        <DollarSign className="w-3 h-3 text-primary" />
                        <span className="text-sm text-primary font-medium">
                          R$ {person.value.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-accent text-muted-foreground hover:text-accent-foreground"
                      onClick={() => {
                        setEditingPerson(person)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-destructive/10 text-destructive hover:text-destructive"
                      onClick={() => handleDeletePerson(person.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Pessoa</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Atualize as informações da pessoa
            </DialogDescription>
          </DialogHeader>
          {editingPerson && (
            <PersonForm 
              categoryId={category.id}
              initialData={editingPerson}
              onSubmit={handleEditPerson}
              onCancel={() => {
                setEditingPerson(null)
                setIsEditDialogOpen(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
