-- KOSSECKI METASYSTEM (KMS) - RESET SCHEMA
-- ⚠️ UWAGA: To usunie wszystkie dane!

-- Usuń istniejące tabele (CASCADE usuwa również zależności)
DROP TABLE IF EXISTS correlations CASCADE;
DROP TABLE IF EXISTS cybernetic_objects CASCADE;
DROP TABLE IF EXISTS source_intelligence CASCADE;
DROP TABLE IF EXISTS raw_signals CASCADE;
DROP VIEW IF EXISTS v_control_chains CASCADE;

-- Teraz utwórz tabele od nowa
CREATE TABLE cybernetic_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    system_class TEXT CHECK (system_class IN ('autonomous_system', 'heteronomous_system', 'environment', 'tool')),
    control_system_type TEXT CHECK (control_system_type IN ('cognitive', 'ideological', 'ethical', 'economic')),
    energy_params JSONB DEFAULT '{"working_power": 0, "idle_power": 0, "available_power": 0}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE correlations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES cybernetic_objects(id) ON DELETE CASCADE,
    target_id UUID REFERENCES cybernetic_objects(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL,
    certainty_score FLOAT DEFAULT 0.0, 
    impact_factor FLOAT DEFAULT 1.0,
    evidence_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE source_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL,
    source_url TEXT UNIQUE,
    reliability_index FLOAT DEFAULT 0.5,
    civilization_profile TEXT,
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE raw_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    noise_level FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Pokaż strukturę
SELECT 'Schema został zresetowany' as status;

