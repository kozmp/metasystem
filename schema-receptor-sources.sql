-- KOSSECKI METASYSTEM (KMS) - ROZSZERZENIE SCHEMA
-- Tracking źródeł dla Receptora 2.0 (Autonomiczny Zwiadowca)
-- 
-- Zgodnie z rygorem Kosseckiego:
-- Każdy obiekt musi mieć śledzenie pochodzenia dla weryfikacji rzetelności

-- ============================================================================
-- 1. Rozszerzenie tabeli raw_signals o metadane źródła
-- ============================================================================

ALTER TABLE raw_signals 
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS source_title TEXT,
ADD COLUMN IF NOT EXISTS source_metadata JSONB DEFAULT '{}';

COMMENT ON COLUMN raw_signals.source_url IS 'URL źródłowy strony (dla scrapingu/RSS)';
COMMENT ON COLUMN raw_signals.source_title IS 'Tytuł źródła (meta title lub RSS title)';
COMMENT ON COLUMN raw_signals.source_metadata IS 'Metadane źródła: author, published_date, description';

-- ============================================================================
-- 2. Rozszerzenie tabeli correlations o nazwę źródła
-- ============================================================================

ALTER TABLE correlations 
ADD COLUMN IF NOT EXISTS source_name TEXT DEFAULT 'unknown';

COMMENT ON COLUMN correlations.source_name IS 'Nazwa źródła informacji (do trackingu rzetelności)';

-- ============================================================================
-- 3. Nowa tabela: recon_targets (Cele Zwiadu)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recon_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,
    target_type TEXT CHECK (target_type IN ('webpage', 'rss_feed', 'api')),
    name TEXT,
    category TEXT, -- 'news', 'science', 'tech', 'politics', 'economics', 'other'
    enabled BOOLEAN DEFAULT true,
    -- Metryki zwiadu
    last_scan_at TIMESTAMPTZ,
    next_scan_at TIMESTAMPTZ,
    scan_interval_minutes INTEGER DEFAULT 60, -- Co ile minut skanować
    total_scans INTEGER DEFAULT 0,
    successful_scans INTEGER DEFAULT 0,
    failed_scans INTEGER DEFAULT 0,
    -- Metryki rzetelności
    average_noise_level FLOAT,
    average_certainty_score FLOAT,
    ideological_flags_count INTEGER DEFAULT 0,
    -- Metadane
    reliability_bias FLOAT DEFAULT 0.5, -- Wstępny bias rzetelności (0-1)
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE recon_targets IS 'Cele autonomicznego zwiadu - strony/RSS do monitorowania';
COMMENT ON COLUMN recon_targets.reliability_bias IS 'Wstępna ocena rzetelności źródła (0=niskie, 1=wysokie)';
COMMENT ON COLUMN recon_targets.scan_interval_minutes IS 'Częstotliwość skanowania w minutach';

-- Index dla wydajności
CREATE INDEX IF NOT EXISTS idx_recon_targets_enabled ON recon_targets(enabled);
CREATE INDEX IF NOT EXISTS idx_recon_targets_next_scan ON recon_targets(next_scan_at) WHERE enabled = true;

-- ============================================================================
-- 4. Nowa tabela: recon_logs (Logi Zwiadu)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recon_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id UUID REFERENCES recon_targets(id) ON DELETE CASCADE,
    scan_type TEXT CHECK (scan_type IN ('manual', 'automatic', 'scheduled')),
    success BOOLEAN NOT NULL,
    items_found INTEGER DEFAULT 0,
    items_processed INTEGER DEFAULT 0,
    raw_signal_ids UUID[], -- Array ID-ów z raw_signals
    error_message TEXT,
    duration_ms INTEGER, -- Czas trwania scanu w milisekundach
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE recon_logs IS 'Logi operacji zwiadu - historia skanowania';
COMMENT ON COLUMN recon_logs.scan_type IS 'Typ skanu: manual (użytkownik), automatic (RSS monitor), scheduled (cron)';

-- Index dla wydajności
CREATE INDEX IF NOT EXISTS idx_recon_logs_target ON recon_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_recon_logs_created ON recon_logs(created_at DESC);

-- ============================================================================
-- 5. Widok: v_recon_summary (Podsumowanie Zwiadu)
-- ============================================================================

CREATE OR REPLACE VIEW v_recon_summary AS
SELECT 
    rt.id,
    rt.name,
    rt.url,
    rt.target_type,
    rt.category,
    rt.enabled,
    rt.last_scan_at,
    rt.next_scan_at,
    rt.total_scans,
    rt.successful_scans,
    rt.failed_scans,
    rt.average_noise_level,
    rt.average_certainty_score,
    rt.reliability_bias,
    -- Ostatni log
    (SELECT created_at FROM recon_logs WHERE target_id = rt.id ORDER BY created_at DESC LIMIT 1) as last_log_at,
    (SELECT success FROM recon_logs WHERE target_id = rt.id ORDER BY created_at DESC LIMIT 1) as last_log_success,
    (SELECT error_message FROM recon_logs WHERE target_id = rt.id ORDER BY created_at DESC LIMIT 1) as last_log_error,
    -- Statystyki z ostatniego tygodnia
    (SELECT COUNT(*) FROM recon_logs WHERE target_id = rt.id AND created_at > NOW() - INTERVAL '7 days') as scans_last_week,
    (SELECT COUNT(*) FROM recon_logs WHERE target_id = rt.id AND created_at > NOW() - INTERVAL '7 days' AND success = true) as successful_scans_last_week
FROM recon_targets rt;

COMMENT ON VIEW v_recon_summary IS 'Podsumowanie celów zwiadu z metrykami';

-- ============================================================================
-- 6. Funkcja: update_recon_target_stats (Aktualizacja statystyk po skanie)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_recon_target_stats(
    p_target_id UUID,
    p_success BOOLEAN,
    p_noise_level FLOAT DEFAULT NULL,
    p_certainty_score FLOAT DEFAULT NULL
) RETURNS void AS $$
BEGIN
    UPDATE recon_targets
    SET 
        total_scans = total_scans + 1,
        successful_scans = CASE WHEN p_success THEN successful_scans + 1 ELSE successful_scans END,
        failed_scans = CASE WHEN NOT p_success THEN failed_scans + 1 ELSE failed_scans END,
        last_scan_at = NOW(),
        average_noise_level = CASE 
            WHEN p_noise_level IS NOT NULL THEN 
                COALESCE((average_noise_level * total_scans + p_noise_level) / (total_scans + 1), p_noise_level)
            ELSE average_noise_level
        END,
        average_certainty_score = CASE 
            WHEN p_certainty_score IS NOT NULL THEN 
                COALESCE((average_certainty_score * successful_scans + p_certainty_score) / (successful_scans + 1), p_certainty_score)
            ELSE average_certainty_score
        END,
        updated_at = NOW()
    WHERE id = p_target_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_recon_target_stats IS 'Aktualizuje statystyki celu zwiadu po wykonaniu skanu';

-- ============================================================================
-- 7. Wstawienie przykładowych celów zwiadu (RSS)
-- ============================================================================

INSERT INTO recon_targets (url, target_type, name, category, reliability_bias, scan_interval_minutes, enabled)
VALUES 
    ('https://www.nature.com/nature.rss', 'rss_feed', 'Nature - Latest Research', 'science', 0.9, 360, true),
    ('https://www.technologyreview.com/feed/', 'rss_feed', 'MIT Technology Review', 'tech', 0.85, 240, true),
    ('https://news.ycombinator.com/rss', 'rss_feed', 'Hacker News', 'tech', 0.7, 180, true),
    ('http://feeds.bbci.co.uk/news/world/rss.xml', 'rss_feed', 'BBC News - World', 'news', 0.7, 120, true),
    ('https://www.economist.com/rss', 'rss_feed', 'The Economist', 'economics', 0.8, 360, true)
ON CONFLICT (url) DO NOTHING;

-- ============================================================================
-- ZAKOŃCZENIE
-- ============================================================================

-- Pokaż podsumowanie
SELECT 
    'Rozszerzenie schema zakończone pomyślnie!' as status,
    (SELECT COUNT(*) FROM recon_targets) as total_targets,
    (SELECT COUNT(*) FROM recon_targets WHERE enabled = true) as enabled_targets;

