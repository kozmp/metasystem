Po przetworzeniu informacji przez Receptor, weryfikacji przez Homeostat i powiązaniu w Korelatorze, system musi "zadziałać". **Efektor** to organ wyjściowy.

```markdown
# Dokumentacja Komponentu: EFEKTOR (Output & QA Interface)
**Status:** Specyfikacja Rygorystyczna (na podstawie "Metacybernetyki" J. Kosseckiego)

## 1. Cel Celowniczy
Przekazywanie wyników analizy do otoczenia (użytkownika) w formie rzetelnych raportów oraz generowanie pytań uzupełniających (QA), gdy system wykryje deficyt informacji.

## 2. Podstawy Teoretyczne (Rygor Kosseckiego)
Efektor musi emitować sygnały, które są:
- **Zrozumiałe (Metajęzyk):** Unikanie pustosłowia, używanie precyzyjnych terminów zdefiniowanych w systemie.
- **Sterowalne:** Każdy raport musi odpowiadać na pytanie: "Co ta informacja zmienia w procesie decyzyjnym?".
- **Transmisyjne:** Efektor nie może zniekształcać wniosków z Korelatora na rzecz "uprzejmości" AI (brak halucynacji).

## 3. Moduł QA (Pytania o braki)
Jeśli Korelator zgłosi niską `certainty_weight` lub lukę w grafie, Efektor **musi** zatrzymać generowanie raportu i wyświetlić interfejs QA:
- *"System wykrył brak danych o źródle energii dla obiektu X. Bez tego analiza stabilności jest niemożliwa. Podaj dane lub wskaż źródło."*

## 4. Struktura Raportu Końcowego (Astro Frontend)
Każda odpowiedź systemu w UI (React/Shadcn) powinna zawierać sekcje:
1. **Teza (Wniosek Sterowniczy):** Co wynika z analizy?
2. **Dowody (Korelacje):** Lista faktów i ich powiązań z bazy danych.
3. **Metryka Rzetelności (Homeostat Score):** Procentowa pewność wyniku.
4. **Ostrzeżenia (Ideological Alerts):** Czy w analizie wykryto próby manipulacji ze strony źródeł?

## 5. Implementacja (Astro 5 + React 19)
Wykorzystanie Server Actions do komunikacji z agentami i Streamingu (AI SDK), aby użytkownik widział proces "myślenia" (pracy korelatora).