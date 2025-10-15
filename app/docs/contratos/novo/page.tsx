"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useContracts } from "@/hooks/use-contracts"
import { useToast } from "@/hooks/use-toast"
import { DEFAULT_CONTRACT_VALUES } from "@/types/contract"
import type { ContractFields } from "@/types/contract"
import { formatCPF, numberToWords, formatDateExtended } from "@/lib/utils/contract-fields"
import { parseEventDate } from "@/lib/utils/date-utils"
import { useEvents } from "@/hooks/use-events"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AndroidDatePicker } from "@/components/ui/android-date-picker"

export default function NovoContratoPage() {
  const router = useRouter()
  const { createContract, generatePDF, templates, contracts } = useContracts()
  const { events } = useEvents()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventDateISO, setEventDateISO] = useState<string>("") // YYYY-MM-DD para o date picker

  // Form state com valores padrão (novos nomes de campos)
  const [formData, setFormData] = useState<ContractFields>({
    ...DEFAULT_CONTRACT_VALUES,
    "1": "",
    "2": "",
    "3": "",
    dia: "", // Vai receber YYYY-MM-DD do date picker
    "4": "",
    "5": "",
    local: "",
    "6": 0,
    "7": 0,
    "8": 0,
    "9": 0,
    "10": "",
    "11": 0,
    "12": 0,
    "13": 7,
    "14": 0,
    "15": 0,
    pix: "",
    dia_assinatura: new Date().getDate(),
    mes: new Date().toLocaleDateString('pt-BR', { month: 'long' }).replace(/ç/g, 'c').replace(/ã/g, 'a')
  } as ContractFields)

  // Filtrar eventos ativos sem contrato
  const eventsWithoutContract = events.filter(event => {
    // Evento deve estar ativo (não cancelado, não finalizado)
    const isActive = event.status !== 'cancelado' && event.status !== 'finalizado'

    // Verificar se já tem contrato vinculado
    const hasContract = contracts.some(contract => contract.event_id === event.id)

    return isActive && !hasContract
  })

  // Handler para data do evento (converte YYYY-MM-DD para formato extenso)
  const handleEventDateChange = (dateString: string) => {
    setEventDateISO(dateString) // Atualiza o estado ISO para o date picker
    if (dateString) {
      const date = parseEventDate(dateString)
      const dateExtended = formatDateExtended(date)
      setFormData({ ...formData, dia: dateExtended })
    } else {
      setFormData({ ...formData, dia: "" })
    }
  }

  // Aplicar porcentagem de sinal
  const applySinalPercentage = (percentage: number) => {
    const valorTotal = formData["9"]
    if (valorTotal > 0) {
      const sinal = valorTotal * (percentage / 100)
      const saldo = valorTotal - sinal
      setFormData({
        ...formData,
        "11": sinal,
        "12": saldo
      })
    }
  }

  // Auto-calcular saldo quando mudar total ou sinal
  const handleValorChange = (field: '9' | '11', value: number) => {
    const newData = { ...formData, [field]: value }
    if (field === '9') {
      // Quando mudar o valor total, calcular sinal como 30% (novo padrão)
      const sinalAuto = value * 0.3
      newData["11"] = sinalAuto
      newData["12"] = value - sinalAuto
      newData["10"] = numberToWords(value)
    } else {
      // Quando mudar o sinal manualmente
      newData["12"] = formData["9"] - value
    }
    setFormData(newData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Buscar o primeiro template ativo (Prime Buffet)
      const primeTemplate = templates.length > 0 ? templates[0] : null

      if (!primeTemplate) {
        toast({
          variant: "destructive",
          title: "Template não encontrado",
          description: "Execute: npx tsx scripts/seed-contract-template.ts"
        })
        setLoading(false)
        return
      }

      // Criar contrato
      const contract = await createContract({
        template_id: primeTemplate.id,
        event_id: selectedEventId,
        filled_data: formData,
        status: 'draft',
        notes: null
      })

      if (!contract) {
        toast({
          variant: "destructive",
          title: "Erro ao criar contrato",
          description: "Não foi possível salvar o contrato. Tente novamente."
        })
        setLoading(false)
        return
      }

      // Contrato criado com sucesso!
      toast({
        title: "✅ Contrato criado!",
        description: "Redirecionando..."
      })

      // Pequeno delay para garantir que o toast seja exibido
      await new Promise(resolve => setTimeout(resolve, 300))

      // Resetar loading antes de navegar
      setLoading(false)

      // Navegar para /docs
      router.push('/docs')

      // Gerar PDF em background (não bloqueia a navegação)
      // Usar setTimeout para garantir que a navegação aconteça primeiro
      setTimeout(() => {
        generatePDF(contract.id).then(pdfUrl => {
          if (pdfUrl) {
            console.log('✅ PDF gerado com sucesso:', pdfUrl)
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
        title: "Erro ao criar contrato",
        description: "Ocorreu um erro inesperado. Tente novamente."
      })
      setLoading(false)
    }
  }

  // Preencher com dados de teste
  const fillTestData = () => {
    // Definir data de teste (15 de março de 2025)
    const testDate = "2025-03-15"
    setEventDateISO(testDate)

    setFormData({
      "1": "Maria Silva Santos",
      "2": "123.456.789-00",
      "3": "Rua das Flores, 123, Centro, São Paulo - SP",
      dia: formatDateExtended(parseEventDate(testDate)),
      "4": "18:00",
      "5": "23:00",
      local: "Salão de Festas Estrela, Av. Paulista, 1000",
      "6": 4,
      "7": 2,
      "8": 1,
      "9": 8500.00,
      "10": "oito mil e quinhentos reais",
      "11": 3000.00,
      "12": 5500.00,
      "13": 7,
      "14": 0,
      "15": 150.00,
      pix: "51.108.023/0001-55",
      dia_assinatura: new Date().getDate(),
      mes: new Date().toLocaleDateString('pt-BR', { month: 'long' }).replace(/ç/g, 'c').replace(/ã/g, 'a')
    })
    toast({ title: "Dados de teste preenchidos!" })
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Novo Contrato Prime Buffet</h1>
        <Button variant="outline" onClick={fillTestData} className="ml-4">
          Preencher com dados de teste
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                  {eventsWithoutContract.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} - {parseEventDate(event.date).toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {eventsWithoutContract.length === 0
                  ? "Nenhum evento ativo sem contrato disponível."
                  : `${eventsWithoutContract.length} evento(s) disponível(is) sem contrato.`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Contratante */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Contratante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  value={formData["1"]}
                  onChange={(e) => setFormData({ ...formData, "1": e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>CPF *</Label>
                <Input
                  value={formData["2"]}
                  onChange={(e) => setFormData({ ...formData, "2": formatCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
            </div>
            <div>
              <Label>Endereço Completo *</Label>
              <Input
                value={formData["3"]}
                onChange={(e) => setFormData({ ...formData, "3": e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados do Evento */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Data do Evento *</Label>
                <AndroidDatePicker
                  value={eventDateISO}
                  onChange={handleEventDateChange}
                />
                {formData.dia && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Será preenchido como: {formData.dia}
                  </p>
                )}
              </div>
              <div>
                <Label>Horário Início *</Label>
                <Input
                  type="time"
                  value={formData["4"]}
                  onChange={(e) => setFormData({ ...formData, "4": e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Horário Fim *</Label>
                <Input
                  type="time"
                  value={formData["5"]}
                  onChange={(e) => setFormData({ ...formData, "5": e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Local do Evento *</Label>
              <Input
                value={formData.local}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Equipe e Valores */}
        <Card>
          <CardHeader>
            <CardTitle>Equipe e Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Garçons</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData["6"] || ""}
                  onChange={(e) => setFormData({ ...formData, "6": e.target.value === "" ? 0 : parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Copeiros</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData["7"] || ""}
                  onChange={(e) => setFormData({ ...formData, "7": e.target.value === "" ? 0 : parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Maître</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData["8"] || ""}
                  onChange={(e) => setFormData({ ...formData, "8": e.target.value === "" ? 0 : parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Valor Total (R$) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData["9"] || ""}
                  onChange={(e) => handleValorChange('9', e.target.value === "" ? 0 : parseFloat(e.target.value))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label>Sinal (R$) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData["11"] || ""}
                  onChange={(e) => handleValorChange('11', e.target.value === "" ? 0 : parseFloat(e.target.value))}
                  placeholder="0.00"
                  required
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applySinalPercentage(30)}
                    className="text-xs h-7"
                    disabled={!formData["9"]}
                  >
                    30%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applySinalPercentage(50)}
                    className="text-xs h-7"
                    disabled={!formData["9"]}
                  >
                    50%
                  </Button>
                </div>
              </div>
              <div>
                <Label>Saldo (R$)</Label>
                <Input
                  type="number"
                  value={formData["12"] || ""}
                  disabled
                  className="bg-muted"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label>Valor por Extenso</Label>
              <Input
                value={formData["10"]}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Prazo para quitação (dias antes do evento)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData["13"] || ""}
                  onChange={(e) => setFormData({ ...formData, "13": e.target.value === "" ? 7 : parseInt(e.target.value) })}
                  placeholder="7"
                />
              </div>
              <div>
                <Label>Convidados Excedentes</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData["14"] || ""}
                  onChange={(e) => setFormData({ ...formData, "14": e.target.value === "" ? 0 : parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Taxa de Atraso por Hora (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData["15"] || ""}
                  onChange={(e) => setFormData({ ...formData, "15": e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label>Chave PIX</Label>
              <Input
                value={formData.pix}
                onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data de Assinatura */}
        <Card>
          <CardHeader>
            <CardTitle>Data de Assinatura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Dia</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dia_assinatura}
                  onChange={(e) => setFormData({ ...formData, dia_assinatura: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label>Mês (sem acento)</Label>
                <Input
                  value={formData.mes}
                  onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                  placeholder="janeiro, fevereiro, marco, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Criando..." : "Criar Contrato"}
          </Button>
        </div>
      </form>
    </div>
  )
}
