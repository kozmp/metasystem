# ✅ TASK 2/3: BENCHMARK RUST/WASM VS TYPESCRIPT

**Data:** 2026-01-02
**Status:** ✅ **GOTOWE DO TESTOWANIA**
**Dev Server:** http://localhost:4322/
**Test URL:** http://localhost:4322/test-benchmark

---

## PODSUMOWANIE

Zaimplementowano kompletny moduł benchmarkowy do pomiaru wydajności Rust/Wasm vs TypeScript. Moduł generuje grafy testowe, uruchamia symulacje, mierzy czasy wykonania i porównuje wyniki.

### Osiągnięcia ✅

- ✅ **pathfinder-core.ts** - wyekstraktowano core logic (bez zależności od bazy)
- ✅ **benchmark.ts** - pełny moduł benchmarkowy
- ✅ **test-benchmark.astro** - interaktywna strona testowa z UI
- ✅ **Generowanie grafów** - automatyczne tworzenie grafów testowych
- ✅ **Pomiar wydajności** - precyzyjne mierzenie czasu wykonania
- ✅ **Porównanie wyników** - weryfikacja zgodności Wasm ↔ TypeScript
- ✅ **Rekomendacje** - automatyczne określenie optymalnego threshold

---

## 1. UTWORZONE PLIKI

### 1.1 pathfinder-core.ts

**Lokalizacja:** `src/lib/cybernetics/decisions/pathfinder-core.ts`

**Funkcjonalność:**
- Wyekstraktowana czysta logika z pathfinder.ts
- Brak zależności od Supabase
- Używana w benchmark.ts i (przyszły) fallback.ts

**Kluczowe funkcje:**
```typescript
export function buildGraph(
  objects: CyberneticObject[],
  correlations: Correlation[]
): Graph

export function findInfluencePaths(
  graph: Graph,
  targetId: string,
  goal: SteeringGoal
): InfluencePath[]

export function calculateNodeInfluences(
  paths: InfluencePath[],
  graph: Graph
): InfluentialNode[]

export function generateRecommendations(
  influentialNodes: InfluentialNode[],
  targetObject: CyberneticObject,
  goal: SteeringGoal
)
```

**Konfiguracja:**
```typescript
export const PATHFINDER_CONFIG = {
  MAX_DEPTH: 5,
  MAX_PATHS: 100,
  MIN_INFLUENCE_THRESHOLD: 0.1,
  TOP_RECOMMENDATIONS: 5,
};
```

### 1.2 benchmark.ts

**Lokalizacja:** `src/lib/cybernetics/wasm_core/benchmark.ts`

**Funkcjonalność:**
- Generowanie grafów testowych
- Uruchamianie symulacji TypeScript i Wasm
- Pomiar czasu wykonania
- Porównanie wyników
- Generowanie raportów

**Kluczowe funkcje:**
```typescript
// Generuje graf testowy o zadanym rozmiarze
export function generateTestGraph(
  objectCount: number,
  connectionProbability: number = 0.3
): [CyberneticObject[], Correlation[]]

// Benchmark pojedynczego rozmiaru
export async function benchmarkGraphSize(
  objectCount: number,
  goal: SteeringGoal = 'strengthen'
): Promise<BenchmarkResult>

// Pełny benchmark wielu rozmiarów
export async function runFullBenchmark(
  sizes: number[] = [50, 100, 200, 500, 1000]
): Promise<BenchmarkReport>
```

**Struktura grafu testowego:**
- Obiekty: `Node 0`, `Node 1`, ..., `Node N`
- Energia: losowa 50-1000 (working_power)
- System class: mix autonomous_system i environment
- Control type: mix ethical i economic
- Korelacje: losowe z prawdopodobieństwem 0.3
- Relation types: mix (direct_control, positive_feedback, negative_feedback, supply)
- Certainty: losowa 0.7-1.0
- Impact factor: losowa 0.6-1.0

### 1.3 test-benchmark.astro

**Lokalizacja:** `src/pages/test-benchmark.astro`

**Funkcjonalność:**
- Interaktywny UI do uruchamiania benchmarków
- 3 tryby: Quick Test, Full Benchmark, Custom Size
- Live logging z kolorowaniem
- Tabela wyników z kolorowaniem speedup
- Podsumowanie statystyk
- Automatyczne rekomendacje threshold

**Przyciski:**
- 🚀 **Quick Test** - szybki test (50, 100, 200 węzłów)
- ⚡ **Full Benchmark** - pełny test (50, 100, 200, 500, 1000 węzłów)
- 🎯 **Custom Size** - dowolny rozmiar grafu
- 🗑️ **Wyczyść** - czyszczenie logów

---

## 2. JAK DZIAŁA BENCHMARK

### 2.1 Flow benchmarku

```
1. Generuj graf testowy (generateTestGraph)
   └─ Losowe obiekty + korelacje

2. Wybierz losowy obiekt docelowy
   └─ target = objects[random]

3. BENCHMARK TYPESCRIPT
   ├─ buildGraph(objects, correlations)
   ├─ findInfluencePaths(graph, target, goal)
   ├─ calculateNodeInfluences(paths, graph)
   └─ Mierz czas: performance.now()

4. BENCHMARK WASM (jeśli dostępny)
   ├─ findInfluencePathsWasm(objects, correlations, target, goal)
   └─ Mierz czas: performance.now()

5. PORÓWNAJ WYNIKI
   ├─ Speedup = TS_time / Wasm_time
   ├─ Sprawdź zgodność top 5 węzłów
   └─ Sprawdź różnicę control_leverage (tolerancja 1%)

6. GENERUJ RAPORT
   ├─ Tabela wyników
   ├─ Statystyki (avg/min/max speedup)
   └─ Rekomendacje (threshold)
```

### 2.2 Algorytm porównania wyników

**compareResults(tsNodes, wasmNodes):**

1. Sprawdź liczebność: `tsNodes.length === wasmNodes.length`
2. Porównaj top 5 węzłów: `tsNodes[0..4].object_id === wasmNodes[0..4].object_id`
3. Porównaj control_leverage z tolerancją 1%:
   ```typescript
   diff = |ts.leverage - wasm.leverage| / ts.leverage
   if (diff > 0.01) return false
   ```
4. Zwróć `true` jeśli wszystkie testy PASS

### 2.3 Generowanie rekomendacji

**Algorytm:**
1. Znajdź pierwszy rozmiar gdzie `speedup >= 2.0x`
2. Jeśli nie znaleziono → threshold = 100 (domyślny)
3. Jeśli znaleziono → threshold = ten rozmiar

**Przykład:**
- 50 węzłów: 1.5x
- 100 węzłów: 2.3x ← **threshold = 100**
- 200 węzłów: 4.1x
- 500 węzłów: 7.8x

**Klasyfikacja speedup:**
- >= 2.0x: ✅ **GOOD** (zielony)
- >= 1.2x: ⚠️ **MEDIUM** (pomarańczowy)
- < 1.2x: ❌ **POOR** (czerwony)

---

## 3. INSTRUKCJE TESTOWANIA

### Krok 1: Sprawdź dev server

```bash
# Powinien być już uruchomiony z Task 1
# Jeśli nie, uruchom:
npm run dev
```

**Oczekiwane:**
```
astro v5.16.6 ready in 1257 ms

┃ Local    http://localhost:4322/
┃ Network  use --host to expose

watching for file changes...
```

✅ **Status:** Server działa bez błędów

### Krok 2: Otwórz stronę benchmark

```
http://localhost:4322/test-benchmark
```

**Oczekiwany widok:**
- ⚡ Nagłówek: "Benchmark Rust/Wasm vs TypeScript"
- Sekcja 1: Kontrola (3 przyciski)
- Sekcja 2: Logi (puste lub z inicjalizacją)
- Sekcja 3: Podsumowanie (ukryte na start)
- Sekcja 4: Wyniki Szczegółowe (ukryte na start)

### Krok 3: Uruchom Quick Test

1. Kliknij przycisk **🚀 Quick Test (50, 100, 200)**
2. Obserwuj logi w sekcji 2
3. Poczekaj na zakończenie (~10-30 sekund)

**Oczekiwane logi:**
```
[10:55:30] Uruchamiam benchmark dla rozmiarów: 50, 100, 200
[10:55:30] Testowanie grafu z 50 obiektami...
[10:55:30] Wygenerowano 142 korelacji
[10:55:30] Running TypeScript...
[10:55:31] ✓ TypeScript: 12.34ms
[10:55:31]   Wpływowych węzłów: 8
[10:55:31] Running Wasm...
[10:55:31] ✓ Wasm: 5.67ms
[10:55:31]   Wpływowych węzłów: 8
[10:55:31] ⚡ Speedup: 2.18x
[10:55:31] ✓ Wyniki zgodne: true
[... powtórz dla 100, 200 ...]
[10:55:45] ✅ Benchmark zakończony!
```

**Jeśli Wasm niedostępny:**
```
[10:55:31] ⚠️ Wasm niedostępny - pomijam test
```

### Krok 4: Sprawdź wyniki

**Sekcja 3: Podsumowanie**
- Powinny pojawić się 4 karty statystyk:
  - Średnie przyspieszenie: X.XXx
  - Min przyspieszenie: X.XXx
  - Max przyspieszenie: X.XXx
  - Rekomendowany threshold: XX węzłów

- Poniżej: Rekomendacja (zielona/pomarańczowa/czerwona):
  ```
  ✅ REKOMENDACJA: Użyj Wasm
  Średnie przyspieszenie X.XXx jest znaczące.
  Ustaw threshold na XX węzłów w pathfinder-optimized.ts.
  ```

**Sekcja 4: Wyniki Szczegółowe**
- Tabela z wynikami:
  ```
  Rozmiar grafu | Korelacje | TypeScript (ms) | Wasm (ms) | Speedup | Zgodność
  50 węzłów     | 142       | 12.34          | 5.67      | 2.18x   | ✅
  100 węzłów    | 298       | 24.56          | 8.91      | 2.76x   | ✅
  200 węzłów    | 601       | 52.34          | 15.23     | 3.44x   | ✅
  ```

### Krok 5: Uruchom Full Benchmark

1. Kliknij **⚡ Full Benchmark (50, 100, 200, 500, 1000)**
2. Poczekaj ~1-3 minuty (duże grafy są wolniejsze)
3. Sprawdź wyniki dla wszystkich rozmiarów

**Oczekiwane speedupy (teoretyczne):**
- 50 węzłów: 1.5-2.5x
- 100 węzłów: 2.0-3.5x
- 200 węzłów: 3.0-5.0x
- 500 węzłów: 5.0-8.0x
- 1000 węzłów: 7.0-12.0x

### Krok 6: Test Custom Size

1. Kliknij **🎯 Custom Size**
2. Wpisz rozmiar (np. 300)
3. Sprawdź wynik dla tego rozmiaru

### Krok 7: Sprawdź konsolę przeglądarki (F12)

**Oczekiwane:**
- Szczegółowe logi [BENCHMARK]
- Brak błędów JavaScript
- Wasm loading success (jeśli dostępny)

**Przykładowe logi konsoli:**
```
[BENCHMARK] Testowanie grafu z 50 obiektami...
[BENCHMARK] Wygenerowano 142 korelacji
[BENCHMARK] Running TypeScript...
[BENCHMARK] ✓ TypeScript: 12.34ms
[BENCHMARK]   Wpływowych węzłów: 8
[BENCHMARK] Running Wasm...
[WASM] BFS completed in 5.67ms
[BENCHMARK] ✓ Wasm: 5.67ms
[BENCHMARK]   Wpływowych węzłów: 8
[BENCHMARK] ⚡ Speedup: 2.18x
[COMPARE] Top 5 węzłów zgodne
[BENCHMARK] ✓ Wyniki zgodne: true
```

---

## 4. INTERPRETACJA WYNIKÓW

### 4.1 Speedup >= 2.0x (✅ DOBRZE)

**Przykład:**
```
Rozmiar | TS (ms) | Wasm (ms) | Speedup
100     | 24.56   | 8.91      | 2.76x
200     | 52.34   | 15.23     | 3.44x
500     | 145.67  | 23.45     | 6.21x
```

**Rekomendacja:**
- ✅ Użyj Wasm dla grafów >= threshold
- ✅ Zaktualizuj `USE_WASM_THRESHOLD` w pathfinder-optimized.ts
- ✅ Wasm przynosi znaczącą korzyść

**Akcja:**
```typescript
// pathfinder-optimized.ts
const USE_WASM_THRESHOLD = 100; // Ustaw na rekomendowany threshold
```

### 4.2 Speedup 1.2-2.0x (⚠️ UMIARKOWANE)

**Przykład:**
```
Rozmiar | TS (ms) | Wasm (ms) | Speedup
100     | 20.00   | 14.50     | 1.38x
200     | 45.00   | 28.00     | 1.61x
```

**Rekomendacja:**
- ⚠️ Wasm daje umiarkowaną korzyść
- ⚠️ Rozważ wyższy threshold (np. 200-500)
- ⚠️ Potencjał do optymalizacji kodu Rust

**Akcja:**
- Testuj z większymi grafami (1000+)
- Profiling kodu Rust (cargo flamegraph)
- Rozważ optymalizacje algorytmu

### 4.3 Speedup < 1.2x (❌ SŁABO)

**Przykład:**
```
Rozmiar | TS (ms) | Wasm (ms) | Speedup
100     | 15.00   | 14.00     | 1.07x
200     | 32.00   | 31.00     | 1.03x
```

**Rekomendacja:**
- ❌ Wasm nie przynosi korzyści
- ❌ Pozostań przy TypeScript
- ❌ Optymalizuj kod Rust lub algorytm

**Możliwe przyczyny:**
1. Overhead Wasm initialization
2. Nieoptymalne przekształcenia JSON ↔ Rust
3. Algorytm TypeScript już wystarczająco szybki
4. Graf za mały (zdominowany overhead)

**Akcja:**
- Debuguj kod Rust (dodaj profiling)
- Testuj z DUŻO większymi grafami (5000+)
- Rozważ inny algorytm w Rust
- Użyj tylko TypeScript jeśli korzyści minimalne

### 4.4 Wyniki niezgodne (❌)

**Objawy:**
```
Zgodność: ❌
[COMPARE] Różna liczba węzłów: TS=8, Wasm=7
```

**Przyczyny:**
1. Bug w implementacji Rust
2. Różnice w zaokrągleniach float
3. Różne sortowanie przy równych wartościach
4. Brak obsługi edge case

**Akcja:**
1. Sprawdź logi [COMPARE] w konsoli
2. Porównaj wyniki ręcznie:
   ```typescript
   console.log('TS:', tsResult);
   console.log('Wasm:', wasmResult);
   ```
3. Debuguj kod Rust w src/lib.rs
4. Dodaj unit testy w Rust

---

## 5. PRZYKŁADOWE WYNIKI (TEORETYCZNE)

### Scenariusz 1: Optymistyczny

**Konfiguracja:**
- CPU: Intel i7 / AMD Ryzen 7
- RAM: 16GB
- Browser: Chrome 120+
- Wasm: Optimized (opt-level="z", LTO=true)

**Wyniki:**
```
Rozmiar | Korelacje | TS (ms) | Wasm (ms) | Speedup | Zgodność
50      | 142       | 15.23   | 8.45      | 1.80x   | ✅
100     | 298       | 34.56   | 12.34     | 2.80x   | ✅
200     | 601       | 78.91   | 19.23     | 4.10x   | ✅
500     | 1503      | 245.67  | 35.89     | 6.85x   | ✅
1000    | 3012      | 612.34  | 67.45     | 9.08x   | ✅
```

**Podsumowanie:**
- Średnie przyspieszenie: **4.93x**
- Rekomendowany threshold: **100 węzłów**
- Rekomendacja: ✅ **Użyj Wasm dla grafów >= 100**

### Scenariusz 2: Pesymistyczny

**Konfiguracja:**
- CPU: Starszy procesor
- RAM: 8GB
- Browser: Firefox 110 (starszy)
- Wasm: Suboptimal loading

**Wyniki:**
```
Rozmiar | Korelacje | TS (ms) | Wasm (ms) | Speedup | Zgodność
50      | 142       | 18.45   | 16.23     | 1.14x   | ✅
100     | 298       | 42.34   | 32.67     | 1.30x   | ✅
200     | 601       | 95.67   | 58.91     | 1.62x   | ✅
500     | 1503      | 298.45  | 145.23    | 2.05x   | ✅
1000    | 3012      | 734.56  | 289.45    | 2.54x   | ✅
```

**Podsumowanie:**
- Średnie przyspieszenie: **1.73x**
- Rekomendowany threshold: **500 węzłów**
- Rekomendacja: ⚠️ **Umiarkowana korzyść - threshold >= 500**

### Scenariusz 3: Wasm niedostępny

**Wyniki:**
```
Rozmiar | Korelacje | TS (ms) | Wasm (ms) | Speedup | Zgodność
50      | 142       | 15.23   | N/A       | N/A     | -
100     | 298       | 34.56   | N/A       | N/A     | -
```

**Podsumowanie:**
- Wasm Status: ❌ Niedostępny
- Rekomendacja: ⚠️ **Sprawdź logi i rebuild Wasm**

**Troubleshooting:**
1. Sprawdź czy plik `wasm_core_bg.wasm` istnieje
2. Rebuild: `cd src/lib/cybernetics/wasm_core && wasm-pack build --target web --release`
3. Sprawdź konsola przeglądarki - błędy loading
4. Sprawdź czy vite-plugin-wasm działa poprawnie

---

## 6. AKTUALIZACJA THRESHOLD (po benchmarku)

### Krok 1: Sprawdź rekomendowany threshold

Po zakończeniu benchmarku, sekcja **Podsumowanie** pokaże:
```
Rekomendowany threshold: 200 węzłów
```

### Krok 2: Zaktualizuj pathfinder-optimized.ts

**Plik:** `src/lib/cybernetics/decisions/pathfinder-optimized.ts`

**PRZED:**
```typescript
const USE_WASM_THRESHOLD = 100;
```

**PO (przykład threshold = 200):**
```typescript
const USE_WASM_THRESHOLD = 200; // Benchmark: 2.8x speedup
```

### Krok 3: Restart dev server

```bash
# Ctrl+C aby zatrzymać
npm run dev
```

### Krok 4: Testuj w DecisionSimulator

1. Otwórz http://localhost:4322/dashboard/decisions
2. Uruchom symulację
3. Sprawdź sekcję METADATA:
   - Jeśli graf < threshold → "📘 TypeScript"
   - Jeśli graf >= threshold → Metadata wskazuje potencjał Wasm

---

## 7. TROUBLESHOOTING

### Problem: Benchmark nie uruchamia się

**Symptomy:**
- Kliknięcie przycisku nie robi nic
- Brak logów w sekcji 2

**Rozwiązanie:**
1. Sprawdź konsolę przeglądarki (F12) - błędy JavaScript?
2. Sprawdź czy dev server działa
3. Wyczyść cache przeglądarki (Ctrl+Shift+R)
4. Sprawdź logi dev servera - błędy kompilacji?

### Problem: Błąd importu benchmark.ts

**Błąd:**
```
Failed to fetch /src/lib/cybernetics/wasm_core/benchmark.ts
```

**Rozwiązanie:**
1. Sprawdź czy plik istnieje:
   ```bash
   ls src/lib/cybernetics/wasm_core/benchmark.ts
   ```
2. Restart dev server
3. Sprawdź ścieżkę importu w test-benchmark.astro

### Problem: Wszystkie speedupy < 1.0x (Wasm wolniejszy!)

**Przykład:**
```
Speedup: 0.85x (Wasm wolniejszy niż TS!)
```

**Możliwe przyczyny:**
1. JSON serialization overhead
2. Nieoptymalne build settings Rust
3. Starszy browser (słabe wsparcie Wasm)
4. Overhead inicjalizacji Wasm zdominował czas

**Rozwiązanie:**
1. Rebuild Wasm z optymalizacją:
   ```bash
   cd src/lib/cybernetics/wasm_core
   wasm-pack build --target web --release
   wasm-opt pkg/wasm_core_bg.wasm -O3 -o pkg/wasm_core_bg.wasm
   ```
2. Testuj z większymi grafami (1000+)
3. Profiling kodu Rust
4. Rozważ pre-initialization Wasm

### Problem: Wyniki niezgodne dla wszystkich testów

**Symptomy:**
```
Zgodność: ❌ (dla wszystkich rozmiarów)
```

**Rozwiązanie:**
1. Sprawdź logi [COMPARE] - co się nie zgadza?
2. Debuguj ręcznie:
   ```javascript
   const tsResult = await benchmarkGraphSize(100);
   console.log('TS Top 5:', tsResult.slice(0, 5));
   console.log('Wasm Top 5:', wasmResult.slice(0, 5));
   ```
3. Sprawdź kod Rust - brakujące edge cases?
4. Porównaj algorytmy BFS: pathfinder-core.ts vs lib.rs

---

## 8. NASTĘPNE KROKI

### Task 3: Fallback Implementation

**Cel:** Pełne wsparcie TypeScript fallback

**Zakres:**
1. Aktualizacja fallback.ts (obecnie placeholder)
2. Użycie pathfinder-core.ts dla fallback logic
3. Testy zgodności
4. Graceful degradation

**Oczekiwany rezultat:**
```typescript
// bridge.ts
try {
  return await findInfluencePathsWasm(...);
} catch (error) {
  console.warn('[WASM] Fallback to TypeScript:', error);
  return await findInfluencePathsTS(...); // ← pełna implementacja
}
```

### Optymalizacje (opcjonalne)

1. **Pre-initialization Wasm:**
   ```typescript
   // Załaduj Wasm przy starcie aplikacji
   await initWasm();
   ```

2. **Caching wyników:**
   ```typescript
   const cache = new Map<string, InfluentialNode[]>();
   ```

3. **Worker threads dla dużych grafów:**
   ```typescript
   const worker = new Worker('wasm-worker.js');
   ```

4. **Streaming results:**
   ```typescript
   for await (const node of findInfluencePathsStream(...)) {
     // Renderuj progresywnie
   }
   ```

---

## 9. PODSUMOWANIE TASK 2

### ✅ UKOŃCZONE

| Element | Status | Opis |
|---------|--------|------|
| pathfinder-core.ts | ✅ | Core logic wyekstraktowana |
| benchmark.ts | ✅ | Moduł benchmarkowy pełny |
| test-benchmark.astro | ✅ | UI testowe gotowe |
| Generowanie grafów | ✅ | Losowe grafy testowe działają |
| Pomiar wydajności | ✅ | TypeScript + Wasm timing |
| Porównanie wyników | ✅ | Weryfikacja zgodności |
| Rekomendacje | ✅ | Automatyczny threshold |
| Dokumentacja | ✅ | Ten plik (TASK-2-BENCHMARK-IMPLEMENTATION.md) |

### ⚠️ WYMAGA TESTOWANIA W PRZEGLĄDARCE

**Instrukcje:**
1. Otwórz http://localhost:4322/test-benchmark
2. Kliknij "🚀 Quick Test"
3. Sprawdź wyniki
4. Uruchom "⚡ Full Benchmark" jeśli Quick Test OK
5. Zapisz wyniki (screenshot lub copy/paste)

### 📝 TODO (Task 3)

- Aktualizacja fallback.ts z użyciem pathfinder-core
- Testy e2e Wasm ↔ TypeScript
- Dokumentacja Task 3

---

## 10. DIFF PODSUMOWANIE

### Nowe pliki (3):
```
src/lib/cybernetics/decisions/pathfinder-core.ts
src/lib/cybernetics/wasm_core/benchmark.ts
src/pages/test-benchmark.astro
```

### Zmodyfikowane pliki (0):
- Brak (Task 2 nie modyfikuje istniejących plików)

### Linie kodu:
- pathfinder-core.ts: ~350 linii
- benchmark.ts: ~350 linii
- test-benchmark.astro: ~400 linii
- **Razem:** ~1100 linii nowego kodu

### Zależności:
- Używa pathfinder-core (nowy)
- Używa bridge.ts (istniejący)
- Używa types.ts (istniejący)

---

**TASK 2 ZAKOŃCZONY - WYMAGA TESTOWANIA! ⏳**

**Następny krok:** Testowanie w przeglądarce + Task 3/3 - Fallback Implementation

**Raport utworzony:** 2026-01-02 11:00
**Przez:** Claude Sonnet 4.5
**Status:** ✅ READY FOR BROWSER TESTING
