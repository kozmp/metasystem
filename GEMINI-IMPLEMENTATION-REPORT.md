# 🎬 RAPORT IMPLEMENTACJI: GEMINI 1.5 PRO INTEGRATION

**Data:** 2026-01-03  
**Status:** ✅ **COMPLETE** - Gotowe do testów (wymaga klucza API)  
**Zgodność:** Metacybernetyka 2015 - doc. Józef Kossecki

---

## 📊 PODSUMOWANIE WYKONAWCZE

Zaimplementowano **kompletny pipeline multimodalnej analizy wideo** z integracją:
- **Gemini 1.5 Pro** (Google AI) → analiza treści wideo
- **Rust/Wasm** → obliczenia mocy P = v × a × c
- **Supabase** → zapis obiektów + flaga propagandy

### Kluczowe Funkcjonalności:
✅ Analiza wideo YouTube przez AI (multimodalna)  
✅ Klasyfikacja cywilizacyjna (Latin/Byzantine/Turandot)  
✅ Detekcja propagandy (Z > 1.5 → alert)  
✅ Obliczenia mocy w Rust  
✅ API REST endpoint (`/api/video/analyze`)  
✅ React UI komponent (VideoAnalyzer)  
✅ Batch processing (wiele wideo)

---

## 🗂️ STRUKTURA PLIKÓW

### Utworzone pliki (9):

```
C:\projekty\KOSSECKI METASYSTEM (KMS)\
├── .env.local                                     # ✅ Zmienne środowiskowe (klucz Gemini)
├── GEMINI-INTEGRATION-GUIDE.md                    # ✅ Instrukcja użytkowania
├── src\
│   ├── lib\cybernetics\receptor\
│   │   ├── gemini_service.ts                      # ✅ Receptor multimodalny (Gemini)
│   │   └── video_pipeline.ts                      # ✅ Pipeline: Gemini → Rust → Supabase
│   ├── lib\cybernetics\wasm_core\
│   │   ├── bridge.ts                              # ✅ Rozszerzono: calculateTotalPowerWasm()
│   │   └── src\lib.rs                             # ✅ Rozszerzono: wasm_calculate_power()
│   ├── components\cybernetics\
│   │   └── VideoAnalyzer.tsx                      # ✅ React UI (analiza wideo)
│   ├── pages\
│   │   ├── api\video\analyze.ts                   # ✅ API Endpoint (POST /api/video/analyze)
│   │   └── test-video-analyzer.astro              # ✅ Strona testowa (/test-video-analyzer)
│   └── scripts\
│       └── test-gemini.ts                         # ✅ Skrypt testowy CLI
└── package.json                                   # ✅ Zaktualizowano: +@google/generative-ai
```

---

## 🧩 ARCHITEKTURA SYSTEMU

### LAYER 1: RECEPTOR (Gemini Service)
**Plik:** `src/lib/cybernetics/receptor/gemini_service.ts`

**Funkcjonalności:**
- **METAPROMPT_2015**: Kompletny prompt z 8 aksjomatami Kosseckiego
- **processVideo(url)**: Wysyła wideo do Gemini 1.5 Pro
- **Walidacja Zod**: Receptor Layer zgodnie z rygorem
- **Flaga propagandy**: Automatyczna detekcja Z > 1.5

**Parametry wyjściowe:**
```typescript
{
  power_v: number;              // Moc jednostkowa [W]
  quality_a: number;            // Jakość (0-1)
  mass_c: number;               // Zasięg/ilość
  total_power_p: number;        // P = v × a × c [W]
  civilization_code: string;    // latin | byzantine | turandot | mixed
  control_system_type: string;  // cognitive | ideological | ethical | economic
  distortion_z: number;         // Z = I_in / I_real
  visual_symbols: string[];     // Symbole w wideo
  reasoning: string;            // Uzasadnienie AI
}
```

### LAYER 2: HOMEOSTAT (Video Pipeline)
**Plik:** `src/lib/cybernetics/receptor/video_pipeline.ts`

**Funkcjonalności:**
- **processVideoAndStore()**: Pipeline end-to-end
- Integracja Gemini → Rust → Supabase
- Automatyczny zapis do `cybernetic_objects`
- Utworzenie alertu w `system_alerts` (jeśli Z > 1.5)
- **processMultipleVideos()**: Batch processing

**Flow:**
```
1. YouTube URL
   ↓
2. Gemini 1.5 Pro → [v, a, c, Z, civilization_code, ...]
   ↓
3. Rust/Wasm → calculate_power(v, a, c) = P
   ↓
4. Supabase → INSERT INTO cybernetic_objects
   ↓
5. IF Z > 1.5 → INSERT INTO system_alerts (HIGH_PROPAGANDA_RISK)
```

### LAYER 3: WASM BRIDGE (Rust Integration)
**Pliki:**
- `src/lib/cybernetics/wasm_core/bridge.ts`
- `src/lib/cybernetics/wasm_core/src/lib.rs`

**Rozszerzenia:**
- **calculateTotalPowerWasm()**: Most TS → Rust
- **wasm_calculate_power()**: Funkcja Rust eksportowana do Wasm
- **Smart Fallback**: Jeśli Wasm fail → obliczenia w TypeScript

**Rust Function:**
```rust
#[wasm_bindgen]
pub fn wasm_calculate_power(power_v: f64, quality_a: f64, mass_c: f64) -> f64 {
    calculate_power(power_v, quality_a, mass_c) // P = v × a × c
}
```

### LAYER 4: EFEKTOR (UI & API)
**Pliki:**
- `src/pages/api/video/analyze.ts` (API)
- `src/components/cybernetics/VideoAnalyzer.tsx` (UI)
- `src/pages/test-video-analyzer.astro` (Strona testowa)

**API Endpoint:**
```
POST /api/video/analyze
Content-Type: application/json

{
  "youtubeUrl": "https://youtube.com/watch?v=...",
  "useWasm": true,
  "autoStore": true
}
```

**Response:**
```json
{
  "power_v": 1000.0,
  "quality_a": 0.3,
  "mass_c": 5.5,
  "total_power_p": 1650.0,
  "civilization_code": "byzantine",
  "control_system_type": "ideological",
  "distortion_z": 2.1,
  "visual_symbols": ["red_flags", "military_uniforms"],
  "reasoning": "High ideological content with emotional amplification...",
  "propaganda_warning": true,
  "stored_object_id": "uuid-xxxx-xxxx"
}
```

---

## 🚀 INSTRUKCJA UŻYTKOWANIA

### KROK 1: Dodaj Klucz API Gemini

1. Wejdź na: https://aistudio.google.com/app/apikey
2. Zaloguj się przez Google
3. Kliknij **"Create API Key"**
4. Skopiuj klucz

5. Edytuj `.env.local`:
```bash
GEMINI_API_KEY=AIzaSy... # <-- Wklej swój klucz tutaj
```

### KROK 2: Uruchom Dev Server
```bash
npm run dev
```

### KROK 3: Testuj

#### Opcja A: UI (przeglądarka)
```
http://localhost:4321/test-video-analyzer
```

#### Opcja B: CLI (terminal)
```bash
npx tsx src/scripts/test-gemini.ts
```

#### Opcja C: API (cURL)
```bash
curl -X POST http://localhost:4321/api/video/analyze \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl":"https://youtube.com/watch?v=dQw4w9WgXcQ"}'
```

#### Opcja D: TypeScript (kod)
```typescript
import { processVideoAndStore } from '@/lib/cybernetics/receptor/video_pipeline';

const result = await processVideoAndStore(
  'https://youtube.com/watch?v=...',
  { useWasm: true, autoStore: true }
);

console.log(result);
```

---

## 📚 METAPROMPT 2015 - AKSJOMATYKA

Implementacja zgodna z **8 aksjomatami teorii poznania** Kosseckiego:

| Aksjomat | Implementacja |
|----------|---------------|
| **1. Obiekt ≠ atrybuty** | ✅ Obiekt definiowany przez relacje (graph) |
| **2. Obiekt = węzeł relacji** | ✅ Korelacje w bazie (correlations) |
| **3. Informacja = różnica potencjałów** | ✅ Distortion Z = I_in / I_real |
| **4. P = v × a × c** | ✅ Obliczenia w Rust (ILOCZYN!) |
| **5. Dominujący system sterowania** | ✅ control_system_type (cognitive/ideological/...) |
| **6. Sprzężenie zwrotne** | ✅ Feedback w grafie wpływów |
| **7. Retencja przez korelacje** | ✅ Recursive CTE w Postgres |
| **8. Z > 1 → propaganda** | ✅ Flaga HIGH_PROPAGANDA_RISK |

### Klasyfikacja Cywilizacyjna:
- **Latin**: Prawo > Władza (system poznawczy)
- **Byzantine**: Władza > Prawo (system ideologiczny/etyczny)
- **Turandot**: Gospodarczo-ideologiczny (utylitaryzm)

---

## 🧪 TESTY

### Test 1: CLI
```bash
npx tsx src/scripts/test-gemini.ts
```

**Oczekiwany output:**
```
🔬 Testing Gemini Integration...
========================================
[VIDEO PIPELINE] Starting analysis: https://youtube.com/...
[GEMINI RECEPTOR] Processing video...
[WASM] Power calculation completed in 0.23ms
[VIDEO PIPELINE] ✓ Stored as object: uuid-xxxx

✅ SUCCESS!
Total Power P = 1650.00 W
Propaganda Warning: ⚠️ YES
```

### Test 2: API
```bash
curl -X POST http://localhost:4321/api/video/analyze \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl":"https://youtube.com/watch?v=TEST"}'
```

### Test 3: UI
1. Otwórz: http://localhost:4321/test-video-analyzer
2. Wklej URL YouTube
3. Kliknij "Analizuj Wideo"
4. Sprawdź wyniki

---

## 📊 WYNIKI W SUPABASE

### Tabela: `cybernetic_objects`
```sql
SELECT 
  id,
  name,
  power_v,
  quality_a,
  mass_c,
  total_power_p,  -- GENERATED COLUMN = v × a × c
  civilization_code,
  control_system_type,
  created_at
FROM cybernetic_objects
WHERE name LIKE 'Video:%'
ORDER BY created_at DESC
LIMIT 10;
```

### Tabela: `system_alerts` (propaganda)
```sql
SELECT 
  id,
  object_id,
  alert_type,          -- 'HIGH_PROPAGANDA_RISK'
  severity,            -- 'high'
  message,
  metadata->>'distortion_z' AS Z,
  metadata->>'youtube_url' AS video_url,
  created_at
FROM system_alerts
WHERE alert_type = 'HIGH_PROPAGANDA_RISK'
ORDER BY created_at DESC;
```

---

## ⚠️ UWAGI TECHNICZNE

### 1. Rate Limits Gemini
- **Free tier**: 60 requests/minute
- **Paid tier**: Wyższe limity
- Dla batch processing użyj `{ parallel: false }`

### 2. Obsługa Wideo przez URL
Gemini 1.5 Pro **może** analizować wideo z URL YouTube bezpośrednio.

Jeśli nie działa:
- Pobierz wideo lokalnie (yt-dlp)
- Konwertuj na base64
- Wyślij jako `inlineData`

### 3. Fallback TypeScript
Jeśli Wasm nie działa:
- Automatyczny fallback na TS
- Funkcjonalność zachowana
- Tylko wolniejsze obliczenia

### 4. Koszty API
Gemini 1.5 Pro (free tier):
- 50 requests/day (wideo)
- Po przekroczeniu → 429 Too Many Requests

---

## 🐛 TROUBLESHOOTING

### Problem: "GEMINI_API_KEY not found"
**Rozwiązanie:**
1. Sprawdź `.env.local`
2. Restart dev server: `npm run dev`
3. Dla client-side w Astro: prefix `PUBLIC_GEMINI_API_KEY`

### Problem: "Invalid JSON from Gemini"
**Rozwiązanie:**
- Zwiększ `temperature` w `gemini_service.ts`
- Dodaj retry logic
- Sprawdź rate limits

### Problem: Wasm nie działa
**Rozwiązanie:**
1. Sprawdź `src/lib/cybernetics/wasm_core/pkg/`
2. Jeśli brak → build: `wasm-pack build --target web`
3. Lub użyj `{ useWasm: false }`

### Problem: "Failed to store in Supabase"
**Rozwiązanie:**
- Sprawdź klucze Supabase w `.env.local`
- Sprawdź schemat: `schema.sql` musi być wykonany
- Sprawdź RLS policies w Supabase

---

## 🎯 ZGODNOŚĆ Z RYGOREM KOSSECKIEGO

✅ **P = v × a × c** (ILOCZYN, nie suma!)  
✅ **Z = I_in / I_real** (Zniekształcenie informacyjne)  
✅ **Klasyfikacja cywilizacyjna** (Latin/Byzantine/Turandot)  
✅ **System sterowania** (Cognitive/Ideological/Ethical/Economic)  
✅ **Receptor Layer** (Walidacja Zod)  
✅ **Homeostat Layer** (Flaga HIGH_PROPAGANDA_RISK)  
✅ **Korelator Layer** (Graf wpływów w Rust)  
✅ **Efektor Layer** (UI + API)  

---

## 📈 METRYKI WYDAJNOŚCI (estymacja)

| Operacja | Czas | Technologia |
|----------|------|-------------|
| Gemini analiza wideo | ~10-30s | Google AI Cloud |
| Obliczenia mocy (Wasm) | <1ms | Rust/Wasm |
| Obliczenia mocy (TS) | ~5ms | TypeScript |
| Zapis Supabase | ~100-200ms | PostgreSQL |
| **TOTAL (end-to-end)** | **~15-35s** | Pełny pipeline |

---

## 🔮 NASTĘPNE KROKI (OPCJONALNE)

1. **Queue System**: BullMQ dla background jobs
2. **Webhook**: Automatyczna analiza po uploadu
3. **Gemini Vision**: Rozszerz o analizy obrazów
4. **Rust Optimization**: Więcej funkcji w Wasm
5. **Caching**: Redis dla powtarzalnych zapytań
6. **Dashboard**: Statystyki propagandy w czasie rzeczywistym

---

## ✅ CHECKLIST FINALNY

- [x] ✅ Instalacja `@google/generative-ai`
- [x] ✅ Utworzenie `gemini_service.ts` z METAPROMPT 2015
- [x] ✅ Implementacja `processVideo()` (multimodal)
- [x] ✅ Rozszerzenie `bridge.ts` o `calculateTotalPowerWasm()`
- [x] ✅ Rozszerzenie `lib.rs` o `wasm_calculate_power()`
- [x] ✅ Utworzenie `video_pipeline.ts` (full integration)
- [x] ✅ API Endpoint `/api/video/analyze`
- [x] ✅ React UI `VideoAnalyzer.tsx`
- [x] ✅ Strona testowa `/test-video-analyzer`
- [x] ✅ Skrypt testowy CLI `test-gemini.ts`
- [x] ✅ Dokumentacja `GEMINI-INTEGRATION-GUIDE.md`
- [x] ✅ Szablon `.env.local`

---

**Autor:** Cursor AI + Senior Fullstack Engineer  
**Zgodność:** Metacybernetyka 2015 - doc. Józef Kossecki  
**Data:** 2026-01-03  
**Status:** ✅ COMPLETE - Ready for Testing

---

**UWAGA:** Aby system działał, **musisz dodać klucz GEMINI_API_KEY** do `.env.local`!

