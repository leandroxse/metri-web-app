-- ============================================
-- TABELAS DE ORÇAMENTOS
-- ============================================

-- Tabela de templates de orçamento
CREATE TABLE IF NOT EXISTS budget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_url TEXT NOT NULL,
  fields_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de orçamentos preenchidos
CREATE TABLE IF NOT EXISTS filled_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES budget_templates(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  filled_data JSONB NOT NULL,
  generated_pdf_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'sent', 'approved', 'rejected')) DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_budget_templates_is_active ON budget_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_filled_budgets_template_id ON filled_budgets(template_id);
CREATE INDEX IF NOT EXISTS idx_filled_budgets_event_id ON filled_budgets(event_id);
CREATE INDEX IF NOT EXISTS idx_filled_budgets_status ON filled_budgets(status);
CREATE INDEX IF NOT EXISTS idx_filled_budgets_created_at ON filled_budgets(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_budget_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_budget_templates_updated_at
  BEFORE UPDATE ON budget_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_updated_at();

CREATE TRIGGER update_filled_budgets_updated_at
  BEFORE UPDATE ON filled_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_updated_at();

-- ============================================
-- STORAGE BUCKET PARA PDFs DE ORÇAMENTO
-- ============================================

-- Criar bucket para orçamentos preenchidos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('filled-budgets', 'filled-budgets', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao storage (RLS)
-- Qualquer pessoa autenticada pode fazer upload
CREATE POLICY "Allow authenticated uploads to filled-budgets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'filled-budgets');

-- Qualquer pessoa pode ler (bucket público)
CREATE POLICY "Allow public read access to filled-budgets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'filled-budgets');

-- Apenas autenticados podem deletar seus próprios arquivos
CREATE POLICY "Allow authenticated delete from filled-budgets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'filled-budgets');

-- ============================================
-- RLS (Row Level Security)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE budget_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE filled_budgets ENABLE ROW LEVEL SECURITY;

-- Políticas para budget_templates
-- Todos podem ler templates ativos
CREATE POLICY "Anyone can view active budget templates"
ON budget_templates FOR SELECT
USING (is_active = true);

-- Apenas autenticados podem criar/editar templates
CREATE POLICY "Authenticated users can manage budget templates"
ON budget_templates FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para filled_budgets
-- Usuários autenticados podem fazer tudo
CREATE POLICY "Authenticated users can manage filled budgets"
ON filled_budgets FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

COMMENT ON TABLE budget_templates IS 'Templates de PDF de orçamento disponíveis';
COMMENT ON TABLE filled_budgets IS 'Orçamentos preenchidos e gerados';
COMMENT ON COLUMN filled_budgets.status IS 'Status: draft, completed, sent, approved, rejected';
COMMENT ON COLUMN filled_budgets.filled_data IS 'Campos do orçamento preenchidos (JSON)';
