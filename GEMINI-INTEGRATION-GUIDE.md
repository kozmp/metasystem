# 🎥 INTEGRACJA GEMINI 1.5 PRO - INSTRUKCJA

**Data:** 2026-01-03  
**Status:** ✅ Zaimplementowane (wymaga klucza API)

---

## 📋 PRZEGLĄD

Dodano **pełny pipeline multimodalnej analizy wideo** zgodny z Metacybernetyką 2015:

```
YouTube URL → Gemini 1.5 Pro → Rust/Wasm → Supabase
                 ↓                 ↓           ↓
            [v, a, c, Z]      [P = v×a×c]  [obiekt + alert]
```

---

## 🗂️ PLIKI UTWORZONE

### 1. `src/lib/cybernetics/receptor/gemini_service.ts`

**Funkcja:** Receptor multimodalny z METAPROMPT 2015

- ✅ **METAPROMPT_2015**: Kompletny prompt z 8 aksjomatami Kosseckiego
- ✅ **processVideo(youtubeUrl)**: Analiza wideo przez Gemini 1.5 Pro
- ✅ Walidacja Zod (Receptor Layer)
- ✅ Flaga propagandy: `Z > 1.5` → ostrzeżenie

**Parametry zwracane:**

```typescript
{
  power_v: number;              // Moc jednostkowa [W]
  quality_a: number;            // Jakość (0-1)
  mass_c: number;               // Zasięg
  civilization_code: string;    // latin | byzantine | turandot
  control_system_type: string;  // cognitive | ideological | ...
  distortion_z: number;         // Z = I_in / I_real
  visual_symbols: string[];     // Symbole w wideo
  reasoning: string;            // Uzasadnienie
}
```

### 2. `src/lib/cybernetics/receptor/video_pipeline.ts`

**Funkcja:** Pełna integracja Gemini -> Rust -> Supabase

- ✅ **processVideoAndStore(url)**: Pipeline end-to-end
- ✅ Automatyczne obliczenia w Rust: `P = v × a × c`
- ✅ Zapis do `cybernetic_objects`
- ✅ Utworzenie alertu `HIGH_PROPAGANDA_RISK` jeśli `Z > 1.5`
- ✅ Batch processing: `processMultipleVideos(urls[])`

### 3. `src/lib/cybernetics/wasm_core/bridge.ts`

**Dodano:**

- ✅ **calculateTotalPowerWasm()**: Most TS -> Rust dla obliczeń mocy

### 4. `src/lib/cybernetics/wasm_core/src/lib.rs`

**Dodano:**

- ✅ **wasm_calculate_power(v, a, c)**: Funkcja eksportowana do WASM

### 5. `.env.local`

**Szablon zmiennych środowiskowych** (klucz Gemini do uzupełnienia)

---

## 🔑 KROK 1: DODAJ KLUCZ API GEMINI

### Uzyskaj klucz:

1. Wejdź na: https://aistudio.google.com/app/apikey
2. Zaloguj się przez Google
3. Kliknij **"Create API Key"**
4. Skopiuj klucz

### Edytuj `.env.local`:

```bash
GEMINI_API_KEY=AIzaSy... # <-- Wklej swój klucz tutaj
```

---

## 🚀 KROK 2: UŻYCIE (przykłady)

### Przykład 1: Analiza pojedynczego wideo

```typescript
import { processVideoAndStore } from "@/lib/cybernetics/receptor/video_pipeline";

// Pełny pipeline: Gemini -> Rust -> Supabase
const result = await processVideoAndStore(
	"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	{
		useWasm: true, // Użyj Rust do obliczeń (domyślnie true)
		autoStore: true, // Zapisz do bazy (domyślnie true)
	}
);

console.log(`Total Power: ${result.total_power_p} W`);
console.log(`Propaganda Risk: ${result.propaganda_warning ? "YES" : "NO"}`);
console.log(`Stored as: ${result.stored_object_id}`);
```

### Przykład 2: Batch processing

```typescript
import { processMultipleVideos } from "@/lib/cybernetics/receptor/video_pipeline";

const urls = [
	"https://youtube.com/watch?v=VIDEO1",
	"https://youtube.com/watch?v=VIDEO2",
	"https://youtube.com/watch?v=VIDEO3",
];

const results = await processMultipleVideos(urls, {
	parallel: false, // Sekwencyjnie (aby nie przekroczyć rate limit)
});

results.forEach((r, i) => {
	console.log(`Video ${i + 1}: P=${r.total_power_p}W, Z=${r.distortion_z}`);
});
```

### Przykład 3: Tylko analiza (bez zapisu)

```typescript
import { processVideo } from "@/lib/cybernetics/receptor/gemini_service";

// Tylko Gemini (bez Rust/Supabase)
const analysis = await processVideo("https://youtube.com/watch?v=...");

console.log(analysis.civilization_code); // "byzantine"
console.log(analysis.control_system_type); // "ideological"
console.log(analysis.visual_symbols); // ["red_flags", "military_uniforms"]
```

---

## 📊 KROK 3: SPRAWDŹ WYNIKI W SUPABASE

Po uruchomieniu `processVideoAndStore()`:

### Tabela: `cybernetic_objects`

```sql
SELECT
  name,
  power_v,
  quality_a,
  mass_c,
  total_power_p,  -- GENERATED COLUMN = v × a × c
  civilization_code,
  control_system_type
FROM cybernetic_objects
WHERE name LIKE 'Video:%'
ORDER BY created_at DESC;
```

### Tabela: `system_alerts` (jeśli Z > 1.5)

```sql
SELECT
  alert_type,        -- 'HIGH_PROPAGANDA_RISK'
  severity,          -- 'high'
  message,
  metadata->>'distortion_z' AS distortion_z,
  metadata->>'youtube_url' AS video_url,
  created_at
FROM system_alerts
WHERE alert_type = 'HIGH_PROPAGANDA_RISK'
ORDER BY created_at DESC;
```

---

## 🧪 KROK 4: TESTY (opcjonalne)

### Utwórz plik testowy: `src/scripts/test-gemini.ts`

```typescript
import { processVideoAndStore } from "@/lib/cybernetics/receptor/video_pipeline";

async function testGeminiIntegration() {
	console.log("🔬 Testing Gemini Integration...\n");

	const testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

	try {
		const result = await processVideoAndStore(testUrl);

		console.log("✅ SUCCESS!\n");
		console.log("Results:");
		console.log(`  Power (v): ${result.power_v} W`);
		console.log(`  Quality (a): ${result.quality_a}`);
		console.log(`  Mass (c): ${result.mass_c}`);
		console.log(`  Total Power (P): ${result.total_power_p} W`);
		console.log(`  Civilization: ${result.civilization_code}`);
		console.log(`  Distortion (Z): ${result.distortion_z}`);
		console.log(
			`  Propaganda Warning: ${result.propaganda_warning ? "⚠️ YES" : "✓ NO"}`
		);

		if (result.stored_object_id) {
			console.log(`\n  Stored in Supabase: ${result.stored_object_id}`);
		}

		if (result.propaganda_warning) {
			console.log(`\n⚠️ REASONING: ${result.reasoning}`);
		}
	} catch (error) {
		console.error("❌ FAILED:", error);
	}
}

testGeminiIntegration();
```

### Uruchom test:

```bash
npx tsx src/scripts/test-gemini.ts
```

---

## ⚠️ UWAGI TECHNICZNE

### 1. Rate Limits Gemini API

- **Free tier**: 60 requests/minute
- Jeśli batch processing → użyj `parallel: false`

### 2. Analiza wideo przez URL

Gemini 1.5 Pro **może** analizować wideo z URL YouTube bezpośrednio.
Jeśli nie zadziała, trzeba:

- Pobrać wideo lokalnie (yt-dlp)
- Przekonwertować na base64
- Wysłać jako `inlineData`

### 3. Wasm calculate_power

Jeśli Wasm nie działa (brak buildu):

- Automatyczny fallback na TypeScript
- Funkcjonalność zachowana, tylko wolniej

---

## 🐛 TROUBLESHOOTING

### Problem: "GEMINI_API_KEY not found"

**Rozwiązanie:**

1. Sprawdź `.env.local` - czy klucz jest tam?
2. Restart dev server: `npm run dev`
3. W Astro: zmienne muszą być prefiksowane `PUBLIC_` dla client-side:
   ```bash
   PUBLIC_GEMINI_API_KEY=...
   ```

### Problem: "Invalid JSON from Gemini"

**Rozwiązanie:**

- Gemini nie zawsze zwraca czysty JSON
- Zwiększ `temperature` w `gemini_service.ts` (linia 95)
- Dodaj retry logic

### Problem: Wasm nie działa

**Rozwiązanie:**

1. Sprawdź czy istnieje `src/lib/cybernetics/wasm_core/pkg/`
2. Jeśli nie - zbuduj Wasm:
   ```bash
   cd src/lib/cybernetics/wasm_core
   wasm-pack build --target web
   ```
3. Lub użyj `{ useWasm: false }` w opcjach

---

## 📚 NASTĘPNE KROKI

1. **UI Component**: Stwórz React komponent dla uploadu URL wideo
2. **Webhook**: Dodaj API endpoint `/api/video/analyze` (Astro)
3. **Queue System**: BullMQ dla batch processing
4. **Gemini Vision**: Rozszerz o analizę obrazów (nie tylko wideo)
5. **Rust Optimization**: Dodaj więcej funkcji w Wasm (np. `analyze_distortion`)

---

## 🎯 ZGODNOŚĆ Z METACYBERNETYKĄ 2015

✅ **AKSJOMAT 4**: P = v × a × c (iloczyn, nie suma!)  
✅ **AKSJOMAT 5**: Klasyfikacja systemu sterowania  
✅ **AKSJOMAT 8**: Zniekształcenie Z = I_in / I_real  
✅ **Klasyfikacja cywilizacyjna**: Latin/Byzantine/Turandot  
✅ **Receptor Layer**: Walidacja Zod przed zapisem  
✅ **Homeostat Layer**: Flaga `HIGH_PROPAGANDA_RISK`

---

**Autor:** Cursor AI + Senior Fullstack Engineer  
**Zgodność:** Metacybernetyka 2015 - doc. Józef Kossecki  
**Licencja:** Zgodna z projektem KMS
