# 🔑 INSTRUKCJA: Dodanie kluczy Supabase

**Problem:** Komponenty React w dashboardzie nie mogą połączyć się z bazą danych, ponieważ brakuje kluczy PUBLIC_ w pliku `.env`.

---

## 📋 KROK PO KROKU:

### 1. Otwórz plik `.env` w głównym katalogu projektu

Jeśli plik nie istnieje, utwórz go:
```bash
# W głównym katalogu projektu:
New-Item -Path .env -ItemType File
```

### 2. Sprawdź aktualne klucze

Prawdopodobnie masz w `.env` coś takiego:
```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJxxxxxxxxxxxx
```

### 3. Dodaj DUPLIKATY z prefiksem PUBLIC_

Skopiuj swoje klucze Supabase i dodaj je ponownie z prefiksem `PUBLIC_`:

**WAŻNE:** To muszą być IDENTYCZNE wartości!

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx

# Server-side
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJxxxxxxxxxxxx

# Client-side (DODAJ TE LINIE)
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_KEY=eyJxxxxxxxxxxxx
```

### 4. Zrestartuj serwer dev

```powershell
# Zatrzymaj serwer (Ctrl+C w terminalu)
# Lub zabij proces:
taskkill /F /IM node.exe

# Uruchom ponownie:
npm run dev
```

### 5. Odśwież przeglądarkę

```
http://localhost:4325/dashboard
```

---

## ❓ DLACZEGO DUPLIKACJA?

Astro (framework) ma specjalną zasadę bezpieczeństwa:

1. **Zmienne BEZ prefiksu PUBLIC_:**
   - Dostępne tylko na serwerze (Node.js)
   - Używane w API endpoints
   - BEZPIECZNE - nie są widoczne w przeglądarce

2. **Zmienne Z prefiksem PUBLIC_:**
   - Dostępne w przeglądarce (JavaScript)
   - Używane w komponentach React client-side
   - PUBLICZNE - każdy może je zobaczyć w DevTools

**W naszym przypadku:**
- `SUPABASE_KEY` to **anon key** (klucz publiczny), więc bezpiecznie można go eksponować
- Duplikacja jest konieczna dla komponentów typu:
  - `StatisticsPanel` - pobiera statystyki z bazy
  - `ObjectsTable` - pobiera listę obiektów
  - `RelationGraph` - pobiera graf relacji

---

## 🔍 JAK ZNALEŹĆ KLUCZE SUPABASE?

1. Wejdź na: https://supabase.com/dashboard
2. Wybierz swój projekt
3. **Settings** → **API**
4. Skopiuj:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`

---

## ✅ JAK SPRAWDZIĆ CZY DZIAŁA?

Po restarcie serwera i odświeżeniu przeglądarki powinieneś zobaczyć:

1. ✅ **Panel Statystyk** (liczba obiektów, relacji, certainty score)
2. ✅ **Tabela Obiektów** (lista wszystkich obiektów z bazy)
3. ✅ **Graf Relacji 3D** (interaktywna wizualizacja)
4. ✅ **Formularz Receptora** (już działa)

Jeśli nadal błąd w konsoli (F12):
```
Error: Brak konfiguracji Supabase
```

Sprawdź:
- Czy klucze PUBLIC_ są identyczne jak zwykłe?
- Czy zrestartowałeś serwer?
- Czy nie ma literówki w nazwach zmiennych?

---

## 📝 PRZYKŁAD KOMPLETNEGO `.env`:

```env
# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t9u8v7w6x5y4z3a2b1c0d9e8f

# Supabase - Server-side
SUPABASE_URL=https://abcdefghijklmno.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ubyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMTU1NzYwMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase - Client-side (DUPLIKACJA!)
PUBLIC_SUPABASE_URL=https://abcdefghijklmno.supabase.co
PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ubyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMTU1NzYwMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**UWAGA:** To są przykładowe wartości! Użyj SWOICH kluczy z Supabase!

---

## 🚀 PO DODANIU KLUCZY

Dashboard powinien w pełni działać:
- Panel ze statystykami systemu
- Tabela z 6+ obiektami cybernetycznymi
- Graf relacji 3D (można obracać myszką)
- Formularz do wprowadzania nowych tekstów

**Wszystkie 4 organy cybernetyczne będą działać w 100%! 🎉**

---

**Autor:** KOSSECKI METASYSTEM (KMS)  
**Data:** 2026-01-02

