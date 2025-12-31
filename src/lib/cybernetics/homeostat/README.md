# HOMEOSTAT - Głęboka Weryfikacja Rzetelności

**Status:** ✅ Zaimplementowany  
**Wersja:** 1.0.0  
**Data:** 2024-12-24

## 1. Cel Celowniczy

**Homeostat** to organ stabilizujący system KMS poprzez wykrywanie sprzeczności i weryfikację rzetelności źródeł. Zgodnie z teorią Kosseckiego:

> "Homeostat utrzymuje równowagę systemu poprzez mechanizmy sprzężenia zwrotnego ujemnego - wykrywanie i eliminację zaburzeń."

Implementacja realizuje **"Weryfikację Rzetelności Wstecznej"** - system "pamięta" historię i wykrywa zmiany narracji.

## 2. Architektura

```
HOMEOSTAT/
├── types.ts                     # Typy TypeScript
├── contradiction-engine.ts      # Silnik detekcji sprzeczności
├── contradiction-engine.test.ts # Testy jednostkowe
├── index.ts                     # Export modułu
└── README.md                    # Dokumentacja
```

## 3. Algorytm Detekcji Sprzeczności

### 3.1 Wejście:
- Lista nowo dodanych relacji (`Correlation[]`)
- Parametry detekcji (`ContradictionDetectionParams`)

### 3.2 Proces:

```
Dla każdej nowej relacji:
  1. Pobierz istniejące relacje między tymi samymi obiektami
  2. Dla każdej istniejącej relacji sprawdź:
     a) Czy relation_type jest przeciwny? (positive_feedback vs negative_feedback)
     b) Czy impact_factor zmienił się drastycznie? (różnica > threshold)
     c) Czy certainty_score spadł gwałtownie? (spadek > threshold)
  3. Jeśli wykryto sprzeczność:
     - Oblicz severity (0-1)
     - Utwórz ContradictionReport
     - Zapisz alert w system_alerts
     - Obniż reliability_index źródła (opcjonalnie)
```

### 3.3 Wyjście:
- `ContradictionReport` z listą wykrytych sprzeczności
- Alerty w bazie danych (`system_alerts`)
- Zaktualizowane `reliability_index` nieretelnych źródeł

## 4. Typy Sprzeczności

| Typ | Opis | Przykład | Severity |
|-----|------|----------|----------|
| `opposite_relation` | Przeciwne typy relacji | support → oppose | 0.8 |
| `impact_reversal` | Drastyczna zmiana siły wpływu | 0.9 → 0.2 | 0.6 |
| `certainty_drop` | Gwałtowny spadek rzetelności | 0.95 → 0.3 | 0.5 |
| `narrative_180` | Pełna zmiana narracji (180°) | Wszystko się zmieniło | 1.0 |

## 5. Przeciwne Typy Relacji

Zgodnie z teorią sprzężeń zwrotnych Kosseckiego:

```typescript
{
  'positive_feedback': ['negative_feedback'],
  'negative_feedback': ['positive_feedback'],
  'supply': ['drain', 'block'],
  'support': ['oppose', 'contradict'],
  'amplify': ['dampen', 'suppress'],
  'enable': ['disable', 'prevent'],
}
```

## 6. Parametry Detekcji

### Domyślne (zgodne z rygorem Kosseckiego):

```typescript
{
  impact_diff_threshold: 0.5,          // 50% różnicy = sprzeczność
  certainty_diff_threshold: 0.3,       // 30% spadku = alert
  check_opposite_relations: true,      // Zawsze sprawdzaj
  lookback_days: 365,                  // Rok pamięci historycznej
  min_severity_for_alert: 0.5,         // Twórz alert dla severity >= 0.5
  auto_penalize_source: true,          // Automatycznie karz nieretelne źródła
  reliability_penalty: 0.1,            // Obniż o 10% za sprzeczność
}
```

## 7. Rozszerzenie Bazy Danych

### Nowa tabela: `system_alerts`

```sql
CREATE TABLE system_alerts (
  id UUID PRIMARY KEY,
  alert_type TEXT,                    -- 'contradiction', 'narrative_shift', etc.
  severity FLOAT,                     -- 0-1, gdzie 1 = krytyczne
  title TEXT,
  description TEXT,
  conflicting_relation_ids UUID[],
  affected_object_ids UUID[],
  source_name TEXT,
  metadata JSONB,
  status TEXT,                        -- 'active', 'resolved', 'dismissed'
  created_at TIMESTAMPTZ
);
```

### Rozszerzenie tabeli `correlations`:

```sql
ALTER TABLE correlations 
  ADD COLUMN source_name TEXT,
  ADD COLUMN superseded_at TIMESTAMPTZ,
  ADD COLUMN superseded_by UUID;
```

## 8. Integracja z Korelatorem

Homeostat jest wywoływany automatycznie po zapisaniu relacji:

```typescript
// W store.ts, po zapisaniu relacji:
const contradictionReport = await detectContradictions(newRelations);

if (contradictionReport.detected) {
  console.log(`⚠ Wykryto ${contradictionReport.contradictions.length} sprzeczności!`);
  // Alerty już utworzone w bazie
  // reliability_index już obniżony
}
```

## 9. Wyświetlanie w Efektor

Dashboard pokazuje nową kartę: **"Alert Wektora Sterowniczego"**

- Liczba aktywnych alertów sprzeczności
- Max severity (0-100%)
- Animacja pulse dla krytycznych alertów
- Status: ✓ Brak sprzeczności (zielony) lub ⚠ Wykryto sprzeczności (czerwony)

## 10. Przykłady Użycia

### Scenariusz 1: Polityk zmienia narrację

**Stara wypowiedź (2022):**  
*"Energia węglowa jest fundamentem naszej gospodarki"*  
→ `positive_feedback`, certainty: 0.9

**Nowa wypowiedź (2024):**  
*"Musimy jak najszybciej wycofać się z węgla"*  
→ `negative_feedback`, certainty: 0.85

**Wynik:**
- ⚠ Wykryto sprzeczność `narrative_180`
- Severity: 1.0 (krytyczne)
- Zalecana akcja: `lower_reliability`
- Reliability index źródła: 0.5 → 0.4

### Scenariusz 2: Korekta danych naukowych

**Stare badanie:**  
*"Lek jest skuteczny"*  
→ `support`, certainty: 0.95

**Korekta po recenzji:**  
*"Błąd w metodologii, lek nieskuteczny"*  
→ `oppose`, certainty: 0.4

**Wynik:**
- ⚠ Wykryto sprzeczność `opposite_relation` + `certainty_drop`
- Severity: 0.85
- Zalecana akcja: `flag_for_review`
- Alert utworzony do ręcznej weryfikacji

## 11. Testy Jednostkowe

### Uruchomienie testów:

```bash
npm run test src/lib/cybernetics/homeostat/contradiction-engine.test.ts
```

### Pokrycie testów:

✅ areRelationsOpposite() - wykrywanie przeciwnych typów  
✅ calculateContradictionSeverity() - obliczanie severity  
✅ Scenariusz: Zmiana narracji polityka  
✅ Scenariusz: Sprzeczność w badaniach naukowych  
✅ Scenariusz: Fałszywy alarm (nie powinno wykryć)  
⏭ Test integracyjny (wymaga Supabase) - skip

## 12. Wdrożenie w Supabase

### Krok 1: Uruchom SQL w Supabase SQL Editor:

```sql
-- Plik: schema-homeostat-alerts.sql
```

### Krok 2: Sprawdź czy tabele istnieją:

```sql
SELECT * FROM system_alerts LIMIT 1;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'correlations' AND column_name IN ('source_name', 'superseded_at');
```

### Krok 3: Przetestuj system:

1. Dodaj tekst przez Receptor Input
2. Dodaj drugi tekst ze sprzeczną narracją
3. Sprawdź dashboard - powinna pojawić się karta alertu

## 13. API Functions

### `detectContradictions(newRelations, params?)`

Główna funkcja detekcji.

**Parametry:**
- `newRelations: Correlation[]` - nowo dodane relacje
- `params?: Partial<ContradictionDetectionParams>` - opcjonalne parametry

**Zwraca:** `Promise<ContradictionReport>`

### `areRelationsOpposite(type1, type2)`

Sprawdza czy dwa typy relacji są przeciwne.

**Przykład:**
```typescript
areRelationsOpposite('positive_feedback', 'negative_feedback'); // true
areRelationsOpposite('supply', 'drain'); // true
```

### `calculateContradictionSeverity(impactDiff, certaintyDiff, isOpposite)`

Oblicza poziom krytyczności sprzeczności.

**Zwraca:** `number` (0-1)

## 14. Zgodność z Teorią Kosseckiego

| Koncept Kosseckiego | Implementacja |
|---------------------|---------------|
| **Homeostaza** | Detekcja sprzeczności stabilizuje system |
| **Sprzężenie ujemne** | Kara za nieretelność (obniżenie reliability_index) |
| **Pamięć operacyjna** | Lookback 365 dni w historii relacji |
| **Weryfikacja rzetelności** | Automatyczna ocena źródeł |
| **Alert sterowniczy** | system_alerts → ostrzeżenia w Efektorze |

## 15. Przyszłe Rozszerzenia

- [ ] Automatyczne wycofywanie relacji (superseded_at)
- [ ] Trendy zmian narracji (timeline)
- [ ] ML model do predykcji nieretelnych źródeł
- [ ] Integracja z zewnętrznymi fact-checkerami
- [ ] Dashboard alertów (lista wszystkich sprzeczności)
- [ ] Eksport raportów sprzeczności do PDF

## 16. Troubleshooting

### Problem: Brak wykrywania sprzeczności

**Rozwiązanie:**
1. Sprawdź czy `source_name` jest ustawiony w relacjach
2. Sprawdź parametry detekcji (czy thresholdy nie są za wysokie)
3. Sprawdź logi: `[HOMEOSTAT]` w konsoli serwera

### Problem: Za dużo fałszywych alarmów

**Rozwiązanie:**
1. Zwiększ `impact_diff_threshold` (np. do 0.7)
2. Zwiększ `min_severity_for_alert` (np. do 0.7)
3. Wyłącz `auto_penalize_source` dla okresu testów

---

**Autor:** AI Assistant (Claude Sonnet 4.5)  
**Rygor:** Zgodnie z Metacybernetyką doc. Józefa Kosseckiego  
**Status:** Produkcyjny ✅
