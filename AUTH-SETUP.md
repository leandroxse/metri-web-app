# 🔐 Setup de Autenticação METRI

Sistema de autenticação simples com senha única implementado em 07/01/2025.

## 📋 Visão Geral

O sistema protege o painel administrativo usando:
- Senha única compartilhada (hash SHA-256)
- Cookie de sessão (httpOnly, secure, sameSite)
- Middleware de proteção
- Rotas discretas (`/access` e `/central`)

## 🚀 Configuração Inicial

### 1. Gerar Hash da Senha

Escolha uma senha forte e gere o hash:

```bash
node scripts/generate-password-hash.js SuaSenhaAqui
```

Exemplo de saída:
```
✅ Hash gerado com sucesso!

📋 Adicione ao seu .env.local:

APP_PASSWORD_HASH=48e273fe4c0018390743f92502745cdb697316cb27c155b7e1044c1de63fcfba
```

### 2. Configurar Variáveis de Ambiente

#### Desenvolvimento Local (`.env.local`)

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
# === Autenticação ===
APP_PASSWORD_HASH=seu_hash_aqui

# === Supabase (já configurado) ===
NEXT_PUBLIC_SUPABASE_URL=https://lrgaiiuoljgjasyrqjzk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:** Nunca commite o arquivo `.env.local` no git!

#### Produção (Netlify)

1. Acesse o painel do Netlify
2. Vá em **Site Settings → Environment Variables**
3. Adicione a variável:
   - **Key:** `APP_PASSWORD_HASH`
   - **Value:** (cole o hash gerado)

## 🗺️ Estrutura de Rotas

### Rotas Públicas
- `/` → Página 404 (não revela painel)
- `/access` → Página de autenticação
- `/eventos/[id]/cardapio/[token]` → Cardápios públicos

### Rotas Protegidas (requerem autenticação)
- `/central` → Dashboard
- `/central/eventos` → Gestão de eventos
- `/central/pagamentos` → Controle de pagamentos
- `/central/cardapios` → CRUD de cardápios
- `/central/categorias` → Categorias profissionais
- `/central/docs` → Sistema de documentos/contratos
- `/central/configuracoes` → Configurações
- `/central/admin/edit-menu-images` → Editor de cardápio

## 🔒 Fluxo de Autenticação

1. **Usuário tenta acessar `/central`**
   - Middleware verifica cookie de sessão
   - Se não autenticado → redireciona para `/access`

2. **Usuário acessa `/access`**
   - Insere senha
   - Server Action valida senha (hash SHA-256)
   - Se válida → cria cookie de sessão (7 dias)
   - Redireciona para `/central`

3. **Usuário autenticado navega livremente**
   - Cookie persiste por 7 dias
   - Navegação funciona normalmente
   - Ao fechar browser, sessão mantém-se ativa

## 🧪 Testando o Sistema

### Teste Local

```bash
# 1. Iniciar servidor dev (se não estiver rodando)
npm run dev

# 2. Acessar rotas e verificar comportamento
http://localhost:3000          → Deve mostrar 404
http://localhost:3000/central  → Deve redirecionar para /access
http://localhost:3000/access   → Deve mostrar form de senha

# 3. Inserir senha correta
# → Deve redirecionar para /central (dashboard)

# 4. Navegar entre páginas
# → Tudo deve funcionar normalmente

# 5. Acessar cardápio público (se existir um evento com cardápio)
http://localhost:3000/eventos/[id]/cardapio/[token]
# → Deve funcionar SEM autenticação
```

### Teste em Produção

```bash
# 1. Deploy no Netlify
git add .
git commit -m "feat: Implementar autenticação simples"
git push origin main

# 2. Aguardar deploy
# 3. Testar no Netlify
https://metriapp.netlify.app          → 404
https://metriapp.netlify.app/central  → /access
https://metriapp.netlify.app/access   → Form de senha
```

## 🔧 Troubleshooting

### Problema: Cookie não persiste

**Causa:** Flag `secure` requer HTTPS
**Solução:** Em produção, sempre use HTTPS. Em dev, o código já detecta `NODE_ENV !== 'production'`

### Problema: Redirect loop

**Causa:** Middleware ou página `/access` com lógica incorreta
**Solução:** Verificar que `/access` não verifica autenticação

### Problema: Senha correta não funciona

**Causa:** Hash incorreto no `.env.local`
**Solução:** Regerar hash com o script e atualizar env var

### Problema: Assets (CSS/JS) não carregam

**Causa:** Middleware bloqueando assets
**Solução:** Verificar matcher em `middleware.ts` exclui `_next/static`

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar logout manual (botão em `/central/configuracoes`)
- [ ] Implementar expiração de sessão após inatividade
- [ ] Adicionar rate limiting para proteger contra brute force
- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Migrar para sistema multi-usuário com Supabase Auth

## 📚 Arquivos Criados/Modificados

### Novos Arquivos
```
lib/auth/
  ├── session.ts          # Utilitários de hash e validação
  └── constants.ts        # Constantes de rotas e cookies

middleware.ts              # Proteção de rotas

app/access/
  ├── page.tsx            # Form de autenticação
  └── actions.ts          # Server Action para login

app/central/              # Painel protegido
  ├── layout.tsx          # Layout com navegação
  ├── page.tsx            # Dashboard
  ├── eventos/
  ├── pagamentos/
  ├── cardapios/
  ├── categorias/
  ├── docs/
  ├── configuracoes/
  └── admin/

scripts/
  └── generate-password-hash.js  # Script helper
```

### Arquivos Modificados
```
app/
  ├── layout.tsx          # Removido navegação (movida para /central)
  └── page.tsx            # Agora é 404 discreto

components/
  ├── bottom-navigation.tsx   # Links atualizados para /central
  └── sidebar.tsx             # Links atualizados para /central
```

## 🔐 Segurança

### Boas Práticas Implementadas
✅ Hash SHA-256 para senha (não armazena texto plano)
✅ Cookie httpOnly (previne XSS)
✅ Cookie secure em produção (HTTPS only)
✅ Cookie sameSite=lax (previne CSRF)
✅ Mensagens de erro genéricas (não revela info)
✅ Rotas discretas (não-óbvias)
✅ Middleware com matcher otimizado

### Limitações Conhecidas
⚠️ Senha única compartilhada (não é multi-usuário)
⚠️ Sem rate limiting (vulnerável a brute force)
⚠️ Sem 2FA
⚠️ Sessão não expira por inatividade

Para sistema de produção mais robusto, considere migrar para Supabase Auth.

## 📞 Suporte

Em caso de dúvidas, consulte:
- PRP original: `PRPs/simple-auth-protection.md`
- Documentação Next.js: https://nextjs.org/docs/app/api-reference/file-conventions/middleware
- Documentação Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto

---

**Implementado em:** 07/01/2025
**Versão:** 1.0.0
**Status:** ✅ Ativo e funcional
