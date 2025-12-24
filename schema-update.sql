-- KOSSECKI METASYSTEM (KMS) - UPDATE SCHEMA
-- Aktualizacja istniejących tabel

-- 1. Dodaj brakującą kolumnę description do cybernetic_objects (jeśli nie istnieje)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cybernetic_objects' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE cybernetic_objects 
        ADD COLUMN description TEXT;
        
        RAISE NOTICE 'Dodano kolumnę description do cybernetic_objects';
    ELSE
        RAISE NOTICE 'Kolumna description już istnieje w cybernetic_objects';
    END IF;
END $$;

-- 2. Sprawdź i zaktualizuj inne brakujące elementy

-- Sprawdź czy istnieje widok v_control_chains
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'v_control_chains'
    ) THEN
        -- Utwórz widok dla Korelatora
        CREATE OR REPLACE VIEW v_control_chains AS
        WITH RECURSIVE control_path AS (
            SELECT source_id, target_id, relation_type, 1 as depth
            FROM correlations
            UNION ALL
            SELECT cp.source_id, c.target_id, c.relation_type, cp.depth + 1
            FROM correlations c
            JOIN control_path cp ON c.source_id = cp.target_id
            WHERE cp.depth < 5
        )
        SELECT * FROM control_path;
        
        RAISE NOTICE 'Utworzono widok v_control_chains';
    ELSE
        RAISE NOTICE 'Widok v_control_chains już istnieje';
    END IF;
END $$;

-- 3. Wyświetl aktualną strukturę tabel
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('cybernetic_objects', 'correlations', 'raw_signals', 'source_intelligence')
ORDER BY table_name, ordinal_position;

