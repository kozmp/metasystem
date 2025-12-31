/**
 * @fileoverview Recon Panel - Panel Centrum Zwiadu
 * @cybernetic Efektor dla autonomicznego zwiadu
 * 
 * Zgodnie z teorią Kosseckiego:
 * - Prezentacja aktywnych źródeł zwiadu
 * - Metryki rzetelności w czasie rzeczywistym
 * - Kontrola nad procesem zbierania danych
 */

import { useState, useEffect } from 'react';

// ============================================================================
// TYPY
// ============================================================================

interface ReconTarget {
  id: string;
  url: string;
  name: string | null;
  target_type: 'webpage' | 'rss_feed' | 'api';
  category: string;
  enabled: boolean;
  reliability_bias: number;
  scan_interval_minutes: number;
  last_scan_at: string | null;
  total_scans: number;
  successful_scans: number;
  failed_scans: number;
  average_noise_level: number | null;
  average_certainty_score: number | null;
}

interface ScanResult {
  success: boolean;
  url: string;
  title?: string;
  extracted_text_length?: number;
  objects_created?: number;
  relations_created?: number;
  certainty_score?: number;
  error?: string;
}

// ============================================================================
// KOMPONENT GŁÓWNY
// ============================================================================

export function ReconPanel() {
  const [targets, setTargets] = useState<ReconTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  
  // Formularz nowego celu
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetType, setNewTargetType] = useState<'webpage' | 'rss_feed'>('webpage');
  
  // Pobierz cele zwiadu z bazy
  useEffect(() => {
    fetchTargets();
  }, []);
  
  async function fetchTargets() {
    try {
      setLoading(true);
      const response = await fetch('/api/recon/targets');
      const data = await response.json();
      
      if (data.success) {
        setTargets(data.data || []);
      } else {
        setError(data.error || 'Błąd pobierania celów');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  }
  
  // Dodaj nowy cel zwiadu
  async function handleAddTarget(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newTargetUrl) {
      setError('Podaj URL');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/recon/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newTargetUrl,
          name: newTargetName || null,
          target_type: newTargetType,
          category: 'other',
          enabled: true,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewTargetUrl('');
        setNewTargetName('');
        await fetchTargets();
      } else {
        setError(data.error || 'Błąd dodawania celu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  }
  
  // Skanuj pojedynczy URL
  async function handleScanUrl(url: string) {
    try {
      setScanning(true);
      setError(null);
      setScanResult(null);
      
      const response = await fetch('/api/recon/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      setScanResult(data);
      
      // Odśwież listę celów
      await fetchTargets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setScanning(false);
    }
  }
  
  // Sprawdź wszystkie RSS feeds (tylko lista, bez przetwarzania)
  async function handleCheckRSS() {
    try {
      setScanning(true);
      setError(null);
      setScanResult(null);
      
      const response = await fetch('/api/recon/rss-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processItems: false }),
      });
      
      const data = await response.json();
      
      if (data.total_items_found > 0) {
        setScanResult({
          success: true,
          url: 'RSS Feeds',
          title: `Znaleziono ${data.total_items_found} nowych wpisów`,
        });
      } else {
        setScanResult({
          success: true,
          url: 'RSS Feeds',
          title: 'Brak nowych wpisów',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setScanning(false);
    }
  }
  
  // Usuń cel
  async function handleDeleteTarget(id: string) {
    if (!confirm('Czy na pewno chcesz usunąć ten cel zwiadu?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/recon/targets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchTargets();
      } else {
        setError(data.error || 'Błąd usuwania celu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  }
  
  // Toggle enabled
  async function handleToggleEnabled(target: ReconTarget) {
    try {
      const response = await fetch('/api/recon/targets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: target.id,
          enabled: !target.enabled,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchTargets();
      } else {
        setError(data.error || 'Błąd aktualizacji');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    }
  }
  
  // Renderowanie
  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <header className="card-terminal p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-terminal-accent uppercase tracking-wider mb-2">
              [CENTRUM ZWIADU]
            </h1>
            <p className="text-terminal-muted text-sm">
              Receptor 2.0 - Autonomiczny Zwiadowca Informacyjny
            </p>
          </div>
          <div className="text-right text-xs text-terminal-muted">
            <div>Aktywnych źródeł: {targets.filter(t => t.enabled).length}</div>
            <div>Łącznie skanów: {targets.reduce((sum, t) => sum + t.total_scans, 0)}</div>
          </div>
        </div>
      </header>
      
      {/* Błędy */}
      {error && (
        <div className="card-terminal p-4 border-2 border-red-500 bg-red-500/10">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div className="flex-1">
              <h3 className="font-bold text-red-500 mb-1 uppercase">Błąd</h3>
              <p className="text-sm text-terminal-text">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs text-terminal-muted hover:text-terminal-text"
              >
                [Zamknij]
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Wynik ostatniego skanu */}
      {scanResult && (
        <div className={`card-terminal p-4 border-2 ${
          scanResult.success 
            ? 'border-control-cognitive bg-control-cognitive/10' 
            : 'border-red-500 bg-red-500/10'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{scanResult.success ? '✅' : '❌'}</span>
            <div className="flex-1">
              <h3 className="font-bold uppercase mb-2">
                {scanResult.success ? 'Skan zakończony pomyślnie' : 'Błąd skanu'}
              </h3>
              <div className="text-sm space-y-1">
                <div><strong>URL:</strong> {scanResult.url}</div>
                {scanResult.title && <div><strong>Tytuł:</strong> {scanResult.title}</div>}
                {scanResult.extracted_text_length !== undefined && (
                  <div><strong>Długość tekstu:</strong> {scanResult.extracted_text_length} znaków</div>
                )}
                {scanResult.objects_created !== undefined && (
                  <div><strong>Utworzono obiektów:</strong> {scanResult.objects_created}</div>
                )}
                {scanResult.relations_created !== undefined && (
                  <div><strong>Utworzono relacji:</strong> {scanResult.relations_created}</div>
                )}
                {scanResult.certainty_score !== undefined && (
                  <div><strong>Certainty Score:</strong> {scanResult.certainty_score.toFixed(2)}</div>
                )}
                {scanResult.error && (
                  <div className="text-red-500"><strong>Błąd:</strong> {scanResult.error}</div>
                )}
              </div>
              <button
                onClick={() => setScanResult(null)}
                className="mt-2 text-xs text-terminal-muted hover:text-terminal-text"
              >
                [Zamknij]
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Formularz dodawania nowego celu */}
      <section className="card-terminal p-6">
        <h2 className="text-xl font-bold text-terminal-accent uppercase tracking-wider mb-4">
          [1] Dodaj Nowe Źródło
        </h2>
        <form onSubmit={handleAddTarget} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-terminal-text mb-2">
                URL *
              </label>
              <input
                type="url"
                value={newTargetUrl}
                onChange={(e) => setNewTargetUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-2 bg-terminal-bg border border-terminal-border text-terminal-text font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-terminal-text mb-2">
                Nazwa (opcjonalna)
              </label>
              <input
                type="text"
                value={newTargetName}
                onChange={(e) => setNewTargetName(e.target.value)}
                placeholder="Moja strona"
                className="w-full px-4 py-2 bg-terminal-bg border border-terminal-border text-terminal-text font-mono"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-terminal-text mb-2">
              Typ źródła
            </label>
            <select
              value={newTargetType}
              onChange={(e) => setNewTargetType(e.target.value as 'webpage' | 'rss_feed')}
              className="w-full px-4 py-2 bg-terminal-bg border border-terminal-border text-terminal-text font-mono"
            >
              <option value="webpage">Strona WWW</option>
              <option value="rss_feed">Kanał RSS</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-terminal-accent text-terminal-bg font-bold uppercase tracking-wider hover:bg-terminal-accent/80 disabled:opacity-50"
          >
            {loading ? '[DODAWANIE...]' : '[DODAJ ŹRÓDŁO]'}
          </button>
        </form>
      </section>
      
      {/* Akcje szybkie */}
      <section className="card-terminal p-6">
        <h2 className="text-xl font-bold text-terminal-accent uppercase tracking-wider mb-4">
          [2] Akcje Szybkie
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCheckRSS}
            disabled={scanning}
            className="px-6 py-3 bg-control-cognitive text-white font-bold uppercase tracking-wider hover:bg-control-cognitive/80 disabled:opacity-50"
          >
            {scanning ? '[SKANOWANIE...]' : '[SPRAWDŹ RSS FEEDS]'}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-terminal-border text-terminal-text font-bold uppercase tracking-wider hover:bg-terminal-border/80"
          >
            [ODŚWIEŻ LISTĘ]
          </button>
        </div>
      </section>
      
      {/* Lista aktywnych źródeł */}
      <section className="card-terminal p-6">
        <h2 className="text-xl font-bold text-terminal-accent uppercase tracking-wider mb-4">
          [3] Aktywne Źródła ({targets.length})
        </h2>
        
        {loading && targets.length === 0 ? (
          <div className="text-center py-8 text-terminal-muted">
            [ŁADOWANIE...]
          </div>
        ) : targets.length === 0 ? (
          <div className="text-center py-8 text-terminal-muted">
            Brak źródeł. Dodaj pierwsze źródło powyżej.
          </div>
        ) : (
          <div className="space-y-4">
            {targets.map((target) => (
              <div
                key={target.id}
                className={`p-4 border-2 ${
                  target.enabled 
                    ? 'border-control-cognitive bg-control-cognitive/5' 
                    : 'border-terminal-border bg-terminal-border/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-terminal-text truncate">
                        {target.name || target.url}
                      </h3>
                      <span className="px-2 py-1 text-xs font-mono bg-terminal-bg border border-terminal-border">
                        {target.target_type}
                      </span>
                      {!target.enabled && (
                        <span className="px-2 py-1 text-xs font-mono bg-red-500/20 border border-red-500 text-red-500">
                          WYŁĄCZONE
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-terminal-muted mb-2 truncate">
                      {target.url}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-terminal-muted">Skany:</span>{' '}
                        <span className="font-bold">{target.total_scans}</span>
                      </div>
                      <div>
                        <span className="text-terminal-muted">Sukces:</span>{' '}
                        <span className="font-bold text-control-cognitive">
                          {target.successful_scans}
                        </span>
                      </div>
                      {target.average_certainty_score !== null && (
                        <div>
                          <span className="text-terminal-muted">Certainty:</span>{' '}
                          <span className="font-bold">
                            {target.average_certainty_score.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {target.average_noise_level !== null && (
                        <div>
                          <span className="text-terminal-muted">Noise:</span>{' '}
                          <span className="font-bold">
                            {target.average_noise_level.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleScanUrl(target.url)}
                      disabled={scanning}
                      className="px-3 py-1 text-xs bg-terminal-accent text-terminal-bg font-bold uppercase hover:bg-terminal-accent/80 disabled:opacity-50 whitespace-nowrap"
                    >
                      {scanning ? 'SKAN...' : 'SKANUJ'}
                    </button>
                    <button
                      onClick={() => handleToggleEnabled(target)}
                      className="px-3 py-1 text-xs bg-terminal-border text-terminal-text font-bold uppercase hover:bg-terminal-border/80 whitespace-nowrap"
                    >
                      {target.enabled ? 'WYŁĄCZ' : 'WŁĄCZ'}
                    </button>
                    <button
                      onClick={() => handleDeleteTarget(target.id)}
                      className="px-3 py-1 text-xs bg-red-500 text-white font-bold uppercase hover:bg-red-500/80 whitespace-nowrap"
                    >
                      USUŃ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

