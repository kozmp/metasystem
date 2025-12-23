Markdown

# Dokumentacja Komponentu: RECEPTOR (Input & Semantic Analysis)
**Status:** Specyfikacja Rygorystyczna (na podstawie "Metacybernetyki" J. Kosseckiego)

## 1. Cel Celowniczy
Przekształcenie nieuporządkowanych danych wejściowych (Natural Language) na ustrukturyzowany metajęzyk cybernetyczny. Receptor musi odfiltrować "szum informacyjny" i zidentyfikować parametry sterownicze.

## 2. Podstawy Teoretyczne (Rygor Kosseckiego)
Każda informacja wchodząca do systemu musi zostać rozbita na:
- **Obiekt Elementarny:** Najmniejsza jednostka analizy.
- **Relacje:** Powiązania między obiektami (system nie uznaje cech izolowanych).
- **Rodzaj Procesu Sterowniczego:** Czy informacja dotyczy sterowania energią, czy informacją?
- **Typ Systemu Społecznego:** Czy komunikat pochodzi z systemu:
    - Poznawczego (nauka)?
    - Ideologicznego (doktryna)?
    - Etycznego (normy)?
    - Gospodarczego (zysk)?

## 3. Implementacja Techniczna (Stack: TypeScript + Zod + LLM)

### A. Walidacja Semantyczna (Zod Schema)
Każdy obiekt wejściowy musi przejść przez schemat walidacji, który odrzuca pojęcia "mętne".
```typescript
const CyberneticInputSchema = z.object({
  source: z.string(),
  sourceType: z.enum(['cognitive', 'ideological', 'ethical', 'economic']),
  objects: z.array(z.object({
    id: z.string(),
    type: z.string(),
    energyParams: z.object({
      power: z.number().optional(), // Moc robocza/jałowa wg Mazura
    })
  })),
  relations: z.array(z.object({
    from: z.string(),
    to: z.string(),
    type: z.string(), // np. sprzężenie zwrotne dodatnie/ujemne
  }))
});