# 🗄️ INSTRUKCJA AKTUALIZACJI BAZY DANYCH

## ⚠️ Wymagane kroki przed testowaniem

Baza danych wymaga aktualizacji o nowe kolumny dla Receptora 2.0.

---

## Opcja A: Supabase Dashboard (ZALECANA)

### Krok 1: Otwórz Supabase Dashboard

Przejdź do swojego projektu Supabase.

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
# Ustaw zmienne środowiskowe z Twojego pliku .env
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

Uruchom serwer dev:

```bash
npm run dev
```

Otwórz Centrum Zwiadu:
```
http://localhost:4321/dashboard/recon
```

Powinieneś móc:
- Dodawać nowe źródła
- Skanować URL-e
- Sprawdzać RSS feeds

---

## Po pomyślnej aktualizacji

Możesz uruchomić pełny test systemu w UI.

---

**Status:** ✅ Po aktualizacji system będzie w pełni funkcjonalny.

