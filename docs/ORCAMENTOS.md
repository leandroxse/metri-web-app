# Sistema de Orçamentos

Sistema completo de geração de orçamentos em PDF para o Prime Buffet.

## 📋 Funcionalidades

- ✅ Criação de orçamentos com dados customizados
- ✅ Geração automática de PDF preenchido
- ✅ Cálculo automático do valor total (pessoas × preço)
- ✅ Formatação de data com dia da semana
- ✅ Vinculação opcional com eventos
- ✅ Múltiplos orçamentos por evento
- ✅ Armazenamento seguro no Supabase

## 🗂️ Campos do Orçamento

| Campo | Descrição | Tipo | Obrigatório |
|-------|-----------|------|-------------|
| `evento` | Nome do evento | Texto | ✅ |
| `data` | Data formatada com dia da semana | Texto | ✅ |
| `cerimonialista` | Nome do cerimonialista | Texto | ✅ |
| `pessoas1` | Quantidade de pessoas (topo) | Número | ✅ |
| `preço2` | Preço por pessoa (R$) | Número | ✅ |
| `pessoas2` | Quantidade de pessoas (cálculo) | Número | ✅ |
| `preçotexto` | Valor total (calculado) | Número | ✅ |

**Nota:** `pessoas1` e `pessoas2` sempre têm o mesmo valor (aparecem em lugares diferentes no PDF).

## 🚀 Configuração Inicial

### 1. Criar Tabelas no Supabase

Execute o script SQL no Supabase SQL Editor:

```bash
# Copie o conteúdo de scripts/create-budget-tables.sql
# Cole no SQL Editor do Supabase e execute
```

Ou via linha de comando:

```bash
psql -h [SUPABASE_DB_HOST] -U postgres -d postgres -f scripts/create-budget-tables.sql
```

### 2. Criar Storage Bucket

No painel do Supabase:
1. Vá em **Storage**
2. Crie um bucket público chamado `budget-templates`
3. Crie um bucket público chamado `filled-budgets`

### 3. Fazer Seed do Template

```bash
npx tsx scripts/seed-budget-template.ts
```

Este script:
- Faz upload do `orçamento1.pdf` para o storage
- Cria o registro do template no banco de dados
- Configura o template como ativo

## 📝 Como Usar

### Criar Novo Orçamento

1. Acesse `/central/docs/orcamentos/novo`
2. Preencha os campos:
   - Nome do evento
   - Data do evento
   - Nome do cerimonialista
   - Quantidade de pessoas
   - Preço por pessoa
3. (Opcional) Vincule a um evento existente
4. Clique em **Criar Orçamento**
5. O PDF será gerado automaticamente

### Formatação de Data

A data é formatada automaticamente no padrão:
```
DD de MMMM de YYYY - dia_da_semana

Exemplo: 01 de outubro de 2025 - quinta-feira
```

### Cálculo Automático

O sistema calcula automaticamente:
```
Valor Total = Quantidade de Pessoas × Preço por Pessoa

Exemplo: 100 pessoas × R$ 18,50 = R$ 1.850,00
```

## 🏗️ Estrutura de Arquivos

```
types/
├── budget.ts                    # Tipos TypeScript

lib/
├── supabase/
│   └── budget-services.ts       # CRUD de orçamentos
├── utils/
│   ├── pdf-utils.ts             # Preenchimento de PDF (fillBudgetPDF)
│   └── date-utils.ts            # Formatação de data (formatDateWithWeekday)

hooks/
└── use-budgets.ts               # Hook React para orçamentos

app/
└── central/
    └── docs/
        └── orcamentos/
            └── novo/
                └── page.tsx     # Página de criação

scripts/
├── create-budget-tables.sql     # Migração do banco
├── seed-budget-template.ts      # Seed do template
└── debug-budget-fields.ts       # Debug de campos do PDF
```

## 🔧 Desenvolvimento

### Adicionar Novo Campo ao PDF

1. Edite o PDF template (`orçamento1.pdf`) no Adobe Acrobat
2. Adicione o form field com o nome desejado
3. Atualize o tipo `BudgetFields` em `types/budget.ts`
4. Atualize a função `fillBudgetPDF` em `lib/utils/pdf-utils.ts`
5. Atualize a página de criação em `app/central/docs/orcamentos/novo/page.tsx`

### Debugar Campos do PDF

```bash
npx tsx scripts/debug-budget-fields.ts
```

Este script lista todos os campos disponíveis no PDF.

## 📊 Banco de Dados

### Tabela: `budget_templates`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único |
| `name` | TEXT | Nome do template |
| `description` | TEXT | Descrição opcional |
| `template_url` | TEXT | URL do PDF no storage |
| `fields_schema` | JSONB | Schema dos campos |
| `is_active` | BOOLEAN | Template ativo? |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

### Tabela: `filled_budgets`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único |
| `template_id` | UUID | Referência ao template |
| `event_id` | UUID | Referência ao evento (opcional) |
| `filled_data` | JSONB | Dados do orçamento |
| `generated_pdf_url` | TEXT | URL do PDF gerado |
| `status` | TEXT | draft/completed/sent/approved/rejected |
| `notes` | TEXT | Notas opcionais |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

## 🔐 Segurança

- ✅ RLS (Row Level Security) habilitado
- ✅ Apenas usuários autenticados podem criar/editar
- ✅ PDFs armazenados em bucket público (read-only)
- ✅ Validação de UUID em todas as operações
- ✅ Logs de erro padronizados

## 🐛 Troubleshooting

### Erro: "Template não encontrado"

1. Verifique se o seed foi executado:
   ```bash
   npx tsx scripts/seed-budget-template.ts
   ```

2. Verifique no Supabase se o template existe:
   ```sql
   SELECT * FROM budget_templates WHERE is_active = true;
   ```

### Erro: "Bucket não encontrado"

Crie os buckets manualmente no painel do Supabase:
- `budget-templates` (público)
- `filled-budgets` (público)

### PDF não é gerado

1. Verifique os logs do navegador (F12)
2. Verifique se o template_url está acessível
3. Execute o debug:
   ```bash
   npx tsx scripts/debug-budget-fields.ts
   ```

## 📚 Referências

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Última atualização:** Janeiro 2025
