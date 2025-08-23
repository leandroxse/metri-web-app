-- Adicionar foreign key entre event_teams e people
-- Isso permite que o Supabase faça o join automaticamente

-- 1. Adicionar foreign key constraint para people
ALTER TABLE public.event_teams 
ADD CONSTRAINT fk_event_teams_person_id 
FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;

-- 2. Opcional: Adicionar foreign key para events também (se a tabela existir)
-- ALTER TABLE public.event_teams 
-- ADD CONSTRAINT fk_event_teams_event_id 
-- FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

-- Verificar se as constraints foram criadas
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'event_teams';