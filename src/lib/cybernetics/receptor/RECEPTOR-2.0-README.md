# RECEPTOR 2.0 - Autonomiczny Zwiadowca

**Implementacja zgodna z Metacybernetyką doc. Józefa Kosseckiego**

---

## 🎯 Cel

Receptor 2.0 to rozszerzenie systemu o autonomiczne zdolności zbierania danych z zewnętrznych źródeł informacyjnych. Zgodnie z teorią Kosseckiego, Receptor jest pierwszym ogniwem w łańcuchu sterowania cybernetycznego:

```
OTOCZENIE → RECEPTOR → KORELATOR → HOMEOSTAT → EFEKTOR
```

## 📦 Komponenty

### 1. **Scraper** (`scraper.ts`)

Silnik do pobierania i czyszczenia treści ze stron WWW.

**Funkcje:**
- `scrapeURL(url: string)` - Pobiera i czyści HTML ze strony
- `scrapeAndProcess(url: string)` - Pełny cykl: scraping → Receptor → Korelator

**Proces czyszczenia:**
1. Pobranie HTML (fetch z timeoutem 15s)
2. Usunięcie tagów `<script>`, `<style>`, `<nav>`, reklam
3. Ekstrakcja głównej treści (`<article>`, `<main>`)
4. Normalizacja białych znaków
5. Ekstrakcja metadanych (tytuł, autor, data publikacji)

**Konfiguracja:**
```typescript
const SCRAPER_CONFIG = {
  TIMEOUT_MS: 15000,           // Timeout na pobranie strony
  MAX_CONTENT_LENGTH: 50000,   // Max długość tekstu (zgodne z limitem Receptora)
  USER_AGENT: 'KOSSECKI-METASYSTEM/1.0',
  MAX_REDIRECTS: 3,
};
```

**Przykład użycia:**
```typescript
import { scrapeAndProcess } from './scraper';

const result = await scrapeAndProcess('https://example.com/article');
console.log(result.objects_created);  // Liczba wyekstrahowanych obiektów
console.log(result.relations_created); // Liczba wyekstrahowanych relacji
console.log(result.certainty_score);   // Waga rzetelności (0-1)
```

---

### 2. **RSS Monitor** (`rss-monitor.ts`)

Moduł do monitorowania kanałów RSS/Atom.

**Funkcje:**
- `processRSSFeed(source: RSSSource)` - Przetwarza pojedynczy feed RSS
- `checkFeeds(sources?: RSSSource[])` - Sprawdza wszystkie źródła RSS

**Domyślne źródła:**
- **Nauka:** Nature, MIT Technology Review
- **Technologia:** Hacker News
- **Wiadomości:** Reuters, BBC News
- **Ekonomia:** Financial Times, The Economist

**Konfiguracja:**
```typescript
const RSS_CONFIG = {
  TIMEOUT_MS: 10000,           // Timeout na pobranie RSS
  MAX_ITEMS_PER_FEED: 10,      // Max liczba wpisów do przetworzenia
  USER_AGENT: 'KOSSECKI-METASYSTEM/1.0 RSS Monitor',
};
```

**Przykład użycia:**
```typescript
import { checkFeeds } from './rss-monitor';

// Tryb LISTA - tylko sprawdź co jest nowego (bez przetwarzania)
const report = await checkFeeds(undefined, false);
console.log(`Znaleziono ${report.total_items_found} nowych wpisów`);

// Tryb PEŁNY - przetworz wszystko przez Receptor → Korelator
const fullReport = await checkFeeds(undefined, true);
console.log(`Przetworzono ${fullReport.total_items_processed} wpisów`);
```

---

### 3. **UI - Centrum Zwiadu** (`/dashboard/recon`)

Interfejs użytkownika dla zarządzania autonomicznym zwiadem.

**Sekcje:**
1. **Dodaj Nowe Źródło** - Formularz do dodawania URL/RSS
2. **Akcje Szybkie** - Przyciski do szybkich operacji (sprawdź RSS, odśwież)
3. **Aktywne Źródła** - Lista celów zwiadu z metrykami

**Metryki rzetelności:**
- **Certainty Score** - Waga rzetelności (1.0 - noise_level)
- **Noise Level** - Poziom szumu semantycznego (0.0 = czyste, 1.0 = bełkot)
- **Sukces/Porażka** - Historia skanów
- **Ostatni skan** - Timestamp ostatniego skanu

---

## 🗄️ Schemat Bazy Danych

### Nowe tabele

#### `recon_targets`
Cele autonomicznego zwiadu - strony/RSS do monitorowania.

```sql
CREATE TABLE recon_targets (
    id UUID PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    target_type TEXT CHECK (target_type IN ('webpage', 'rss_feed', 'api')),
    name TEXT,
    category TEXT, -- 'news', 'science', 'tech', 'politics', 'economics', 'other'
    enabled BOOLEAN DEFAULT true,
    -- Metryki zwiadu
    last_scan_at TIMESTAMPTZ,
    next_scan_at TIMESTAMPTZ,
    scan_interval_minutes INTEGER DEFAULT 60,
    total_scans INTEGER DEFAULT 0,
    successful_scans INTEGER DEFAULT 0,
    failed_scans INTEGER DEFAULT 0,
    -- Metryki rzetelności
    average_noise_level FLOAT,
    average_certainty_score FLOAT,
    reliability_bias FLOAT DEFAULT 0.5, -- Wstępny bias rzetelności
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `recon_logs`
Logi operacji zwiadu - historia skanowania.

```sql
CREATE TABLE recon_logs (
    id UUID PRIMARY KEY,
    target_id UUID REFERENCES recon_targets(id),
    scan_type TEXT CHECK (scan_type IN ('manual', 'automatic', 'scheduled')),
    success BOOLEAN NOT NULL,
    items_found INTEGER DEFAULT 0,
    items_processed INTEGER DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Rozszerzenia istniejących tabel

#### `raw_signals` - dodano tracking źródła
```sql
ALTER TABLE raw_signals 
ADD COLUMN source_url TEXT,
ADD COLUMN source_title TEXT,
ADD COLUMN source_metadata JSONB DEFAULT '{}';
```

---

## 🔌 API Endpoints

### `POST /api/recon/scrape`

Scraping pojedynczego URL.

**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com/article",
  "title": "Tytuł artykułu",
  "extracted_text_length": 5234,
  "objects_created": 12,
  "relations_created": 8,
  "certainty_score": 0.85,
  "raw_signal_id": "uuid-here"
}
```

---

### `POST /api/recon/rss-check`

Sprawdzanie kanałów RSS.

**Request:**
```json
{
  "processItems": false,  // true = przetwórz wszystko, false = tylko lista
  "sources": [...]        // opcjonalnie, domyślnie DEFAULT_RSS_SOURCES
}
```

**Response:**
```json
{
  "total_sources": 7,
  "sources_checked": 7,
  "sources_failed": 1,
  "total_items_found": 45,
  "total_items_processed": 0,
  "results": [...],
  "errors": [...]
}
```

---

### `GET /api/recon/targets`

Pobierz wszystkie cele zwiadu.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "url": "https://example.com",
      "name": "Example Site",
      "target_type": "webpage",
      "enabled": true,
      "total_scans": 10,
      "successful_scans": 8,
      "average_certainty_score": 0.75
    }
  ]
}
```

---

### `POST /api/recon/targets`

Dodaj nowy cel zwiadu.

**Request:**
```json
{
  "url": "https://example.com",
  "name": "Example Site",
  "target_type": "webpage",
  "category": "news",
  "reliability_bias": 0.7,
  "scan_interval_minutes": 60,
  "enabled": true
}
```

---

### `PUT /api/recon/targets`

Aktualizuj cel zwiadu.

**Request:**
```json
{
  "id": "uuid",
  "enabled": false
}
```

---

### `DELETE /api/recon/targets`

Usuń cel zwiadu.

**Request:**
```json
{
  "id": "uuid"
}
```

---

## 🔄 Przepływ Danych

### Scraping pojedynczego URL

```
1. [USER] Kliknie [SKANUJ] w UI
     ↓
2. [FRONTEND] POST /api/recon/scrape { url: "..." }
     ↓
3. [SCRAPER] scrapeAndProcess(url)
     ↓
4. [SCRAPER] Pobranie HTML, czyszczenie, ekstrakcja metadanych
     ↓
5. [RECEPTOR] Transformacja tekstu → obiekty + relacje (AI)
     ↓
6. [KORELATOR] Zapis w bazie:
     - raw_signals (tekst + metadane źródła)
     - cybernetic_objects (obiekty)
     - correlations (relacje)
     ↓
7. [HOMEOSTAT] Detekcja sprzeczności (opcjonalne)
     ↓
8. [FRONTEND] Wyświetlenie wyniku
```

### Monitoring RSS

```
1. [USER] Kliknie [SPRAWDŹ RSS FEEDS] w UI
     ↓
2. [FRONTEND] POST /api/recon/rss-check { processItems: false }
     ↓
3. [RSS MONITOR] checkFeeds(sources, processItems=false)
     ↓
4. [RSS MONITOR] Dla każdego źródła RSS:
     - Pobranie XML
     - Parsowanie (RSS 2.0 lub Atom)
     - Ekstrakcja wpisów (title, link, description, pubDate)
     ↓
5. [FRONTEND] Wyświetlenie listy nowych wpisów
```

---

## 🧪 Testowanie

### Test scrapera

```bash
npx tsx src/lib/cybernetics/receptor/scraper-test.ts
```

### Test RSS monitora

```bash
npx tsx src/lib/cybernetics/receptor/rss-test.ts
```

### Test full cycle

```typescript
import { scrapeAndProcess } from './scraper';

const result = await scrapeAndProcess('https://www.nature.com/articles/d41586-024-00001-0');
console.log(JSON.stringify(result, null, 2));
```

---

## ⚙️ Konfiguracja

### Zmienne środowiskowe

Wszystkie zmienne z `.env` pozostają bez zmian. Receptor 2.0 używa istniejącej infrastruktury:
- `OPENROUTER_API_KEY` - Klucz do OpenRouter (dla Receptora AI)
- `SUPABASE_URL` - URL Supabase (dla Korelatora)
- `SUPABASE_ANON_KEY` - Klucz Supabase

### Instalacja zależności

```bash
npm install cheerio xml2js
```

---

## 🚨 Rygor Kosseckiego

### 1. Tracking Pochodzenia

**Każdy obiekt musi mieć śledzenie źródła:**
- `raw_signals.source_url` - URL źródłowy
- `raw_signals.source_title` - Tytuł źródła
- `raw_signals.source_metadata` - Autor, data publikacji, opis

### 2. Anti-Ideology Tuning

**System automatycznie wykrywa przymiotniki wartościujące:**
- "sprawiedliwy", "niesprawiedliwy"
- "dobry", "zły", "słuszny", "błędny"
- "postępowy", "reakcyjny", "nowoczesny", "przestarzały"

**Jeśli tekst zawiera wysokie nasycenie ideologiczne:**
- `semantic_noise_level >= 0.6`
- `signal_status = "WARNING"` lub `"REJECT"`
- `is_ambiguous = true`

### 3. Waga Rzetelności

**Certainty Score = 1.0 - Semantic Noise Level**

Przykłady:
- Tekst naukowy (noise 0.1) → certainty 0.9
- Tekst mieszany (noise 0.5) → certainty 0.5
- Tekst ideologiczny (noise 0.8) → certainty 0.2

### 4. Klasyfikacja Systemowa

**Każdy obiekt ma typ systemu sterowania:**
- `cognitive` - System poznawczy (nauka, badania, fakty)
- `ideological` - System ideologiczny (propaganda, doktryna)
- `ethical` - System etyczny (normy, wartości)
- `economic` - System gospodarczy (biznes, zysk)

---

## 📊 Metryki Systemowe

### Metryki celów zwiadu

Każdy cel (`recon_target`) ma automatycznie obliczane:
- `total_scans` - Łączna liczba skanów
- `successful_scans` - Liczba udanych skanów
- `failed_scans` - Liczba nieudanych skanów
- `average_noise_level` - Średni poziom szumu
- `average_certainty_score` - Średnia waga rzetelności

### Funkcja aktualizacji statystyk

```sql
SELECT update_recon_target_stats(
    p_target_id := 'uuid',
    p_success := true,
    p_noise_level := 0.3,
    p_certainty_score := 0.7
);
```

---

## 🔮 Przyszłe Rozszerzenia

### 1. Automatyczny Scheduler (Cron)

Automatyczne skanowanie celów zgodnie z `scan_interval_minutes`.

```typescript
// TODO: Implementacja w src/lib/cybernetics/receptor/scheduler.ts
export async function scheduledScan() {
  const targets = await getTargetsDueForScan();
  for (const target of targets) {
    await scanTarget(target);
  }
}
```

### 2. Webhook Support

Możliwość rejestracji webhooków dla powiadomień o nowych danych.

### 3. API Key Management

Obsługa wielu kluczy API dla różnych źródeł (np. Twitter API, Reddit API).

### 4. Advanced Filtering

Filtrowanie wpisów RSS na podstawie słów kluczowych przed przetwarzaniem.

---

## 📚 Dokumentacja Teorii

**Metacybernetyka - Cybernetyka Drugiego Rzędu**  
doc. Józef Kossecki

**Kluczowe pojęcia:**
- **Receptor** - Organ wejściowy systemu, odbiera bodźce z otoczenia
- **Korelator** - Pamięć operacyjna, zapisuje i koreluje informacje
- **Homeostat** - Mechanizm homeostazy, weryfikuje rzetelność
- **Efektor** - Organ wyjściowy, prezentuje wyniki

---

## ✅ Checklist Implementacji

- [x] Scraper (scraper.ts)
- [x] RSS Monitor (rss-monitor.ts)
- [x] Schema rozszerzenia (schema-receptor-sources.sql)
- [x] API Endpoints (/api/recon/*)
- [x] UI - Centrum Zwiadu (/dashboard/recon)
- [x] Komponent React (ReconPanel.tsx)
- [x] Tracking źródeł w Korelatorze
- [x] Dokumentacja (ten plik)
- [ ] Testy jednostkowe
- [ ] Automatyczny scheduler
- [ ] Webhook support

---

**Status:** ✅ **IMPLEMENTACJA ZAKOŃCZONA**

**Data:** 2024-12-31

**Autor:** AI Assistant (Cursor + Claude Sonnet 4.5)

**Rygor:** Zgodne z Metacybernetyką doc. Józefa Kosseckiego

