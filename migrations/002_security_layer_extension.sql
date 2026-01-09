-- KOSSECKI METASYSTEM (KMS) - SECURITY LAYER EXTENSION
-- Rozszerzenie system_alerts o kolumny dla Homeostat Security Layer
-- Data: 2026-01-09
-- Zgodnie z architekturą: Claude Code Damage Control → KMS Adaptation

-- ============================================================================
-- ROZSZERZENIE TABELI system_alerts O KOLUMNY SECURITY
-- ============================================================================

DO $$ 
BEGIN
    -- 1. Dodaj kolumnę operation_type (typ operacji: sql_query, file_write, etc.)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'system_alerts' 
        AND column_name = 'operation_type'
    ) THEN
        ALTER TABLE system_alerts 
        ADD COLUMN operation_type TEXT;
        
        RAISE NOTICE 'Dodano kolumnę operation_type do system_alerts';
    END IF;
    
    -- 2. Dodaj kolumnę blocked_by_security (czy operacja została zablokowana)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'system_alerts' 
        AND column_name = 'blocked_by_security'
    ) THEN
        ALTER TABLE system_alerts 
        ADD COLUMN blocked_by_security BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Dodano kolumnę blocked_by_security do system_alerts';
    END IF;
    
    -- 3. Dodaj kolumnę user_confirmed (czy użytkownik potwierdził operację)
    -- NULL = nie wymagało potwierdzenia
    -- TRUE = użytkownik zaakceptował
    -- FALSE = użytkownik odrzucił
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'system_alerts' 
        AND column_name = 'user_confirmed'
    ) THEN
        ALTER TABLE system_alerts 
        ADD COLUMN user_confirmed BOOLEAN DEFAULT NULL;
        
        RAISE NOTICE 'Dodano kolumnę user_confirmed do system_alerts';
    END IF;
    
    -- 4. Dodaj kolumnę target (ścieżka pliku lub nazwa tabeli)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'system_alerts' 
        AND column_name = 'target'
    ) THEN
        ALTER TABLE system_alerts 
        ADD COLUMN target TEXT;
        
        RAISE NOTICE 'Dodano kolumnę target do system_alerts';
    END IF;
    
    -- 5. Dodaj kolumnę pattern_matched (który pattern wykrył zagrożenie)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'system_alerts' 
        AND column_name = 'pattern_matched'
    ) THEN
        ALTER TABLE system_alerts 
        ADD COLUMN pattern_matched TEXT;
        
        RAISE NOTICE 'Dodano kolumnę pattern_matched do system_alerts';
    END IF;
END $$;

-- ============================================================================
-- ROZSZERZENIE alert_type O NOWE TYPY SECURITY
-- ============================================================================

-- Usuń stare constraint i dodaj nowy z rozszerzoną listą
ALTER TABLE system_alerts 
DROP CONSTRAINT IF EXISTS system_alerts_alert_type_check;

ALTER TABLE system_alerts 
ADD CONSTRAINT system_alerts_alert_type_check 
CHECK (alert_type IN (
    -- Oryginalne typy
    'contradiction',
    'narrative_shift',
    'low_certainty',
    'ideological_flag',
    -- Nowe typy security
    'SECURITY_VIOLATION',
    'CRITICAL_SECURITY_VIOLATION',
    'SECURITY_CONFIRMATION_REQUIRED',
    'SECURITY_CHECK_PASSED'
));

-- ============================================================================
-- INDEKSY DLA WYDAJNOŚCI ZAPYTAŃ SECURITY
-- ============================================================================

-- Indeks dla zdarzeń zablokowanych przez security
CREATE INDEX IF NOT EXISTS idx_system_alerts_blocked 
ON system_alerts(blocked_by_security, created_at DESC) 
WHERE blocked_by_security = TRUE;

-- Indeks dla zdarzeń wymagających potwierdzenia
CREATE INDEX IF NOT EXISTS idx_system_alerts_confirmation 
ON system_alerts(user_confirmed, created_at DESC) 
WHERE user_confirmed IS NOT NULL;

-- Indeks dla operation_type (szybkie filtrowanie po typie operacji)
CREATE INDEX IF NOT EXISTS idx_system_alerts_operation_type 
ON system_alerts(operation_type, created_at DESC);

-- ============================================================================
-- WIDOK DLA ZDARZEŃ BEZPIECZEŃSTWA
-- ============================================================================

CREATE OR REPLACE VIEW v_security_events AS
SELECT 
    a.id,
    a.created_at,
    a.alert_type,
    a.severity,
    a.title,
    a.description,
    a.operation_type,
    a.blocked_by_security,
    a.user_confirmed,
    a.target,
    a.pattern_matched,
    a.source_name,
    a.metadata,
    a.status,
    -- Czytelne etykiety
    CASE 
        WHEN a.blocked_by_security THEN '🚫 ZABLOKOWANO'
        WHEN a.user_confirmed = TRUE THEN '✓ POTWIERDZONO'
        WHEN a.user_confirmed = FALSE THEN '✗ ODRZUCONO'
        ELSE '✓ DOZWOLONO'
    END as decision_label
FROM system_alerts a
WHERE a.operation_type IS NOT NULL  -- Tylko zdarzenia security (mają operation_type)
ORDER BY a.created_at DESC;

-- ============================================================================
-- FUNKCJA HELPER: Tworzenie alertu security
-- ============================================================================

CREATE OR REPLACE FUNCTION create_security_alert(
    p_alert_type TEXT,
    p_severity FLOAT,
    p_message TEXT,
    p_operation_type TEXT,
    p_blocked_by_security BOOLEAN DEFAULT FALSE,
    p_user_confirmed BOOLEAN DEFAULT NULL,
    p_target TEXT DEFAULT NULL,
    p_pattern_matched TEXT DEFAULT NULL,
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
        operation_type,
        blocked_by_security,
        user_confirmed,
        target,
        pattern_matched,
        source_name,
        metadata,
        status,
        conflicting_relation_ids,  -- Wymagane przez constraint NOT NULL
        affected_object_ids
    ) VALUES (
        p_alert_type,
        p_severity,
        'Security Event: ' || p_operation_type,
        p_message,
        p_operation_type,
        p_blocked_by_security,
        p_user_confirmed,
        p_target,
        p_pattern_matched,
        'Homeostat Security Layer',
        p_metadata,
        'active',
        ARRAY[]::UUID[],  -- Pusta tablica dla security events
        ARRAY[]::UUID[]
    )
    RETURNING id INTO v_alert_id;
    
    RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STATYSTYKI SECURITY (dla dashboardu)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_security_stats(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    total_events BIGINT,
    blocked_count BIGINT,
    confirmed_count BIGINT,
    rejected_count BIGINT,
    critical_count BIGINT,
    most_common_operation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE blocked_by_security = TRUE) as blocked_count,
        COUNT(*) FILTER (WHERE user_confirmed = TRUE) as confirmed_count,
        COUNT(*) FILTER (WHERE user_confirmed = FALSE) as rejected_count,
        COUNT(*) FILTER (WHERE severity >= 0.8) as critical_count,
        MODE() WITHIN GROUP (ORDER BY operation_type) as most_common_operation
    FROM system_alerts
    WHERE operation_type IS NOT NULL
      AND created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- POKAŻ WYNIK MIGRACJI
-- ============================================================================

SELECT 
    'Security Layer Extension - SUKCES' as status,
    (SELECT count(*) FROM system_alerts WHERE operation_type IS NOT NULL) as security_events_count,
    (SELECT count(*) FROM system_alerts WHERE blocked_by_security = TRUE) as blocked_count;

-- ============================================================================
-- INSTRUKCJA URUCHOMIENIA
-- ============================================================================

-- Aby uruchomić tę migrację w Supabase:
-- 1. Otwórz Supabase Dashboard → SQL Editor
-- 2. Wklej całą zawartość tego pliku
-- 3. Kliknij "Run"
-- 4. Sprawdź output - powinien pokazać "Security Layer Extension - SUKCES"


