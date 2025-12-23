# KORELATOR - Organ Logiki i Pamięci

## Cel Celowniczy
Przetwarzanie sygnałów z Receptora, ich trwała retencja (pamięć) oraz tworzenie nowych asocjacji (wnioskowanie) przy zachowaniu ścisłego rygoru logicznego.

## Odpowiedzialności
1. **Retencja** - Trwałe przechowywanie obiektów i relacji w bazie danych
2. **Korelacja** - Kojarzenie faktów, budowa grafu wiedzy
3. **Wyszukiwanie** - Hybrydowe zapytania (wektorowe + relacyjne/SQL Recursive)
4. **Wnioskowanie** - Tworzenie nowych relacji na podstawie istniejących

## Struktura Plików
- `storage.ts` - Interfejs do bazy danych (Supabase)
- `graph.ts` - Operacje na grafie wiedzy
- `search.ts` - Algorytmy wyszukiwania (hybrydowe)
- `inference.ts` - Logika wnioskowania
- `index.ts` - Publiczne API modułu

## Zasady Implementacji
- Baza danych MUSI odzwierciedlać strukturę relacyjną (nie płaskie tabele)
- Każda relacja ma `certainty_weight` weryfikowaną przez Homeostat
- Wyszukiwanie MUSI uwzględniać ścieżki wpływów (Recursive CTE)

