# 🚀 METRI - Status do Projeto

**Última atualização:** 02/01/2025

## 📌 Informação Rápida

- **Projeto:** METRI - Sistema de Gestão de Eventos e Equipes
- **Tech Stack:** Next.js 15 + React 18 + TypeScript + Supabase + Tailwind v4
- **Porta Local:** 3000 (já rodando - NÃO REINICIAR)
- **Repositório:** https://github.com/leandroxse/metri-web-app.git
- **Branch:** main
- **Caminho Local:** `D:\Users\Leandro\Desktop\metri-web-app`

## 🗄️ Supabase (Database)

**Status:** ✅ ATIVO E SAUDÁVEL
**MCP Supabase:** ✅ FUNCIONANDO

- **Project ID:** `lrgaiiuoljgjasyrqjzk`
- **Project Name:** metri-app
- **Região:** us-east-2
- **URL:** https://lrgaiiuoljgjasyrqjzk.supabase.co
- **PostgreSQL:** v17.4.1

**Tabelas principais:**
- `categories` - Categorias profissionais
- `people` - Pessoas/profissionais
- `events` - Eventos planejados
- `event_staff` - Alocação N:N eventos/categorias
- `payments` - Controle de pagamentos
- `event_teams` - Times selecionados
- `menus` - Cardápios
- `menu_categories` - Categorias de cardápio
- `menu_items` - Itens de cardápio
- `event_menus` - Cardápios vinculados a eventos
- `menu_selections` - Seleções de pratos pelos convidados
- `documents` - Documentos e PDFs (NOVO)
- `contract_templates` - Templates de contratos (NOVO)
- `filled_contracts` - Contratos preenchidos (NOVO)

**Todas as tabelas têm RLS habilitado**

## 🌐 Deploy Netlify

**URL:** https://metriapp.netlify.app
**Status:** ✅ CONECTADO AO GITHUB (auto-deploy)

**Configuração de Deploy:**
```
Team: leandroxse's team
Branch: main (auto-deploy habilitado)
Build command: npm run build
Publish directory: .next
```

**Variáveis de Ambiente (CONFIGURADAS):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://lrgaiiuoljgjasyrqjzk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTg2NzksImV4cCI6MjA3MTIzNDY3OX0.VN-bevJCeMC3TgzWRThoC1uyFdJXnkR0m-0vaCRin4c
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODY3OSwiZXhwIjoyMDcxMjM0Njc5fQ.mf5tJtki9Hrn_GdjyB_XC0SVv7Pzr9i2UAOK5R8v95s
```

## 🔑 GitHub Credentials

**Status:** ✅ CONFIGURADO E FUNCIONAL

- **User:** leandroxse
- **Email:** leandroxsmorais@gmail.com
- **Token:** [CONFIGURADO LOCALMENTE]
- **Remote:** GitHub Auto-Deploy habilitado

**⚠️ REGRA:** SÓ FAZER COMMIT QUANDO O USUÁRIO PEDIR!

## 🎯 Funcionalidades Implementadas

### Core Features
- ✅ Dashboard interativo com métricas
- ✅ Visão semanal de eventos + gráficos
- ✅ CRUD completo de eventos/categorias/pessoas
- ✅ Alocação de equipes por evento
- ✅ Controle de pagamentos
- ✅ PWA (instalável iOS/Android)
- ✅ Tema OLED + Dark/Light mode
- ✅ Offline support

### Sistema de Cardápios (NOVO)
- ✅ CRUD completo de cardápios
- ✅ Editor interativo de cardápios (categorias, itens, imagens)
- ✅ Wizard de seleção interativa para convidados
- ✅ **Navegação com setas na barra inferior (minimalista)**
- ✅ Compartilhamento via WhatsApp com link único e token
- ✅ Sistema de arquivamento de cardápios
- ✅ Visualização de seleções por evento
- ✅ **Exportar seleções em PDF (modal de visualização + wizard)**
- ✅ Integração com sistema de pagamentos
- ✅ Cardápios Prime 001 e 002 pré-cadastrados
- ✅ Logo Prime Buffet como marca d'água

### Sistema de Documentos e Contratos (NOVO)
- ✅ Upload de documentos (PDFs, imagens) com drag-and-drop
- ✅ Categorização de documentos (Contrato, NF, Recibo, Foto, Outro)
- ✅ Hub DOCS centralizado (/docs) - **Contratos como aba padrão**
- ✅ **Sistema de vinculação de contratos a eventos:**
  - Seletor de eventos ao criar contrato (apenas eventos ativos sem contrato)
  - Seletor de contratos no formulário de eventos (apenas contratos disponíveis)
  - Exibição de contrato vinculado no TeamManager
  - Lógica que impede vincular múltiplos contratos ao mesmo evento
- ✅ Geração automática de contratos preenchidos
- ✅ Template Prime Buffet com 19 campos
- ✅ Auto-formatação (CPF, valores, extenso)
- ✅ Storage no Supabase (3 buckets)
- ⏳ Sistema de form fields PDF (aguardando criação de campos no template)

### Melhorias UX Recentes
- ✅ Métricas de pagamento mostram apenas evento selecionado
- ✅ Valores sem animações (interface objetiva)
- ✅ Editor de cardápio com layout compacto
- ✅ Suspense boundary para Next.js 15
- ✅ Sidebar moderna para Tablet/Desktop
- ✅ Bottom navigation apenas para Mobile/PWA
- ✅ Optimistic UI em pagamentos (sem glitches visuais)
- ✅ Valores editados mantidos ao marcar como pago
- ✅ Card inteiro clicável para marcar/desmarcar pagamento
- ✅ Sistema de vinculação contrato-evento (contratos ao invés de documentos gerais)

## 📁 Estrutura Atualizada

```
app/
  ├── page.tsx                    # Dashboard principal
  ├── layout.tsx                  # Layout root + PWA
  ├── eventos/
  │   ├── page.tsx               # Lista de eventos
  │   └── [id]/cardapio/[token]/ # Wizard de seleção de cardápio
  ├── cardapios/                 # CRUD de cardápios
  ├── categorias/                # Categorias profissionais
  ├── pagamentos/                # Controle de pagamentos
  ├── docs/                      # Sistema DOCS (NOVO)
  │   ├── page.tsx              # Hub DOCS (tabs: Documentos, Contratos)
  │   └── contratos/novo/       # Formulário novo contrato
  ├── configuracoes/             # Configurações
  └── admin/
      └── edit-menu-images/      # Editor de cardápio

components/
  ├── ui/                        # shadcn/ui components
  ├── wizard/                    # Componentes do wizard de cardápio
  ├── menu-editor.tsx            # Editor completo de cardápios
  ├── menu-form.tsx              # Formulário de cardápio
  ├── menu-viewer.tsx            # Visualizador de cardápio
  ├── event-menu-link.tsx        # Compartilhamento WhatsApp
  ├── payment-*.tsx              # Componentes de pagamento
  ├── document-upload.tsx        # Upload de documentos (NOVO)
  ├── team-manager.tsx           # Gerenciador equipe + docs (ATUALIZADO)
  └── bottom-navigation.tsx      # Navegação com DOCS (ATUALIZADO)

hooks/
  ├── use-documents.ts           # Hook para documentos (NOVO)
  └── use-contracts.ts           # Hook para contratos (NOVO)

lib/
  ├── supabase/
  │   ├── client.ts              # Cliente Supabase
  │   ├── client-services.ts
  │   ├── document-services.ts   # CRUD documentos (NOVO)
  │   └── contract-services.ts   # CRUD + geração PDF (NOVO)
  └── utils/
      ├── event-status.ts        # Lógica de status de eventos
      ├── pdf-utils.ts           # Funções pdf-lib (NOVO)
      └── contract-fields.ts     # Helpers formatação (NOVO)

types/
  ├── document.ts                # Interface Document (NOVO)
  └── contract.ts                # Interfaces + FIELD_POSITIONS (NOVO)

scripts/
  ├── seed-cardapio-prime.ts          # Seed do Cardápio Prime 001
  ├── seed-cardapio-prime-002.ts      # Seed do Cardápio Prime 002
  ├── create-storage-buckets.ts       # Criar buckets Supabase (NOVO)
  └── seed-contract-template.ts       # Upload template contrato (NOVO)

docs/
  └── DOCS-SETUP.md              # Guia de configuração DOCS (NOVO)
```

## 🔧 Comandos

```bash
npm run dev      # Desenvolvimento (porta 3000)
npm run build    # Build production
npm run start    # Start production
npm run lint     # ESLint

# Seeds - Cardápios
npx tsx scripts/seed-cardapio-prime.ts      # Inserir Cardápio Prime 001
npx tsx scripts/seed-cardapio-prime-002.ts  # Inserir Cardápio Prime 002

# Setup - Sistema DOCS
npx tsx scripts/create-storage-buckets.ts   # Criar buckets no Supabase
npx tsx scripts/seed-contract-template.ts   # Upload template de contrato
```

## 📦 Principais Dependências

- next: ^15.4.6
- react: ^18.3.1
- @supabase/supabase-js: latest
- framer-motion: ^12.23.12
- tailwindcss: ^4.1.9
- date-fns: latest
- shadcn/ui + Radix UI
- pdf-lib: latest (manipulação de PDFs)
- react-dropzone: latest (upload drag-and-drop)

## ⚠️ Regras Importantes

1. **NUNCA reiniciar o servidor** - já está rodando na porta 3000
2. **Falar sempre em PT-BR** com o usuário
3. **MCP Supabase disponível** - usar para queries quando necessário
4. **Seguir princípios:** KISS, YAGNI, Dependency Inversion
5. **Arquivos < 500 linhas** - refatorar se necessário
6. **SÓ FAZER COMMIT QUANDO USUÁRIO PEDIR** - não commitar automaticamente

## 🔗 Links Úteis

- GitHub: https://github.com/leandroxse/metri-web-app
- Netlify: https://metriapp.netlify.app
- Supabase Dashboard: https://supabase.com/dashboard/project/lrgaiiuoljgjasyrqjzk

## 📋 Status Atual

- ✅ Desenvolvimento local funcionando
- ✅ Supabase conectado e ativo
- ✅ GitHub conectado (auto-push habilitado)
- ✅ Netlify com auto-deploy do GitHub
- ✅ PWA configurado
- ✅ Sistema de cardápios completo
- ✅ Database schema completo

---

**MCP Supabase:** ✅ Testado e funcional
**Build Status:** ✅ OK
**Último Commit:** 442a0e7 - "🐛 Fix: Métricas de pagamento agora mostram apenas evento selecionado"
**Último Deploy:** Auto-deploy ativo via Netlify
