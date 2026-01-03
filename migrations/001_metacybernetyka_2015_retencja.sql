-- ============================================================================
-- MIGRACJA: Metacybernetyka 2015 - Retencja (Parametry v, a, c)
-- ============================================================================
-- Data: 2026-01-02
-- Cel: Rozszerzenie cybernetic_objects o parametry z "Metacybernetyka 2015"
--
-- Zgodnie z teorią Kosseckiego:
-- - v (power_v) = moc jednostkowa [J/s = W]
-- - a (quality_a) = jakość (sprawność, efektywność)
-- - c (mass_c) = ilość (masa, liczebność)
-- - P (total_power_p) = v × a × c = moc całkowita systemu
--
-- Dodatkowo:
-- - civilization_code = kod cywilizacyjny (łacińska/bizantyjska/turandot)
-- - motivation_type = motywacja (witalne/informacyjne)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. DODANIE KOLUMN METRYCZNYCH (v, a, c)
-- ----------------------------------------------------------------------------

-- Moc jednostkowa [W] - ile energii na jednostkę czasu generuje jeden element
ALTER TABLE cybernetic_objects
ADD COLUMN IF NOT EXISTS power_v FLOAT8 DEFAULT 1.0 NOT NULL
CHECK (power_v >= 0);

COMMENT ON COLUMN cybernetic_objects.power_v IS
'Moc jednostkowa [W] - energia na jednostkę czasu (v z Metacybernetyki 2015)';

-- Jakość (sprawność) - współczynnik efektywności 0-1
ALTER TABLE cybernetic_objects
ADD COLUMN IF NOT EXISTS quality_a FLOAT8 DEFAULT 1.0 NOT NULL
CHECK (quality_a >= 0 AND quality_a <= 1);

COMMENT ON COLUMN cybernetic_objects.quality_a IS
'Jakość/sprawność - współczynnik efektywności 0-1 (a z Metacybernetyki 2015)';

-- Ilość (masa, liczebność) - ile elementów/jednostek
ALTER TABLE cybernetic_objects
ADD COLUMN IF NOT EXISTS mass_c FLOAT8 DEFAULT 1.0 NOT NULL
CHECK (mass_c >= 0);

COMMENT ON COLUMN cybernetic_objects.mass_c IS
'Ilość/masa - liczba elementów lub masa systemu (c z Metacybernetyki 2015)';

-- ----------------------------------------------------------------------------
-- 2. DODANIE KOLUMN KLASYFIKACYJNYCH
-- ----------------------------------------------------------------------------

-- Kod cywilizacyjny według Kosseckiego
ALTER TABLE cybernetic_objects
ADD COLUMN IF NOT EXISTS civilization_code TEXT DEFAULT 'unknown'
CHECK (civilization_code IN ('latin', 'byzantine', 'turandot', 'mixed', 'unknown'));

COMMENT ON COLUMN cybernetic_objects.civilization_code IS
'Kod cywilizacyjny: latin (nauka), byzantine (religia), turandot (ideologia), mixed, unknown';

-- Typ motywacji systemu
ALTER TABLE cybernetic_objects
ADD COLUMN IF NOT EXISTS motivation_type TEXT DEFAULT 'informational'
CHECK (motivation_type IN ('vital', 'informational', 'mixed'));

COMMENT ON COLUMN cybernetic_objects.motivation_type IS
'Typ motywacji: vital (przeżycie biologiczne), informational (poznanie), mixed';

-- ----------------------------------------------------------------------------
-- 3. KOLUMNA GENEROWANA: MOCA CAŁKOWITA (P = v × a × c)
-- ----------------------------------------------------------------------------

-- PostgreSQL 12+ wspiera GENERATED ALWAYS AS STORED
ALTER TABLE cybernetic_objects
ADD COLUMN IF NOT EXISTS total_power_p FLOAT8
GENERATED ALWAYS AS (power_v * quality_a * mass_c) STORED;

COMMENT ON COLUMN cybernetic_objects.total_power_p IS
'Moc całkowita P = v × a × c [W] - automatycznie obliczana (generated column)';

-- ----------------------------------------------------------------------------
-- 4. INDEKSY DLA WYDAJNOŚCI
-- ----------------------------------------------------------------------------

-- Indeks dla wyszukiwania po mocy całkowitej (często sortowane)
CREATE INDEX IF NOT EXISTS idx_cybernetic_objects_total_power
ON cybernetic_objects(total_power_p DESC NULLS LAST);

-- Indeks dla filtrowania po kodzie cywilizacyjnym
CREATE INDEX IF NOT EXISTS idx_cybernetic_objects_civilization
ON cybernetic_objects(civilization_code)
WHERE civilization_code != 'unknown';

-- Indeks dla filtrowania po typie motywacji
CREATE INDEX IF NOT EXISTS idx_cybernetic_objects_motivation
ON cybernetic_objects(motivation_type);

-- ----------------------------------------------------------------------------
-- 5. WIDOK POMOCNICZY: Ranking mocy systemów
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_power_ranking AS
SELECT
    id,
    name,
    system_class,
    power_v,
    quality_a,
    mass_c,
    total_power_p,
    civilization_code,
    motivation_type,
    -- Ranking w ramach klasy systemu
    RANK() OVER (PARTITION BY system_class ORDER BY total_power_p DESC) as power_rank_in_class,
    -- Ranking globalny
    RANK() OVER (ORDER BY total_power_p DESC) as power_rank_global
FROM cybernetic_objects
WHERE total_power_p > 0
ORDER BY total_power_p DESC;

COMMENT ON VIEW v_power_ranking IS
'Ranking systemów według mocy całkowitej P = v × a × c';

-- ----------------------------------------------------------------------------
-- 6. FUNKCJA POMOCNICZA: Obliczanie P dla bulk update
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION calculate_total_power(
    p_power_v FLOAT8,
    p_quality_a FLOAT8,
    p_mass_c FLOAT8
) RETURNS FLOAT8 AS $$
BEGIN
    RETURN p_power_v * p_quality_a * p_mass_c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_total_power IS
'Oblicza P = v × a × c - użyj gdy generated column nie działa';

-- ----------------------------------------------------------------------------
-- 7. TRIGGER (BACKUP) - gdyby generated column nie działała
-- ----------------------------------------------------------------------------

-- Ten trigger NIE będzie potrzebny jeśli generated column działa
-- Zakomentowany, ale gotowy do użycia jako fallback

/*
CREATE OR REPLACE FUNCTION update_total_power()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_power_p := NEW.power_v * NEW.quality_a * NEW.mass_c;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_total_power
BEFORE INSERT OR UPDATE OF power_v, quality_a, mass_c
ON cybernetic_objects
FOR EACH ROW
EXECUTE FUNCTION update_total_power();
*/

COMMIT;

-- ============================================================================
-- KONIEC MIGRACJI
-- ============================================================================

-- Weryfikacja:
-- SELECT name, power_v, quality_a, mass_c, total_power_p FROM cybernetic_objects LIMIT 5;
