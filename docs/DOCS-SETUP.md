# 📄 Guia de Configuração do Sistema DOCS

Este guia explica como configurar o sistema de documentos e contratos do Metri (Prime Buffet).

## 🎯 Visão Geral

O sistema DOCS permite:
- Upload e gerenciamento de PDFs e documentos
- Geração automática de contratos preenchidos a partir de templates
- Vínculo de documentos a eventos específicos
- Armazenamento seguro no Supabase Storage

## 📋 Pré-requisitos

1. **Banco de Dados**: As tabelas já foram criadas via migration:
   - `documents`
   - `contract_templates`
   - `filled_contracts`

2. **Dependências**: Já instaladas via `npm install`:
   - `pdf-lib` - Manipulação de PDFs
   - `react-dropzone` - Upload drag-and-drop

## 🚀 Instalação (Passo a Passo)

### Passo 1: Criar Storage Buckets

Execute o script para criar os buckets de armazenamento:

```bash
npx tsx scripts/create-storage-buckets.ts
```

Este script cria 3 buckets públicos:
- **documents**: Para documentos gerais (PDFs, fotos)
- **contract-templates**: Para templates de contratos
- **filled-contracts**: Para contratos gerados

### Passo 2: Upload do Template de Contrato

Execute o script para fazer upload do template Prime Buffet:

```bash
npx tsx scripts/seed-contract-template.ts
```

Este script:
1. Faz upload do arquivo `contrato.pdf` para o bucket `contract-templates`
2. Cria registro na tabela `contract_templates` com schema de 25 campos
3. Retorna a URL pública do template

## ✅ Verificação

Após executar os scripts, verifique:

1. **Supabase Dashboard > Storage**:
   - 3 buckets criados: documents, contract-templates, filled-contracts
   - Arquivo `prime-buffet-template.pdf` no bucket contract-templates

2. **Supabase Dashboard > Table Editor > contract_templates**:
   - 1 registro: "Contrato Prime Buffet"
   - Campo `fields_schema` com 25 campos mapeados

## 🎨 Ajuste de Posições dos Campos no PDF

O template PDF não possui campos interativos. Os campos são posicionados usando coordenadas X,Y absolutas.

### Como ajustar:

1. Acesse `/docs/contratos/novo`
2. Preencha o formulário e gere um PDF
3. Abra o PDF gerado e verifique alinhamento
4. Edite o arquivo `types/contract.ts`, constante `FIELD_POSITIONS`
5. Ajuste as coordenadas `x`, `y` e `size` de cada campo
6. Gere novo PDF e repita até ficar alinhado

### Exemplo de ajuste:

```typescript
// types/contract.ts
export const FIELD_POSITIONS: Record<keyof ContractFields, FieldPosition> = {
  contratante_nome: {
    x: 150,  // ← Aumentar move para DIREITA
    y: 680,  // ← Aumentar move para CIMA
    size: 11 // ← Tamanho da fonte
  },
  // ... outros campos
}
```

### Dicas:
- **Eixo X**: Valores maiores = mais à direita (0 = esquerda)
- **Eixo Y**: Valores maiores = mais acima (0 = baixo)
- **Size**: Tamanho da fonte (8-14 recomendado)
- **Páginas**: Campos em páginas diferentes têm coordenadas independentes

## 📁 Estrutura de Arquivos

```
metri-web-app/
├── app/
│   └── docs/
│       ├── page.tsx                    # Hub principal (tabs: Documentos, Contratos)
│       └── contratos/
│           └── novo/
│               └── page.tsx            # Formulário de novo contrato
├── components/
│   ├── document-upload.tsx             # Upload drag-and-drop
│   └── team-manager.tsx                # Gerenciador de equipe + documentos do evento
├── hooks/
│   ├── use-documents.ts                # Hook para documentos
│   └── use-contracts.ts                # Hook para contratos
├── lib/
│   ├── supabase/
│   │   ├── document-services.ts        # CRUD + upload de documentos
│   │   └── contract-services.ts        # CRUD + geração PDF de contratos
│   └── utils/
│       ├── pdf-utils.ts                # Funções pdf-lib para preencher PDFs
│       └── contract-fields.ts          # Helpers (formatCPF, numberToWords, etc)
├── types/
│   ├── document.ts                     # Interface Document
│   └── contract.ts                     # Interfaces + FIELD_POSITIONS
└── scripts/
    ├── create-storage-buckets.ts       # Cria buckets
    └── seed-contract-template.ts       # Upload template + seed
```

## 🔧 Funcionalidades

### 1. Gerenciamento de Documentos

- **Upload**: Arraste ou selecione PDF/imagens (máx 10MB)
- **Categorias**: Contrato, Nota Fiscal, Recibo, Foto, Outro
- **Vínculo**: Associar documento a um evento específico
- **Download**: Abrir documentos em nova aba
- **Exclusão**: Deletar documento (remove do storage também)

### 2. Geração de Contratos

- **Formulário Inteligente**:
  - Auto-formatação de CPF (000.000.000-00)
  - Auto-cálculo de saldo (total - sinal)
  - Auto-conversão de valor para extenso
  - Data de assinatura preenchida automaticamente

- **Campos do Contrato Prime Buffet** (25 campos):
  - Dados do Contratante (nome, CPF, endereço)
  - Dados do Evento (data, horários, local)
  - Equipe (garçons, copeiras, maître)
  - Valores (total, sinal, saldo, extenso)
  - Dados da Empresa (nome, CNPJ, PIX)
  - Testemunhas (2 com nome e CPF)

- **Status de Contratos**:
  - `draft`: Rascunho (criado mas sem PDF)
  - `completed`: Concluído (PDF gerado)
  - `sent`: Enviado ao cliente
  - `signed`: Assinado

### 3. Integração com Eventos

- **TeamManager**: Ao clicar em um evento na página `/eventos`, abre dialog com:
  - Gerenciamento de status do evento
  - Seção de documentos vinculados ao evento
  - Upload de novos documentos para o evento
  - Gerenciamento de equipe

## 🐛 Troubleshooting

### Erro: "Bucket not found"

**Solução**: Execute `npx tsx scripts/create-storage-buckets.ts`

### PDF gerado com campos desalinhados

**Solução**: Ajuste `FIELD_POSITIONS` em `types/contract.ts` (veja seção "Ajuste de Posições")

### Erro: "File too large"

**Solução**: Limite é 10MB. Comprima o arquivo ou ajuste `fileSizeLimit` no script de buckets.

### Documentos não aparecem

**Solução**: Verifique RLS policies no Supabase. As policies devem estar permissivas para authenticated users.

## 📚 Referências

- **pdf-lib**: https://pdf-lib.js.org/
- **react-dropzone**: https://react-dropzone.js.org/
- **Supabase Storage**: https://supabase.com/docs/guides/storage

## 🎉 Pronto!

O sistema DOCS está configurado. Acesse `/docs` para começar a usar!
