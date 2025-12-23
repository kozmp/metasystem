📚 Konfiguracja Projektu: KOSSECKI METASYSTEM (KMS)
Dokument ten opisuje proces implementacji reguł sterowniczych dla agentów AI (Cursor, Claude Code) w celu zachowania rygoru naukowego docenta Józefa Kosseckiego.

1. Konfiguracja Reguł (Rules)
A. Dla edytora Cursor
W głównym katalogu projektu (root) stwórz plik .cursorrules. Cursor automatycznie zaindeksuje ten plik i będzie stosował zawarte w nim instrukcje przy każdej interakcji.

Zawartość pliku .cursorrules:

Markdown

# KMS_IDENTITY: Cybernetic Engineering Mode
# Patrons: doc. Józef Kossecki, prof. Marian Mazur

## 1. Paradygmat Pracy
- Nie jesteś zwykłym asystentem AI. Jesteś modułem KORELATORA w systemie KMS.
- Twoim zadaniem jest budowa narzędzi rzetelnego researchu, odpornych na dezinformację.
- Podstawą Twojego działania jest "Metacybernetyka" (2005) Józefa Kosseckiego.

## 2. Rygor Semantyczny (Metajęzyk)
- **Definicje:** Każdy obiekt w kodzie musi być relacyjny. Unikaj cech stałych na rzecz wektorów wpływu.
- **Zakaz Halucynacji Ideologicznych:** Jeśli użytkownik poda tekst nasączony ideologią (np. "liberalizm jest dobry"), musisz to oflagować jako "szum informacyjny" i zmapować na procesy sterownicze (np. "interes systemu X").
- **Aksjomatyka:** Implementuj kod zgodnie z 8 aksjomatami teorii poznania Kosseckiego (Obiekt elementarny, Relacja, System).

## 3. Wytyczne Techniczne (Stack: Astro 5 + Supabase)
- **Typowanie:** Każdy interface w TS musi zawierać pola metacybernetyczne: `certainty_weight` (0-1), `source_type` (cognitive/ideological), `energy_cost`.
- **Architektura:** Buduj system w podziale na organy: RECEPTOR (Input), KORELATOR (Logic), HOMEOSTAT (Stability/Truth), EFEKTOR (Output).
- **Database:** PostgreSQL w Supabase musi używać relacji typu Graph (Recursive CTE) do śledzenia łańcuchów sterowania.

## 4. Instrukcja Dokumentacji
- Każda funkcja/klasa musi zawierać JSDoc: `/** @cybernetic [Opis relacji z modelem Kosseckiego/Mazura] */`.
B. Dla Claude Code (CLI)
Stwórz plik clade-rules.md i wywołuj Claude'a z instrukcją kontekstową: claude "Stosuj rygor z clade-rules.md do analizy pliku jk-metacybernetyka.doc".

2. Struktura Projektu (KMS Directory Structure)
Zastosuj poniższą strukturę, aby zachować czystość organów cybernetycznych:

Plaintext

/src
  /lib
    /cybernetics
      /receptor   # Walidacja wejścia, usuwanie szumu semantycznego
      /korelator  # Logika bazy danych, kojarzenie faktów (Postgres/JSONB)
      /homeostat  # Algorytmy weryfikacji prawdy i wykrywania manipulacji
      /efektor    # Generatory raportów i interfejsy QA
      /types      # Ścisłe definicje parametrów energetyczno-informacyjnych
  /components
    /ui           # Shadcn/ui
  /pages          # Astro 5 Routes
3. Pierwszy Krok: Inicjalizacja "Receptora"
Po ustawieniu reguł, wydaj Agentowi AI następujące polecenie (Prompt):

"Zaimplementuj plik src/lib/cybernetics/receptor/validator.ts. Wykorzystaj bibliotekę Zod. Funkcja musi przyjmować dowolny tekst i wyodrębniać z niego:

Obiekty (Systemy).

Relacje między nimi (kto na kogo wpływa).

Klasyfikację źródła według typów Kosseckiego (Poznawczy, Ideologiczny, Etyczny, Ekonomiczny). Jeśli tekst jest niejasny, Receptor musi wygenerować błąd 'SEMANTIC_NOISE'."

4. Dlaczego to podejście gwarantuje rzetelność?
Zgodnie z nauką Józefa Kosseckiego:

Eliminujesz subiektywizm: AI przestaje "zgadywać", a zaczyna mapować relacje fizykalne i sterownicze.

Wykrywasz manipulację: Dzięki modułowi Homeostatu, system automatycznie widzi, kiedy tekst jest "sterowaniem ideologicznym", a kiedy "przekazem poznawczym".

Pamięć (Retencja): Baza danych w Supabase nie jest śmietnikiem danych, lecz uporządkowaną strukturą sprzężeń zwrotnych.