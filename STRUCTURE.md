# Struktura Projektu KOSSECKI METASYSTEM (KMS)

## 📁 Hierarchia Katalogów

```
KOSSECKI METASYSTEM (KMS)/
│
├── .ai/                                    # Dokumentacja AI i kontekst
│   ├── help-context.md
│   ├── masterpropt.md
│   ├── RECEPTOR.md
│   ├── KORELATOR.md
│   ├── HOMEOSTAT.md
│   ├── EFEKTOR.md
│   ├── KORELATOR_SEARCH_LOGIC.md
│   └── jk-metacybernetyka.doc
│
├── .cursor/rules/                          # Reguły dla Cursor AI
│   └── cursorrules.mdc
│
├── src/                                    # Kod źródłowy aplikacji
│   ├── lib/
│   │   └── cybernetics/                   # 🧠 RDZEŃ CYBERNETYCZNY
│   │       ├── types.ts                   # Interfejsy energetyczno-informacyjne
│   │       ├── constants.ts               # Stałe i progi cybernetyczne
│   │       ├── index.ts                   # Publiczne API modułu
│   │       │
│   │       ├── receptor/                  # 📥 ORGAN WEJŚCIOWY
│   │       │   └── README.md              # Dokumentacja Receptora
│   │       │
│   │       ├── korelator/                 # 🧮 ORGAN LOGIKI I PAMIĘCI
│   │       │   └── README.md              # Dokumentacja Korelatora
│   │       │
│   │       ├── homeostat/                 # 🛡️ ORGAN WERYFIKACJI
│   │       │   └── README.md              # Dokumentacja Homeostatu
│   │       │
│   │       └── efektor/                   # 📤 ORGAN WYJŚCIOWY
│   │           └── README.md              # Dokumentacja Efektora
│   │
│   ├── components/                        # Komponenty UI
│   │   └── Welcome.astro
│   │
│   ├── layouts/                           # Layouty Astro
│   │   └── Layout.astro
│   │
│   ├── pages/                             # Strony (routing)
│   │   └── index.astro
│   │
│   └── assets/                            # Zasoby statyczne
│       ├── astro.svg
│       └── background.svg
│
├── public/                                # Pliki publiczne
│   └── favicon.svg
│
├── dist/                                  # Build produkcyjny (generowany)
│
├── node_modules/                          # Zależności (generowane)
│
├── .astro/                                # Cache Astro (generowane)
│
├── astro.config.mjs                       # Konfiguracja Astro
├── tsconfig.json                          # Konfiguracja TypeScript (Strict Mode)
├── package.json                           # Zależności projektu
├── package-lock.json                      # Lockfile npm
├── .gitignore                             # Ignorowane pliki Git
├── README.md                              # Dokumentacja główna
└── STRUCTURE.md                           # Ten plik
```

## 🧬 Moduł Cybernetyczny - Szczegóły

### `src/lib/cybernetics/types.ts`
**Linie kodu:** ~350  
**Zawartość:**
- `EnergyParameters` - parametry energetyczne Mazura
- `InformationParameters` - parametry informacyjne Kosseckiego
- `CyberneticObject` - obiekt cybernetyczny (węzeł w grafie)
- `ControlProcess` - proces sterowania (krawędź w grafie)
- `HomeostatAlert` - alert bezpieczeństwa
- `AnalysisResult` - wynik analizy dla użytkownika
- `CyberneticContext` - kontekst globalny systemu

### `src/lib/cybernetics/constants.ts`
**Linie kodu:** ~150  
**Zawartość:**
- Progi pewności (certainty thresholds)
- Progi energetyczne
- Parametry retencji (pamięci)
- Wagi typów źródeł
- Klasyfikacja cywilizacyjna
- Koszty operacji

### Organy Cybernetyczne (do implementacji)

#### 1. **RECEPTOR** (`receptor/`)
**Planowane pliki:**
- `validator.ts` - Schematy Zod
- `extractor.ts` - Ekstrakcja obiektów i relacji
- `classifier.ts` - Klasyfikacja typu źródła
- `index.ts` - Publiczne API

#### 2. **KORELATOR** (`korelator/`)
**Planowane pliki:**
- `storage.ts` - Interfejs do Supabase
- `graph.ts` - Operacje na grafie wiedzy
- `search.ts` - Wyszukiwanie hybrydowe
- `inference.ts` - Wnioskowanie
- `index.ts` - Publiczne API

#### 3. **HOMEOSTAT** (`homeostat/`)
**Planowane pliki:**
- `verifier.ts` - Weryfikacja prawdziwości
- `detector.ts` - Wykrywanie dezinformacji
- `classifier.ts` - Klasyfikacja cywilizacyjna
- `alerter.ts` - Generowanie alertów
- `index.ts` - Publiczne API

#### 4. **EFEKTOR** (`efektor/`)
**Planowane pliki:**
- `reporter.ts` - Generowanie raportów
- `qa-generator.ts` - Pytania uzupełniające
- `formatter.ts` - Formatowanie dla UI
- `index.ts` - Publiczne API

## 🔧 Konfiguracja

### TypeScript (`tsconfig.json`)
- **Mode:** Strict
- **Aliasy:**
  - `@/*` → `src/*`
  - `@cybernetics/*` → `src/lib/cybernetics/*`
  - `@components/*` → `src/components/*`

### Package (`package.json`)
- **Nazwa:** kossecki-metasystem
- **Wersja:** 0.1.0
- **Framework:** Astro 5.16.6+

## 📊 Statystyki

- **Pliki TypeScript:** 3 (types.ts, constants.ts, index.ts)
- **Pliki dokumentacji:** 6 (README.md + 4x organ README + STRUCTURE.md)
- **Linie kodu (core):** ~500
- **Katalogi organów:** 4 (receptor, korelator, homeostat, efektor)

## 🚀 Następne Kroki

1. **Implementacja Receptora** - walidacja Zod, ekstrakcja relacji
2. **Konfiguracja Supabase** - schema.sql, auth, storage
3. **Implementacja Korelatora** - graf wiedzy, wyszukiwanie
4. **Implementacja Homeostatu** - weryfikacja, alerty
5. **Implementacja Efektora** - UI, raporty, QA
6. **Integracja LangGraph** - pętle sprzężeń zwrotnych
7. **UI/UX** - Tailwind CSS 4, Shadcn/ui

## 📖 Dokumentacja Referencyjna

- [README główny](README.md)
- [RECEPTOR](src/lib/cybernetics/receptor/README.md)
- [KORELATOR](src/lib/cybernetics/korelator/README.md)
- [HOMEOSTAT](src/lib/cybernetics/homeostat/README.md)
- [EFEKTOR](src/lib/cybernetics/efektor/README.md)

---

**Status:** ✅ Inicjalizacja zakończona  
**Data:** 2025-12-23  
**Wersja:** 0.1.0

