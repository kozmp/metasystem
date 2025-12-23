# EFEKTOR - Organ Wyjściowy

## Cel Celowniczy
Przekazywanie wyników analizy do otoczenia (użytkownika) w formie rzetelnych raportów oraz generowanie pytań uzupełniających (QA), gdy system wykryje deficyt informacji.

## Odpowiedzialności
1. **Generowanie Raportów** - Tworzenie `AnalysisResult` z tezą, dowodami, metryką
2. **Interfejs QA** - Zadawanie pytań użytkownikowi przy brakach informacji
3. **Prezentacja UI** - Wyraźne oddzielanie Faktów od Opinii
4. **Streaming** - Pokazywanie procesu "myślenia" systemu w czasie rzeczywistym

## Struktura Plików
- `reporter.ts` - Generowanie raportów końcowych
- `qa-generator.ts` - Tworzenie pytań uzupełniających
- `formatter.ts` - Formatowanie wyników dla UI
- `index.ts` - Publiczne API modułu

## Zasady Implementacji
- UI MUSI wyraźnie oddzielać Fakty (System Poznawczy) od Opinii (System Ideologiczny)
- Jeśli `requires_qa = true`, Efektor MUSI zatrzymać output i wyświetlić formularz
- Każdy raport zawiera: Tezę, Dowody, Metrykę Rzetelności, Ostrzeżenia

