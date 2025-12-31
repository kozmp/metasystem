# 🗄️ INSTRUKCJA AKTUALIZACJI BAZY DANYCH

## ⚠️ Wymagane kroki przed testowaniem

Baza danych wymaga aktualizacji o nowe kolumny dla Receptora 2.0.

---

## Opcja A: Supabase Dashboard (ZALECANA)

### Krok 1: Otwórz Supabase Dashboard

https://app.supabase.com/project/qqxgegdcygqrptuviwmo

### Krok 2: Przejdź do SQL Editor

Left menu → **SQL Editor**

### Krok 3: Utwórz nową query

Kliknij **New query**

### Krok 4: Skopiuj i uruchom

Otwórz plik:
```
schema-receptor-sources.sql
```

Skopiuj całą zawartość i wklej do SQL Editor.

### Krok 5: Wykonaj

Kliknij **Run** (lub Ctrl+Enter)

### Krok 6: Weryfikacja

Sprawdź czy zobaczysz:
```sql
✓ Rozszerzenie schema zakończone pomyślnie!
✓ total_targets: 5
✓ enabled_targets: 5
```

---

## Opcja B: psql (Linia komend)

### Jeśli masz zainstalowany psql:

```bash
# Ustaw zmienne (użyj swoich danych z Supabase)
$env:PGHOST = "db.qqxgegdcygqrptuviwmo.supabase.co"
$env:PGDATABASE = "postgres"
$env:PGUSER = "postgres"
$env:PGPASSWORD = "[YOUR_DATABASE_PASSWORD]"
$env:PGPORT = "5432"

# Uruchom schema
psql -f schema-receptor-sources.sql
```

---

## Co zostanie dodane?

### 1. Rozszerzenie istniejących tabel

**`raw_signals`:**
- `source_url TEXT`
- `source_title TEXT`
- `source_metadata JSONB`

**`correlations`:**
- `source_name TEXT`

### 2. Nowe tabele

**`recon_targets`** - Cele zwiadu
- Tracking URL/RSS sources
- Metryki skanowania
- Metryki rzetelności

**`recon_logs`** - Logi operacji zwiadu
- Historia skanów
- Success/failure tracking

### 3. Nowe obiekty

- Widok `v_recon_summary`
- Funkcja `update_recon_target_stats()`
- 5 przykładowych RSS feeds

---

## Weryfikacja po aktualizacji

Uruchom test ponownie:

```bash
$env:OPENROUTER_API_KEY="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"
$env:SUPABASE_URL="https://qqxgegdcygqrptuviwmo.supabase.co"
$env:SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeGdlZ2RjeWdxcnB0dXZpd21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjIzMjgsImV4cCI6MjA4MjA5ODMyOH0.AnRsFOgb-X9GCR9Dt3bEMNV_H_cxt_kUiUmGDFc2F4o"
npx tsx test-scraper.ts
```

Powinieneś zobaczyć:
```
✓ Utworzono obiektów: 2
✓ Utworzono relacji: 1
✓ Certainty Score: 0.90
✓ Raw Signal ID: [UUID]
```

---

## Po pomyślnej aktualizacji

Możesz uruchomić pełny test systemu:

### Test Centrum Zwiadu (UI):
```
http://localhost:4321/dashboard/recon
```

### Test RSS Monitora:
```bash
npx tsx test-rss.ts
```

---

**Status:** ⚠️ **WYMAGANA AKTUALIZACJA BAZY DANYCH**

Po aktualizacji system będzie w pełni funkcjonalny.

