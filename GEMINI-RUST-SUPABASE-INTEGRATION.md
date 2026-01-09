# 🎯 INTEGRACJA GEMINI + RUST + SUPABASE - Instrukcja Uruchomienia

**KOSSECKI METASYSTEM (KMS) - Metacybernetyka 2015**

---

## ✅ STATUS: System GOTOWY do użycia

Wszystkie komponenty zostały zintegrowane zgodnie z rygorem Metacybernetyki 2015.

---

## 📋 Struktura Integracji

```
YouTube URL
    ↓
[GEMINI 1.5 PRO]
    ↓
Analiza multimodalna (wideo + audio + tekst)
    → power_v (moc jednostkowa)
    → quality_a (jakość/sprawność)
    → mass_c (masa/zasięg)
    → civilization_code (latin/byzantine/turandot)
    → distortion_z (zniekształcenie Z = I_in / I_real)
    ↓
[RUST/WASM] ← Bridge TypeScript
    ↓
Obliczenia: P = v × a × c
    ↓
[SUPABASE - PostgreSQL]
    ↓
Tabela: cybernetic_objects
    + ALERT: HIGH_PROPAGANDA_RISK (jeśli Z > 1.5)
```

---

## 🔧 Konfiguracja (WYMAGANE!)

### 1. Klucze API

Utwórz plik `.env` w głównym folderze projektu:

```env
# SUPABASE
SUPABASE_URL=https://twoj-projekt.supabase.co
SUPABASE_ANON_KEY=eyJ...twoj_klucz...

# GEMINI
GEMINI_API_KEY=AIza...twoj_klucz...
```

### 2. Pobierz Klucz Gemini

1. Wejdź na: https://aistudio.google.com/app/apikey
2. Kliknij **"Create API Key"**
3. Wybierz projekt (lub utwórz nowy)
4. Skopiuj klucz i wklej do `.env`

### 3. Klucze Supabase

Zobacz plik: `DODAJ-KLUCZE-SUPABASE.md`

---

## 🚀 Uruchomienie Testowe

### Metoda 1: Skrypt Demo (zalecane)

```bash
npm run demo:video-pipeline
```

**To uruchomi:**
- ✓ Sprawdzenie połączenia z Supabase
- ✓ Walidację GEMINI_API_KEY
- ✓ Pełną analizę testowego wideo
- ✓ Obliczenia w Rust/WASM
- ✓ Zapis do bazy

### Metoda 2: Własny kod

```typescript
import { processVideoAndStore } from "./src/lib/cybernetics/receptor/video_pipeline";

const result = await processVideoAndStore(
  "https://www.youtube.com/watch?v=TWOJ_ID", 
  {
    useWasm: true,      // Użyj Rust dla obliczeń
    autoStore: true,    // Zapisz do Supabase
  }
);

console.log(result);
```

---

## 📊 Przykładowy Wynik

```typescript
{
  power_v: 1000.5,              // Moc jednostkowa [W]
  quality_a: 0.75,              // Jakość (0-1)
  mass_c: 12.3,                 // Masa/zasięg
  total_power_p: 9229.6,        // P = v × a × c
  
  civilization_code: "byzantine",
  control_system_type: "ideological",
  distortion_z: 2.1,            // Z > 1.5 → PROPAGANDA!
  
  propaganda_warning: true,     // ⚠️ Flaga propagandy
  
  visual_symbols: [
    "Czerwona flaga",
    "Uniformy",
    "Godło państwowe"
  ],
  
  reasoning: "Wideo ma wysoki poziom ideologizacji...",
  
  stored_object_id: "uuid-12345" // ID w Supabase
}
```

---

## 🔍 Co Się Dzieje Pod Maską?

### 1. **Gemini Service** (`gemini_service.ts`)

- Wysyła URL wideo + METAPROMPT_2015 do Gemini 1.5 Pro
- Gemini analizuje:
  - Warstwę wizualną (symbole, kolory, architektura)
  - Warstwę audio (ton, emocje, retoryka)
  - Warstwę tekstową (napisy, transkrypcja)
- Zwraca sformalizowany JSON zgodny ze schematem Zod

### 2. **Video Pipeline** (`video_pipeline.ts`)

- Odbiera wynik z Gemini
- Wywołuje Rust/WASM dla obliczeń P = v × a × c
- Sprawdza flagę propagandy (Z > 1.5)
- Zapisuje obiekt do Supabase
- Tworzy ALERT jeśli Z > 1.5

### 3. **Rust Bridge** (`wasm_core/bridge.ts`)

- Lazy loading modułu Wasm
- Smart fallback na TypeScript jeśli Wasm fail
- Funkcja `calculateTotalPowerWasm(v, a, c)` → wywołuje Rust

### 4. **Rust Core** (`wasm_core/src/lib.rs`)

- Funkcja `wasm_calculate_power(v, a, c)` eksportowana przez wasm-bindgen
- Ultra-szybkie obliczenia (Rust → Wasm)
- Używana przez bridge.ts

---

## 📁 Schemat Bazy Danych

### Tabela: `cybernetic_objects`

```sql
CREATE TABLE cybernetic_objects (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    
    -- METACYBERNETYKA 2015: Parametry mocy
    power_v FLOAT8 CHECK (power_v >= 0),       -- Moc jednostkowa [W]
    quality_a FLOAT8 CHECK (quality_a >= 0 AND quality_a <= 1), -- Jakość
    mass_c FLOAT8 CHECK (mass_c >= 0),         -- Masa/zasięg
    total_power_p FLOAT8 GENERATED ALWAYS AS (power_v * quality_a * mass_c) STORED,
    
    -- Klasyfikacja cywilizacyjna
    civilization_code TEXT CHECK (civilization_code IN 
        ('latin', 'byzantine', 'turandot', 'mixed', 'unknown')),
    
    control_system_type TEXT CHECK (control_system_type IN 
        ('cognitive', 'ideological', 'ethical', 'economic')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: `system_alerts` (dla flagowania propagandy)

```sql
CREATE TABLE system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id UUID REFERENCES cybernetic_objects(id),
    alert_type TEXT NOT NULL,              -- 'HIGH_PROPAGANDA_RISK'
    severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
    message TEXT,
    metadata JSONB,                        -- Szczegóły z Gemini
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🧪 Testowanie w Dashboard

Po zapisie obiektu, otwórz Dashboard KMS:

```bash
npm run dev
```

Przejdź do: http://localhost:4321/dashboard

Zobaczysz:
- ✓ Punkty na grafie (x = power_v, y = quality_a)
- ✓ Kolor według cywilizacji:
  - 🟢 Latin = zielony
  - 🔵 Byzantine = niebieski
  - 🔴 Turandot = czerwony
- ✓ Alert dla propagandy (Z > 1.5)

---

## 🔧 Rozwiązywanie Problemów

### Błąd: "GEMINI_API_KEY not found"

**Rozwiązanie:**
1. Sprawdź plik `.env`
2. Upewnij się, że klucz jest poprawny (zaczyna się od `AIza`)
3. Zrestartuj `npm run dev`

### Błąd: "Wasm module not loaded"

**Rozwiązanie:**
1. Przebuduj Wasm:
   ```bash
   cd src/lib/cybernetics/wasm_core
   wasm-pack build --target web --out-dir pkg
   ```
2. Sprawdź czy istnieje plik `pkg/wasm_core.wasm`
3. System automatycznie użyje fallback TypeScript

### Błąd: "Supabase insert failed"

**Rozwiązanie:**
1. Sprawdź klucze w `.env`
2. Upewnij się, że schemat bazy jest aktualny:
   ```bash
   # Uruchom migrację (jeśli jeszcze nie)
   psql -d twoja-baza -f schema.sql
   ```

### Błąd: "Invalid YouTube URL"

**Rozwiązanie:**
1. Sprawdź format URL (musi zawierać `youtube.com` lub `youtu.be`)
2. Upewnij się, że wideo jest publiczne
3. Spróbuj innego URL

---

## 📚 Dokumentacja Związana

- `GEMINI-INTEGRATION-GUIDE.md` - Szczegóły API Gemini
- `VITE-WASM-INTEGRATION.md` - Konfiguracja Rust/WASM
- `DODAJ-KLUCZE-SUPABASE.md` - Setup bazy danych
- `METACYBERNETYKA - Józef Kossecki 2015.pdf` - Teoria (aksjomaty 1-8)

---

## 🎓 Jak Używać w Praktyce?

### Scenariusz 1: Analiza Pojedynczego Wideo

```typescript
const result = await processVideoAndStore(
  "https://www.youtube.com/watch?v=ABC123"
);

if (result.propaganda_warning) {
  console.warn("⚠️ Wykryto propagandę!", result.distortion_z);
}
```

### Scenariusz 2: Batch Analysis (Wiele Wideo)

```typescript
import { processMultipleVideos } from "./video_pipeline";

const urls = [
  "https://www.youtube.com/watch?v=ABC123",
  "https://www.youtube.com/watch?v=DEF456",
];

const results = await processMultipleVideos(urls, {
  useWasm: true,
  autoStore: true,
  parallel: false, // Sekwencyjnie (limitów Gemini)
});

// Znajdź najbardziej ideologiczne
const mostIdeological = results
  .filter(r => r.control_system_type === 'ideological')
  .sort((a, b) => b.distortion_z - a.distortion_z)[0];
```

### Scenariusz 3: Integration z React Component

```tsx
import { processVideoAndStore } from "@/lib/cybernetics/receptor/video_pipeline";
import { useState } from "react";

export function VideoAnalyzer() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (url: string) => {
    setLoading(true);
    try {
      const data = await processVideoAndStore(url);
      setResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="text" placeholder="YouTube URL" onChange={...} />
      <button onClick={() => handleAnalyze(url)}>Analyze</button>
      
      {loading && <p>Analyzing...</p>}
      
      {result && (
        <div>
          <h3>Power: {result.total_power_p.toFixed(2)} W</h3>
          <p>Civilization: {result.civilization_code}</p>
          {result.propaganda_warning && (
            <Alert>⚠️ Propaganda detected (Z={result.distortion_z})</Alert>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 🚨 WAŻNE: Limity API Gemini

**Free Tier (Google AI Studio):**
- 60 zapytań/minutę
- 1500 zapytań/dzień
- Wideo: max 10MB lub 10 minut

**Paid Tier:**
- Wyższe limity
- Dłuższe wideo

**Best Practices:**
- Używaj `parallel: false` dla batch analysis
- Cache wyników (unikaj ponownej analizy tego samego wideo)
- Monitoruj użycie na: https://aistudio.google.com/app/apikeys

---

## 🎯 Next Steps

Po udanym teście możesz:

1. **Zintegrować z UI** - Dodaj formularz w Dashboard
2. **Rozszerzyć Metaprompt** - Dostosuj do swoich potrzeb badawczych
3. **Dodać więcej parametrów** - Np. sentiment analysis, topic extraction
4. **Eksportować raporty** - CSV/JSON z wynikami analiz
5. **Utworzyć API endpoint** - `/api/video/analyze` dla zewnętrznych integracji

---

## 📞 Support

W razie problemów sprawdź:
1. Logi w konsoli (`npm run demo:video-pipeline`)
2. Supabase Dashboard (czy obiekt się zapisał?)
3. Plik `INITIALIZATION_REPORT.md` (historia systemu)

---

**Metacybernetyka 2015 w akcji!** 🚀

