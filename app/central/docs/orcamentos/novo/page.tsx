"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useBudgets } from "@/hooks/use-budgets"
import { useToast } from "@/hooks/use-toast"
import { DEFAULT_BUDGET_VALUES } from "@/types/budget"
import type { BudgetFields } from "@/types/budget"
import { formatCurrency } from "@/lib/utils/contract-fields"
import { formatDateWithWeekday, parseEventDate } from "@/lib/utils/date-utils"
import { useEvents } from "@/hooks/use-events"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AndroidDatePicker } from "@/components/ui/android-date-picker"

/**
 * Página de criação de novo orçamento
 *
 * Permite criar orçamentos com:
 * - Dados do evento
 * - Nome do cerimonialista
 * - Quantidade de pessoas e preço por pessoa
 * - Cálculo automático do total
 */
export default function NovoOrcamentoPage() {
  const router = useRouter()
  const { createBudget, generatePDF, templates } = useBudgets()
  const { events } = useEvents()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [eventDateISO, setEventDateISO] = useState<string>("") // YYYY-MM-DD para o date picker

  // Form state com valores padrão
  const [formData, setFormData] = useState<BudgetFields>({
    ...DEFAULT_BUDGET_VALUES,
    evento: "",
    data: "",
    cerimonialista: "",
    pessoas1: 80,
    "preço2": 15.00,
    pessoas2: 80,
    preçotexto: 1200.00, // 80 * 15
  } as BudgetFields)

  /**
   * Handler para data do evento
   * Converte YYYY-MM-DD para formato com dia da semana
   */
  const handleEventDateChange = (dateString: string): void => {
    setEventDateISO(dateString)
    if (dateString) {
      const dateFormatted = formatDateWithWeekday(dateString)
      setFormData({ ...formData, data: dateFormatted })
    } else {
      setFormData({ ...formData, data: "" })
    }
  }

  /**
   * Handler para mudanças na quantidade de pessoas
   * Atualiza pessoas1 e pessoas2 (mesmo valor) e recalcula total
   */
  const handlePessoasChange = (value: number): void => {
    const total = value * formData["preço2"]
    setFormData({
      ...formData,
      pessoas1: value,
      pessoas2: value,
      preçotexto: total
    })
  }

  /**
   * Handler para mudanças no preço por pessoa
   * Recalcula o total automaticamente
   */
  const handlePrecoChange = (value: number): void => {
    const total = formData.pessoas1 * value
    setFormData({
      ...formData,
      "preço2": value,
      preçotexto: total
    })
  }

  /**
   * Handler de submit do formulário
   * Cria o orçamento e gera o PDF
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)

    try {
      // Verificar se template foi selecionado
      if (!selectedTemplateId) {
        toast({
          variant: "destructive",
          title: "Template não selecionado",
          description: "Por favor, selecione um template de orçamento"
        })
        setLoading(false)
        return
      }

      // Buscar template selecionado
      const budgetTemplate = templates.find(t => t.id === selectedTemplateId)

      if (!budgetTemplate) {
        toast({
          variant: "destructive",
          title: "Template não encontrado",
          description: "Template selecionado não está disponível"
        })
        setLoading(false)
        return
      }

      // Criar orçamento
      const budget = await createBudget({
        template_id: budgetTemplate.id,
        event_id: selectedEventId,
        filled_data: formData,
        status: 'draft',
        notes: null
      })

      if (!budget) {
        toast({
          variant: "destructive",
          title: "Erro ao criar orçamento",
          description: "Não foi possível salvar o orçamento. Tente novamente."
        })
        setLoading(false)
        return
      }

      // Orçamento criado com sucesso!
      toast({
        title: "✅ Orçamento criado!",
        description: "Redirecionando..."
      })

      // Pequeno delay para garantir que o toast seja exibido
      await new Promise(resolve => setTimeout(resolve, 300))

      // Resetar loading antes de navegar
      setLoading(false)

      // Navegar para /central/docs com aba de orçamentos selecionada
      router.push('/central/docs?tab=budgets')

      // Gerar PDF em background (não bloqueia a navegação)
      setTimeout(() => {
        generatePDF(budget.id).then(pdfUrl => {
          if (pdfUrl) {
            console.log('✅ PDF de orçamento gerado com sucesso:', pdfUrl)
          } else {
            console.warn('⚠️ PDF não pôde ser gerado')
          }
        }).catch(error => {
          console.error('❌ Erro ao gerar PDF:', error)
        })
      }, 500)

    } catch (error) {
      console.error('❌ Erro no handleSubmit:', error)
      toast({
        variant: "destructive",
        title: "Erro ao criar orçamento",
        description: "Ocorreu um erro inesperado. Tente novamente."
      })
      setLoading(false)
    }
  }

  /**
   * Preencher com dados de teste
   */
  const fillTestData = (): void => {
    const testDate = "2025-10-10"
    setEventDateISO(testDate)

    setFormData({
      evento: "Casamento Silva",
      data: formatDateWithWeekday(testDate),
      cerimonialista: "Ana Paula Eventos",
      pessoas1: 100,
      "preço2": 18.50,
      pessoas2: 100,
      preçotexto: 1850.00
    })
    toast({ title: "Dados de teste preenchidos!" })
  }

  // Filtrar eventos ativos
  const activeEvents = events.filter(event =>
    event.status !== 'cancelado' && event.status !== 'finalizado'
  )

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Novo Orçamento</h1>
        <Button variant="outline" onClick={fillTestData} className="ml-4">
          Preencher com dados de teste
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Template */}
        <Card>
          <CardHeader>
            <CardTitle>Template de Orçamento *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="template">Selecione o template</Label>
              <Select
                value={selectedTemplateId || ""}
                onValueChange={(value) => setSelectedTemplateId(value)}
                required
              >
                <SelectTrigger id="template" className={!selectedTemplateId ? "border-red-300" : ""}>
                  <SelectValue placeholder="Escolha o tipo de orçamento" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {templates.length === 0
                  ? "Nenhum template disponível."
                  : "Escolha o cardápio/tipo de orçamento que deseja gerar"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Atribuir a Evento */}
        <Card>
          <CardHeader>
            <CardTitle>Atribuir a Evento (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Selecione um evento ativo</Label>
              <Select
                value={selectedEventId || "none"}
                onValueChange={(value) => setSelectedEventId(value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum evento selecionado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum evento</SelectItem>
                  {activeEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} - {parseEventDate(event.date).toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {activeEvents.length === 0
                  ? "Nenhum evento ativo disponível."
                  : `${activeEvents.length} evento(s) disponível(is).`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Evento */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome do Evento *</Label>
              <Input
                value={formData.evento}
                onChange={(e) => setFormData({ ...formData, evento: e.target.value })}
                placeholder="Ex: Casamento Silva"
                required
              />
            </div>
            <div>
              <Label>Data do Evento *</Label>
              <AndroidDatePicker
                value={eventDateISO}
                onChange={handleEventDateChange}
              />
              {formData.data && (
                <p className="text-xs text-muted-foreground mt-1">
                  Será preenchido como: {formData.data}
                </p>
              )}
            </div>
            <div>
              <Label>Cerimonialista *</Label>
              <Input
                value={formData.cerimonialista}
                onChange={(e) => setFormData({ ...formData, cerimonialista: e.target.value })}
                placeholder="Ex: Ana Paula Eventos"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Valores e Quantidade */}
        <Card>
          <CardHeader>
            <CardTitle>Quantidade e Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Quantidade de Pessoas *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.pessoas1 || ""}
                  onChange={(e) => handlePessoasChange(e.target.value === "" ? 0 : parseInt(e.target.value))}
                  placeholder="80"
                  required
                />
              </div>
              <div>
                <Label>Preço por Pessoa *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData["preço2"] || ""}
                  onChange={(e) => handlePrecoChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                  placeholder="15.00"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Valor Total</Label>
              <Input
                value={formatCurrency(formData.preçotexto)}
                disabled
                className="bg-muted text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.pessoas1} pessoa(s) × {formatCurrency(formData["preço2"])} = {formatCurrency(formData.preçotexto)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Criando..." : "Criar Orçamento"}
          </Button>
        </div>
      </form>
    </div>
  )
}
