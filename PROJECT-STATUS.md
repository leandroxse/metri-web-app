# 🚀 METRI - Status do Projeto

**Última atualização:** 01/10/2025
ao ler isso confirme que o mcp do suapabse esta funcionando 
## 📌 Informação Rápida

- **Projeto:** METRI - Sistema de Gestão de Eventos e Equipes
- **Tech Stack:** Next.js 15 + React 18 + TypeScript + Supabase + Tailwind v4
- **Porta Local:** 3000 (já rodando - NÃO REINICIAR)
- **Repositório:** https://github.com/leandroxse/metri-web-app.git
- **Branch:** main

## 🗄️ Supabase (Database)

**Status:** ✅ ATIVO E SAUDÁVEL

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

**Todas as tabelas têm RLS habilitado**

## 🌐 Deploy Netlify

**URL:** https://metriapp.netlify.app

**Configuração de Deploy:**
```
Team: leandroxse's team
Branch: main
Build command: npm run build
Publish directory: .next (ou vazio)
Base directory: (vazio)
```

**Variáveis de Ambiente (OBRIGATÓRIAS):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://lrgaiiuoljgjasyrqjzk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTg2NzksImV4cCI6MjA3MTIzNDY3OX0.VN-bevJCeMC3TgzWRThoC1uyFdJXnkR0m-0vaCRin4c
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODY3OSwiZXhwIjoyMDcxMjM0Njc5fQ.mf5tJtki9Hrn_GdjyB_XC0SVv7Pzr9i2UAOK5R8v95s
```

## 📁 Estrutura Simplificada

```
app/
  ├── page.tsx              # Dashboard principal
  ├── layout.tsx            # Layout root + PWA
  ├── eventos/              # Gestão de eventos
  ├── categorias/           # Categorias profissionais
  ├── pagamentos/           # Controle de pagamentos
  └── configuracoes/        # Configurações

components/
  ├── ui/                   # shadcn/ui components
  ├── event-form.tsx
  ├── category-form.tsx
  └── bottom-navigation.tsx

lib/
  ├── supabase/
  │   ├── client.ts         # Cliente Supabase
  │   └── client-services.ts
  └── config/supabase.ts    # Configuração

hooks/
  ├── use-events.ts
  ├── use-categories.ts
  └── use-people.ts
```

## 🎯 Funcionalidades

- ✅ Dashboard interativo com métricas
- ✅ Visão semanal de eventos + gráficos
- ✅ CRUD completo de eventos/categorias/pessoas
- ✅ Alocação de equipes por evento
- ✅ Controle de pagamentos
- ✅ PWA (instalável iOS/Android)
- ✅ Tema OLED + Dark/Light mode
- ✅ Offline support

## 🔧 Comandos

```bash
npm run dev      # Desenvolvimento (porta 3000)
npm run build    # Build production
npm run start    # Start production
npm run lint     # ESLint
```

## 🔑 GitHub Credentials

**Configurado:** ✅ Personal Access Token
**User:** leandroxse
**Email:** leandroxsmorais@gmail.com
**Token:** Configurado via git credential helper (não versionado por segurança)

**Nota:** Token armazenado localmente em `~/.git-credentials` (não commitado)

## 📦 Principais Dependências

- next: ^15.4.6
- react: ^18.3.1
- @supabase/supabase-js: latest
- framer-motion: ^12.23.12
- tailwindcss: ^4.1.9
- date-fns: latest
- shadcn/ui + Radix UI

## ⚠️ Regras Importantes

1. **NUNCA reiniciar o servidor** - já está rodando na porta 3000
2. **Falar sempre em PT-BR** com o usuário
3. **MCP Supabase disponível** - usar para queries quando necessário
4. **Seguir princípios:** KISS, YAGNI, Dependency Inversion
5. **Arquivos < 500 linhas** - refatorar se necessário

## 🔗 Links Úteis

- GitHub: https://github.com/leandroxse/metri-web-app
- Netlify: https://metriapp.netlify.app
- Supabase Dashboard: https://supabase.com/dashboard/project/lrgaiiuoljgjasyrqjzk

## 📋 Status Atual

- ✅ Desenvolvimento local funcionando
- ✅ Supabase conectado e ativo
- ✅ GitHub conectado
- 🔄 Deploy Netlify em configuração
- ✅ PWA configurado
- ✅ Database schema criado (0 rows)

---

**MCP Supabase:** ✅ Testado e funcional
**Build Status:** ✅ OK
**Último Commit:** "🚀 Correções de timezone e melhorias visuais"
