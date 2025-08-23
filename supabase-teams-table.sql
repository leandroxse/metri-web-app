-- Criar tabela para persistir equipes dos eventos no Supabase
-- Substitui o localStorage para evitar perda de dados

CREATE TABLE IF NOT EXISTS public.event_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  person_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_event_person UNIQUE(event_id, person_id)
  
  -- Foreign keys (opcional - comentado pois pode não existir ainda)
  -- FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  -- FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_event_teams_event_id ON public.event_teams(event_id);
CREATE INDEX IF NOT EXISTS idx_event_teams_person_id ON public.event_teams(person_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_teams_updated_at
  BEFORE UPDATE ON public.event_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS (Row Level Security) - opcional
-- ALTER TABLE public.event_teams ENABLE ROW LEVEL SECURITY;

-- Comentários para documentação
COMMENT ON TABLE public.event_teams IS 'Armazena as equipes selecionadas para cada evento, substituindo localStorage';
COMMENT ON COLUMN public.event_teams.event_id IS 'ID do evento';
COMMENT ON COLUMN public.event_teams.person_id IS 'ID da pessoa selecionada para o evento';