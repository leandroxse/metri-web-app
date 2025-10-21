// Types para o sistema de contratos

// Campos do contrato Prime Buffet (mapeados para os nomes dos form fields no PDF)
export interface ContractFields {
  // Dados do Contratante
  "1": string                           // Nome completo do contratante
  "2": string                           // CPF (formato: 000.000.000-00)
  "3": string                           // Endereço completo (residente/domiciliado)

  // Dados do Evento
  dia: string                           // Dia do evento (ex: "15 de março de 2025")
  "4": string                           // Horário início (das)
  "5": string                           // Horário fim (às)
  local: string                         // Local do evento

  // Equipe (Cláusula 5)
  "6": number                           // Quantidade de garçons
  "7": number                           // Quantidade de copeiros
  "8": number                           // Quantidade de maître

  // Valores
  "9": number                           // Valor total em R$
  "10": string                          // Valor por extenso
  "11": number                          // Valor do sinal em R$
  "12": number                          // Saldo restante em R$

  // Pagamento e Taxas
  "13": number                          // Dias antes do evento para quitação
  "14": number                          // Número de convidados excedentes
  "15": number                          // Taxa de atraso por hora (R$)
  pix: string                           // Chave PIX para pagamento

  // Assinatura (última folha)
  "dia 2": number                       // Dia da assinatura (1-31) - campo "data01" no PDF
  mes: string                           // Mês da assinatura (por extenso, SEM acento)
}

// Valores padrão/comuns do Prime Buffet
export const DEFAULT_CONTRACT_VALUES: Partial<ContractFields> = {
  "6": 4,                               // 4 garçons
  "7": 2,                               // 2 copeiras
  "8": 1,                               // 1 maître
  "13": 7,                              // 7 dias antes do evento
  "14": 0,                              // 0 convidados excedentes (padrão)
  "15": 150.00,                         // R$ 150,00 por hora de atraso
  pix: "51.108.023/0001-55"             // CNPJ do Prime Buffet
}

// Template de contrato
export interface ContractTemplate {
  id: string
  name: string
  description: string | null
  template_url: string
  fields_schema: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

// Contrato preenchido
export interface FilledContract {
  id: string
  template_id: string | null
  event_id: string | null
  filled_data: ContractFields
  generated_pdf_url: string | null
  status: 'draft' | 'completed' | 'sent' | 'signed'
  notes: string | null
  created_at: string
  updated_at: string
}

// Type para formulário de contrato
export type ContractFormData = Omit<FilledContract, 'id' | 'created_at' | 'updated_at' | 'generated_pdf_url'>

// Posições dos campos no PDF (coordenadas x, y)
export interface FieldPosition {
  x: number
  y: number
  size?: number
}

// NOTA: FIELD_POSITIONS removido - agora usamos form fields do PDF
// Os campos são preenchidos automaticamente pelo pdf-lib usando os nomes dos form fields
