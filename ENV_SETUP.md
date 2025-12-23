# KOSSECKI METASYSTEM (KMS) - Konfiguracja Środowiska

## 1. Instalacja Zależności

```bash
npm install
```

## 2. Konfiguracja Zmiennych Środowiskowych

Utwórz plik `.env` w głównym katalogu projektu:

```env
# OPENROUTER API KEY (WYMAGANE)
# Pobierz klucz API z: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# MODEL AI (OPCJONALNE)
# Domyślny: anthropic/claude-3.5-sonnet
AI_MODEL=anthropic/claude-3.5-sonnet
```

## 3. Szybkie Demo (Bez Instalacji Testów)

```bash
# Uruchom demo Receptora (3 przykłady: Cognitive/Mixed/Ideological)
npm run demo:receptor
```

## 4. Uruchomienie Testów Receptora (Pełne Testy Jednostkowe)

```bash
# Instalacja zależności testowych (jeśli nie zainstalowane)
npm install

# Wszystkie testy
npm test

# Tylko testy Receptora
npm run test:receptor

# Tryb watch (automatyczne ponowne uruchamianie)
npm run test:watch
```

## 5. Uruchomienie Aplikacji

```bash
# Tryb deweloperski
npm run dev

# Build produkcyjny
npm run build

# Podgląd buildu
npm run preview
```

## 6. Testy Jednostkowe - Opis

### Test 1: Cognitive Clarity
Weryfikuje czy Receptor poprawnie rozpoznaje tekst naukowy/techniczny:
- Oczekiwany `semantic_noise_level < 0.4`
- Oczekiwany `signal_status = "CLEAR"`
- Oczekiwany `dominant_system_type = "cognitive"`

### Test 2: Ideological Noise
Weryfikuje czy Receptor wykrywa propagandę i terminologię wartościującą:
- Oczekiwany `semantic_noise_level >= 0.6`
- Oczekiwany `signal_status = "WARNING"` lub `"REJECT"`
- Oczekiwane `ideological_flags` (wykryte flagi)

### Test 3: Gradacja Statusu
Weryfikuje poprawność klasyfikacji CLEAR/WARNING/REJECT

### Test 4: Mechanizm Fallback
Weryfikuje czy system przełącza się na alternatywne modele przy awarii

### Test 5: Walidacja Integralności
Weryfikuje odrzucanie pustych i zbyt długich tekstów

## 7. Struktura Projektu

```
src/
  lib/
    cybernetics/
      receptor/
        validator.ts      # Schematy Zod i walidacja
        extractor.ts      # Główna logika ekstrakcji (LLM)
        extractor.test.ts # Testy jednostkowe
        classifier.ts     # Klasyfikacja źródeł
        index.ts          # Publiczne API
```

## 8. Zgodność z Rygorem Kosseckiego

Wszystkie komponenty systemu są zgodne z:
- 8 aksjomatami teorii poznania Kosseckiego
- Modelem energetyczno-informacyjnym Mazura
- Klasyfikacją systemów sterowania (Poznawczy/Ideologiczny/Etyczny/Ekonomiczny)
- Zasadą homeostazy (mechanizm fallback)
- Zasadą sprzężenia zwrotnego (walidacja integralności)

