# MODUŁ DECYZYJNY - Symulator Sterowania

**Zgodność:** Metacybernetyka doc. Józefa Kosseckiego

---

## 📋 Opis

Moduł Decyzyjny to zaawansowany system analizy wpływu w grafie relacji cybernetycznych. System przeszukuje wszystkie ścieżki wpływu prowadzące do wybranego obiektu i generuje rekomendacje sterownicze oparte na teorii Kosseckiego.

---

## 🎯 Funkcjonalności

### 1. **Analiza Wpływu (Pathfinder)**
- Przeszukiwanie grafu relacji (BFS)
- Znajdowanie wszystkich ścieżek wpływu do celu
- Obliczanie siły wpływu (impact_factor)
- Uwzględnianie sprzężeń zwrotnych (feedback multiplier)
- Obliczanie dźwigni sterowniczej (control leverage)

### 2. **Generowanie Rekomendacji**
- Rekomendacja główna (najwyższa leverage)
- Alternatywne rekomendacje (top 5)
- Uzasadnienia oparte na parametrach cybernetycznych
- Ostrzeżenia o niskiej rzetelności/mocy

### 3. **Strategia AI**
- Generowanie szczegółowej strategii przez Claude 3.5 Sonnet
- Analiza sytuacji
- Rekomendacja działania
- Ostrzeżenia i ograniczenia

---

## 🧮 Wzory Kosseckiego

### Dźwignia Sterownicza (Control Leverage)

```
Leverage = Available_Power × Influence_Strength × Certainty_Score
```

**Gdzie:**
- `Available_Power` - Moc swobodna obiektu (z `energy_params`)
- `Influence_Strength` - Siła wpływu (agregacja `impact_factor` ze ścieżek)
- `Certainty_Score` - Średnia rzetelność relacji w ścieżkach

### Mnożnik Sprzężenia Zwrotnego (Feedback Multiplier)

```
Multiplier = ∏ feedback_type_multiplier

gdzie:
- positive_feedback: ×1.5 (wzmacnianie)
- negative_feedback: ×0.7 (hamowanie)
- inne: ×1.0
```

### Siła Wpływu (Influence Strength)

```
Influence = ∏ impact_factor_i (dla wszystkich relacji w ścieżce)
```

---

## 📚 API

### `simulateSteering(targetObjectId, goal)`

**Parametry:**
- `targetObjectId: string` - ID obiektu docelowego
- `goal: 'strengthen' | 'weaken'` - Cel sterowania

**Zwraca:** `SteeringSimulationResult`

**Przykład:**
```typescript
import { simulateSteering } from '@/lib/cybernetics/decisions';

const result = await simulateSteering('obj-123', 'strengthen');

console.log(result.primary_recommendation.action);
// "wzmocnić 'Obiekt X'"

console.log(result.primary_recommendation.rationale);
// "Obiekt generuje sprzężenie dodatnie (wzmacniające)..."
```

### `generateAIStrategy(context)`

**Parametry:**
- `context: AIStrategyContext` - Kontekst symulacji

**Zwraca:** `string` (strategia w formie tekstu)

**Przykład:**
```typescript
import { generateAIStrategy } from '@/lib/cybernetics/decisions';

const strategy = await generateAIStrategy({
  target_object: obj,
  goal: 'strengthen',
  influential_nodes: nodes,
  current_system_state: stats,
});

console.log(strategy);
// "Analiza: Obiekt ma 5 węzłów wpływowych..."
```

---

## 🔧 Algorytm Pathfinder

### 1. Budowa Grafu
```
Graph = {
  objects: Map<id, CyberneticObject>,
  adjacencyList: Map<source_id, Correlation[]>,
  reverseAdjacencyList: Map<target_id, Correlation[]>
}
```

### 2. BFS Wstecz
Przeszukiwanie **od celu do źródeł** (reverse graph):

```
1. Start: [targetId]
2. Dla każdego węzła:
   - Pobierz relacje wpływające (incoming)
   - Oblicz nową siłę wpływu (current × impact_factor)
   - Filtruj słabe wpływy (< threshold)
   - Dodaj do kolejki
3. Stop: głębokość = MAX_DEPTH lub liczba ścieżek = MAX_PATHS
```

### 3. Agregacja Węzłów
```
Dla każdego węzła w ścieżkach:
1. Agreguj wszystkie ścieżki prowadzące przez ten węzeł
2. Oblicz średnią siłę wpływu
3. Oblicz średnią rzetelność
4. Oblicz mnożnik sprzężeń
5. Oblicz dźwignię sterowniczą
```

### 4. Ranking
```
Sort by: control_leverage DESC
Top N: PATHFINDER_CONFIG.TOP_RECOMMENDATIONS
```

---

## 🎨 UI - DecisionSimulator.tsx

### Sekcje:

1. **[1] KONFIGURACJA**
   - Wybór obiektu docelowego
   - Wybór celu (strengthen/weaken)
   - Przycisk [URUCHOM SYMULACJĘ]

2. **[2] REKOMENDACJA GŁÓWNA**
   - Akcja do wykonania
   - Uzasadnienie (parametry cybernetyczne)
   - Oczekiwany wpływ (%)
   - Pewność (%)
   - Przycisk [GENERUJ STRATEGIĘ AI]

3. **[2.1] STRATEGIA AI** (opcjonalnie)
   - Analiza sytuacji
   - Rekomendacja działania
   - Ostrzeżenia

4. **[3] ALTERNATYWNE REKOMENDACJE**
   - Top 5 alternatywnych opcji

5. **[4] TOP WĘZŁY WPŁYWOWE**
   - Lista 10 najbardziej wpływowych węzłów
   - Parametry: leverage, wpływ, liczba ścieżek

---

## 🔍 Przykład Użycia

### Krok 1: Wybierz obiekt w Dashboard
```
http://localhost:4321/dashboard/decisions
```

### Krok 2: Konfiguruj symulację
- Obiekt: "USA"
- Cel: "strengthen" (wzmocnić)

### Krok 3: Uruchom
System analizuje graf i znajduje:
- Ścieżek: 45
- Węzłów wpływowych: 12
- Najwyższa leverage: "NATO" (15.2)

### Krok 4: Przeczytaj rekomendację
```
Akcja: wzmocnić "NATO"

Uzasadnienie: Obiekt generuje sprzężenie dodatnie (wzmacniające)
i ma 8 ścieżek wpływu. Dźwignia sterownicza: 15.20
(moc: 8.50, wpływ: 0.85, rzetelność: 0.75).

Oczekiwany wpływ: 85%
Pewność: 75%
```

### Krok 5: Generuj strategię AI
```
Analiza: Obiekt "USA" ma 12 węzłów wpływowych w systemie.
Dominuje sprzężenie dodatnie przez "NATO" (leverage 15.2)
i "EU" (leverage 12.8).

Rekomendacja główna: Wzmocnić "NATO", który ma najwyższą
dźwignię sterowniczą (15.20) i generuje 8 ścieżek wpływu
z średnią rzetelności 0.75. Zwiększenie mocy dostępnej NATO
o 10% powinno skutkować wzrostem wpływu USA o ~8.5%.

Ostrzeżenia: Należy monitorować sprzężenie ujemne od "Rosja"
(leverage -5.2), które może osłabić efekt. Rzetelność relacji
NATO→USA jest wysoka (0.75), co daje pewność rekomendacji.
```

---

## ⚙️ Konfiguracja

### `pathfinder.ts`
```typescript
const PATHFINDER_CONFIG = {
  MAX_DEPTH: 5,                    // Max głębokość ścieżek
  MAX_PATHS: 100,                  // Max liczba ścieżek
  MIN_INFLUENCE_THRESHOLD: 0.1,   // Min wpływ
  TOP_RECOMMENDATIONS: 5,          // Liczba rekomendacji
};
```

### `ai-strategy.ts`
```typescript
Model: anthropic/claude-3.5-sonnet
Temperature: 0.3 (precyzja)
Max Tokens: 800
```

---

## 🧪 Testowanie

### Test 1: Symulacja podstawowa
```bash
# W konsoli przeglądarki:
const result = await fetch('/api/decisions/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target_object_id: 'obj-123',
    goal: 'strengthen'
  })
}).then(r => r.json());

console.log(result);
```

### Test 2: Strategia AI
```bash
const strategy = await fetch('/api/decisions/strategy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target_object_id: 'obj-123',
    goal: 'strengthen'
  })
}).then(r => r.json());

console.log(strategy.strategy);
```

---

## 📊 Struktura Plików

```
src/lib/cybernetics/decisions/
├── types.ts              # Typy TypeScript
├── pathfinder.ts         # Silnik analizy wpływu (BFS)
├── ai-strategy.ts        # Generator strategii AI
├── index.ts              # Exports
└── README.md             # Ten plik

src/components/cybernetics/
└── DecisionSimulator.tsx # UI komponent React

src/pages/api/decisions/
├── simulate.ts           # API: symulacja
└── strategy.ts           # API: strategia AI

src/pages/dashboard/
└── decisions.astro       # Strona symulatora
```

---

## 🎓 Zgodność z Teorią Kosseckiego

### ✅ Zaimplementowane zasady:

1. **Moc Swobodna** - Uwzględniona w leverage
2. **Sprzężenia Zwrotne** - Feedback multiplier
3. **Rzetelność** - Certainty score w leverage
4. **Dźwignia Sterownicza** - Główny parametr ranking
5. **Graf Relacji** - BFS na pełnym grafie
6. **Homeostaza** - Wykrywanie pętli feedback
7. **Anti-Ideology** - Używanie certainty_score

---

## 🚀 Wydajność

- Budowa grafu: O(V + E)
- BFS: O(V + E × D) gdzie D = MAX_DEPTH
- Agregacja: O(P × V) gdzie P = liczba ścieżek
- **Łącznie:** O(V × E × D) dla V obiektów, E relacji

Typowe czasy:
- 10 obiektów, 20 relacji: ~50ms
- 100 obiektów, 200 relacji: ~200ms
- 1000 obiektów, 2000 relacji: ~1-2s

---

**Status:** ✅ **W PEŁNI ZAIMPLEMENTOWANE**

**Wersja:** 1.0.0

**Data:** 2024-12-31

**Zgodność:** Metacybernetyka doc. Józefa Kosseckiego

