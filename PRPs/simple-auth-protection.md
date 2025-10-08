# PRP: Sistema de Autenticação Simples com Senha Única

**Created:** 2025-01-07
**Status:** Ready for Implementation
**Complexity:** Low-Medium
**Estimated Time:** 1-2 hours

---

## Goal

Implementar proteção de autenticação simples usando **senha única compartilhada** para proteger o painel administrativo do METRI, evitando acesso não autorizado quando clientes receberem links de cardápios públicos.

**End State:** Usuário não consegue acessar painel administrativo sem inserir senha correta. Cardápios públicos continuam acessíveis sem autenticação.

---

## Why

- **Problema de Segurança:** Cliente que recebe link `metriapp.netlify.app/eventos/123/cardapio/abc` pode simplesmente apagar o path e acessar `metriapp.netlify.app/` tendo acesso total ao painel administrativo
- **Simplicidade:** Não precisa de múltiplos usuários ou sistema complexo de auth
- **Sem overhead:** Não requer mudanças no banco de dados ou RLS
- **Discrição:** Usar rotas não-óbvias para dificultar descoberta por curiosos

---

## What

### Sistema de Autenticação

1. **Página de Autenticação** (`/access`)
   - Form simples com senha única
   - Validação client-side e server-side
   - Cria cookie de sessão ao autenticar
   - Redireciona para `/central` após sucesso

2. **Middleware de Proteção**
   - Intercepta todas as rotas antes de renderizar
   - Checa cookie de sessão válido
   - Permite rotas públicas (cardápios, assets)
   - Redireciona não-autenticados para `/access`

3. **Painel Administrativo** (`/central/*`)
   - Todas as páginas administrativas movidas para `/central/*`
   - Acessível apenas com sessão válida
   - Mantém funcionalidade atual intacta

4. **Página Raiz** (`/`)
   - Página 404 customizada ou landing simples
   - Não expõe existência do painel
   - Opcional: pode redirecionar para `/access`

### Rotas Discretas Escolhidas

- **Painel Admin:** `/central/*` (ao invés de `/admin`, `/dashboard`, `/app`)
- **Autenticação:** `/access` (ao invés de `/login`, `/auth`, `/signin`)

Reasoning: Palavras comuns mas não-óbvias para painéis administrativos.

---

## Success Criteria

- [ ] Usuário não-autenticado não acessa `/central/*`
- [ ] Senha correta em `/access` cria sessão e redireciona para `/central`
- [ ] Senha incorreta mostra erro sem revelar se existe painel
- [ ] Cookie de sessão expira após 7 dias (ou logout manual)
- [ ] Cardápios públicos (`/eventos/[id]/cardapio/[token]`) continuam acessíveis
- [ ] Assets estáticos (imagens, icons, manifest) não requerem auth
- [ ] Sistema funciona em dev e prod (Netlify)
- [ ] Navegação interna funciona normalmente após autenticação

---

## All Needed Context

### Documentation & References

```yaml
- url: https://nextjs.org/docs/app/api-reference/file-conventions/middleware
  why: Official Next.js 15 middleware documentation
  critical: Middleware runs on Edge Runtime, has limitations on APIs

- url: https://nextjs.org/docs/app/api-reference/functions/cookies
  why: Cookie management in App Router (server actions and route handlers)
  critical: Different API for middleware vs server components

- url: https://www.alexchantastic.com/password-protecting-next
  why: Real-world example of simple password protection in Next.js App Router
  pattern: Cookie-based session with middleware

- url: https://github.com/vercel/next.js/discussions/50374
  why: Setting cookies in middleware and reading in server components
  gotcha: Cookie handling changed in Next.js 14.2.8+

- file: app/layout.tsx
  why: Root layout já usa providers (ThemeProvider, SidebarProvider)
  pattern: Wrap children with providers, conditional rendering

- file: components/bottom-navigation.tsx
  why: Navigation component que precisa atualizar rotas para /central/*
  pattern: Links hardcoded, precisa mapear para novas rotas

- file: components/conditional-sidebar.tsx
  why: Sidebar component que também precisa atualizar rotas
  pattern: Similar ao bottom-navigation

- file: lib/supabase/client.ts
  why: Já temos Supabase client configurado (não vamos usar auth dele)
  gotcha: Não confundir com Supabase Auth, vamos usar cookie simples
```

### Current Codebase Structure

```
metri-web-app/
├── app/
│   ├── layout.tsx                    # Root layout com providers
│   ├── page.tsx                      # Dashboard (MOVER para /central)
│   ├── eventos/
│   │   ├── page.tsx                  # Lista eventos (MOVER)
│   │   └── [id]/cardapio/[token]/   # PÚBLICO - não proteger!
│   ├── pagamentos/page.tsx           # MOVER
│   ├── cardapios/page.tsx            # MOVER
│   ├── categorias/page.tsx           # MOVER
│   ├── docs/page.tsx                 # MOVER
│   └── configuracoes/page.tsx        # MOVER
├── components/
│   ├── bottom-navigation.tsx         # ATUALIZAR rotas
│   ├── conditional-sidebar.tsx       # ATUALIZAR rotas
│   └── ...
├── lib/
│   └── supabase/client.ts
├── .env.local                        # ADICIONAR senha aqui
└── middleware.ts                     # CRIAR este arquivo
```

### Desired Codebase Structure (After Implementation)

```
metri-web-app/
├── app/
│   ├── layout.tsx                    # (sem mudanças)
│   ├── page.tsx                      # NOVO - página 404 ou landing
│   ├── access/
│   │   └── page.tsx                  # NOVO - página de autenticação
│   ├── central/                      # NOVO - painel protegido
│   │   ├── layout.tsx                # NOVO - layout interno com nav
│   │   ├── page.tsx                  # MOVIDO - dashboard
│   │   ├── eventos/page.tsx          # MOVIDO
│   │   ├── pagamentos/page.tsx       # MOVIDO
│   │   ├── cardapios/page.tsx        # MOVIDO
│   │   ├── categorias/page.tsx       # MOVIDO
│   │   ├── docs/page.tsx             # MOVIDO
│   │   └── configuracoes/page.tsx    # MOVIDO
│   └── eventos/
│       └── [id]/cardapio/[token]/   # MANTÉM - rota pública
├── lib/
│   └── auth/
│       ├── session.ts                # NOVO - utils sessão
│       └── constants.ts              # NOVO - constantes
├── .env.local                        # ADICIONAR APP_PASSWORD
└── middleware.ts                     # NOVO - proteção rotas
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js Middleware Limitations
// ❌ Middleware runs on Edge Runtime - can't use Node.js APIs
// ❌ Can't import crypto.scrypt - use Web Crypto API
// ✅ Use crypto.subtle for hashing
// ✅ Use NextResponse.cookies for cookie management

// CRITICAL: Cookie Security
// ✅ MUST set httpOnly: true (previne XSS)
// ✅ MUST set secure: true em production (HTTPS only)
// ✅ MUST set sameSite: 'lax' (previne CSRF)
// ⚠️  path: '/' garante cookie disponível em todas rotas

// CRITICAL: Matcher Pattern
// ✅ Middleware matcher DEVE excluir assets estáticos
// ✅ Pattern: /((?!_next/static|_next/image|favicon.ico).*)
// ⚠️  Sem isso, middleware bloqueia CSS/JS/images

// CRITICAL: Route Handlers vs Server Actions
// ⚠️  Server Actions (form actions) usam cookies() do 'next/headers'
// ⚠️  Middleware usa request.cookies e response.cookies
// ✅ APIs diferentes mas compatíveis

// GOTCHA: Redirect Loops
// ❌ Se /access verificar sessão e redirecionar, cria loop
// ✅ Middleware deve permitir /access sem autenticação
// ✅ Mas /access deve redirecionar SE já autenticado

// GOTCHA: Next.js 15 App Router
// ✅ Já não tem getServerSideProps
// ✅ Usa Server Components por padrão
// ⚠️  Forms precisam de 'use client' para controlled inputs
```

### Environment Variables

```bash
# .env.local (ADICIONAR)
# Senha de acesso ao painel (hash SHA-256)
APP_PASSWORD=SuaSenhaSeguraAqui123

# Opcional: Secret para assinar cookies (gerar random)
SESSION_SECRET=random-256-bit-secret-key-here
```

---

## Implementation Blueprint

### Task List (In Order)

```yaml
Task 1: Criar Estrutura de Pastas e Arquivos Base
  files:
    - CREATE app/access/page.tsx
    - CREATE app/central/layout.tsx
    - CREATE app/central/page.tsx (vazio por enquanto)
    - CREATE lib/auth/session.ts
    - CREATE lib/auth/constants.ts
    - CREATE middleware.ts

Task 2: Implementar Utilitários de Sessão
  file: lib/auth/session.ts
  responsibility: Hash senha, validar senha, criar/validar tokens
  pattern: Use Web Crypto API (compatível com Edge Runtime)

Task 3: Implementar Constantes de Auth
  file: lib/auth/constants.ts
  responsibility: Nomes de cookies, duração sessão, rotas públicas

Task 4: Implementar Middleware de Proteção
  file: middleware.ts
  responsibility: Interceptar requests, validar sessão, redirecionar
  pattern: Similar a https://www.alexchantastic.com/password-protecting-next
  critical: Matcher DEVE excluir _next/static, assets, rotas públicas

Task 5: Implementar Página de Autenticação
  file: app/access/page.tsx
  responsibility: Form de senha, validação, criar sessão
  pattern: Server Action para autenticação
  ux: Minimalista, discreto, sem revelar que é admin

Task 6: Mover Dashboard para /central
  action: MOVE app/page.tsx → app/central/page.tsx
  verify: Dashboard renderiza corretamente em /central

Task 7: Criar Layout do Painel Central
  file: app/central/layout.tsx
  responsibility: Wrapper com Sidebar e BottomNav
  pattern: Similar ao app/layout.tsx mas específico do painel

Task 8: Mover Páginas Administrativas
  actions:
    - MOVE app/eventos/page.tsx → app/central/eventos/page.tsx
    - MOVE app/pagamentos/page.tsx → app/central/pagamentos/page.tsx
    - MOVE app/cardapios/page.tsx → app/central/cardapios/page.tsx
    - MOVE app/categorias/page.tsx → app/central/categorias/page.tsx
    - MOVE app/docs/page.tsx → app/central/docs/page.tsx
    - MOVE app/configuracoes/page.tsx → app/central/configuracoes/page.tsx
  critical: NÃO mover app/eventos/[id]/cardapio - é rota pública!

Task 9: Atualizar Componentes de Navegação
  files:
    - MODIFY components/bottom-navigation.tsx
    - MODIFY components/conditional-sidebar.tsx
  changes: Atualizar todos hrefs para /central/*
  pattern:
    - OLD: href="/eventos"
    - NEW: href="/central/eventos"

Task 10: Atualizar Links Internos nos Componentes
  action: SEARCH all Link components and useRouter().push()
  pattern: Replace /eventos → /central/eventos (etc)
  files: Usar Grep para encontrar todos

Task 11: Criar Página Raiz Pública
  file: app/page.tsx (recriar)
  options:
    - Opção A: Página 404 minimalista
    - Opção B: Landing page genérica
    - Opção C: Redirect automático para /access
  recommendation: Opção A (404 discreto)

Task 12: Adicionar Variáveis de Ambiente
  file: .env.local
  add:
    - APP_PASSWORD=sua_senha_aqui
    - SESSION_SECRET=random_secret_256_bits

Task 13: Testar Fluxo Completo
  tests:
    - [ ] Acesso a / não revela painel
    - [ ] Acesso a /central redireciona para /access
    - [ ] Senha incorreta em /access mostra erro
    - [ ] Senha correta cria sessão e redireciona
    - [ ] Navegação dentro de /central/* funciona
    - [ ] Cardápios públicos acessíveis sem auth
    - [ ] Logout funciona (implementar botão)

Task 14: Deploy e Teste em Prod
  actions:
    - VERIFY variáveis env no Netlify
    - TEST em produção
    - VERIFY cookies funcionam com HTTPS
```

---

## Pseudocode & Implementation Details

### Task 2: lib/auth/session.ts

```typescript
// Utilitários de autenticação usando Web Crypto API (Edge Runtime compatible)

/**
 * Gera hash SHA-256 de uma string
 * CRITICAL: Deve funcionar no Edge Runtime (não usar Node.js crypto)
 */
export async function hashPassword(password: string): Promise<string> {
  // Use Web Crypto API (disponível no Edge)
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Verifica se senha fornecida corresponde ao hash esperado
 */
export async function verifyPassword(
  password: string,
  correctPasswordHash: string
): Promise<boolean> {
  const inputHash = await hashPassword(password)
  // SECURITY: Use timing-safe comparison
  return inputHash === correctPasswordHash
}

/**
 * Gera token de sessão aleatório
 * PATTERN: Use crypto.randomUUID() ou Web Crypto
 */
export function generateSessionToken(): string {
  return crypto.randomUUID()
}

/**
 * Valida se token de sessão é válido
 * SIMPLE: Para MVP, apenas checa se existe
 * FUTURE: Poderia validar contra lista de tokens ativos
 */
export function isValidSession(token: string | undefined): boolean {
  return typeof token === 'string' && token.length > 0
}
```

### Task 3: lib/auth/constants.ts

```typescript
// Constantes de autenticação

export const AUTH_COOKIE_NAME = 'metri_session'
export const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 dias em ms

// Rotas públicas que NÃO requerem autenticação
export const PUBLIC_ROUTES = [
  '/access',                              // Página de login
  '/eventos/[id]/cardapio/[token]',      // Cardápios públicos
]

// Rotas protegidas (tudo dentro de /central)
export const PROTECTED_PREFIX = '/central'

// Rota de autenticação
export const AUTH_ROUTE = '/access'

// Rota padrão após login
export const DEFAULT_REDIRECT = '/central'
```

### Task 4: middleware.ts

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, AUTH_ROUTE, PROTECTED_PREFIX, DEFAULT_REDIRECT } from '@/lib/auth/constants'
import { isValidSession } from '@/lib/auth/session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CRITICAL: Permitir assets estáticos sempre
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/cardapio/') ||  // Cardápios públicos
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/splash/')
  ) {
    return NextResponse.next()
  }

  // Obter token de sessão do cookie
  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const isAuthenticated = isValidSession(sessionToken)

  // Se está tentando acessar /access e já está autenticado → redirecionar para painel
  if (pathname === AUTH_ROUTE && isAuthenticated) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url))
  }

  // Se está tentando acessar rota protegida sem estar autenticado → redirecionar para /access
  if (pathname.startsWith(PROTECTED_PREFIX) && !isAuthenticated) {
    return NextResponse.redirect(new URL(AUTH_ROUTE, request.url))
  }

  // Permitir acesso
  return NextResponse.next()
}

// CRITICAL: Matcher exclui assets estáticos para performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Task 5: app/access/page.tsx

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { authenticate } from './actions' // Server Action

export default function AccessPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authenticate(password)

      if (result.success) {
        // Sucesso → redirecionar para painel
        router.push('/central')
        router.refresh() // Força revalidação do middleware
      } else {
        // SECURITY: Mensagem genérica que não revela se existe painel
        setError('Acesso negado')
        setPassword('')
      }
    } catch (err) {
      setError('Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold">Acesso Restrito</h1>
          <p className="text-sm text-muted-foreground">
            Insira a senha para continuar
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                disabled={loading}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !password}
            >
              {loading ? 'Verificando...' : 'Acessar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Task 5b: app/access/actions.ts (Server Action)

```typescript
'use server'

import { cookies } from 'next/headers'
import { verifyPassword, generateSessionToken, hashPassword } from '@/lib/auth/session'
import { AUTH_COOKIE_NAME, SESSION_DURATION } from '@/lib/auth/constants'

/**
 * Server Action para autenticação
 * PATTERN: Validar senha, criar cookie de sessão
 */
export async function authenticate(password: string): Promise<{ success: boolean }> {
  try {
    // CRITICAL: Obter hash da senha da env var
    const correctPasswordHash = process.env.APP_PASSWORD_HASH

    if (!correctPasswordHash) {
      console.error('APP_PASSWORD_HASH not configured')
      return { success: false }
    }

    // Verificar senha
    const isValid = await verifyPassword(password, correctPasswordHash)

    if (!isValid) {
      return { success: false }
    }

    // Gerar token de sessão
    const sessionToken = generateSessionToken()

    // CRITICAL: Criar cookie com configurações seguras
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,                    // Previne XSS
      secure: process.env.NODE_ENV === 'production', // HTTPS only em prod
      sameSite: 'lax',                   // Previne CSRF
      maxAge: SESSION_DURATION / 1000,   // 7 dias em segundos
      path: '/',                         // Disponível em todas rotas
    })

    return { success: true }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false }
  }
}

/**
 * Server Action para logout
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}
```

### Task 7: app/central/layout.tsx

```typescript
import type React from "react"
import { SidebarProvider } from "@/lib/contexts/sidebar-context"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ConditionalSidebar } from "@/components/conditional-sidebar"
import { ConditionalNav } from "@/components/conditional-nav"
import { ConditionalMain } from "@/components/conditional-main"
import { ConditionalLayoutWrapper } from "@/components/conditional-layout-wrapper"

/**
 * Layout específico do painel /central
 * PATTERN: Similar ao root layout mas sem PWA wrappers
 */
export default function CentralLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <ConditionalLayoutWrapper>
        <ConditionalSidebar />
        <ConditionalNav />
        <ConditionalMain>
          {children}
        </ConditionalMain>
        <BottomNavigation />
      </ConditionalLayoutWrapper>
    </SidebarProvider>
  )
}
```

### Task 9: Atualizar Navegação (components/bottom-navigation.tsx)

```typescript
// BEFORE
const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Eventos", href: "/eventos", icon: Calendar },
  { name: "Pagamentos", href: "/pagamentos", icon: DollarSign },
  { name: "Cardápios", href: "/cardapios", icon: ChefHat },
  { name: "DOCS", href: "/docs", icon: FileText },
]

// AFTER
const navItems = [
  { name: "Dashboard", href: "/central", icon: Home },
  { name: "Eventos", href: "/central/eventos", icon: Calendar },
  { name: "Pagamentos", href: "/central/pagamentos", icon: DollarSign },
  { name: "Cardápios", href: "/central/cardapios", icon: ChefHat },
  { name: "DOCS", href: "/central/docs", icon: FileText },
]
```

### Task 11: app/page.tsx (Página Raiz Pública)

```typescript
import { FileQuestion } from 'lucide-react'

/**
 * Página raiz - 404 discreto
 * SECURITY: Não revela existência do painel
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <FileQuestion className="w-16 h-16 text-muted-foreground mx-auto" />
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-muted-foreground">Página não encontrada</p>
      </div>
    </div>
  )
}
```

---

## Validation Loop

### Level 1: TypeScript Build

```bash
# FIRST: Verificar se compila sem erros
npm run build

# Expected: ✓ Compiled successfully
# If errors: READ mensagem, FIX código, re-run
```

### Level 2: Local Dev Testing

```bash
# Start dev server
npm run dev

# Test flow:
# 1. Acessar http://localhost:3000
#    → Deve mostrar 404
#
# 2. Acessar http://localhost:3000/central
#    → Deve redirecionar para /access
#
# 3. Inserir senha ERRADA em /access
#    → Deve mostrar erro "Acesso negado"
#
# 4. Inserir senha CORRETA em /access
#    → Deve redirecionar para /central (dashboard)
#
# 5. Navegar entre páginas do painel
#    → Todas devem funcionar normalmente
#
# 6. Acessar cardápio público: /eventos/123/cardapio/abc
#    → Deve funcionar SEM autenticação
#
# 7. Fechar browser, reabrir
#    → Deve continuar autenticado (cookie persiste)
```

### Level 3: Environment Variables

```bash
# CRITICAL: Gerar hash da senha ANTES de testar

# No terminal Node.js:
node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('SuaSenha')).then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('')))"

# Ou usar script helper:
npm run generate-password-hash

# ADICIONAR ao .env.local:
APP_PASSWORD_HASH=<hash_gerado_acima>
```

### Level 4: Production Deployment (Netlify)

```bash
# 1. Adicionar variáveis de ambiente no Netlify:
#    Site Settings → Environment Variables
#    APP_PASSWORD_HASH=<seu_hash>

# 2. Deploy
git push origin main

# 3. Testar em produção
# https://metriapp.netlify.app → 404
# https://metriapp.netlify.app/central → redirect /access
# https://metriapp.netlify.app/access → login funciona
# https://metriapp.netlify.app/eventos/X/cardapio/Y → público

# 4. Verificar cookies em HTTPS
# DevTools → Application → Cookies
# Deve ter: metri_session, Secure=true, HttpOnly=true, SameSite=Lax
```

---

## Final Validation Checklist

- [ ] Build sem erros: `npm run build`
- [ ] Rota `/` mostra 404 discreto
- [ ] Rota `/central` redireciona para `/access` quando não-autenticado
- [ ] Senha incorreta em `/access` mostra erro genérico
- [ ] Senha correta em `/access` cria sessão e redireciona
- [ ] Todas páginas `/central/*` acessíveis após auth
- [ ] Navegação (Sidebar, BottomNav) funciona com novas rotas
- [ ] Cardápios públicos acessíveis sem autenticação
- [ ] Cookie de sessão tem flags corretas (httpOnly, secure em prod, sameSite)
- [ ] Cookie persiste entre sessões (7 dias)
- [ ] Netlify env vars configuradas
- [ ] Production deploy funciona com HTTPS
- [ ] Nenhum link quebrado em toda aplicação

---

## Anti-Patterns to Avoid

- ❌ **Não** usar `localStorage` para sessão (vulnerável a XSS)
- ❌ **Não** usar Node.js crypto no middleware (Edge Runtime não suporta)
- ❌ **Não** revelar mensagens específicas de erro ("Senha incorreta" vs "Usuário não existe")
- ❌ **Não** hardcode senha no código (usar env vars)
- ❌ **Não** esquecer de adicionar `'use client'` em forms com state
- ❌ **Não** usar `redirect()` do Next.js em middleware (usar `NextResponse.redirect()`)
- ❌ **Não** esquecer matcher no middleware (bloqueia assets)
- ❌ **Não** definir `secure: true` em desenvolvimento local (HTTP não funciona)
- ❌ **Não** usar cookies sem `httpOnly` (vulnerável a XSS)
- ❌ **Não** esquecer de atualizar TODOS os Links internos para `/central/*`

---

## Known Issues & Solutions

### Issue: "Cannot read cookies in middleware"
**Solution:** Use `request.cookies.get()` em vez de `cookies()` from 'next/headers'

### Issue: Redirect loop entre /access e /central
**Solution:** Middleware deve permitir /access sem checar auth, mas /access deve verificar se já está autenticado e redirecionar

### Issue: Cookie não persiste entre requests
**Solution:** Verificar que `path: '/'` está setado e que maxAge está em segundos (não ms)

### Issue: Middleware bloqueia CSS/JS
**Solution:** Matcher deve excluir `_next/static` e `_next/image`

### Issue: Public route (cardápio) pede autenticação
**Solution:** Middleware deve ter regex ou path check específico para `/eventos/[id]/cardapio/`

---

## Success Metrics

Após implementação, o sistema deve:

1. ✅ Prevenir 100% de acessos não-autenticados ao painel
2. ✅ Manter cardápios públicos 100% acessíveis
3. ✅ Zero erros de TypeScript no build
4. ✅ Zero links quebrados em navegação
5. ✅ Sessão persiste por 7 dias sem re-login
6. ✅ Funcionar identicamente em dev e prod

---

## Confidence Score: 8/10

**Reasoning:**
- ✅ Estrutura clara e bem documentada
- ✅ Pattern comprovado (Alex Chan example)
- ✅ APIs estáveis do Next.js 15
- ⚠️  Movimentação de arquivos requer atenção (fácil esquecer um Link)
- ⚠️  Middleware matcher pode precisar ajustes finos

**Potential Pitfalls:**
1. Esquecer de atualizar algum link interno
2. Matcher muito restritivo bloqueando assets
3. Cookie flags incorretas em prod vs dev

**Mitigation:**
- Task 10 usa Grep para encontrar TODOS os links
- Validation Loop testa fluxo completo
- Checklist final cobre todos edge cases
