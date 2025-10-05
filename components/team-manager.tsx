"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Check, X, Save, FileText, ExternalLink } from "lucide-react"
import type { Event } from "@/types/event"
import type { Category, Person } from "@/types/category"
import { personClientService, eventTeamClientService } from "@/lib/supabase/client-services"
import { useContracts } from "@/hooks/use-contracts"

interface TeamManagerProps {
  event: Event
  categories: Category[]
  onUpdateEvent: (updatedEvent: Event) => void
}

interface CategoryPeople {
  category: Category
  people: Person[]
  loading: boolean
}

export function TeamManager({ event, categories, onUpdateEvent }: TeamManagerProps) {
  const [eventTeam, setEventTeam] = useState<Person[]>([])
  const [categoryPeopleData, setCategoryPeopleData] = useState<Map<string, CategoryPeople>>(new Map())
  const [pendingSelections, setPendingSelections] = useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState(event.status)

  // Carregar contrato vinculado ao evento
  const { contracts } = useContracts(event.id)
  const linkedContract = contracts.find(contract => contract.event_id === event.id)

  // Carregar equipe do evento do Supabase
  useEffect(() => {
    const loadEventTeam = async () => {
      try {
        const savedTeam = await eventTeamClientService.getEventTeam(event.id)
        setEventTeam(savedTeam)
      } catch (error) {
        console.error('Error loading event team:', error)
        setEventTeam([])
      }
    }
    
    loadEventTeam()
  }, [event.id])

  // Carregar todas as pessoas de todas as categorias que possuem pessoas
  useEffect(() => {
    if (!categories || categories.length === 0) {
      setIsLoading(false)
      return
    }
    
    const loadAllCategoryPeople = async () => {
      setIsLoading(true)
      
      // Carregar todas as pessoas em paralelo para melhor performance
      const promises = categories.map(async (category) => {
        try {
          const people = await personClientService.getByCategory(category.id)
          if (people && people.length > 0) {
            return {
              category,
              people,
              loading: false
            }
          }
          return null
        } catch (error) {
          console.error(`Error loading people for ${category.name}:`, error)
          return null
        }
      })
      
      const results = await Promise.all(promises)
      
      // Criar o mapa final com todas as categorias que têm pessoas
      const newCategoryData = new Map<string, CategoryPeople>()
      results.forEach((result) => {
        if (result) {
          newCategoryData.set(result.category.id, result)
        }
      })
      
      // Atualizar o estado uma única vez com todos os dados
      setCategoryPeopleData(newCategoryData)
      setIsLoading(false)
    }

    loadAllCategoryPeople()
  }, [categories])

  // Atualizar as atribuições de staff do evento
  const updateEventStaffAssignments = (team: Person[]) => {
    const staffAssignments = categories.map(category => {
      const count = team.filter(person => person.categoryId === category.id).length
      return { categoryId: category.id, count }
    }).filter(assignment => assignment.count > 0)

    const updatedEvent = {
      ...event,
      staffAssignments
    }

    onUpdateEvent(updatedEvent)
  }

  // Toggle seleção de pessoa individual
  const togglePersonSelection = (person: Person) => {
    const newPending = new Set(pendingSelections)

    if (newPending.has(person.id)) {
      newPending.delete(person.id)
    } else {
      newPending.add(person.id)
    }

    setPendingSelections(newPending)
    setHasChanges(true)
  }

  // Aplicar todas as alterações
  const saveAllChanges = async () => {
    // CORREÇÃO: Usar isPersonSelected que já tem a lógica correta
    const updatedTeam: Person[] = []

    // Para cada categoria, incluir apenas as pessoas que devem estar selecionadas
    categoryPeopleData.forEach(({ people }) => {
      people.forEach(person => {
        const shouldBeInTeam = isPersonSelected(person)

        if (shouldBeInTeam) {
          updatedTeam.push(person)
        }
      })
    })

    // Salvar no Supabase e atualizar estado
    try {
      const personIds = updatedTeam.map(person => person.id)
      const success = await eventTeamClientService.saveEventTeam(event.id, personIds)

      if (success) {
        setEventTeam(updatedTeam)
        updateEventStaffAssignments(updatedTeam)

        // Reset pending selections
        setPendingSelections(new Set())
        setHasChanges(false)
      } else {
        console.error('Erro ao salvar equipe no Supabase')
        alert('Erro ao salvar equipe. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao salvar equipe:', error)
      alert('Erro ao salvar equipe. Verifique sua conexão e tente novamente.')
    }
  }

  // Cancelar alterações
  const cancelChanges = () => {
    setPendingSelections(new Set())
    setHasChanges(false)
  }

  // Verificar se uma pessoa deve estar selecionada
  const isPersonSelected = (person: Person) => {
    const isCurrentlyInTeam = eventTeam.some(p => p.id === person.id)
    const hasPendingChange = pendingSelections.has(person.id)
    
    // Se tem mudança pendente, usar o estado pendente, senão usar o estado atual
    return hasPendingChange ? !isCurrentlyInTeam : isCurrentlyInTeam
  }

  // Calcular estatísticas
  const totalChanges = pendingSelections.size
  const totalSelectedPeople = useMemo(() => {
    let count = 0
    categoryPeopleData.forEach(({ people }) => {
      people.forEach(person => {
        if (isPersonSelected(person)) count++
      })
    })
    return count
  }, [categoryPeopleData, eventTeam, pendingSelections])

  // Função para atualizar status
  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus)
    const updatedEvent = {
      ...event,
      status: newStatus as Event['status']
    }
    onUpdateEvent(updatedEvent)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "planejado":
        return { label: "Planejado", color: "blue", bgClass: "bg-blue-100 dark:bg-blue-900/30 oled:bg-blue-400/20", textClass: "text-blue-800 dark:text-blue-300 oled:text-blue-200" }
      case "em_progresso":
        return { label: "Em Progresso", color: "green", bgClass: "bg-green-100 dark:bg-green-900/30 oled:bg-green-400/20", textClass: "text-green-800 dark:text-green-300 oled:text-green-200" }
      case "finalizado":
        return { label: "Finalizado", color: "gray", bgClass: "bg-gray-100 dark:bg-gray-900/30 oled:bg-gray-700/40", textClass: "text-gray-800 dark:text-gray-300 oled:text-gray-200" }
      case "cancelado":
        return { label: "Cancelado", color: "red", bgClass: "bg-red-100 dark:bg-red-900/30 oled:bg-red-400/20", textClass: "text-red-800 dark:text-red-300 oled:text-red-200" }
      default:
        return { label: "Planejado", color: "blue", bgClass: "bg-blue-100 dark:bg-blue-900/30 oled:bg-blue-400/20", textClass: "text-blue-800 dark:text-blue-300 oled:text-blue-200" }
    }
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm ring-1 ring-border space-y-6">

      {/* Grid de Info + Status para Desktop/Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status rápido do evento */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Status do Evento</span>
            <span className="text-xs text-muted-foreground">Clique para alterar</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
          {[
            { value: "planejado", label: "Planejado", color: "blue" },
            { value: "em_progresso", label: "Em Progresso", color: "green" },
            { value: "finalizado", label: "Finalizado", color: "gray" },
            { value: "cancelado", label: "Cancelado", color: "red" }
          ].map((status) => {
            const config = getStatusConfig(status.value)
            return (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                className={`
                  p-2 rounded-lg text-xs font-medium transition-all border-2
                  ${selectedStatus === status.value
                    ? `${config.bgClass} ${config.textClass} border-current`
                    : 'bg-background text-muted-foreground border-transparent hover:border-border'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    status.color === 'blue' ? 'bg-blue-500 oled:bg-blue-400' :
                    status.color === 'green' ? 'bg-green-500 oled:bg-green-400' :
                    status.color === 'gray' ? 'bg-gray-500 oled:bg-gray-400' : 'bg-red-500 oled:bg-red-400'
                  }`} />
                  {status.label}
                </div>
              </button>
            )
          })}
          </div>
        </div>

        {/* Contrato Vinculado */}
        {linkedContract ? (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="mb-3">
              <span className="text-sm font-medium text-foreground">Contrato Vinculado</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 oled:bg-blue-400/20 rounded-lg flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 oled:text-blue-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {linkedContract.filled_data.Contratante || linkedContract.filled_data.contratante_nome || "Contrato"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => linkedContract.generated_pdf_url && window.open(linkedContract.generated_pdf_url, '_blank')}
                className="h-8 text-xs flex-shrink-0 ml-2"
                disabled={!linkedContract.generated_pdf_url}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                {linkedContract.generated_pdf_url ? "Ver" : "N/A"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Nenhum contrato vinculado</p>
          </div>
        )}
      </div>

      {/* Header com informações do evento */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          Equipe do Evento
          {totalSelectedPeople > 0 && (
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 oled:bg-emerald-400/20 oled:text-emerald-200">
              {totalSelectedPeople} selecionadas
            </Badge>
          )}
        </h2>
        <p className="text-sm text-muted-foreground">
          Selecione pessoas em todas as categorias e salve de uma vez
        </p>
      </div>

      {/* No categories message */}
      {(!categories || categories.length === 0) && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Nenhuma categoria disponível. Por favor, cadastre categorias primeiro.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Carregando pessoas...
          </p>
        </div>
      )}

      {/* Grid de categorias - Otimizado para Desktop/Tablet */}
      {!isLoading && categoryPeopleData.size > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from(categoryPeopleData.values()).map(({ category, people, loading }) => {
            if (loading || people.length === 0) return null

            return (
              <div key={category.id} className="space-y-3 p-4 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                {/* Header da categoria - Compacto */}
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-semibold text-foreground">
                      {category.name}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {people.filter(person => isPersonSelected(person)).length}/{people.length}
                  </Badge>
                </div>

                {/* Grid de pessoas - 2 colunas em telas grandes */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                  {people.map(person => {
                    const isSelected = isPersonSelected(person)
                    const hasPendingChange = pendingSelections.has(person.id)

                    return (
                      <div
                        key={person.id}
                        className={`group p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 oled:bg-emerald-400/10 border-emerald-400 dark:border-emerald-600 shadow-sm'
                            : 'bg-card border-border hover:border-primary/40 hover:shadow-sm'
                        } ${
                          hasPendingChange ? 'ring-2 ring-blue-400/40' : ''
                        }`}
                        onClick={() => togglePersonSelection(person)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Checkbox */}
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                            isSelected
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-gray-300 dark:border-gray-600 group-hover:border-emerald-400'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground truncate">
                              {person.name}
                            </div>
                            {person.value > 0 && (
                              <div className="text-xs text-muted-foreground">
                                R$ {person.value.toFixed(2)}
                              </div>
                            )}
                          </div>

                          {/* Status Badge */}
                          {hasPendingChange && (
                            <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 flex-shrink-0">
                              Novo
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Botões de ação */}
      {!isLoading && categoryPeopleData.size > 0 && (
        <div className="border-t border-gray-200/60 dark:border-gray-700/60 oled:border-gray-600/40 pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => saveAllChanges().catch(console.error)}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium h-11"
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações {totalChanges > 0 && `(${totalChanges})`}
            </Button>
            {hasChanges && (
              <Button
                variant="outline"
                onClick={cancelChanges}
                className="sm:w-auto h-11"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Estado vazio - nenhuma categoria com pessoas */}
      {!isLoading && categoryPeopleData.size === 0 && (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">
            Nenhuma categoria possui pessoas cadastradas
          </p>
          <p className="text-sm text-muted-foreground">
            Vá em Categorias para adicionar pessoas primeiro
          </p>
        </div>
      )}
    </div>
  )
}