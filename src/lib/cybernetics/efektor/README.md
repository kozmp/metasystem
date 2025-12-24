# EFEKTOR - Organ Wyjściowy KMS

**Status:** ✅ Zaimplementowany  
**Wersja:** 0.1.0  
**Data:** 2024-12-24

## 1. Cel Celowniczy

**Efektor** to organ wyjściowy systemu KMS, odpowiedzialny za prezentację wyników analizy w sposób rzetelny, zrozumiały i sterowniczy. Zgodnie z teorią Kosseckiego, Efektor:

- Emituje sygnały zrozumiałe (używa precyzyjnych terminów)
- Nie zniekształca wniosków (brak halucynacji AI)
- Wyraźnie oddziela fakty od opinii
- Ostrzega o wykrytym szumie ideologicznym

## 2. Architektura

```
EFEKTOR/
├── types.ts              # Typy TypeScript
├── index.ts              # Export modułu
└── README.md             # Dokumentacja

KOMPONENTY REACT:
├── ReceptorInputForm.tsx     # Formularz wejściowy
├── ObjectsTable.tsx          # Tabela obiektów
├── StatisticsPanel.tsx       # Panel statystyk
└── RelationGraph.tsx         # Wizualizacja grafu

STRONY ASTRO:
└── pages/
    ├── dashboard/index.astro # Dashboard główny
    └── api/
        └── receptor/process.ts # API endpoint
```

## 3. Komponenty

### 3.1 Dashboard (`src/pages/dashboard/index.astro`)

Główna strona panelu analitycznego. Renderowana Server-Side przez Astro 5.

**Funkcje:**
- Pobieranie danych z Supabase (SSR)
- Obliczanie metryk systemowych
- Hydratacja komponentów React (Client Islands)
- Ostrzeżenia o źródłach ideologicznych

**Endpoint:** `/dashboard`

### 3.2 ReceptorInputForm

Formularz do wprowadzania tekstu do analizy.

**Props:**
- `onProcessComplete?: () => void` - callback po przetworzeniu

**Funkcje:**
- Wysyła POST do `/api/receptor/process`
- Wyświetla stan ładowania
- Pokazuje wyniki (obiekty, relacje, rzetelność)

### 3.3 ObjectsTable

Tabela z listą obiektów cybernetycznych.

**Props:**
- `objects: DashboardObject[]` - lista obiektów
- `onObjectClick?: (objectId: string) => void` - callback na kliknięcie

**Kolumny:**
- Nazwa obiektu
- Klasa systemu
- Typ sterowania (z ostrzeżeniem dla ideologicznych)
- Moc swobodna (z `energy_params`)
- Potencjał sterowniczy (liczba relacji wychodzących)
- Średnia rzetelność

### 3.4 StatisticsPanel

Panel ze statystykami systemu.

**Props:**
- `stats: SystemStats` - statystyki

**Metryki:**
- Liczba obiektów i relacji
- Średnia rzetelność systemu
- Rozkład typów systemów
- Ostrzeżenia (wysoki szum, ideologia)

### 3.5 RelationGraph

Interaktywna wizualizacja grafu relacji.

**Props:**
- `width?: number` - szerokość (domyślnie 1200)
- `height?: number` - wysokość (domyślnie 600)
- `className?: string` - dodatkowe klasy CSS

**Technologia:** `react-force-graph-2d`

**Funkcje:**
- Graf siłowy z layoutem fizycznym
- Węzły = obiekty (kolor wg typu sterowania)
- Krawędzie = relacje (kolor wg typu sprzężenia)
- Grubość krawędzi = `impact_factor`
- Ostrzeżenia dla źródeł ideologicznych (⚠)
- Kontrolki zoom (przybliż, oddal, dopasuj)
- Panel szczegółów wybranego węzła
- Legenda typów

## 4. API Endpoints

### POST `/api/receptor/process`

Przetwarza surowy tekst przez pipeline Receptor → Korelator.

**Request Body:**
```json
{
  "text": "Tekst do analizy..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "raw_signal_id": "uuid",
  "objects_created": 5,
  "relations_created": 8,
  "certainty_score": 0.85
}
```

**Response (Error):**
```json
{
  "success": false,
  "objects_created": 0,
  "relations_created": 0,
  "error": "Komunikat błędu"
}
```

## 5. Estetyka Terminala

Zgodnie z wymogami, interfejs ma charakter surowy, inżynieryjny:

**Paleta kolorów:**
- Tło: `#0a0e14` (terminal-bg)
- Tekst: `#e5e7eb` (terminal-text)
- Akcent: `#3b82f6` (niebieski)
- Sukces: `#10b981` (zielony)
- Ostrzeżenie: `#ef4444` (czerwony)

**Typografia:**
- Font: JetBrains Mono (monospace)
- Uppercase tracking-wider dla nagłówków

**Sprzężenia zwrotne:**
- Dodatnie (wzrost): zielony `#10b981`
- Ujemne (hamowanie): czerwony `#ef4444`

**Typy sterowania:**
- Poznawczy: niebieski `#3b82f6`
- Ideologiczny: czerwony `#ef4444` + animacja pulse
- Etyczny: fioletowy `#8b5cf6`
- Gospodarczy: żółty `#f59e0b`

## 6. Rygor Cybernetyczny

### 6.1 Potencjał Sterowniczy

Dla każdego obiektu obliczany jest **potencjał sterowniczy** = liczba relacji wychodzących.

```typescript
steering_potential = count(relations WHERE source_id = object.id)
```

Im więcej relacji wychodzących, tym większy wpływ obiektu na system.

### 6.2 Ostrzeżenia o Szumie

Jeśli `certainty_score < 0.3`, relacja jest oznaczana jako "wysoki szum":

```typescript
is_high_noise = certainty_score < 0.3
```

Takie relacje wymagają weryfikacji przez Homeostat.

### 6.3 Ostrzeżenia Ideologiczne

Obiekty z `control_system_type = 'ideological'` są wyróżnione:
- Czerwony kolor z animacją pulse
- Ikona ostrzeżenia ⚠
- Banner na górze dashboardu

## 7. Użycie

### Uruchomienie dev server:

```bash
npm run dev
```

### Dashboard dostępny pod:

```
http://localhost:4321/dashboard
```

### Workflow:

1. Otwórz dashboard
2. Wklej tekst do formularza "Receptor Input"
3. Kliknij "Przetworz sygnał"
4. System wyekstrahuje obiekty i relacje
5. Obiekty pojawią się w tabeli
6. Graf zostanie automatycznie zaktualizowany
7. Statystyki odświeżą się po przeładowaniu

## 8. Zależności

```json
{
  "@astrojs/react": "^3.x",
  "@astrojs/tailwind": "^5.x",
  "react": "^19.x",
  "react-dom": "^19.x",
  "react-force-graph": "^1.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^4.x"
}
```

## 9. Zgodność z Metacybernetyką

| Koncept Kosseckiego | Implementacja |
|---------------------|---------------|
| **Obiekt Elementarny** | `CyberneticObject` w bazie |
| **Relacja Sterownicza** | `Correlation` z `relation_type` |
| **Sprzężenie Dodatnie** | `positive_feedback` (zielone) |
| **Sprzężenie Ujemne** | `negative_feedback` (czerwone) |
| **Moc Swobodna** | `energy_params.available_power` |
| **Retencja** | Supabase PostgreSQL |
| **Receptor** | Pipeline transformacji tekstu |
| **Korelator** | Graf powiązań w bazie |
| **Homeostat** | `certainty_score` (TODO: pełna implementacja) |
| **Efektor** | Dashboard + Wizualizacja |

## 10. TODO (Przyszłe Rozszerzenia)

- [ ] Modal ze szczegółami obiektu (po kliknięciu w tabeli)
- [ ] Filtrowanie obiektów (po klasie, typie sterowania)
- [ ] Export grafu do PNG/SVG
- [ ] Widok czasowy (timeline zmian)
- [ ] Pełna implementacja Homeostatu (weryfikacja źródeł)
- [ ] Integracja z zewnętrznymi źródłami (API)
- [ ] System pytań uzupełniających (QA module)
- [ ] Raporty PDF z analizą

## 11. Kontakt z Teorią

> "Efektor to organ wykonawczy systemu. Musi emitować sygnały sterownicze, które są zrozumiałe dla otoczenia i nie zniekształcają informacji z Korelatora."
> 
> — doc. Józef Kossecki, *Metacybernetyka*

Implementacja Efektora w KMS realizuje ten postulat poprzez:
1. **Rzetelność** - każda informacja ma `certainty_score`
2. **Przejrzystość** - użytkownik widzi źródła i dowody
3. **Ostrzeżenia** - ideologia i szum są wyraźnie oznaczone
4. **Sterowność** - dashboard pokazuje co można zrobić dalej

---

**Autor:** AI Assistant (Claude Sonnet 4.5)  
**Rygor:** Zgodnie z zasadami Kosseckiego  
**Licencja:** Projekt edukacyjny
