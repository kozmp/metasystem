-- KOSSECKI METASYSTEM (KMS) - CORE DATABASE SCHEMA
-- Zgodne z rygorem: Receptor -> Korelator (Retencja) -> Homeostat -> Efektor

-- 1. Tabela obiektów (Systemy Autonomiczne i Inne)
-- Reprezentuje "obiekty elementarne" z teorii poznania Kosseckiego
-- ZAKTUALIZOWANO: Metacybernetyka 2015 - dodano parametry v, a, c oraz P = v × a × c
CREATE TABLE cybernetic_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    -- Klasyfikacja wg Mazura/Kosseckiego
    system_class TEXT CHECK (system_class IN ('autonomous_system', 'heteronomous_system', 'environment', 'tool')),
    -- Dominujący system sterowania źródła
    control_system_type TEXT CHECK (control_system_type IN ('cognitive', 'ideological', 'ethical', 'economic')),
    -- Parametry energetyczne (Moc jałowa, robocza, swobodna) - LEGACY
    energy_params JSONB DEFAULT '{"working_power": 0, "idle_power": 0, "available_power": 0}',

    -- METACYBERNETYKA 2015: Parametry mocy systemowej
    power_v FLOAT8 DEFAULT 1.0 NOT NULL CHECK (power_v >= 0), -- Moc jednostkowa [W]
    quality_a FLOAT8 DEFAULT 1.0 NOT NULL CHECK (quality_a >= 0 AND quality_a <= 1), -- Jakość/sprawność
    mass_c FLOAT8 DEFAULT 1.0 NOT NULL CHECK (mass_c >= 0), -- Ilość/masa
    total_power_p FLOAT8 GENERATED ALWAYS AS (power_v * quality_a * mass_c) STORED, -- P = v × a × c

    -- METACYBERNETYKA 2015: Klasyfikacja cywilizacyjna
    civilization_code TEXT DEFAULT 'unknown' CHECK (civilization_code IN ('latin', 'byzantine', 'turandot', 'mixed', 'unknown')),
    motivation_type TEXT DEFAULT 'informational' CHECK (motivation_type IN ('vital', 'informational', 'mixed')),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela relacji i sprzężeń (Korelator)
-- Reprezentuje transformacje i przepływy informacji/energii
CREATE TABLE correlations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES cybernetic_objects(id) ON DELETE CASCADE,
    target_id UUID REFERENCES cybernetic_objects(id) ON DELETE CASCADE,
    -- Typ relacji sterowniczej
    relation_type TEXT NOT NULL, -- np. 'direct_control', 'positive_feedback', 'negative_feedback', 'supply'
    -- Waga rzetelności nadana przez Homeostat (0-1)
    certainty_score FLOAT DEFAULT 0.0, 
    -- Współczynnik korelacji (siła wpływu)
    impact_factor FLOAT DEFAULT 1.0,
    -- Dowody empiryczne i kontekst (szczegóły z tekstu)
    evidence_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela reputacji źródeł (Homeostat)
-- Służy do oceny "reaktywności" i wiarygodności dostarczycieli informacji
CREATE TABLE source_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL,
    source_url TEXT UNIQUE,
    -- Indeks rzetelności poznawczej (zwiększany przez naukowe fakty, zmniejszany przez szum)
    reliability_index FLOAT DEFAULT 0.5,
    -- Profil cywilizacyjny wykryty przez AI (np. 'latin', 'byzantine', 'turandot')
    civilization_profile TEXT,
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Logi retencyjne (Pamięć operacyjna korelatora)
-- Przechowuje surowe wpisy przed ich przetworzeniem na obiekty
CREATE TABLE raw_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    noise_level FLOAT, -- semanticNoiseLevel z Receptora
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widok dla Korelatora do szukania łańcuchów sterowania (Recursive Search)
-- Pozwala sprawdzić np. kto pośrednio steruje danym obiektem
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