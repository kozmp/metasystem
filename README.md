# KOSSECKI METASYSTEM (KMS)

System rzetelnego researchu oparty na **Metacybernetyce** doc. Józefa Kosseckiego.

## 🎯 Cel Systemu

Budowa aplikacji do rzetelnego researchu, która nie tylko streszcza dane, ale **analizuje je jako procesy sterownicze**, wykrywając dezinformację poprzez analizę energetyczno-informacyjną i cywilizacyjną.

## 🏗️ Architektura Cybernetyczna

System zbudowany jest w oparciu o 4 organy cybernetyczne:

### 1. **RECEPTOR** (Input & Semantic Analysis)
- Walidacja i strukturyzacja danych wejściowych
- Ekstrakcja obiektów i relacji
- Klasyfikacja typu źródła (Poznawczy/Ideologiczny/Etyczny/Ekonomiczny)
- Filtracja szumu informacyjnego

### 2. **KORELATOR** (Logic, Memory & Inference)
- Retencja (trwała pamięć) obiektów i relacji
- Budowa grafu wiedzy (PostgreSQL + JSONB)
- Hybrydowe wyszukiwanie (wektorowe + relacyjne)
- Wnioskowanie i kojarzenie faktów

### 3. **HOMEOSTAT** (Verification & Stability)
- Weryfikacja prawdziwości informacji
- Wykrywanie dezinformacji i manipulacji
- Klasyfikacja cywilizacyjna źródeł
- Generowanie alertów bezpieczeństwa

### 4. **EFEKTOR** (Output & QA Interface)
- Generowanie raportów końcowych
- Interfejs pytań uzupełniających (QA)
- Prezentacja wyników w UI (Astro + React)
- Streaming procesu "myślenia"

## 🛠️ Stack Technologiczny

- **Frontend:** Astro 5 (Server Islands, View Transitions), React 19
- **Styling:** Tailwind CSS 4, Shadcn/ui
- **Typowanie:** TypeScript 5 (Strict Mode)
- **Backend:** Supabase (Auth, Storage, PostgreSQL)
- **AI/Logic:** LangGraph (pętle sprzężeń zwrotnych), OpenRouter API
- **DevOps:** Docker, GitHub Actions

## 📘 Podstawy Teoretyczne

System implementuje literalnie koncepcje z "Metacybernetyki" (2005):

- **Informacja** = transformacja między stanami korelatora (nie tekst!)
- **Prawda** = zgodność modelu z rzeczywistością empiryczną
- **Dezinformacja** = celowe wprowadzanie szumu sterowniczego
- **Moc Swobodna** = zasoby dostępne na sterowanie strategiczne
- **Sprzężenie Zwrotne** = dodatnie (niestabilność) vs ujemne (homeostaza)

## 📂 Struktura Projektu

```
src/
├── lib/
│   └── cybernetics/
│       ├── types.ts           # Interfejsy energetyczno-informacyjne
│       ├── receptor/          # Organ wejściowy
│       ├── korelator/         # Organ logiki i pamięci
│       ├── homeostat/         # Organ weryfikacji
│       └── efektor/           # Organ wyjściowy
├── components/
│   └── ui/                    # Shadcn/ui components
└── pages/                     # Astro routes
```

## 🚀 Rozpoczęcie Pracy

### ⚡ Szybki Start (5 minut)

**Chcesz od razu przetestować system?**

👉 **[QUICK_START.md](QUICK_START.md)** - Instrukcja krok po kroku

### 📖 Szczegółowa Konfiguracja

```bash
# Instalacja zależności
npm install

# Konfiguracja zmiennych środowiskowych
# Utwórz plik .env i dodaj:
# OPENROUTER_API_KEY=your_api_key_here
# (Pobierz klucz z: https://openrouter.ai/keys)
```

Szczegółowe instrukcje: [ENV_SETUP.md](ENV_SETUP.md)

### 2. Uruchomienie Testów

```bash
# Wszystkie testy jednostkowe
npm test

# Tylko testy Receptora (Cognitive Clarity + Ideological Noise)
npm run test:receptor

# Tryb watch (automatyczne ponowne uruchamianie)
npm run test:watch
```

### 3. Uruchomienie Aplikacji

```bash
# Uruchomienie serwera deweloperskiego
npm run dev

# Build produkcyjny
npm run build

# Podgląd buildu
npm run preview
```

## 📖 Dokumentacja

Każdy organ cybernetyczny posiada własny plik `README.md` w swoim katalogu:

- [RECEPTOR](src/lib/cybernetics/receptor/README.md)
- [KORELATOR](src/lib/cybernetics/korelator/README.md)
- [HOMEOSTAT](src/lib/cybernetics/homeostat/README.md)
- [EFEKTOR](src/lib/cybernetics/efektor/README.md)

## 🧬 Zasady Kodowania

1. **Rygor Semantyczny:** Każdy obiekt jest relacyjny, nie ma cech izolowanych
2. **Zakaz Halucynacji:** AI nie może "zgadywać" - tylko mapować relacje
3. **Dokumentacja Cybernetyczna:** Każda funkcja ma JSDoc z odniesieniem do Kosseckiego/Mazura
4. **Strict TypeScript:** Wszystkie typy muszą odzwierciedlać parametry cybernetyczne

## 📚 Bibliografia

- Kossecki, Józef. *Metacybernetyka*. Wydawnictwo Naukowe PWN, 2005.
- Mazur, Marian. *Cybernetyka i charakter*. PIW, 1976.

## 👨‍💻 Autor

KOSSECKI METASYSTEM (KMS) - System zbudowany zgodnie z rygorem naukowym doc. Józefa Kosseckiego.

---

## ✅ Status Implementacji

### RECEPTOR (Organ Wejściowy) - ✅ ZAIMPLEMENTOWANY
- ✅ Schematy Zod (walidacja semantyczna)
- ✅ Ekstrakcja obiektów i relacji przez LLM (OpenRouter)
- ✅ Gradacja szumu semantycznego (CLEAR/WARNING/REJECT)
- ✅ Anti-Ideology Tuning (detekcja przymiotników wartościujących)
- ✅ Mechanizm fallback (homeostaza systemu)
- ✅ Testy jednostkowe (Cognitive Clarity + Ideological Noise)

### KORELATOR (Organ Logiki) - 🚧 W TRAKCIE
- ⏳ Integracja z PostgreSQL (Supabase)
- ⏳ Graf wiedzy (Recursive CTE)
- ⏳ Hybrydowe wyszukiwanie

### HOMEOSTAT (Organ Weryfikacji) - 📋 ZAPLANOWANY
- ⏳ Algorytmy weryfikacji prawdy
- ⏳ Klasyfikacja cywilizacyjna źródeł

### EFEKTOR (Organ Wyjściowy) - 📋 ZAPLANOWANY
- ⏳ Generator raportów
- ⏳ Interfejs QA

**Ostatnia aktualizacja:** 2025-01-22
