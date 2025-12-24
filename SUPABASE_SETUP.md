# 🗄️ Supabase - Instrukcja Wdrożenia Schematu Bazy Danych

**Status:** ✅ Konfiguracja `.env` zakończona  
**Następny krok:** Wdrożenie schematu SQL

---

## 📋 Krok 1: Wejdź do SQL Editor w Supabase

1. Otwórz projekt w Supabase: https://supabase.com/dashboard
2. Przejdź do projektu: **qqxgegdcygqrptuviwmo**
3. W menu po lewej stronie kliknij **SQL Editor**
4. Kliknij przycisk **New Query** (+ nowe zapytanie)

---

## 📝 Krok 2: Skopiuj i Wykonaj Schemat SQL

Skopiuj **całą zawartość** pliku `schema.sql` i wklej do SQL Editor w Supabase.

### Treść schema.sql:

```sql
-- KOSSECKI METASYSTEM (KMS) - CORE DATABASE SCHEMA
-- Zgodne z rygorem: Receptor -> Korelator (Retencja) -> Homeostat -> Efektor

-- 1. Tabela obiektów (Systemy Autonomiczne i Inne)
CREATE TABLE cybernetic_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    system_class TEXT CHECK (system_class IN ('autonomous_system', 'heteronomous_system', 'environment', 'tool')),
    control_system_type TEXT CHECK (control_system_type IN ('cognitive', 'ideological', 'ethical', 'economic')),
    energy_params JSONB DEFAULT '{"working_power": 0, "idle_power": 0, "available_power": 0}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela relacji i sprzężeń (Korelator)
CREATE TABLE correlations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES cybernetic_objects(id) ON DELETE CASCADE,
    target_id UUID REFERENCES cybernetic_objects(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL,
    certainty_score FLOAT DEFAULT 0.0, 
    impact_factor FLOAT DEFAULT 1.0,
    evidence_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela reputacji źródeł (Homeostat)
CREATE TABLE source_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL,
    source_url TEXT UNIQUE,
    reliability_index FLOAT DEFAULT 0.5,
    civilization_profile TEXT,
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Logi retencyjne (Pamięć operacyjna korelatora)
CREATE TABLE raw_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    noise_level FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widok dla Korelatora do szukania łańcuchów sterowania (Recursive Search)
CREATE OR REPLACE VIEW v_control_chains AS
WITH RECURSIVE control_path AS (
    SELECT source_id, target_id, relation_type, 1 as depth
    FROM correlations
    UNION ALL
    SELECT cp.source_id, c.target_id, c.relation_type, cp.depth + 1
    FROM correlations c
    JOIN control_path cp ON c.source_id = cp.target_id
    WHERE cp.depth < 5
)
SELECT * FROM control_path;
```

### Wykonanie:

1. Wklej cały kod do SQL Editor
2. Kliknij **Run** (lub `Ctrl+Enter`)
3. Sprawdź czy pojawiło się "Success. No rows returned"

---

## ✅ Krok 3: Weryfikacja Schematu

W Supabase przejdź do **Table Editor** i sprawdź czy widzisz 4 tabele:
- ✅ `cybernetic_objects`
- ✅ `correlations`
- ✅ `source_intelligence`
- ✅ `raw_signals`

---

## 🧪 Krok 4: Test Połączenia

W terminalu projektu uruchom:

```bash
npm run test:supabase
```

**Oczekiwany wynik:**
```
[SUPABASE] Testuję połączenie z bazą danych...
[SUPABASE] ✓ Połączenie z bazą danych działa
[SUPABASE] Sprawdzam schemat bazy danych...
[SUPABASE] ✓ Wszystkie wymagane tabele istnieją
[SUPABASE] ✓ Baza danych gotowa do użycia!
```

---

## 🔧 Rozwiązywanie Problemów

### Problem: "relation does not exist"

**Rozwiązanie:**  
Schemat nie został wdrożony. Powtórz Krok 2.

### Problem: "Invalid API key"

**Rozwiązanie:**  
Sprawdź czy w `.env` masz poprawne wartości:
```bash
cat .env | grep SUPABASE
```

### Problem: "permission denied"

**Rozwiązanie:**  
Użyj klucza `service_role` zamiast `anon` (znajdziesz go w Settings → API → service_role key)

**UWAGA:** Klucz `service_role` daje pełny dostęp do bazy! Nie commituj go do git!

---

## 📊 Struktura Bazy Danych (Zgodność z Kossecki)

### 1. cybernetic_objects
**Cel:** Przechowywanie obiektów elementarnych z teorii poznania Kosseckiego  
**Pola:**
- `system_class` - Typ systemu (autonomiczny/heteronomiczny/otoczenie/narzędzie)
- `control_system_type` - Dominujący system sterowania (poznawczy/ideologiczny/etyczny/ekonomiczny)
- `energy_params` - Parametry energetyczne (moc robocza/jałowa/swobodna)

### 2. correlations
**Cel:** Mapowanie relacji sterowniczych między obiektami  
**Pola:**
- `relation_type` - Typ relacji (direct_control/positive_feedback/negative_feedback/supply)
- `certainty_score` - Waga rzetelności (0-1, nadawana przez Homeostat)
- `impact_factor` - Siła wpływu
- `evidence_data` - Dowody empiryczne (JSONB)

### 3. source_intelligence
**Cel:** Ocena reaktywności i wiarygodności źródeł informacji  
**Pola:**
- `reliability_index` - Indeks rzetelności poznawczej (0-1)
- `civilization_profile` - Profil cywilizacyjny (latin/byzantine/turandot)

### 4. raw_signals
**Cel:** Pamięć operacyjna Korelatora (surowe sygnały przed przetworzeniem)  
**Pola:**
- `content` - Surowy tekst
- `processed` - Czy przetworzony przez Receptor
- `noise_level` - Poziom szumu semantycznego

### 5. v_control_chains (VIEW)
**Cel:** Rekurencyjne wyszukiwanie łańcuchów sterowania  
**Funkcjonalność:** Odpowiada na pytanie "Kto pośrednio steruje X?"  
**Głębokość:** Do 5 poziomów relacji

---

## 🚀 Następne Kroki

Po wdrożeniu schematu możesz:

1. **Przetestować Korelator:**
   ```bash
   npm run demo:korelator
   ```

2. **Zapisać pierwszy obiekt:**
   ```typescript
   import { supabase } from './src/lib/supabase/client';
   
   const { data, error } = await supabase
     .from('cybernetic_objects')
     .insert({
       name: 'Państwo X',
       system_class: 'autonomous_system',
       control_system_type: 'cognitive',
     });
   ```

3. **Zintegrować Receptor z Korelatorem:**
   - Receptor przetwarza tekst → wyodrębnia obiekty i relacje
   - Korelator zapisuje je w Supabase → buduje graf wiedzy

---

## 📚 Dokumentacja Supabase

- **Dashboard:** https://supabase.com/dashboard/project/qqxgegdcygqrptuviwmo
- **SQL Editor:** https://supabase.com/dashboard/project/qqxgegdcygqrptuviwmo/sql
- **Table Editor:** https://supabase.com/dashboard/project/qqxgegdcygqrptuviwmo/editor
- **API Docs:** https://supabase.com/dashboard/project/qqxgegdcygqrptuviwmo/api

---

**Autor:** KOSSECKI METASYSTEM (KMS)  
**Zgodność:** Metacybernetyka doc. Józefa Kosseckiego (2005)  
**Data:** 2025-01-22

