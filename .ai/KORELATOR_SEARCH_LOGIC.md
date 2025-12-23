# Specyfikacja Logiki Wyszukiwania: CYBERNETIC ASSOCIATIVE SEARCH
**Status:** Rozszerzenie do KORELATOR.md (Rygor Mazura/Kosseckiego)

## 1. Paradygmat: Wyszukiwanie Relacyjne vs Wektorowe
Standardowe AI szuka "podobieństwa". Korelator Kosseckiego szuka **"sprzężeń"**.
- **Wektor (Similarity):** "Znajdź teksty o podobnym znaczeniu".
- **Korelacja (Cybernetic):** "Znajdź obiekty, które wpływają na obiekt X lub są przez niego sterowane".

## 2. Algorytm Wyszukiwania Hybrydowego
Code Agent musi zaimplementować funkcję `findCorrelations(query)`, która działa w trzech krokach:

### Krok A: Dekonstrukcja Zapytania (Semantic Extraction)
Zanim przeszukamy bazę, LLM musi zamienić zapytanie na wektor sterowniczy.
- *Zapytanie:* "Jak kryzys energetyczny wpływa na stabilność państwa?"
- *Transformacja:* `SEARCH obiekty[typ=energetyka] -> RELACJA[typ=zasilanie/sterowanie] -> obiekty[typ=system_autonomiczny, cecha=stabilność]`.

### Krok B: Ranking Retencyjny (Energy-Based Ranking)
Wyniki nie są sortowane tylko po "score", ale po **potencjale korelacyjnym**:
1. **Waga Dowodu (Homeostat Score):** Informacje zweryfikowane mają priorytet.
2. **Aktualność Sterownicza:** Informacje o procesach trwających (sprzężenia zwrotne czynne) są ważniejsze niż dane historyczne (retencja bierna).
3. **Moc Systemu:** Informacje dotyczące systemów o większej mocy (np. mocarstwa, wielkie korporacje) mają wyższy priorytet w analizie strategicznej.

### Krok C: Wykrywanie Luk (Negative Search)
Jeśli Korelator nie znajduje bezpośredniej relacji, musi zgłosić **brak korelacji**. 
- **Zadanie dla AI:** "Nie znalazłem bezpośredniego związku między A i B, ale znalazłem pośredni system C, który łączy oba te elementy".

## 3. Implementacja SQL (Supabase/Postgres)
Użycie CTE (Common Table Expressions) do przeszukiwania grafu relacji:
```sql
WITH RECURSIVE influence_path AS (
    -- Znajdź bezpośrednie relacje
    SELECT source_id, target_id, relation_type, 1 as depth
    FROM correlations
    WHERE source_id = :start_node
    UNION ALL
    -- Znajdź relacje pośrednie (łańcuchy sterowania)
    SELECT c.source_id, c.target_id, c.relation_type, ip.depth + 1
    FROM correlations c
    INNER JOIN influence_path ip ON c.source_id = ip.target_id
    WHERE ip.depth < 3 -- Ograniczenie głębokości analizy
)
SELECT * FROM influence_path;