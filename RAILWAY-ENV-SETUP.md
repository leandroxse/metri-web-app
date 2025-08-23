# Railway Environment Variables Setup

Para corrigir o erro de build no Railway, configure as seguintes variáveis de ambiente:

## 1. Acesse o Dashboard do Railway
- Vá para [railway.app](https://railway.app)
- Selecione seu projeto `metri-web-app`
- Clique na aba **Variables**

## 2. Adicione as Variáveis do Supabase

Adicione essas 3 variáveis com os valores do seu `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://lrgaiiuoljgjasyrqjzk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTg2NzksImV4cCI6MjA3MTIzNDY3OX0.VN-bevJCeMC3TgzWRThoC1uyFdJXnkR0m-0vaCRin4c
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODY3OSwiZXhwIjoyMDcxMjM0Njc5fQ.mf5tJtki9Hrn_GdjyB_XC0SVv7Pzr9i2UAOK5R8v95s
```

## 3. Redeploy
Após adicionar as variáveis, faça um novo deploy:
- Clique em **Deploy** no Railway
- Ou faça um novo push para o repositório

## 4. Verificação
O build deve completar sem erros agora que as variáveis do Supabase estão disponíveis.

## Fallback
O código foi atualizado para usar valores placeholder caso as variáveis não estejam disponíveis, evitando crashes durante o build.

## Troubleshooting
Se ainda aparecer "Supabase environment variables not found":
1. Verifique se as variáveis estão salvas no Railway Dashboard
2. Force um novo deployment clicando em "Redeploy"
3. Aguarde alguns minutos para o deploy completar
4. As variáveis devem ser carregadas no novo deployment