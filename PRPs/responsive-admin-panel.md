# 📱💻 PRP: Otimização Responsiva do Painel Admin

**Status:** Planning
**Prioridade:** Média
**Estimativa:** 3-4 dias
**Versão:** 1.0
**Data:** 02/10/2025

---

## Goal

Otimizar o layout de todas as páginas do painel administrativo do METRI para tablet (768px+) e desktop (1024px+), aproveitando melhor o espaço horizontal e vertical disponível, mantendo 100% da funcionalidade mobile-first existente.

**Resumo:** Ajustes de UI/UX responsivos sem alteração de lógica ou funcionalidades.

---

## Why

### Problema Atual
- Páginas desenvolvidas com abordagem mobile-first funcionam perfeitamente em celular
- Em tablet/desktop, muito espaço horizontal desperdiçado com layouts em coluna única
- Cards e elementos mantêm proporções mobile mesmo em telas grandes
- Modais/dialogs ficam pequenos em monitores widescreen
- Experiência de uso desktop está aquém do potencial

### Impacto Esperado
- ✅ Melhor aproveitamento visual em tablets e desktops
- ✅ Redução de scroll vertical desnecessário
- ✅ Workflows mais eficientes (menos cliques para ver informações)
- ✅ Profissionalismo visual aumentado
- ✅ Mantém perfeita experiência mobile

### Valor de Negócio
- Usuários que acessam via desktop terão experiência superior
- Redução de tempo para completar tarefas administrativas
- Melhor apresentação do sistema para novos usuários

---

## What

### Escopo de Páginas
1. **Dashboard** (`app/page.tsx`)
2. **Eventos** (`app/eventos/page.tsx`)
3. **Categorias** (`app/categorias/page.tsx`)
4. **Pagamentos** (`app/pagamentos/page.tsx`)
5. **Todos os Modais/Dialogs** (event-form, team-manager, category-form, people-manager, etc.)

### Mudanças Específicas por Página

#### 1. Dashboard (app/page.tsx)
**Mobile (atual):** Mantém como está
**Tablet (768px+):**
- Métricas em 2 colunas (era 1)
- Week cards sempre visíveis (não scroll)
- Event cards em 2 colunas

**Desktop (1024px+):**
- Métricas em 4 colunas
- Week view horizontal completo
- Event cards em 3 colunas

#### 2. Eventos (app/eventos/page.tsx)
**Mobile:** Mantém
**Tablet:**
- Grid 2 colunas para eventos
- Filtros em linha horizontal
- Botões de ação sempre visíveis (remover `md:opacity-0`)

**Desktop:**
- Grid 3 colunas
- Header com filtros e ações em mesma linha
- Hover effects sutis (não esconder elementos)

#### 3. Categorias (app/categorias/page.tsx)
**Mobile:** Mantém
**Tablet:**
- Grid 2 colunas já existe, ajustar spacing
- Modal people-manager com max-w-5xl

**Desktop:**
- Grid 3 colunas já existe
- Aumentar padding interno dos cards

#### 4. Pagamentos (app/pagamentos/page.tsx)
**CRÍTICO:** Arquivo com 888 linhas - REFATORAR primeiro!

**Mobile:** Mantém após refatoração
**Tablet:**
- Layout side-by-side: eventos (esquerda) + pagamentos (direita)
- Cards de pagamento em 2 colunas

**Desktop:**
- Side-by-side otimizado (30% eventos, 70% pagamentos)
- Pagamentos em 2-3 colunas

#### 5. Modais/Dialogs Globais
**Ajustes:**
- Mobile: max-w-full ou max-w-lg (mantém)
- Tablet: max-w-3xl ou max-w-4xl
- Desktop: max-w-5xl ou max-w-6xl conforme conteúdo

**Forms:**
- Inputs em 2 colunas quando apropriado (em md:)
- Manter campos críticos em coluna única (título, descrição)

---

## All Needed Context

### Documentation & References
```yaml
- file: app/page.tsx
  why: Dashboard principal com métricas, week view e eventos - referência de padrões mobile-first

- file: app/eventos/page.tsx
  why: Exemplo de grid responsivo e botões com hover opacity - padrão a ajustar

- file: app/categorias/page.tsx
  why: Menor arquivo (474 linhas), melhor exemplo de componentização

- file: app/pagamentos/page.tsx
  why: Maior arquivo (888 linhas) - necessita refatoração antes de responsividade

- file: components/event-form.tsx
  why: Padrão de form com grid-cols-1 md:grid-cols-2 para inputs

- file: components/team-manager.tsx
  why: Modal complexo com tabela - referência de max-width

- file: CLAUDE.md
  why: Regras de arquitetura - arquivos < 500 linhas, funções < 50 linhas

- doc: https://tailwindcss.com/docs/responsive-design
  section: Mobile First approach
  critical: Usar breakpoints progressivos (sm:, md:, lg:, xl:)

- doc: https://tailwindcss.com/docs/breakpoints
  critical: sm=640px, md=768px, lg=1024px, xl=1280px, 2xl=1536px
```

### Current Codebase Tree (Simplificado)
```
app/
├── page.tsx                    # Dashboard (673 linhas)
├── eventos/
│   └── page.tsx               # Eventos (613 linhas)
├── categorias/
│   └── page.tsx               # Categorias (474 linhas) ✅
├── pagamentos/
│   └── page.tsx               # Pagamentos (888 linhas) ⚠️ EXCEDE LIMITE
└── layout.tsx

components/
├── ui/                        # shadcn/ui components
├── event-form.tsx             # Modal form eventos
├── team-manager.tsx           # Modal seleção de time
├── category-form.tsx          # Modal form categorias
├── person-form.tsx            # Form adicionar pessoa
├── people-manager.tsx         # Modal gerenciar pessoas
└── bottom-navigation.tsx      # Nav mobile
```

### Desired Changes (Não adiciona arquivos, só modifica)
```
✅ Todos os arquivos mantidos
✅ app/pagamentos/page.tsx será refatorado em componentes:
   - components/payment-event-selector.tsx (novo)
   - components/payment-list.tsx (novo)
   - components/payment-card.tsx (novo)

✅ Todos recebem ajustes de classes Tailwind para responsividade
```

### Known Gotchas & Constraints

```typescript
// CRÍTICO: Arquivos devem ter < 500 linhas (CLAUDE.md)
// app/pagamentos/page.tsx tem 888 linhas - REFATORAR PRIMEIRO

// CRÍTICO: Funções devem ter < 50 linhas
// Verificar todas as funções ao refatorar

// PATTERN: Mobile-first sempre
// Classes base são mobile, depois md:, lg:, xl:

// GOTCHA: Não usar opacity-0 para esconder botões essenciais em desktop
// Trocar por hover:shadow-lg ou hover:scale-105

// PATTERN: Grid responsivo padrão do projeto
// grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

// PATTERN: Modal sizes padrão
// Mobile: max-w-lg, Tablet: max-w-3xl, Desktop: max-w-5xl

// GOTCHA: Container responsive já existe
// .container-responsive no globals.css - usar quando apropriado

// CRITICAL: Manter todas as animações Framer Motion
// Não remover motion.div, AnimatedCard, etc

// CRITICAL: Preservar toda lógica de negócio
// Mudanças são APENAS classes CSS/Tailwind
```

---

## Implementation Blueprint

### Fase 1: Refatoração Pagamentos (OBRIGATÓRIA)
**Arquivo:** `app/pagamentos/page.tsx` (888 → ~300 linhas)

#### Componentes a Extrair:
1. **components/payment-event-selector.tsx**
   - Seletor de eventos (ativo/histórico)
   - Lista de eventos para escolha
   - ~120 linhas

2. **components/payment-list.tsx**
   - Grid de payments cards
   - Lógica de filtro e ordenação
   - ~150 linhas

3. **components/payment-card.tsx**
   - Card individual de pagamento
   - Ações (editar, deletar)
   - ~80 linhas

4. **app/pagamentos/page.tsx** (refatorado)
   - Orquestração dos 3 componentes
   - Estado global da página
   - ~250 linhas ✅

### Fase 2: Ajustes Responsivos Dashboard

**Arquivo:** `app/page.tsx`

**Mudanças de Classes:**

```typescript
// ANTES (Métricas):
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// DEPOIS (Métricas):
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">

// ANTES (Week View):
<div className="grid grid-cols-7 gap-2 mb-6">

// DEPOIS (Week View):
<div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3 mb-4 md:mb-6">

// ANTES (Event Cards):
<div className="space-y-3">

// DEPOIS (Event Cards):
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
```

### Fase 3: Ajustes Eventos

**Arquivo:** `app/eventos/page.tsx`

```typescript
// ANTES (Grid eventos):
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// DEPOIS (Grid eventos - melhor spacing):
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">

// ANTES (Botões de ação):
<div className="absolute top-4 right-4 md:opacity-0 md:group-hover:opacity-100">

// DEPOIS (Botões sempre visíveis com hover sutil):
<div className="absolute top-4 right-4 flex gap-2 transition-all md:hover:scale-105">

// ANTES (Filtros):
<div className="flex flex-col gap-2">

// DEPOIS (Filtros horizontais em tablet):
<div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
```

### Fase 4: Ajustes Categorias

**Arquivo:** `app/categorias/page.tsx`

```typescript
// Já está bom, apenas ajustar spacing:

// ANTES:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// DEPOIS:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">

// Cards internos - aumentar padding em desktop:
<CardContent className="p-4 md:p-5 lg:p-6">
```

**Arquivo:** `components/people-manager.tsx`

```typescript
// ANTES (Dialog):
<DialogContent className="bg-background border-border">

// DEPOIS (Dialog maior em desktop):
<DialogContent className="bg-background border-border max-w-lg md:max-w-3xl lg:max-w-5xl">
```

### Fase 5: Ajustes Pagamentos (Pós-Refatoração)

**Arquivo:** `app/pagamentos/page.tsx` (refatorado)

```typescript
// Layout geral - side by side em desktop:

// ANTES (implícito - coluna única):
<div className="space-y-4">
  <PaymentEventSelector />
  <PaymentList />
</div>

// DEPOIS (side by side em desktop):
<div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
  <div className="lg:w-1/3">
    <PaymentEventSelector />
  </div>
  <div className="lg:w-2/3">
    <PaymentList />
  </div>
</div>
```

**Arquivo:** `components/payment-list.tsx`

```typescript
// Grid de pagamentos:
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
  {payments.map(payment => (
    <PaymentCard key={payment.id} payment={payment} />
  ))}
</div>
```

### Fase 6: Ajustes Globais de Modais

**Arquivos:** `components/*-form.tsx`, `components/*-manager.tsx`

```typescript
// PADRÃO PARA TODOS OS DIALOGS:

// Dialogs simples (forms básicos):
<DialogContent className="max-w-lg md:max-w-2xl lg:max-w-3xl">

// Dialogs complexos (tabelas, múltiplos elementos):
<DialogContent className="max-w-lg md:max-w-4xl lg:max-w-5xl">

// Forms com múltiplos inputs - 2 colunas em desktop:

// ANTES:
<div className="space-y-4">
  <div className="space-y-2">
    <Label>Campo 1</Label>
    <Input />
  </div>
  <div className="space-y-2">
    <Label>Campo 2</Label>
    <Input />
  </div>
</div>

// DEPOIS (quando apropriado):
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>Campo 1</Label>
    <Input />
  </div>
  <div className="space-y-2">
    <Label>Campo 2</Label>
    <Input />
  </div>
</div>

// EXCEÇÃO: Campos únicos importantes mantêm coluna única
// Ex: Título de evento, descrição (textarea), seleção principal
```

---

## Integration Points

### Globals CSS
```css
/* Verificar container-responsive já existe em app/globals.css */
/* Não precisa adicionar nada novo */
```

### Breakpoints Tailwind
```javascript
// tailwind.config.ts (já configurado - não modificar)
theme: {
  screens: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  }
}
```

### Componentes UI (shadcn)
```bash
# Todos os componentes já instalados:
# - Dialog (com DialogContent, DialogHeader, etc)
# - Card (com CardHeader, CardContent, etc)
# - Button, Input, Label, Select, etc.
# Não precisa instalar nada novo
```

---

## Validation Loop

### Level 1: Visual Testing por Breakpoint

**Checklist de Testes Manuais:**

#### Mobile (360px - 428px)
```bash
# Abrir DevTools, device mode iPhone SE ou similar
- [ ] Dashboard: métricas 1 coluna, week horizontal scroll, eventos 1 coluna
- [ ] Eventos: grid 1 coluna, filtros verticais, botões visíveis
- [ ] Categorias: grid 1 coluna
- [ ] Pagamentos: seletor + lista verticais, cards 1 coluna
- [ ] Modais: max-w-full ou max-w-lg
```

#### Tablet (768px - 1023px)
```bash
# Abrir DevTools, device mode iPad ou similar
- [ ] Dashboard: métricas 2 colunas, eventos 2 colunas
- [ ] Eventos: grid 2 colunas, filtros horizontais, botões visíveis
- [ ] Categorias: grid 2 colunas
- [ ] Pagamentos: side-by-side (30/70), payments 2 colunas
- [ ] Modais: max-w-3xl ou max-w-4xl
```

#### Desktop (1024px+)
```bash
# Abrir DevTools, responsive mode 1440px ou 1920px
- [ ] Dashboard: métricas 4 colunas, week completo, eventos 3 colunas
- [ ] Eventos: grid 3 colunas, filtros inline, hover effects
- [ ] Categorias: grid 3 colunas, padding aumentado
- [ ] Pagamentos: side-by-side otimizado, payments 2-3 colunas
- [ ] Modais: max-w-5xl, forms em 2 colunas quando apropriado
```

### Level 2: Code Quality

```bash
# Verificar limites de tamanho:
npm run check-file-size  # Criar script se não existir

# Verificação manual:
wc -l app/pagamentos/page.tsx
# Deve ser < 500 linhas após refatoração

wc -l components/payment-*.tsx
# Cada componente < 300 linhas

# Linting (já configurado):
npm run lint

# Type checking:
npx tsc --noEmit

# Build test:
npm run build
# Deve passar sem warnings
```

### Level 3: Responsiveness Automated (opcional)

```bash
# Testar com Playwright (se configurado):
npx playwright test --project=chromium --headed

# Ou criar screenshots por breakpoint:
npx playwright screenshot \
  --viewport-size=375,667 \
  --output=screenshots/mobile-dashboard.png \
  http://localhost:3000

npx playwright screenshot \
  --viewport-size=768,1024 \
  --output=screenshots/tablet-dashboard.png \
  http://localhost:3000

npx playwright screenshot \
  --viewport-size=1440,900 \
  --output=screenshots/desktop-dashboard.png \
  http://localhost:3000
```

---

## Implementation Tasks (Ordem de Execução)

### ✅ Task 1: Refatorar Pagamentos (Crítico)
```yaml
WHY: Arquivo excede 888 linhas - viola regra de 500 linhas max
PRIORITY: P0 (blocker para demais ajustes)

ACTIONS:
  1. CREATE components/payment-event-selector.tsx
     - Extrair lógica de seleção de eventos
     - Props: { selectedEvent, onSelectEvent, events, isActive }
     - Pattern: Seguir people-manager.tsx como referência

  2. CREATE components/payment-list.tsx
     - Extrair grid de pagamentos
     - Props: { payments, onEdit, onDelete, onAdd }
     - Grid: grid-cols-1 md:grid-cols-2 xl:grid-cols-3

  3. CREATE components/payment-card.tsx
     - Extrair card individual
     - Props: { payment, onEdit, onDelete }
     - Reutilizar padrão de Card UI

  4. REFACTOR app/pagamentos/page.tsx
     - Importar 3 novos componentes
     - Manter apenas orquestração e estado global
     - Reduzir para ~250 linhas

VALIDATION:
  - [ ] app/pagamentos/page.tsx < 500 linhas
  - [ ] Cada componente novo < 300 linhas
  - [ ] Funcionalidade 100% preservada
  - [ ] npm run build passa
```

### ✅ Task 2: Responsividade Dashboard
```yaml
FILE: app/page.tsx
PRIORITY: P1

CHANGES:
  - FIND: <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    REPLACE: <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
    WHY: Melhor aproveitamento de espaço em tablet

  - FIND: <div className="space-y-3"> (event cards container)
    REPLACE: <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
    WHY: Múltiplas colunas para eventos em desktop

  - FIND: <div className="grid grid-cols-7 gap-2 mb-6">
    REPLACE: <div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3 mb-4 md:mb-6">
    WHY: Spacing progressivo

VALIDATION:
  - [ ] Mobile (375px): 1 coluna métricas, 1 coluna eventos
  - [ ] Tablet (768px): 2 colunas métricas, 2 colunas eventos
  - [ ] Desktop (1440px): 4 colunas métricas, 3 colunas eventos
```

### ✅ Task 3: Responsividade Eventos
```yaml
FILE: app/eventos/page.tsx
PRIORITY: P1

CHANGES:
  - FIND: <div className="absolute top-4 right-4 md:opacity-0 md:group-hover:opacity-100
    REPLACE: <div className="absolute top-4 right-4 flex gap-2 transition-all md:hover:scale-105
    WHY: Botões sempre visíveis, hover sutil em desktop

  - FIND: <div className="flex flex-col gap-2"> (filtros)
    REPLACE: <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
    WHY: Filtros horizontais em tablet/desktop

  - FIND: gap-4 (em event grid)
    REPLACE: gap-3 md:gap-4 lg:gap-6
    WHY: Spacing responsivo

VALIDATION:
  - [ ] Mobile: Filtros verticais, botões visíveis
  - [ ] Tablet: 2 colunas, filtros horizontais
  - [ ] Desktop: 3 colunas, hover scale nos cards
```

### ✅ Task 4: Responsividade Categorias
```yaml
FILE: app/categorias/page.tsx
PRIORITY: P2

CHANGES:
  - UPDATE: gap-4 → gap-3 md:gap-4 lg:gap-6 (category grid)
  - UPDATE: <CardContent className="p-4"> → className="p-4 md:p-5 lg:p-6"

FILE: components/people-manager.tsx
CHANGES:
  - FIND: <DialogContent className="bg-background border-border">
    REPLACE: <DialogContent className="bg-background border-border max-w-lg md:max-w-3xl lg:max-w-5xl">

VALIDATION:
  - [ ] Grid spacing responsivo
  - [ ] Modal people-manager maior em desktop
  - [ ] Cards com padding progressivo
```

### ✅ Task 5: Responsividade Pagamentos
```yaml
FILE: app/pagamentos/page.tsx (pós-refatoração)
PRIORITY: P1

CHANGES:
  - Implementar layout side-by-side:
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <div className="lg:w-1/3">
        <PaymentEventSelector />
      </div>
      <div className="lg:w-2/3">
        <PaymentList />
      </div>
    </div>

FILE: components/payment-list.tsx
CHANGES:
  - Grid: grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4

VALIDATION:
  - [ ] Mobile: vertical stack
  - [ ] Desktop: side-by-side (30/70)
  - [ ] Payments em 2-3 colunas conforme largura
```

### ✅ Task 6: Ajustes Globais Modais
```yaml
FILES:
  - components/event-form.tsx
  - components/team-manager.tsx
  - components/category-form.tsx
  - components/person-form.tsx

PATTERN:
  Dialog simples:
    <DialogContent className="max-w-lg md:max-w-2xl lg:max-w-3xl">

  Dialog complexo:
    <DialogContent className="max-w-lg md:max-w-4xl lg:max-w-5xl">

  Forms com múltiplos inputs:
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* inputs lado a lado em desktop */}
    </div>

EXCEPTIONS:
  - Textarea (descrição) sempre col-span-2 ou col-span-full
  - Campo de título principal sempre full width

VALIDATION:
  - [ ] Todos modais responsivos
  - [ ] Forms em 2 colunas quando apropriado
  - [ ] Campos importantes mantêm largura total
```

---

## Final Validation Checklist

### Funcional
- [ ] Todas as páginas carregam sem erro
- [ ] Todas as funcionalidades preservadas (CRUD, navegação, etc)
- [ ] Modais abrem/fecham corretamente
- [ ] Forms submetem dados corretamente
- [ ] Sem regressões em mobile

### Visual (Multi-device)
- [ ] Mobile (375px): Layout vertical, compacto, 100% funcional
- [ ] Tablet (768px): 2 colunas, spacing otimizado, filtros inline
- [ ] Desktop (1024px): 3+ colunas, modais largos, máximo aproveitamento
- [ ] Ultra-wide (1920px): Sem espaços vazios excessivos

### Código
- [ ] Nenhum arquivo > 500 linhas
- [ ] Nenhuma função > 50 linhas
- [ ] npm run build passa sem warnings
- [ ] npm run lint sem erros
- [ ] TypeScript sem erros (npx tsc --noEmit)

### Performance
- [ ] Lighthouse score > 90 (desktop)
- [ ] Lighthouse score > 80 (mobile)
- [ ] Sem layout shifts (CLS < 0.1)
- [ ] First Contentful Paint < 1.5s

---

## Anti-Patterns to Avoid

❌ **NÃO fazer:**
- Remover funcionalidades mobile para simplificar desktop
- Usar `hidden md:block` excessivamente (causa confusão)
- Hardcodar tamanhos de modal (usar max-w-* responsivos)
- Quebrar layouts mobile ao adicionar classes desktop
- Adicionar bibliotecas CSS externas (usar só Tailwind)
- Over-engineering com breakpoints customizados desnecessários

✅ **FAZER:**
- Testar cada mudança em 3 breakpoints (mobile, tablet, desktop)
- Manter mobile-first sempre (classes base = mobile)
- Usar padrões Tailwind oficiais (grid, flex, gap, etc)
- Preservar todas as animações Framer Motion
- Manter consistência visual (cores, spacing, typography)
- Seguir padrões de código existentes do projeto

---

## Success Metrics

### Quantitativos
- ✅ 100% das páginas responsivas (4/4)
- ✅ 100% dos modais responsivos (6/6)
- ✅ 0 arquivos acima de 500 linhas
- ✅ 0 regressões funcionais

### Qualitativos
- ✅ Experiência desktop "profissional" e "moderna"
- ✅ Redução de scroll desnecessário em telas grandes
- ✅ Informações mais densas sem perda de legibilidade
- ✅ Transições suaves entre breakpoints

---

## Risk Assessment

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Quebrar layout mobile | Baixa | Alto | Testar mobile primeiro sempre |
| Refatoração introduzir bugs | Média | Alto | Validar cada componente extraído |
| Esquecer algum modal | Baixa | Médio | Checklist de todos os dialogs |
| Exceder prazo | Média | Baixo | Priorizar P0 e P1 primeiro |

---

## PRP Confidence Score

**8.5/10** - Alta confiança de implementação em one-pass

**Justificativa:**
- ✅ Mudanças são majoritariamente CSS/classes Tailwind
- ✅ Padrões claros de grid/flex/spacing já existem no projeto
- ✅ Nenhuma mudança de lógica ou API
- ✅ Validação visual é direta (DevTools responsivo)
- ⚠️ Refatoração de pagamentos.tsx requer atenção (maior risco)

**Áreas de Atenção:**
- Refatoração de pagamentos (Task 1) - testar exaustivamente
- Garantir hover states não quebrarem em touch devices
- Validar performance com muitos elementos (100+ eventos)

---

**Criado por:** Claude Code
**Aprovado por:** [usuario]
**Próximo passo:** Revisar com stakeholder e iniciar Task 1
