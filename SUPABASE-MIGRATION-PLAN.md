# 🚀 PLANO DE MIGRAÇÃO SQLite → SUPABASE

## ✅ COMPLEXIDADE: BAIXA/MÉDIA (2-3 horas de trabalho)

## 📊 ESTRUTURA ATUAL DO BANCO

### Tabelas:
1. **categories** (6 campos)
   - id, name, description, color, memberCount, timestamps

2. **people** (5 campos)
   - id, name, value, categoryId, timestamps

3. **events** (9 campos)
   - id, title, description, date, startTime, endTime, location, status, timestamps

4. **event_staff** (5 campos)
   - id, eventId, categoryId, quantity, createdAt

5. **payments** (9 campos)
   - id, eventId, personId, amount, isPaid, paidAt, notes, timestamps

## 🔧 PASSOS DA MIGRAÇÃO

### Fase 1: Setup Supabase (15 min)
- [ ] Criar conta no Supabase (se não tiver)
- [ ] Criar novo projeto
- [ ] Pegar as credenciais (URL e ANON_KEY)
- [ ] Configurar .env.local

### Fase 2: Criar Schema no Supabase (30 min)
- [ ] Criar as 5 tabelas via Supabase Dashboard
- [ ] Configurar foreign keys
- [ ] Habilitar RLS (Row Level Security)
- [ ] Criar políticas de acesso público temporárias

### Fase 3: Migrar Services (1 hora)
- [ ] Criar novo `lib/supabase/client.ts`
- [ ] Adaptar `lib/db/services.ts` para Supabase
- [ ] Manter mesma interface dos hooks (não precisa mudar componentes!)
- [ ] Testar CRUD de cada tabela

### Fase 4: Migrar Dados Existentes (30 min)
- [ ] Script para exportar dados do SQLite local
- [ ] Script para importar no Supabase
- [ ] Validar integridade dos dados

### Fase 5: Deploy (15 min)
- [ ] Remover dependências SQLite
- [ ] Atualizar variáveis de ambiente no Railway
- [ ] Deploy e testar

## 💡 VANTAGENS DA MIGRAÇÃO

✅ **Banco real na nuvem** - Nunca mais perde dados
✅ **Realtime** - Atualizações em tempo real (se quiser)
✅ **Backup automático** - Supabase faz backup diário
✅ **Escala infinita** - Supabase aguenta milhões de registros
✅ **Auth grátis** - Se quiser adicionar login depois
✅ **Storage grátis** - Para imagens/arquivos
✅ **Funciona em qualquer lugar** - Railway, Vercel, Netlify, etc

## 🎯 RESULTADO ESPERADO

- **ZERO mudanças nos componentes** (hooks mantém mesma interface)
- **ZERO mudanças na UI** 
- **100% dos dados preservados**
- **Nunca mais perder dados em deploy**
- **Performance melhor** (Postgres > SQLite)

## 📝 SQL PARA CRIAR TABELAS NO SUPABASE

```sql
-- Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- People
CREATE TABLE people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value DECIMAL(10,2),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Staff
CREATE TABLE event_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, category_id)
);

-- Payments
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, person_id)
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies (temporariamente público)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas públicas temporárias (ajustar depois se quiser auth)
CREATE POLICY "Public Access" ON categories FOR ALL USING (true);
CREATE POLICY "Public Access" ON people FOR ALL USING (true);
CREATE POLICY "Public Access" ON events FOR ALL USING (true);
CREATE POLICY "Public Access" ON event_staff FOR ALL USING (true);
CREATE POLICY "Public Access" ON payments FOR ALL USING (true);
```

## 🚀 COMEÇAR MIGRAÇÃO?

Se quiser, posso:
1. Criar as tabelas no Supabase (precisa das credenciais)
2. Implementar os novos services
3. Migrar todos os dados existentes
4. Garantir que NUNCA MAIS perca dados!

**Tempo estimado: 2-3 horas para migração completa**