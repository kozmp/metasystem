-- KOSSECKI METASYSTEM (KMS) - HOMEOSTAT ALERTS SCHEMA
-- Rozszerzenie bazy o system alertów sprzeczności
-- Zgodnie z teorią: "Weryfikacja Rzetelności Wstecznej"

-- 1. Tabela alertów systemowych (wykryte sprzeczności)
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Typ alertu
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'contradiction',      -- Sprzeczność w relacjach
        'narrative_shift',    -- Zmiana narracji tego samego źródła
        'low_certainty',      -- Niska rzetelność
        'ideological_flag'    -- Wykryto ideologię
    )),
    
    -- Poziom krytyczności (0-1, gdzie 1 = krytyczne)
    severity FLOAT NOT NULL DEFAULT 0.5,
    
    -- Tytuł alertu (krótki opis)
    title TEXT NOT NULL,
    
    -- Szczegółowy opis sprzeczności
    description TEXT NOT NULL,
    
    -- ID relacji które są w sprzeczności (array)
    conflicting_relation_ids UUID[] NOT NULL,
    
    -- ID obiektów których dotyczy alert
    affected_object_ids UUID[],
    
    -- Źródło które wygenerowało sprzeczność
    source_name TEXT,
    
    -- Dodatkowe dane (szczegóły sprzeczności w JSON)
    metadata JSONB DEFAULT '{}',
    
    -- Status: 'active', 'resolved', 'dismissed'
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
    
    -- Kiedy został rozwiązany/odrzucony
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created ON system_alerts(created_at DESC);

-- 3. Rozszerzenie tabeli correlations o pole source_name (śledzenie źródła)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'correlations' 
        AND column_name = 'source_name'
    ) THEN
        ALTER TABLE correlations 
        ADD COLUMN source_name TEXT;
        
        RAISE NOTICE 'Dodano kolumnę source_name do correlations';
    END IF;
END $$;

-- 4. Rozszerzenie tabeli correlations o timestamp superseded (wycofana relacja)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'correlations' 
        AND column_name = 'superseded_at'
    ) THEN
        ALTER TABLE correlations 
        ADD COLUMN superseded_at TIMESTAMPTZ,
        ADD COLUMN superseded_by UUID REFERENCES correlations(id);
        
        RAISE NOTICE 'Dodano kolumny superseded_at i superseded_by do correlations';
    END IF;
END $$;

-- 5. Funkcja helper do tworzenia alertu sprzeczności
CREATE OR REPLACE FUNCTION create_contradiction_alert(
    p_title TEXT,
    p_description TEXT,
    p_relation_ids UUID[],
    p_object_ids UUID[],
    p_source_name TEXT,
    p_severity FLOAT DEFAULT 0.7,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_alert_id UUID;
BEGIN
    INSERT INTO system_alerts (
        alert_type,
        severity,
        title,
        description,
        conflicting_relation_ids,
        affected_object_ids,
        source_name,
        metadata,
        status
    ) VALUES (
        'contradiction',
        p_severity,
        p_title,
        p_description,
        p_relation_ids,
        p_object_ids,
        p_source_name,
        p_metadata,
        'active'
    )
    RETURNING id INTO v_alert_id;
    
    RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Widok dla aktywnych alertów (dla Efektora)
CREATE OR REPLACE VIEW v_active_alerts AS
SELECT 
    a.*,
    array_length(a.conflicting_relation_ids, 1) as num_conflicts,
    array_length(a.affected_object_ids, 1) as num_affected_objects
FROM system_alerts a
WHERE a.status = 'active'
ORDER BY a.severity DESC, a.created_at DESC;

-- 7. Pokaż statystyki
SELECT 
    'Schema Homeostat Alerts został wdrożony' as status,
    (SELECT count(*) FROM system_alerts) as total_alerts,
    (SELECT count(*) FROM system_alerts WHERE status = 'active') as active_alerts;

