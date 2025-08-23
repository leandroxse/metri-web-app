# 🔧 Configuração do Supabase

## ⚠️ Problema Atual: Credenciais Inválidas

O sistema está configurado para usar Supabase, mas as credenciais no `.env.local` estão **inválidas** ou o projeto Supabase pode estar **pausado**.

### 🔍 Diagnóstico

**Erro detectado:** `Invalid API key`
**Causa provável:** 
- Projeto Supabase pausado por inatividade
- Credenciais expiradas ou incorretas
- Projeto removido

### 🚀 Solução

#### Opção 1: Reativar Projeto Existente
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Verifique se o projeto `lrgaiiuoljgjasyrqjzk` existe
3. Se pausado, reative o projeto
4. Verifique se as credenciais estão corretas

#### Opção 2: Criar Novo Projeto Supabase
1. **Criar projeto:**
   ```bash
   # Acesse https://supabase.com/dashboard
   # Clique em "New Project"
   # Nome: metri-web-app
   # Região: preferencialmente próxima
   ```

2. **Configurar credenciais:**
   ```bash
   # Copie as novas credenciais para .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
   ```

3. **Executar SQL das tabelas:**
   ```sql
   -- Execute o conteúdo do arquivo supabase-tables.sql
   -- no SQL Editor do Supabase Dashboard
   ```

### 📁 Arquivos Relevantes

- **`.env.local`** - Credenciais do Supabase
- **`supabase-tables.sql`** - Schema das tabelas
- **`lib/supabase/client.ts`** - Configuração do cliente
- **`lib/supabase/services.ts`** - Services CRUD

### 🧪 Teste de Conexão

Para testar se a configuração está funcionando:

```javascript
// Execute no console do navegador após carregar a página
window.MetriDebug.categories()
```

Se retornar dados ou mostrar erro específico, a conexão está funcionando.

### 🔄 Status Atual do Sistema

**✅ Funcionando sem Supabase:**
- Interface carrega normalmente
- Componentes renderizam
- Logs informativos (warnings)

**⚠️ Limitações sem Supabase:**
- Dados não são salvos
- Listas ficam vazias
- Operações CRUD retornam arrays/objetos vazios

### 💡 Desenvolvimento Offline

O sistema foi projetado para degradar graciosamente:
- Sem Supabase: interface funciona mas sem dados
- Com Supabase: sistema completo com persistência

## 🛠️ Próximos Passos

1. **Reconfigurar Supabase** com credenciais válidas
2. **Executar SQL** para criar tabelas
3. **Testar conexão** com MetriDebug
4. **Popular dados** de teste se necessário

---

**📋 Checklist de Configuração:**
- [ ] Projeto Supabase ativo
- [ ] Credenciais válidas no .env.local
- [ ] Tabelas criadas (supabase-tables.sql)
- [ ] RLS configurado com políticas públicas
- [ ] Teste de conexão OK

**🔗 Links Úteis:**
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Configuração](https://supabase.com/docs/guides/getting-started)