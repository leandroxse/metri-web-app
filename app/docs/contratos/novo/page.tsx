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
import { formatCPF, numberToWords } from "@/lib/utils/contract-fields"
import { useEvents } from "@/hooks/use-events"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NovoContratoPage() {
  const router = useRouter()
  const { createContract, generatePDF, templates, contracts } = useContracts()
  const { events } = useEvents()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Form state com valores padrão (novos nomes de campos)
  const [formData, setFormData] = useState<ContractFields>({
    ...DEFAULT_CONTRACT_VALUES,
    "1": "",
    "2": "",
    "3": "",
    dia: "",
    "4": "",
    "5": "",
    local: "",
    "9": 0,
    "10": "",
    "11": 0,
    "12": 0,
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

  // Auto-calcular saldo quando mudar total ou sinal
  const handleValorChange = (field: '9' | '11', value: number) => {
    const newData = { ...formData, [field]: value }
    if (field === '9') {
      // Quando mudar o valor total, calcular sinal como 50%
      const sinalAuto = value * 0.5
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

      if (contract) {
        toast({ title: "Contrato criado com sucesso!" })

        // Gerar PDF automaticamente
        const pdfUrl = await generatePDF(contract.id)

        if (pdfUrl) {
          toast({ title: "PDF gerado!", description: "Você pode baixar o contrato agora." })
          router.push('/docs')
        }
      } else {
        toast({ variant: "destructive", title: "Erro ao criar contrato" })
      }
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "Erro ao criar contrato" })
    } finally {
      setLoading(false)
    }
  }

  // Preencher com dados de teste
  const fillTestData = () => {
    setFormData({
      "1": "Maria Silva Santos",
      "2": "123.456.789-00",
      "3": "Rua das Flores, 123, Centro, São Paulo - SP",
      dia: "15 de março de 2025",
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
                      {event.title} - {new Date(event.date).toLocaleDateString('pt-BR')}
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
                <Input
                  value={formData.dia}
                  onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
                  placeholder="Ex: 15 de março de 2025"
                  required
                />
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
                  value={formData["6"]}
                  onChange={(e) => setFormData({ ...formData, "6": parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Copeiros</Label>
                <Input
                  type="number"
                  value={formData["7"]}
                  onChange={(e) => setFormData({ ...formData, "7": parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Maître</Label>
                <Input
                  type="number"
                  value={formData["8"]}
                  onChange={(e) => setFormData({ ...formData, "8": parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Valor Total (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData["9"] || ""}
                  onChange={(e) => handleValorChange('9', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label>Sinal (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData["11"] || ""}
                  onChange={(e) => handleValorChange('11', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
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
                  value={formData["13"]}
                  onChange={(e) => setFormData({ ...formData, "13": parseInt(e.target.value) || 7 })}
                />
              </div>
              <div>
                <Label>Convidados Excedentes</Label>
                <Input
                  type="number"
                  value={formData["14"]}
                  onChange={(e) => setFormData({ ...formData, "14": parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Taxa de Atraso por Hora (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData["15"]}
                  onChange={(e) => setFormData({ ...formData, "15": parseFloat(e.target.value) || 0 })}
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
