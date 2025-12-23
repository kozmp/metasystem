# HOMEOSTAT - Organ Weryfikacji i Stabilności

## Cel Celowniczy
Utrzymanie stabilności poznawczej systemu poprzez wykrywanie i neutralizowanie dezinformacji, sprzeczności logicznych oraz obcych wpływów sterowniczych (ideologicznych).

## Odpowiedzialności
1. **Weryfikacja Merytoryczna** - Zgodność z faktami i aksjomatami
2. **Weryfikacja Celowościowa** - Identyfikacja interesu sterowniczego źródła
3. **Weryfikacja Cywilizacyjna** - Klasyfikacja wzorca kulturowego (Łaciński/Bizantyjski/Turański/Żydowski)
4. **Generowanie Alertów** - Tworzenie `HomeostatAlert` przy wykryciu zagrożeń

## Struktura Plików
- `verifier.ts` - Algorytmy weryfikacji prawdziwości
- `detector.ts` - Wykrywanie dezinformacji i manipulacji
- `classifier.ts` - Klasyfikacja cywilizacyjna źródeł
- `alerter.ts` - Generowanie i zarządzanie alertami
- `index.ts` - Publiczne API modułu

## Zasady Implementacji
- Przed zapisem w bazie, KAŻDA informacja przechodzi przez Homeostat
- Jeśli źródło jest ideologiczne, dodaj flagę `WARNING_IDEOLOGY`
- Jeśli `certainty_weight` < 0.7, Homeostat wymusza QA

