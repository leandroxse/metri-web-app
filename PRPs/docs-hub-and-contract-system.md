# PRP: Sistema DOCS - Hub de Documentos e Geração de Contratos

## Goal
Implementar uma nova seção DOCS no sistema METRI que funcione como um hub centralizado para gerenciar documentos (PDFs e outros arquivos) e gerar contratos preenchidos a partir de templates. O sistema deve permitir upload de documentos, visualização, compartilhamento com clientes, e um fluxo intuitivo para preencher contratos do buffet com dados do evento.

## Why
- **Centralização**: Evitar que o usuário precise procurar documentos em pastas do computador
- **Eficiência**: Automatizar o preenchimento de contratos que atualmente é manual e propenso a erros
- **Profissionalismo**: Gerar contratos formatados e prontos para assinatura rapidamente
- **Integração**: Vincular documentos aos eventos existentes no sistema
- **Compartilhamento**: Facilitar o envio de documentos para clientes

## What
Um sistema completo de gestão de documentos com foco em contratos de buffet, incluindo:
- Upload e armazenamento de documentos diversos (PDFs, imagens, etc)
- Sistema de categorização de documentos
- Geração automática de contratos preenchidos a partir de templates
- Formulário intuitivo que coleta apenas os dados necessários do contrato
- Integração com eventos existentes
- Visualização e compartilhamento de documentos

### Success Criteria
- [ ] Usuário pode fazer upload de qualquer documento e categorizá-lo
- [ ] Usuário pode visualizar lista de todos os documentos organizados
- [ ] Usuário pode vincular documentos a eventos
- [ ] Usuário pode criar novo contrato preenchendo apenas os campos necessários
- [ ] Sistema gera PDF do contrato com todos os campos preenchidos corretamente
- [ ] Usuário pode baixar ou compartilhar o contrato gerado
- [ ] Sistema mantém histórico de contratos gerados por evento
- [ ] Interface segue o padrão visual do sistema (OLED/Dark/Light themes)

## All Needed Context

### Documentation & References

```yaml
# BIBLIOTECAS PRINCIPAIS

- url: https://pdf-lib.js.org/
  why: Biblioteca para preencher campos em PDFs existentes
  critical: |
    - Suporta preenchimento de form fields em PDFs
    - Funciona no browser e Node.js
    - TypeScript native
    - ⚠️ Não atualizada desde 2021, mas estável para nosso caso

- url: https://supabase.com/docs/guides/storage
  why: Sistema de storage do Supabase para arquivos
  section: "Standard Uploads, Security with RLS"
  critical: |
    - Criar buckets separados para cada tipo de documento
    - Implementar RLS policies para segurança
    - Validar tipo e tamanho de arquivo no cliente
    - Usar signed URLs para compartilhamento seguro

- url: https://supabase.com/docs/reference/javascript/storage-from-upload
  why: API reference para upload de arquivos
  critical: Upload com contentType correto para PDFs

# PADRÕES DO CODEBASE

- file: components/menu-form.tsx
  why: Padrão de formulário complexo com múltiplas etapas
  pattern: Estado local + validação + submit com loading state

- file: components/event-form.tsx
  why: Formulário com integração de dados relacionados (categorias, staff)
  pattern: Como buscar e integrar dados de outras tabelas

- file: lib/supabase/menu-services.ts
  why: Padrão de serviços do Supabase com error handling
  pattern: CRUD operations, logging, UUID validation

- file: lib/supabase/services.ts
  why: Helpers de validação e error handling padrão
  pattern: logError(), isValidUUID(), async patterns

- file: types/menu.ts
  why: Padrão de definição de types
  pattern: Interface principal + FormData types (Omit)

# ANÁLISE DO CONTRATO EXISTENTE

- docfile: contrato.pdf (na raiz do projeto)
  why: Template do contrato Prime Buffet que será preenchido
  campos_identificados: |
    # Total de 25 campos identificados no PDF
    Ver seção "Contract Fields Schema" abaixo
```

### Current Codebase Tree

```
metri-web-app/
├── app/
│   ├── eventos/          # Seção existente de eventos
│   ├── cardapios/        # Seção existente de cardápios
│   ├── categorias/       # Seção existente de categorias
│   ├── pagamentos/       # Seção existente de pagamentos
│   ├── page.tsx          # Dashboard
│   └── layout.tsx
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── event-form.tsx
│   ├── menu-form.tsx
│   └── menu-editor.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── services.ts
│   │   └── menu-services.ts
│   └── utils/
│       └── event-status.ts
├── types/
│   ├── event.ts
│   ├── menu.ts
│   ├── category.ts
│   └── payment.ts
├── hooks/
│   ├── use-events.ts
│   ├── use-menus.ts
│   └── use-payments.ts
└── public/
    └── contrato.pdf      # Template original
```

### Desired Codebase Tree (Novos Arquivos)

```
metri-web-app/
├── app/
│   └── docs/                           # 📁 NOVA SEÇÃO DOCS
│       ├── page.tsx                    # Lista de documentos + tabs (Documentos | Contratos)
│       ├── upload/
│       │   └── page.tsx                # Upload de documentos
│       ├── contratos/
│       │   ├── page.tsx                # Lista de contratos
│       │   ├── novo/
│       │   │   └── page.tsx            # Formulário de novo contrato
│       │   └── [id]/
│       │       ├── page.tsx            # Visualizar/Editar contrato
│       │       └── preview/
│       │           └── page.tsx        # Preview do PDF gerado
│       └── [id]/
│           └── page.tsx                # Visualizar documento individual
│
├── components/
│   ├── document-list.tsx               # Lista de documentos com filtros
│   ├── document-upload.tsx             # Componente de upload (drag & drop)
│   ├── document-card.tsx               # Card individual de documento
│   ├── contract-form.tsx               # Formulário de preenchimento de contrato
│   ├── contract-list.tsx               # Lista de contratos gerados
│   ├── contract-preview.tsx            # Preview do contrato com dados
│   └── pdf-viewer.tsx                  # Visualizador de PDF (react-pdf)
│
├── lib/
│   ├── supabase/
│   │   ├── document-services.ts        # CRUD de documentos
│   │   └── contract-services.ts        # CRUD de contratos + geração PDF
│   └── utils/
│       ├── pdf-utils.ts                # Funções pdf-lib para preencher campos
│       └── contract-fields.ts          # Schema e mapeamento de campos do contrato
│
├── types/
│   ├── document.ts                     # Types de documentos
│   └── contract.ts                     # Types de contratos e campos
│
├── hooks/
│   ├── use-documents.ts                # Hook para documentos
│   └── use-contracts.ts                # Hook para contratos
│
└── public/
    └── templates/
        └── contrato-prime.pdf          # Template do contrato (vazio)
```

### Known Gotchas & Library Quirks

```typescript
// CRÍTICO: pdf-lib configuration
// pdf-lib requer carregar o PDF como ArrayBuffer
// Não aceita URLs diretas - precisa fazer fetch primeiro

// ✅ CORRETO:
const pdfBytes = await fetch(templateUrl).then(res => res.arrayBuffer())
const pdfDoc = await PDFDocument.load(pdfBytes)

// ❌ ERRADO:
const pdfDoc = await PDFDocument.load(templateUrl) // Não funciona!

// CRÍTICO: Supabase Storage
// - Validar tipo de arquivo ANTES de upload
// - Limitar tamanho (ex: 10MB para PDFs)
// - Usar buckets separados com RLS policies diferentes
// - ContentType deve ser 'application/pdf' para PDFs

// CRÍTICO: Next.js 15 + useSearchParams
// Sempre envolver componentes que usam useSearchParams em <Suspense>
// Padrão já usado em: app/eventos/[id]/cardapio/[token]/page.tsx

// PADRÃO DO PROJETO:
// - snake_case para campos do Supabase (created_at, event_id)
// - camelCase para TypeScript (eventId, createdAt)
// - Mapear entre os dois nos services (ver lib/supabase/services.ts)

// PADRÃO DE ERROR HANDLING:
// - Usar logError() helper (ver services.ts)
// - Validar UUIDs com isValidUUID()
// - Retornar null em caso de erro, não throw
// - Logar contexto completo do erro
```

## Implementation Blueprint

### Contract Fields Schema

Campos identificados no contrato Prime Buffet (contrato.pdf):

```typescript
// types/contract.ts
export interface ContractFields {
  // PÁGINA 1 - Dados do Contratante e Evento
  contratante_nome: string              // Nome completo do contratante
  contratante_cpf: string               // CPF (formato: 000.000.000-00)
  contratante_endereco: string          // Endereço completo
  evento_data: string                   // Data do evento (formato: "dd de mês de 2025")
  evento_horario_inicio: string         // Horário início (formato: "HH:MM")
  evento_horario_fim: string            // Horário fim (formato: "HH:MM")
  evento_local: string                  // Local do evento

  // PÁGINA 2 - Equipe e Valores
  equipe_garcons: number                // Quantidade de garçons
  equipe_copeiras: number               // Quantidade de copeiras
  equipe_maitre: number                 // Quantidade de maître
  valor_total: number                   // Valor total em R$
  valor_total_extenso: string           // Valor por extenso
  sinal_valor: number                   // Valor do sinal em R$
  saldo_valor: number                   // Saldo restante em R$
  prazo_pagamento_dias: number          // Dias antes do evento para quitar
  chave_pix: string                     // Chave PIX para pagamento

  // PÁGINA 3 - Valores Adicionais
  valor_excedente_por_pessoa: number    // Valor por pessoa excedente em R$

  // PÁGINA 4 - Taxas
  taxa_atraso_por_hora: number          // Taxa por hora de atraso em R$

  // PÁGINA 5 - Assinatura e Testemunhas
  data_assinatura_dia: number           // Dia da assinatura (1-31)
  data_assinatura_mes: string           // Mês da assinatura (por extenso)
  testemunha1_nome: string              // Nome da testemunha 1
  testemunha1_cpf: string               // CPF da testemunha 1
  testemunha2_nome: string              // Nome da testemunha 2
  testemunha2_cpf: string               // CPF da testemunha 2
}

// Valores padrão/comuns do Prime Buffet
export const DEFAULT_CONTRACT_VALUES = {
  equipe_garcons: 4,
  equipe_copeiras: 2,
  equipe_maitre: 1,
  prazo_pagamento_dias: 7,
  chave_pix: "51.108.023/0001-55", // CNPJ do Prime Buffet
  valor_excedente_por_pessoa: 50.00,
  taxa_atraso_por_hora: 150.00
}
```

### Database Schema (Supabase)

```sql
-- ============================================
-- TABELA: documents
-- Armazena metadados de todos os documentos
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  -- Categorias: 'contract', 'invoice', 'receipt', 'photo', 'other'

  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  -- Tipos: 'pdf', 'jpg', 'png', 'docx', etc

  file_size INTEGER,
  -- Tamanho em bytes

  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  -- Opcional: vincular a um evento

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies para documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON documents
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON documents
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON documents
  FOR DELETE USING (true);

-- Index para busca por evento
CREATE INDEX idx_documents_event_id ON documents(event_id);
CREATE INDEX idx_documents_category ON documents(category);

-- ============================================
-- TABELA: contract_templates
-- Templates de contratos reutilizáveis
-- ============================================
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  template_url TEXT NOT NULL,
  -- URL do PDF template vazio no storage

  fields_schema JSONB NOT NULL,
  -- Schema dos campos e suas posições no PDF

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para templates
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON contract_templates
  FOR SELECT USING (true);

-- Apenas admin pode criar/editar templates (por enquanto todos podem)
CREATE POLICY "Enable all for authenticated users" ON contract_templates
  FOR ALL USING (true);

-- ============================================
-- TABELA: filled_contracts
-- Contratos preenchidos e gerados
-- ============================================
CREATE TABLE filled_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES contract_templates(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,

  filled_data JSONB NOT NULL,
  -- Dados preenchidos do contrato (ContractFields)

  generated_pdf_url TEXT,
  -- URL do PDF gerado e preenchido

  status TEXT DEFAULT 'draft',
  -- Status: 'draft', 'completed', 'sent', 'signed'

  notes TEXT,
  -- Observações sobre o contrato

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para contratos preenchidos
ALTER TABLE filled_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users" ON filled_contracts
  FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_filled_contracts_event_id ON filled_contracts(event_id);
CREATE INDEX idx_filled_contracts_template_id ON filled_contracts(template_id);
CREATE INDEX idx_filled_contracts_status ON filled_contracts(status);
```

### Storage Buckets Configuration

```typescript
// Criar 3 buckets no Supabase Storage:

// 1. Bucket: 'documents' (público com RLS)
// - Para documentos gerais (fotos, invoices, etc)
// - Público: false
// - Max file size: 10MB
// - Allowed mime types: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']

// 2. Bucket: 'contract-templates' (público read)
// - Para templates de contratos vazios
// - Público: true (read-only)
// - Max file size: 5MB
// - Allowed mime types: ['application/pdf']

// 3. Bucket: 'filled-contracts' (privado com RLS)
// - Para contratos preenchidos gerados
// - Público: false
// - Max file size: 10MB
// - Allowed mime types: ['application/pdf']

// RLS Policies para buckets (Objects)
// Ver: https://supabase.com/docs/guides/storage/security/access-control

// Exemplo de policy para 'documents':
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'documents' AND auth.role() = 'authenticated' );
```

### Task List (Order of Implementation)

```yaml
# FASE 1: Setup Base (Database + Storage)
Task 1: "Criar tabelas no Supabase"
  - Executar SQL acima para criar: documents, contract_templates, filled_contracts
  - Criar indexes e RLS policies
  - Verificar com: SELECT * FROM pg_tables WHERE schemaname = 'public'

Task 2: "Configurar Storage Buckets"
  - Criar buckets: documents, contract-templates, filled-contracts
  - Configurar RLS policies para cada bucket
  - Fazer upload do contrato.pdf para bucket 'contract-templates'

Task 3: "Criar Types TypeScript"
  - CREATE types/document.ts (Document, DocumentFormData)
  - CREATE types/contract.ts (ContractFields, ContractTemplate, FilledContract)
  - PATTERN: Seguir types/menu.ts e types/event.ts

# FASE 2: Services Layer
Task 4: "Criar Document Services"
  - CREATE lib/supabase/document-services.ts
  - Implementar: getAll, getById, getByEvent, create, update, delete, upload
  - PATTERN: Seguir lib/supabase/menu-services.ts
  - CRITICAL: Validar file type e size antes de upload

Task 5: "Criar Contract Services"
  - CREATE lib/supabase/contract-services.ts
  - Implementar: getTemplates, createContract, fillContract, generatePDF
  - PATTERN: Seguir lib/supabase/services.ts

Task 6: "Criar PDF Utils"
  - CREATE lib/utils/pdf-utils.ts
  - Implementar: loadPDF, fillFields, savePDF
  - Usar: pdf-lib library
  - CRITICAL: Fetch PDF como ArrayBuffer antes de carregar

Task 7: "Criar Contract Fields Utils"
  - CREATE lib/utils/contract-fields.ts
  - Definir mapeamento de campos para posições no PDF
  - Funções helper: formatCPF, formatCurrency, numberToWords

# FASE 3: Hooks
Task 8: "Criar useDocuments hook"
  - CREATE hooks/use-documents.ts
  - State management para lista de documentos
  - PATTERN: Seguir hooks/use-menus.ts

Task 9: "Criar useContracts hook"
  - CREATE hooks/use-contracts.ts
  - State management para contratos
  - PATTERN: Seguir hooks/use-events.ts

# FASE 4: UI Components
Task 10: "Criar Document Components"
  - CREATE components/document-list.tsx (lista com filtros)
  - CREATE components/document-card.tsx (card individual)
  - CREATE components/document-upload.tsx (upload drag & drop)
  - CREATE components/pdf-viewer.tsx (visualizador)
  - PATTERN: Seguir components/menu-viewer.tsx

Task 11: "Criar Contract Components"
  - CREATE components/contract-form.tsx (formulário de preenchimento)
  - CREATE components/contract-list.tsx (lista de contratos)
  - CREATE components/contract-preview.tsx (preview antes de gerar)
  - PATTERN: Seguir components/event-form.tsx

# FASE 5: Pages
Task 12: "Criar DOCS Hub Page"
  - CREATE app/docs/page.tsx
  - Tabs: Documentos | Contratos
  - Lista de documentos + botão upload
  - PATTERN: Seguir app/eventos/page.tsx

Task 13: "Criar Upload Page"
  - CREATE app/docs/upload/page.tsx
  - Formulário de upload com drag & drop
  - Validação de arquivo
  - Link para evento (opcional)

Task 14: "Criar Contracts Pages"
  - CREATE app/docs/contratos/page.tsx (lista)
  - CREATE app/docs/contratos/novo/page.tsx (formulário)
  - CREATE app/docs/contratos/[id]/page.tsx (visualizar)
  - CREATE app/docs/contratos/[id]/preview/page.tsx (preview PDF)

Task 15: "Adicionar DOCS ao Menu Principal"
  - MODIFY components/bottom-navigation.tsx
  - Adicionar item "Docs" com ícone FileText
  - PATTERN: Seguir padrão dos outros itens

# FASE 6: Integration & Polish
Task 16: "Integrar com Eventos"
  - MODIFY app/eventos/[id]/page.tsx
  - Adicionar seção "Documentos" mostrando docs vinculados
  - Botão "Gerar Contrato" que abre formulário pré-preenchido

Task 17: "Upload Template Inicial"
  - Criar seed script para upload do contrato Prime Buffet
  - Criar registro em contract_templates
  - Definir fields_schema com mapeamento de campos

Task 18: "Testes e Validação"
  - Testar upload de diferentes tipos de arquivo
  - Testar geração de contrato com todos os campos
  - Verificar PDF gerado está correto
  - Testar em mobile (responsividade)
```

### Pseudocode - Função Principal de Geração de PDF

```typescript
// lib/utils/pdf-utils.ts

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { ContractFields } from '@/types/contract'

/**
 * Preenche um template de PDF com os dados do contrato
 *
 * CRITICAL:
 * - Template deve ser carregado como ArrayBuffer (fetch primeiro)
 * - Posições dos campos devem ser mapeadas manualmente
 * - Fonte padrão: Helvetica (suporta caracteres latinos)
 */
async function fillContractPDF(
  templateUrl: string,
  fields: ContractFields
): Promise<Uint8Array> {

  // STEP 1: Carregar template como ArrayBuffer
  const response = await fetch(templateUrl)
  if (!response.ok) throw new Error('Failed to fetch template')
  const templateBytes = await response.arrayBuffer()

  // STEP 2: Carregar PDF document
  const pdfDoc = await PDFDocument.load(templateBytes)
  const pages = pdfDoc.getPages()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // STEP 3: Preencher campos por página

  // PÁGINA 1 - Dados do contratante e evento
  const page1 = pages[0]
  page1.drawText(fields.contratante_nome, {
    x: 150, y: 680, // Posições aproximadas - ajustar testando
    size: 11,
    font,
    color: rgb(0, 0, 0)
  })

  page1.drawText(fields.contratante_cpf, {
    x: 200, y: 665,
    size: 11,
    font
  })

  page1.drawText(fields.contratante_endereco, {
    x: 220, y: 650,
    size: 11,
    font
  })

  page1.drawText(fields.evento_data, {
    x: 180, y: 480,
    size: 11,
    font
  })

  page1.drawText(`${fields.evento_horario_inicio} às ${fields.evento_horario_fim}`, {
    x: 120, y: 465,
    size: 11,
    font
  })

  page1.drawText(fields.evento_local, {
    x: 50, y: 410,
    size: 11,
    font
  })

  // PÁGINA 2 - Equipe e valores
  const page2 = pages[1]
  page2.drawText(fields.equipe_garcons.toString(), {
    x: 120, y: 580,
    size: 11,
    font
  })

  page2.drawText(fields.equipe_copeiras.toString(), {
    x: 180, y: 580,
    size: 11,
    font
  })

  page2.drawText(fields.equipe_maitre.toString(), {
    x: 240, y: 580,
    size: 11,
    font
  })

  page2.drawText(formatCurrency(fields.valor_total), {
    x: 180, y: 480,
    size: 11,
    font
  })

  page2.drawText(fields.valor_total_extenso, {
    x: 280, y: 480,
    size: 11,
    font
  })

  page2.drawText(formatCurrency(fields.sinal_valor), {
    x: 180, y: 460,
    size: 11,
    font
  })

  page2.drawText(formatCurrency(fields.saldo_valor), {
    x: 180, y: 440,
    size: 11,
    font
  })

  page2.drawText(fields.prazo_pagamento_dias.toString(), {
    x: 320, y: 440,
    size: 11,
    font
  })

  page2.drawText(fields.chave_pix, {
    x: 230, y: 420,
    size: 11,
    font
  })

  // PÁGINA 3 - Valores adicionais
  const page3 = pages[2]
  page3.drawText(formatCurrency(fields.valor_excedente_por_pessoa), {
    x: 580, y: 580,
    size: 11,
    font
  })

  // PÁGINA 4 - Taxas
  const page4 = pages[3]
  page4.drawText(formatCurrency(fields.taxa_atraso_por_hora), {
    x: 240, y: 520,
    size: 11,
    font
  })

  // PÁGINA 5 - Assinatura e testemunhas
  const page5 = pages[4]
  page5.drawText(fields.data_assinatura_dia.toString(), {
    x: 100, y: 480,
    size: 11,
    font
  })

  page5.drawText(fields.data_assinatura_mes, {
    x: 140, y: 480,
    size: 11,
    font
  })

  page5.drawText(fields.testemunha1_nome, {
    x: 100, y: 350,
    size: 11,
    font
  })

  page5.drawText(fields.testemunha1_cpf, {
    x: 380, y: 350,
    size: 11,
    font
  })

  page5.drawText(fields.testemunha2_nome, {
    x: 100, y: 330,
    size: 11,
    font
  })

  page5.drawText(fields.testemunha2_cpf, {
    x: 380, y: 330,
    size: 11,
    font
  })

  // STEP 4: Serializar PDF preenchido
  const pdfBytes = await pdfDoc.save()

  return pdfBytes
}

/**
 * Helper: Formatar valor monetário
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

/**
 * Helper: Converter número para extenso (simplificado)
 * TODO: Usar biblioteca como 'numero-por-extenso' para valores complexos
 */
function numberToWords(value: number): string {
  // Implementação simplificada
  // Para produção, usar biblioteca especializada
  const units = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']

  // ... lógica completa aqui

  return `${value} reais` // placeholder
}

export { fillContractPDF, formatCurrency, numberToWords }
```

### Integration Points

```yaml
DATABASE:
  - migrations: "Criar 3 tabelas (documents, contract_templates, filled_contracts)"
  - storage: "Criar 3 buckets (documents, contract-templates, filled-contracts)"
  - rls: "Configurar policies para segurança"

NAVIGATION:
  - modify: components/bottom-navigation.tsx
  - add: "Item 'Docs' com ícone FileText após 'Pagamentos'"
  - route: "/docs"

DEPENDENCIES:
  - add: "pdf-lib@^1.17.1" (geração/edição de PDF)
  - add: "react-pdf@^9.0.0" (visualização de PDF - opcional)
  - add: "react-dropzone@^14.2.3" (upload drag & drop)

ROUTES:
  - create: "app/docs/page.tsx" (hub principal)
  - create: "app/docs/upload/page.tsx" (upload)
  - create: "app/docs/contratos/novo/page.tsx" (novo contrato)
  - create: "app/docs/contratos/[id]/page.tsx" (ver contrato)

THEME:
  - ensure: "Suporte a OLED/Dark/Light themes em todos os novos componentes"
  - pattern: "usar className='bg-background border-border text-foreground'"
```

## Validation Loop

### Level 1: Type Safety & Linting

```bash
# Verificar types TypeScript
npx tsc --noEmit

# Expected: No errors
# If errors: Fix type mismatches, missing imports, etc

# Linting (se configurado)
npm run lint

# Expected: No linting errors
```

### Level 2: Supabase Schema Validation

```sql
-- Verificar que todas as tabelas foram criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('documents', 'contract_templates', 'filled_contracts');

-- Expected: 3 rows

-- Verificar RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('documents', 'contract_templates', 'filled_contracts');

-- Expected: rowsecurity = true para todas

-- Verificar buckets foram criados
SELECT * FROM storage.buckets
WHERE name IN ('documents', 'contract-templates', 'filled-contracts');

-- Expected: 3 buckets
```

### Level 3: Manual Testing Flow

```bash
# 1. Testar Upload de Documento
- Navegar para /docs
- Clicar em "Upload Documento"
- Selecionar PDF de teste
- Preencher nome e categoria
- Verificar upload bem sucedido
- Expected: Documento aparece na lista

# 2. Testar Criação de Contrato
- Navegar para /docs/contratos
- Clicar em "Novo Contrato"
- Preencher todos os campos do formulário
- Clicar em "Preview"
- Verificar preview mostra dados corretos
- Clicar em "Gerar Contrato"
- Expected: PDF gerado e baixado com campos preenchidos

# 3. Testar Integração com Evento
- Navegar para um evento existente
- Verificar seção "Documentos" aparece
- Clicar em "Gerar Contrato"
- Verificar formulário vem pré-preenchido com dados do evento
- Expected: Nome, data, local, etc já preenchidos

# 4. Testar Responsividade
- Abrir /docs no mobile (DevTools)
- Testar upload de arquivo
- Testar formulário de contrato
- Expected: Interface adaptada para mobile
```

### Level 4: PDF Generation Testing

```typescript
// Script de teste: scripts/test-pdf-generation.ts
import { fillContractPDF } from '@/lib/utils/pdf-utils'
import { DEFAULT_CONTRACT_VALUES } from '@/types/contract'
import fs from 'fs'

async function testPDFGeneration() {
  const testFields = {
    ...DEFAULT_CONTRACT_VALUES,
    contratante_nome: "João da Silva",
    contratante_cpf: "123.456.789-00",
    contratante_endereco: "Rua Teste, 123, Belém/PA",
    evento_data: "15 de fevereiro de 2025",
    evento_horario_inicio: "18:00",
    evento_horario_fim: "23:00",
    evento_local: "Salão Festas, Av. Principal, 456",
    valor_total: 5000.00,
    valor_total_extenso: "cinco mil reais",
    sinal_valor: 1500.00,
    saldo_valor: 3500.00,
    data_assinatura_dia: 1,
    data_assinatura_mes: "janeiro",
    testemunha1_nome: "Maria Santos",
    testemunha1_cpf: "987.654.321-00",
    testemunha2_nome: "Pedro Oliveira",
    testemunha2_cpf: "111.222.333-44"
  }

  const templateUrl = '/templates/contrato-prime.pdf'
  const pdfBytes = await fillContractPDF(templateUrl, testFields)

  // Salvar para inspeção manual
  fs.writeFileSync('test-output.pdf', pdfBytes)

  console.log('✅ PDF gerado com sucesso: test-output.pdf')
  console.log('📋 Abra o arquivo e verifique se todos os campos estão preenchidos corretamente')
}

testPDFGeneration()
```

```bash
# Executar teste de geração
npx tsx scripts/test-pdf-generation.ts

# Expected: Arquivo test-output.pdf criado
# Manual: Abrir PDF e verificar todos os campos preenchidos
```

## Final Validation Checklist

```yaml
Funcionalidade:
  - [ ] Upload de documento funciona com drag & drop
  - [ ] Documentos aparecem na lista corretamente
  - [ ] Filtro por categoria funciona
  - [ ] Visualizador de PDF abre documentos
  - [ ] Formulário de contrato valida campos obrigatórios
  - [ ] Preview do contrato mostra dados corretos
  - [ ] PDF gerado tem todos os campos preenchidos
  - [ ] Download do contrato funciona
  - [ ] Integração com evento funciona (pré-preenche dados)
  - [ ] Histórico de contratos por evento aparece

Segurança:
  - [ ] RLS policies configuradas em todas as tabelas
  - [ ] Validação de tipo de arquivo no upload
  - [ ] Limite de tamanho de arquivo respeitado
  - [ ] Apenas PDFs aceitos para contratos
  - [ ] Sem exposição de dados sensíveis

Performance:
  - [ ] Upload de arquivo até 10MB é rápido (<5s)
  - [ ] Geração de PDF é rápida (<3s)
  - [ ] Lista de documentos carrega rápido
  - [ ] Sem re-renders desnecessários

UX:
  - [ ] Loading states em todas as operações async
  - [ ] Mensagens de erro são claras
  - [ ] Feedback visual de sucesso após ações
  - [ ] Interface responsiva (mobile + desktop)
  - [ ] Temas OLED/Dark/Light funcionam corretamente
  - [ ] Navegação intuitiva
  - [ ] Formulário salva draft automaticamente (opcional)

Code Quality:
  - [ ] Nenhum erro TypeScript
  - [ ] Nenhum warning de linting
  - [ ] Código segue padrões do projeto
  - [ ] Types bem definidos
  - [ ] Error handling robusto
  - [ ] Logs informativos (não verbosos)
```

## Anti-Patterns to Avoid

```typescript
// ❌ NÃO carregar PDF diretamente de URL
const pdfDoc = await PDFDocument.load(url) // ERRO!

// ✅ Carregar como ArrayBuffer primeiro
const bytes = await fetch(url).then(r => r.arrayBuffer())
const pdfDoc = await PDFDocument.load(bytes)

// ❌ NÃO usar form fields do PDF (complexo e limitado)
const form = pdfDoc.getForm()
form.getTextField('name').setText(value) // Evitar

// ✅ Desenhar texto diretamente nas posições
page.drawText(value, { x: 100, y: 500 })

// ❌ NÃO fazer upload sem validação
await supabase.storage.from('docs').upload(path, file) // Inseguro!

// ✅ Validar tipo e tamanho primeiro
if (file.type !== 'application/pdf') throw new Error('Invalid type')
if (file.size > 10 * 1024 * 1024) throw new Error('File too large')
await supabase.storage.from('docs').upload(path, file)

// ❌ NÃO misturar snake_case e camelCase no mesmo objeto
const data = { event_id: id, eventName: name } // Inconsistente

// ✅ Converter no service layer
const dbData = { event_id: id, event_name: name } // snake_case para DB
const jsData = { eventId: id, eventName: name } // camelCase para JS

// ❌ NÃO hardcoded posições sem comentários
page.drawText(text, { x: 234, y: 567 }) // Números mágicos

// ✅ Comentar ou usar constantes
const FIELD_POSITIONS = {
  CONTRATANTE_NOME: { x: 150, y: 680 },
  CONTRATANTE_CPF: { x: 200, y: 665 }
}
page.drawText(nome, FIELD_POSITIONS.CONTRATANTE_NOME)

// ❌ NÃO ignorar erros de upload
await uploadFile(file) // E se falhar?

// ✅ Tratar erros e dar feedback ao usuário
try {
  await uploadFile(file)
  toast.success('Documento enviado com sucesso!')
} catch (error) {
  console.error('Upload failed:', error)
  toast.error('Erro ao enviar documento. Tente novamente.')
}
```

## Additional Notes

### PDF Field Position Mapping

As posições dos campos no PDF devem ser determinadas **manualmente** através de tentativa e erro:

1. Abrir o PDF original em um editor
2. Medir as coordenadas dos campos (ou usar pdf-lib para explorar)
3. Testar com valores dummy
4. Ajustar até ficar correto

⚠️ **Importante**: O sistema de coordenadas do pdf-lib:
- Origem (0,0) é no **canto inferior esquerdo**
- X aumenta para direita
- Y aumenta para **cima** (inverso do HTML)

### Future Enhancements (Out of Scope)

Recursos que podem ser adicionados futuramente:
- [ ] Assinatura digital no PDF
- [ ] Envio automático por email/WhatsApp
- [ ] Múltiplos templates de contrato
- [ ] Editor visual de posicionamento de campos
- [ ] OCR para extrair dados de documentos escaneados
- [ ] Versionamento de contratos
- [ ] Workflows de aprovação

### Dependencies to Install

```bash
npm install pdf-lib
npm install react-pdf  # opcional, para visualizador
npm install react-dropzone
```

### Reference Files

Arquivos importantes para consultar durante implementação:
- `contrato.pdf` - Template original do contrato
- `components/menu-form.tsx` - Padrão de formulário complexo
- `lib/supabase/services.ts` - Padrão de services e error handling
- `types/menu.ts` - Padrão de definição de types
- `app/eventos/page.tsx` - Padrão de página de listagem

---

## Score: 8.5/10

**Confidence Level**: Alto para implementação em uma passada

**Razões**:
- ✅ Contexto completo do contrato e campos identificados
- ✅ Padrões claros do codebase para seguir
- ✅ Bibliotecas bem documentadas (pdf-lib, Supabase Storage)
- ✅ Schema de dados bem definido
- ✅ Validação em múltiplos níveis
- ⚠️ Posicionamento de campos no PDF requer ajustes manuais (não automatizável)
- ⚠️ pdf-lib não é atualizado desde 2021 (mas estável)

**Pontos de Atenção**:
1. O posicionamento dos campos no PDF vai requerer iteração manual
2. Testes visuais são essenciais - verificar PDF gerado manualmente
3. Performance de geração pode variar com PDFs grandes (monitorar)
