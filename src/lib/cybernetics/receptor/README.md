# RECEPTOR - Organ Wejściowy ✅ ZAIMPLEMENTOWANY + WZMOCNIONY

## Cel Celowniczy
Przekształcenie nieuporządkowanych danych wejściowych (Natural Language) na ustrukturyzowany metajęzyk cybernetyczny zgodny z typami z `types.ts`.

## Odpowiedzialności
1. **Walidacja Semantyczna** - Wykorzystanie Zod do weryfikacji struktury danych
2. **Ekstrakcja Relacji** - Identyfikacja obiektów i relacji między nimi za pomocą AI
3. **Klasyfikacja Źródła** - Określenie typu systemu sterowania (cognitive/ideological/ethical/economic)
4. **Filtracja Szumu** - Odrzucanie informacji niejasnych lub sprzecznych
5. **Gradacja Sygnału** - Klasyfikacja CLEAR/WARNING/REJECT na podstawie poziomu szumu
6. **Homeostaza** - Mechanizm fallback przy awarii API (retry z alternatywnymi modelami)

## Struktura Plików
- ✅ `validator.ts` - Schematy Zod dla walidacji wejścia + gradacja szumu (~400 linii)
- ✅ `extractor.ts` - Ekstrakcja obiektów i relacji z tekstu przez AI + fallback (~400 linii)
- ✅ `extractor.test.ts` - Testy jednostkowe (Cognitive Clarity + Ideological Noise) (~300 linii)
- ✅ `classifier.ts` - Klasyfikacja typu źródła (~200 linii)
- ✅ `index.ts` - Publiczne API modułu (~100 linii)
- ✅ `example.ts` - Przykłady użycia (~150 linii)

## Zasady Implementacji (Rygor Kosseckiego)
- Każdy input MUSI przejść przez walidację Zod
- **Gradacja szumu semantycznego:**
  - `0.0-0.4` = **STATUS: CLEAR** - Pełna akceptacja sygnału
  - `0.4-0.7` = **STATUS: WARNING** - Akceptacja warunkowa, wymaga weryfikacji użytkownika
  - `>0.7` = **STATUS: REJECT** - Odrzucenie sygnału, zbyt wysoki poziom szumu
- **Anti-Ideology Tuning:** Każdy przymiotnik wartościujący bez osadzenia w mierzalnych parametrach podnosi `semantic_noise_level`
- Receptor NIE interpretuje - tylko strukturyzuje zgodnie z promptem systemowym
- **Mechanizm fallback:** Jeśli główny model zawiedzie, system automatycznie próbuje alternatywnych modeli:
  1. `anthropic/claude-3.5-sonnet` (priorytet 1)
  2. `openai/gpt-4o` (fallback 1)
  3. `google/gemini-flash-1.5` (fallback 2)

## Użycie

### Prosty przykład:
```typescript
import { processInput } from '@cybernetics/receptor';

const text = "Państwo X dotuje firmę Y kwotą 100 mln.";
const result = await processInput(text);

if ('error_type' in result) {
  console.error('Błąd:', result.message);
} else {
  console.log('Obiekty:', result.objects);
  console.log('Relacje:', result.relations);
}
```

### Uruchomienie testów:
```bash
# Ustaw klucz API w .env
echo "OPENROUTER_API_KEY=your_key_here" > .env

# Uruchom testy jednostkowe Receptora
npm run test:receptor

# Uruchom wszystkie testy
npm test

# Tryb watch
npm run test:watch
```

## Testy Jednostkowe

### Test 1: Cognitive Clarity
Weryfikuje czy Receptor poprawnie rozpoznaje tekst naukowy/techniczny:
- Tekst: Opis techniczny elektrowni jądrowej Fukushima
- Oczekiwany wynik: `noise_level < 0.4`, `status = "CLEAR"`, `system_type = "cognitive"`

### Test 2: Ideological Noise
Weryfikuje czy Receptor wykrywa propagandę i terminologię wartościującą:
- Tekst: Propagandowy tekst z przymiotnikami wartościującymi
- Oczekiwany wynik: `noise_level >= 0.6`, `status = "WARNING"` lub `"REJECT"`, wykryte `ideological_flags`

### Test 3: Gradacja Statusu
Weryfikuje poprawność klasyfikacji CLEAR/WARNING/REJECT dla różnych poziomów szumu

### Test 4: Mechanizm Fallback
Weryfikuje czy system przełącza się na alternatywne modele przy awarii głównego modelu

### Test 5: Walidacja Integralności
Weryfikuje odrzucanie pustych i zbyt długich tekstów

## Status: ✅ GOTOWY DO UŻYCIA + PRZETESTOWANY

