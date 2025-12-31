# 🚀 RECEPTOR 2.0 - Szybki Start

## Krok 1: Instalacja Zależności

```bash
npm install
```

Nowe biblioteki dodane automatycznie:
- `cheerio` - Parsing i czyszczenie HTML
- `xml2js` - Parsing RSS/Atom feeds

## Krok 2: Aktualizacja Schematu Bazy Danych

Uruchom skrypt SQL w Supabase:

```bash
psql -h [YOUR_SUPABASE_HOST] -U postgres -d postgres -f schema-receptor-sources.sql
```

Lub w Supabase Dashboard → SQL Editor → Wklej zawartość `schema-receptor-sources.sql` → Run.

**Co zostanie dodane:**
- Tabela `recon_targets` - Cele zwiadu
- Tabela `recon_logs` - Logi operacji
- Rozszerzenie `raw_signals` o `source_url`, `source_title`, `source_metadata`
- Rozszerzenie `correlations` o `source_name`
- Widok `v_recon_summary` - Podsumowanie celów zwiadu
- Funkcja `update_recon_target_stats()` - Aktualizacja statystyk

## Krok 3: Uruchomienie Serwera Dev

```bash
npm run dev
```

Aplikacja uruchomi się na `http://localhost:4321`

## Krok 4: Dostęp do Centrum Zwiadu

Otwórz przeglądarkę:

```
http://localhost:4321/dashboard/recon
```

## Krok 5: Pierwsze Skanowanie

### Metoda A: Ręczne skanowanie URL

1. W sekcji **[1] Dodaj Nowe Źródło**:
   - Wpisz URL: `https://www.nature.com/articles/d41586-024-00001-0`
   - Nazwa: `Nature Article`
   - Typ: `Strona WWW`
   - Kliknij **[DODAJ ŹRÓDŁO]**

2. W sekcji **[3] Aktywne Źródła**:
   - Kliknij **[SKANUJ]** przy dodanym źródle
   - Poczekaj na wynik (15-30 sekund)

3. Sprawdź wynik:
   - Liczba utworzonych obiektów
   - Liczba utworzonych relacji
   - Certainty Score

### Metoda B: Monitoring RSS

1. Kliknij **[SPRAWDŹ RSS FEEDS]** w sekcji **[2] Akcje Szybkie**
2. System sprawdzi domyślne źródła RSS (Nature, MIT Tech Review, Hacker News, BBC, The Economist)
3. Zobaczysz listę nowych wpisów

## Krok 6: Weryfikacja w Dashboard

Wróć do głównego dashboard:

```
http://localhost:4321/dashboard
```

Sprawdź:
- **Statystyki** - Liczba nowych obiektów i relacji
- **Tabela Obiektów** - Nowe obiekty z metadanymi źródła
- **Graf Relacji** - Nowe relacje sterownicze

## Przykład: Test Scrapera z Terminala

```bash
# Utwórz plik test-scraper.ts
cat > test-scraper.ts << 'EOF'
import { scrapeAndProcess } from './src/lib/cybernetics/receptor/scraper';

async function test() {
  const url = 'https://news.ycombinator.com/item?id=38000000';
  console.log(`Testuję scraping: ${url}`);
  
  const result = await scrapeAndProcess(url);
  
  console.log('\n=== WYNIK ===');
  console.log(`Success: ${result.success}`);
  console.log(`Title: ${result.title}`);
  console.log(`Extracted text length: ${result.extracted_text_length}`);
  console.log(`Objects created: ${result.objects_created}`);
  console.log(`Relations created: ${result.relations_created}`);
  console.log(`Certainty score: ${result.certainty_score?.toFixed(2)}`);
  
  if (result.error) {
    console.error(`Error: ${result.error}`);
  }
}

test();
EOF

# Uruchom test
npx tsx test-scraper.ts
```

## Przykład: Test RSS Monitora z Terminala

```bash
# Utwórz plik test-rss.ts
cat > test-rss.ts << 'EOF'
import { checkFeeds } from './src/lib/cybernetics/receptor/rss-monitor';

async function test() {
  console.log('Testuję RSS Monitor (tryb LISTA - bez przetwarzania)...\n');
  
  const report = await checkFeeds(undefined, false);
  
  console.log('\n=== RAPORT ===');
  console.log(`Total sources: ${report.total_sources}`);
  console.log(`Sources checked: ${report.sources_checked}`);
  console.log(`Sources failed: ${report.sources_failed}`);
  console.log(`Total items found: ${report.total_items_found}`);
  console.log(`Total items processed: ${report.total_items_processed}`);
  
  console.log('\n=== SZCZEGÓŁY ŹRÓDEŁ ===');
  report.results.forEach(result => {
    console.log(`\n[${result.source.name}]`);
    console.log(`  Success: ${result.success}`);
    console.log(`  Items found: ${result.items_found}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    if (result.items.length > 0) {
      console.log(`  First item: ${result.items[0].title}`);
    }
  });
}

test();
EOF

# Uruchom test
npx tsx test-rss.ts
```

## Częste Problemy i Rozwiązania

### Problem: "OPENROUTER_API_KEY nie jest ustawiony"

**Rozwiązanie:**
Sprawdź plik `.env`:
```env
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

### Problem: "Błąd połączenia z Supabase"

**Rozwiązanie:**
Sprawdź `.env`:
```env
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
```

### Problem: "Tabela recon_targets nie istnieje"

**Rozwiązanie:**
Uruchom `schema-receptor-sources.sql` w Supabase SQL Editor.

### Problem: "Timeout przy scrapingu"

**Rozwiązanie:**
- Sprawdź połączenie internetowe
- Spróbuj innego URL
- Zwiększ timeout w `scraper.ts`:
  ```typescript
  const SCRAPER_CONFIG = {
    TIMEOUT_MS: 30000, // Zwiększ do 30s
    // ...
  };
  ```

### Problem: "Nie udało się wyekstrahować treści ze strony"

**Rozwiązanie:**
- Strona może wymagać JavaScript (np. SPA)
- Spróbuj innego URL
- Sprawdź czy strona nie blokuje botów

## Wskazówki Użytkowania

### 1. Wybór Źródeł

**Dobre źródła:**
- Artykuły naukowe (Nature, Science, arXiv)
- Artykuły techniczne (MIT Tech Review, Ars Technica)
- Blogi eksperckie
- Oficjalne dokumenty/raporty

**Problematyczne źródła:**
- Strony wymagające JavaScript
- Strony za paywall
- Strony z dużą ilością reklam
- Fora/social media (wymaga specjalnej obsługi)

### 2. Interpretacja Metryk

**Certainty Score:**
- `0.8-1.0` - Wysoka rzetelność (tekst naukowy, faktograficzny)
- `0.5-0.8` - Średnia rzetelność (tekst mieszany)
- `0.0-0.5` - Niska rzetelność (tekst ideologiczny, opiniotwórczy)

**Noise Level:**
- `0.0-0.3` - Tekst czysty (CLEAR)
- `0.3-0.6` - Tekst z szumem (WARNING)
- `0.6-1.0` - Tekst mętny (REJECT)

### 3. Best Practices

1. **Zacznij od RSS** - Monitoring RSS jest mniej inwazyjny
2. **Testuj na małych fragmentach** - Nie przetwarzaj od razu 100 artykułów
3. **Sprawdzaj Dashboard** - Weryfikuj czy obiekty są poprawnie wyekstrahowane
4. **Używaj kategorii** - Organizuj źródła według kategorii (science, tech, news)
5. **Monitoruj noise level** - Jeśli źródło ma wysoki noise, rozważ wyłączenie

## Następne Kroki

Po uruchomieniu Receptora 2.0:

1. **Eksperymentuj z różnymi źródłami**
   - Dodaj swoje ulubione blogi
   - Przetestuj różne typy treści

2. **Analizuj wyniki w Dashboard**
   - Sprawdź graf relacji
   - Zidentyfikuj najważniejsze obiekty (wysokie steering_potential)

3. **Zweryfikuj sprzeczności w Homeostacie**
   - System automatycznie wykrywa sprzeczności
   - Sprawdź alerty w Dashboard

4. **Rozszerz schemat o własne kategorie**
   - Dodaj nowe typy obiektów
   - Dostosuj klasyfikację do swoich potrzeb

## Dokumentacja

Pełna dokumentacja techniczna:
- `src/lib/cybernetics/receptor/RECEPTOR-2.0-README.md`

Dokumentacja API:
- GET/POST/PUT/DELETE `/api/recon/targets`
- POST `/api/recon/scrape`
- POST `/api/recon/rss-check`

## Support

W przypadku problemów:
1. Sprawdź logi terminala (`npm run dev`)
2. Sprawdź logi przeglądarki (Console)
3. Sprawdź `.env` - czy wszystkie klucze są ustawione
4. Sprawdź Supabase - czy tabele istnieją

---

**Status:** ✅ Gotowe do użycia

**Wersja:** 2.0.0

**Data:** 2024-12-31

**Rygor:** Zgodne z Metacybernetyką doc. Józefa Kosseckiego

