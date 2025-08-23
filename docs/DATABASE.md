# Documentação do Banco de Dados - Metri

## Visão Geral

O Metri utiliza **Supabase (PostgreSQL)** como banco de dados na nuvem. Esta arquitetura oferece escalabilidade, backup automático, e sincronização em tempo real entre diferentes dispositivos.

## Tecnologias Utilizadas

- **Supabase**: Plataforma Backend-as-a-Service baseada em PostgreSQL
- **PostgreSQL**: Banco de dados relacional robusto
- **@supabase/supabase-js**: Cliente oficial para JavaScript/TypeScript
- **Row Level Security (RLS)**: Segurança nativa do PostgreSQL

## Estrutura das Tabelas

### 1. Tabela `categories` (Categorias Profissionais)

Armazena os tipos de profissionais que podem ser alocados em eventos.

```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,           -- Nome da categoria (ex: "Garçom", "Segurança")
  description TEXT NOT NULL,     -- Descrição detalhada
  color TEXT NOT NULL DEFAULT '#3B82F6',  -- Cor para identificação visual
  member_count INTEGER DEFAULT 0, -- Quantidade de membros na categoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos importantes:**
- `id`: UUID único gerado automaticamente pelo PostgreSQL
- `color`: Hexadecimal para UI (#3B82F6 = azul padrão)
- `member_count`: Contador de pessoas cadastradas nesta categoria

### 2. Tabela `people` (Pessoas/Profissionais)

Registra os profissionais individuais que fazem parte de cada categoria.

```sql
CREATE TABLE people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,            -- Nome completo da pessoa
  value DECIMAL(10,2),           -- Valor/hora ou valor fixo a receber (opcional)
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relações:**
- `category_id`: Relacionamento N:1 com `categories`
- `ON DELETE CASCADE`: Remove pessoas quando categoria é deletada

### 3. Tabela `events` (Eventos)

Armazena os eventos organizados com suas informações básicas.

```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,           -- Título do evento
  description TEXT,              -- Descrição detalhada (opcional)
  date DATE NOT NULL,            -- Data do evento
  start_time TIME NOT NULL,      -- Horário início
  end_time TIME NOT NULL,        -- Horário término
  location TEXT,                 -- Local do evento (opcional)
  status TEXT DEFAULT 'planned', -- Status: planned, ongoing, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Formatos de dados:**
- `date`: DATE nativo do PostgreSQL
- `start_time`/`end_time`: TIME nativo do PostgreSQL
- `status`: String com valores predefinidos

### 4. Tabela `event_staff` (Alocação de Equipes)

Tabela associativa que conecta eventos com categorias, definindo quantas pessoas de cada categoria são necessárias.

```sql
CREATE TABLE event_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1, -- Quantidade de pessoas desta categoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, category_id)
);
```

**Relações:**
- Implementa relacionamento N:N entre `events` e `categories`
- `quantity`: Define quantas pessoas daquela categoria são necessárias

### 5. Tabela `payments` (Pagamentos)

Sistema de controle de pagamentos por evento e pessoa.

```sql
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
```

## Diagrama de Relacionamentos

```
┌──────────────┐         ┌────────────────┐         ┌──────────────┐
│  categories  │◄────┐   │  event_staff   │    ┌───►│    events    │
├──────────────┤     │   ├────────────────┤    │    ├──────────────┤
│ id (PK)      │     ├───┤ category_id(FK)│    │    │ id (PK)      │
│ name         │     │   │ event_id (FK)  ├────┘    │ title        │
│ description  │     │   │ quantity       │         │ date         │
│ color        │     │   └────────────────┘         │ start_time   │
│ member_count │     │                               │ end_time     │
└──────────────┘     │                               │ location     │
        ▲            │                               │ status       │
        │            │                               └──────────────┘
        │            │                                       ▲
        │            │                               ┌───────┴────────┐
┌──────────────┐     │                               │   payments     │
│    people    │     │                               ├────────────────┤
├──────────────┤     │                               │ id (PK)        │
│ id (PK)      │     │                               │ event_id (FK)  │
│ name         │     │                               │ person_id (FK) │◄─┐
│ value        │     │                               │ amount         │  │
│ category_id  ├─────┘                               │ is_paid        │  │
│   (FK)       │◄────────────────────────────────────┤ paid_at        │  │
└──────────────┘                                     └────────────────┘  │
                                                              │            │
                                                              └────────────┘
```

## Configuração Supabase

### Cliente Configuration (`lib/supabase/client.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Não usando auth por enquanto
  },
  db: {
    schema: 'public'
  }
})
```

### Services Layer (`lib/supabase/services.ts`)
```typescript
// Exemplo de service para categorias
export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return []
    }
    
    return data || []
  }
  // ... outros métodos CRUD
}
```

## Triggers Automáticos

### Auto-update de timestamps
```sql
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_people_updated_at 
  BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Row Level Security (RLS)

### Políticas Temporárias (acesso público)
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas públicas temporárias
CREATE POLICY "Public Access" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON people FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON event_staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON payments FOR ALL USING (true) WITH CHECK (true);
```

## Operações Comuns

### Buscar eventos de um dia específico
```typescript
const { data: events } = await supabase
  .from('events')
  .select('*')
  .eq('date', '2025-08-19')
  .order('start_time')
```

### Contar pessoas por categoria
```typescript
const { data: stats } = await supabase
  .from('categories')
  .select(`
    name,
    people:people(count)
  `)
```

### Buscar alocação de um evento com detalhes
```typescript
const { data: eventDetails } = await supabase
  .from('events')
  .select(`
    *,
    event_staff (
      quantity,
      categories (
        name,
        color
      )
    )
  `)
  .eq('id', eventId)
  .single()
```

## Vantagens do Supabase vs SQLite Local

### ✅ Benefícios
- **Backup Automático**: Dados protegidos na nuvem
- **Sincronização**: Acesso multi-dispositivo
- **Escalabilidade**: PostgreSQL suporta crescimento
- **Real-time**: Subscriptions para updates instantâneos
- **Administração**: Dashboard web para gerenciar dados
- **Segurança**: RLS nativo e encriptação

### ⚠️ Considerações
- **Conexão**: Requer internet para funcionar
- **Latência**: Consultas podem ser mais lentas que local
- **Custo**: Plano gratuito tem limites de storage/bandwidth

## Monitoramento e Performance

### Métricas no Dashboard Supabase
- Número de requisições por minuto
- Tamanho do banco de dados
- Consultas mais lentas
- Uso de bandwidth
- Limite de conexões

### Otimizações Implementadas
```sql
-- Índices para performance
CREATE INDEX idx_people_category_id ON people(category_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_event_staff_event_id ON event_staff(event_id);
CREATE INDEX idx_payments_event_id ON payments(event_id);
```

## Backup e Recuperação

### Backup Automático Supabase
- Backups automáticos diários (plano pago)
- Point-in-time recovery disponível
- Export manual via dashboard

### Export de Dados
```typescript
// Exemplo: exportar todos os dados
async function exportAllData() {
  const categories = await supabase.from('categories').select('*')
  const people = await supabase.from('people').select('*')
  const events = await supabase.from('events').select('*')
  const payments = await supabase.from('payments').select('*')
  
  return {
    categories: categories.data,
    people: people.data,
    events: events.data,
    payments: payments.data,
    exported_at: new Date().toISOString()
  }
}
```

## Migração de SQLite para Supabase

### ✅ Completado
1. Criação das tabelas com schema equivalente
2. Atualização dos types TypeScript (snake_case)
3. Implementação dos services Supabase
4. Migração dos hooks React
5. Remoção completa do SQLite e dependências

### Diferenças Principais
| SQLite | Supabase |
|--------|----------|
| `TEXT` | `TEXT` |
| `INTEGER` | `INTEGER` |
| `REAL` | `DECIMAL(10,2)` |
| `uuid()` | `gen_random_uuid()` |
| `CURRENT_TIMESTAMP` | `NOW()` |
| Arquivo local | Cloud PostgreSQL |

## Troubleshooting

### Erro: "Error loading categories"
```typescript
// Verificar conexão e credenciais
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### Erro de RLS
```sql
-- Verificar políticas ativas
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('categories', 'people', 'events', 'event_staff', 'payments');
```

### Performance Lenta
- Verificar índices criados
- Analisar queries no dashboard Supabase
- Considerar desnormalização para consultas frequentes

## Evolução Futura

### Autenticação
```sql
-- Políticas baseadas em usuário (futuro)
CREATE POLICY "Users can view own data" ON events 
  FOR SELECT USING (auth.uid() = user_id);
```

### Real-time Subscriptions
```typescript
// Escutar mudanças em eventos
supabase
  .channel('events')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'events' 
  }, (payload) => {
    console.log('Event updated:', payload)
  })
  .subscribe()
```

### Edge Functions
- Funções serverless para lógica complexa
- Triggers para notificações
- Integração com APIs externas

---

*Última atualização: 20/08/2025*
*Versão do Schema: 2.0.0 (Supabase)*
*Migração SQLite → Supabase: Concluída*