# Dokumentacja Komponentu: KORELATOR (Logic, Memory & Inference)
**Status:** Specyfikacja Rygorystyczna (na podstawie "Metacybernetyki" J. Kosseckiego)

## 1. Cel Celowniczy
Przetwarzanie sygnałów z Receptora, ich trwała retencja (pamięć) oraz tworzenie nowych asocjacji (wnioskowanie) przy zachowaniu ścisłego rygoru logicznego. Korelator buduje "Cybernetyczny Model Świata".

## 2. Podstawy Teoretyczne (Rygor Kosseckiego)
Korelator musi operować na parametrach energii i informacji:
- **Retencja (Pamięć):** Zdolność do trwałego przechowywania relacji. Każdy fakt ma "czas połowicznego rozpadu" lub współczynnik wzmocnienia.
- **Korelacja (Kojarzenie):** Tworzenie nowych informacji na podstawie zestawienia dwóch lub więcej komunikatów.
- **Potencjał Korelacyjny:** System musi oceniać, czy nowa informacja zwiększa możliwości sterownicze (wiedzę o otoczeniu).

## 3. Implementacja Techniczna (Stack: PostgreSQL + JSONB / Apache AGE + TypeScript)

### A. Struktura Bazy Danych (Supabase)
W przeciwieństwie do płaskich tabel, baza musi odzwierciedlać strukturę relacyjną.
```sql
-- Tabela Systemów (Obiektów)
CREATE TABLE cybernetic_systems (
    id UUID PRIMARY KEY,
    name TEXT,
    system_type TEXT, -- np. autonomiczny, heteronomiczny
    energy_level JSONB, -- {working_power, idle_power, available_power}
    retention_factor FLOAT DEFAULT 1.0
);

-- Tabela Relacji (Korelacji)
CREATE TABLE correlations (
    id UUID PRIMARY KEY,
    source_id UUID REFERENCES cybernetic_systems(id),
    target_id UUID REFERENCES cybernetic_systems(id),
    relation_type TEXT, -- np. sprzężenie zwrotne, zasilanie, sterowanie
    certainty_weight FLOAT, -- od 0 do 1 (weryfikacja przez Homeostat)
    created_at TIMESTAMP
);