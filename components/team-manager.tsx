"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Check, X, UserPlus, UserMinus, Save } from "lucide-react"
import type { Event } from "@/types/event"
import type { Category, Person } from "@/types/category"
import { personClientService, eventTeamClientService } from "@/lib/supabase/client-services"

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
    console.log(`🔄 Toggle pessoa: ${person.name}`)
    
    const newPending = new Set(pendingSelections)
    const isCurrentlyInTeam = eventTeam.some(p => p.id === person.id)
    const currentlySelected = isPersonSelected(person)
    
    console.log(`📊 Estado antes do toggle:`, {
      personName: person.name,
      isCurrentlyInTeam,
      currentlySelected,
      hadPendingChange: pendingSelections.has(person.id)
    })
    
    if (newPending.has(person.id)) {
      newPending.delete(person.id)
      console.log(`🗑️ Removendo ${person.name} das mudanças pendentes`)
    } else {
      newPending.add(person.id)
      console.log(`➕ Adicionando ${person.name} às mudanças pendentes`)
    }
    
    setPendingSelections(newPending)
    setHasChanges(true)
    
    // Estado após mudança
    const willBeSelected = newPending.has(person.id) ? !isCurrentlyInTeam : isCurrentlyInTeam
    console.log(`🎯 ${person.name} ficará: ${willBeSelected ? 'SELECIONADA' : 'NÃO SELECIONADA'}`)
  }

  // Aplicar todas as alterações
  const saveAllChanges = async () => {
    console.log('💾 Salvando alterações da equipe...')
    console.log('📋 Estado atual da equipe:', eventTeam.map(p => p.name))
    console.log('🔄 Mudanças pendentes:', Array.from(pendingSelections))
    
    // CORREÇÃO: Usar isPersonSelected que já tem a lógica correta
    const updatedTeam: Person[] = []
    
    // Para cada categoria, incluir apenas as pessoas que devem estar selecionadas
    categoryPeopleData.forEach(({ people }) => {
      people.forEach(person => {
        const shouldBeInTeam = isPersonSelected(person)
        
        if (shouldBeInTeam) {
          updatedTeam.push(person)
          console.log(`✅ Incluindo na equipe: ${person.name}`)
        } else {
          console.log(`❌ Removendo da equipe: ${person.name}`)
        }
      })
    })

    console.log('🎯 Nova equipe final:', updatedTeam.map(p => p.name))

    // Salvar no Supabase e atualizar estado
    try {
      console.log('🏆 Saving team to Supabase...')
      const personIds = updatedTeam.map(person => person.id)
      const success = await eventTeamClientService.saveEventTeam(event.id, personIds)
      
      if (success) {
        console.log('✅ Team saved to Supabase successfully!')
        setEventTeam(updatedTeam)
        updateEventStaffAssignments(updatedTeam)
        
        // Reset pending selections
        setPendingSelections(new Set())
        setHasChanges(false)
      } else {
        console.error('❌ Failed to save team to Supabase')
        alert('Erro ao salvar equipe. Tente novamente.')
      }
    } catch (error) {
      console.error('❌ Error saving team to Supabase:', error)
      alert('Erro ao salvar equipe. Verifique sua conexão e tente novamente.')
    }
    
    console.log('✅ Alterações salvas com sucesso!')
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
    <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 oled:from-black oled:to-gray-900/30 rounded-xl p-6 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50 oled:ring-gray-600/30 space-y-6">
      
      {/* Status rápido do evento */}
      <div className="bg-gray-50 dark:bg-gray-800/50 oled:bg-gray-900/70 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 oled:text-gray-200">Status do Evento:</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 oled:text-gray-400">Clique para alterar</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    : 'bg-white dark:bg-gray-700 oled:bg-gray-800/80 text-gray-600 dark:text-gray-400 oled:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600 oled:hover:border-gray-500'
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

      {/* Header com informações do evento */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white oled:text-gray-100 mb-2 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 oled:from-emerald-400/20 oled:to-emerald-300/20 rounded-lg">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 oled:text-emerald-300" />
          </div>
          Equipe do Evento
          {totalSelectedPeople > 0 && (
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 oled:bg-emerald-400/20 oled:text-emerald-200">
              {totalSelectedPeople} selecionadas
            </Badge>
          )}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 oled:text-gray-300">
          Selecione pessoas em todas as categorias e salve de uma vez
        </p>
      </div>

      {/* No categories message */}
      {(!categories || categories.length === 0) && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-600 dark:text-gray-400 oled:text-gray-300">
            Nenhuma categoria disponível. Por favor, cadastre categorias primeiro.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 oled:text-gray-300">
            Carregando pessoas...
          </p>
        </div>
      )}

      {/* Todas as categorias expandidas */}
      {!isLoading && categoryPeopleData.size > 0 && (
        <div className="space-y-6">
          {Array.from(categoryPeopleData.values()).map(({ category, people, loading }) => {
            if (loading || people.length === 0) return null
            
            return (
              <div key={category.id} className="space-y-4">
                {/* Header da categoria */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200/60 dark:border-gray-700/60 oled:border-gray-600/40">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm" 
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white oled:text-gray-100">
                    {category.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {people.filter(person => isPersonSelected(person)).length}/{people.length}
                  </Badge>
                </div>

                {/* Lista de pessoas da categoria */}
                <div className="grid gap-3">
                  {people.map(person => {
                    const isSelected = isPersonSelected(person)
                    const hasPendingChange = pendingSelections.has(person.id)
                    
                    return (
                      <div 
                        key={person.id} 
                        className={`group p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 oled:from-emerald-400/10 oled:to-green-400/10 border-emerald-300 dark:border-emerald-600 oled:border-emerald-400 shadow-md'
                            : 'bg-white/80 dark:bg-gray-800/80 oled:bg-gray-900/80 border-gray-200 dark:border-gray-700 oled:border-gray-600 hover:border-gray-300 dark:hover:border-gray-600 oled:hover:border-gray-500'
                        } ${
                          hasPendingChange ? 'ring-2 ring-blue-500/30 dark:ring-blue-400/30 oled:ring-blue-400/40' : ''
                        }`}
                        onClick={() => togglePersonSelection(person)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-500 oled:bg-emerald-400 oled:border-emerald-400'
                                : 'border-gray-300 dark:border-gray-600 oled:border-gray-500 group-hover:border-emerald-400'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white oled:text-gray-100">
                                {person.name}
                              </div>
                              {person.value && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 oled:text-gray-300">
                                  R$ {person.value.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasPendingChange && (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 oled:bg-blue-400/20 oled:text-blue-200 text-xs">
                                Alterado
                              </Badge>
                            )}
                            {isSelected && !hasPendingChange && (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 oled:bg-emerald-400/20 oled:text-emerald-200 text-xs">
                                Selecionada
                              </Badge>
                            )}
                          </div>
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
          <div className="flex gap-3">
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
                className="px-6"
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
        <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-800/50 oled:bg-gray-900/50 rounded-xl">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500 oled:text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 oled:text-gray-300 mb-2">
            Nenhuma categoria possui pessoas cadastradas
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 oled:text-gray-400">
            Vá em Categorias para adicionar pessoas primeiro
          </p>
        </div>
      )}
    </div>
  )
}