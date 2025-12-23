/**
 * @fileoverview Receptor Classifier - Klasyfikacja źródeł i typów systemów
 * @cybernetic Implementacja klasyfikacji cywilizacyjnej według Kosseckiego
 * 
 * Klasyfikacja systemów sterowania:
 * - Poznawczy (cognitive) - nauka, empiria, fakty
 * - Ideologiczny (ideological) - doktryna, propaganda, manipulacja
 * - Etyczny (ethical) - normy, wartości, moralność
 * - Gospodarczy (economic) - biznes, zysk, handel
 */

import type { SourceType } from '../types';
import type { ExtractedObject, ExtractedRelation } from './validator';
import { SOURCE_TYPE_WEIGHTS, CIVILIZATION_INDICATORS } from '../constants';

// ============================================================================
// KLASYFIKATOR TYPU ŹRÓDŁA
// ============================================================================

/**
 * @cybernetic Klasyfikacja tekstu na podstawie wskaźników słów kluczowych
 * Zwraca dominujący typ systemu sterowania
 */
export function classifySourceType(text: string): SourceType {
  const lowerText = text.toLowerCase();
  
  const scores = {
    cognitive: 0,
    ideological: 0,
    ethical: 0,
    economic: 0,
  };
  
  // Wskaźniki dla systemu POZNAWCZEGO
  const cognitiveIndicators = [
    'badanie', 'eksperyment', 'dowód', 'dane', 'analiza', 'wynik',
    'metoda', 'test', 'pomiar', 'obserwacja', 'hipoteza', 'teoria',
    'empiria', 'fakt', 'weryfikacja', 'nauka', 'research',
  ];
  
  // Wskaźniki dla systemu IDEOLOGICZNEGO
  const ideologicalIndicators = [
    'doktryna', 'ideologia', 'propaganda', 'wróg', 'walka', 'słuszny',
    'niesłuszny', 'prawda objawiona', 'wierność', 'zdrada', 'masy',
    'wyzwolenie', 'rewolucja', 'klasa', 'naród ponad wszystko',
  ];
  
  // Wskaźniki dla systemu ETYCZNEGO
  const ethicalIndicators = [
    'moralność', 'etyka', 'wartość', 'norma', 'powinność', 'dobro',
    'zło', 'sprawiedliwość', 'honor', 'godność', 'cnota', 'sumienie',
    'odpowiedzialność', 'obowiązek',
  ];
  
  // Wskaźniki dla systemu GOSPODARCZEGO
  const economicIndicators = [
    'zysk', 'koszt', 'inwestycja', 'rynek', 'handel', 'biznes',
    'konkurencja', 'efektywność', 'profit', 'cena', 'wartość rynkowa',
    'transakcja', 'kapitał', 'dochód', 'wydatek',
  ];
  
  // Zliczanie wystąpień
  for (const indicator of cognitiveIndicators) {
    if (lowerText.includes(indicator)) scores.cognitive++;
  }
  for (const indicator of ideologicalIndicators) {
    if (lowerText.includes(indicator)) scores.ideological++;
  }
  for (const indicator of ethicalIndicators) {
    if (lowerText.includes(indicator)) scores.ethical++;
  }
  for (const indicator of economicIndicators) {
    if (lowerText.includes(indicator)) scores.economic++;
  }
  
  // Znajdź dominujący typ
  let maxScore = 0;
  let dominantType: SourceType = 'cognitive'; // Domyślnie poznawczy
  
  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantType = type as SourceType;
    }
  }
  
  return dominantType;
}

// ============================================================================
// DETEKTOR SZUMU SEMANTYCZNEGO
// ============================================================================

/**
 * @cybernetic Obliczanie poziomu szumu semantycznego
 * Szum = mętność, pustosłowie, brak konkretów
 * 
 * 0.0-0.3 = tekst precyzyjny
 * 0.3-0.7 = tekst mieszany
 * 0.7-1.0 = tekst mętny, ideologiczny
 */
export function calculateSemanticNoise(text: string): number {
  let noiseScore = 0;
  const lowerText = text.toLowerCase();
  
  // Wskaźniki szumu: słowa mętne, ideologiczne, pustosłowne
  const noiseIndicators = [
    'może', 'prawdopodobnie', 'wydaje się', 'można sądzić',
    'niektórzy twierdzą', 'ogólnie rzecz biorąc', 'w zasadzie',
    'absolutnie', 'całkowicie', 'niewątpliwie', 'oczywiste',
    'naturalnie', 'wszyscy wiedzą', 'wiadomo',
  ];
  
  // Wskaźniki ideologii (zwiększają szum)
  const ideologyIndicators = [
    'wróg ludu', 'zdrajca', 'prawdziwy patriota', 'nasz naród',
    'wielka walka', 'słuszna sprawa', 'historyczna konieczność',
  ];
  
  // Zlicz wystąpienia
  for (const indicator of noiseIndicators) {
    if (lowerText.includes(indicator)) noiseScore += 0.05;
  }
  
  for (const indicator of ideologyIndicators) {
    if (lowerText.includes(indicator)) noiseScore += 0.1;
  }
  
  // Sprawdź długość zdań - bardzo długie zdania = szum
  const sentences = text.split(/[.!?]+/);
  let longSentenceCount = 0;
  for (const sentence of sentences) {
    if (sentence.split(' ').length > 40) {
      longSentenceCount++;
    }
  }
  noiseScore += (longSentenceCount / sentences.length) * 0.2;
  
  // Sprawdź brak konkretów (liczb, dat, nazw własnych)
  const hasNumbers = /\d+/.test(text);
  const hasProperNouns = /[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+/.test(text);
  
  if (!hasNumbers) noiseScore += 0.1;
  if (!hasProperNouns) noiseScore += 0.1;
  
  // Ogranicz do zakresu 0-1
  return Math.min(1.0, noiseScore);
}

// ============================================================================
// DETEKTOR FLAG IDEOLOGICZNYCH
// ============================================================================

/**
 * @cybernetic Wykrywanie flag ideologicznych w tekście
 * Flagi = słowa/frazy wskazujące na manipulację ideologiczną
 */
export function detectIdeologicalFlags(text: string): string[] {
  const flags: string[] = [];
  const lowerText = text.toLowerCase();
  
  const flagPatterns = [
    { pattern: 'wróg ludu', flag: 'WRÓG_LUDU' },
    { pattern: 'zdrajca', flag: 'ETYKIETA_ZDRAJCY' },
    { pattern: 'prawda objawiona', flag: 'DOGMATYZM' },
    { pattern: 'historyczna konieczność', flag: 'DETERMINIZM_HISTORYCZNY' },
    { pattern: 'nieomylny', flag: 'KULT_JEDNOSTKI' },
    { pattern: 'klasa panująca', flag: 'RETORYKA_KLASOWA' },
    { pattern: 'naród wybrany', flag: 'NACJONALIZM' },
    { pattern: 'ostateczne rozwiązanie', flag: 'EKSTERMINACJA' },
    { pattern: 'wyzwolenie', flag: 'RETORYKA_REWOLUCYJNA' },
  ];
  
  for (const { pattern, flag } of flagPatterns) {
    if (lowerText.includes(pattern)) {
      flags.push(flag);
    }
  }
  
  return flags;
}

// ============================================================================
// KLASYFIKATOR CYWILIZACYJNY
// ============================================================================

/**
 * @cybernetic Klasyfikacja wzorca cywilizacyjnego źródła
 * Zgodnie z typologią Kosseckiego:
 * - LATIN - Prawo ponad władzą (Europa Zachodnia)
 * - BYZANTINE - Władza ponad prawem (Europa Wschodnia, Rosja)
 * - TURANIAN - Siła ponad wszystkim (Azja Centralna)
 * - JEWISH - Tożsamość grupowa (wspólnota)
 */
export type CivilizationPattern = 'latin' | 'byzantine' | 'turanian' | 'jewish' | 'mixed';

export function classifyCivilizationPattern(text: string): CivilizationPattern {
  const lowerText = text.toLowerCase();
  
  const scores = {
    latin: 0,
    byzantine: 0,
    turanian: 0,
    jewish: 0,
  };
  
  // Zlicz wystąpienia wskaźników z constants.ts
  for (const [pattern, indicators] of Object.entries(CIVILIZATION_INDICATORS)) {
    for (const indicator of indicators) {
      if (lowerText.includes(indicator.toLowerCase())) {
        scores[pattern as keyof typeof scores]++;
      }
    }
  }
  
  // Znajdź dominujący wzorzec
  let maxScore = 0;
  let dominantPattern: CivilizationPattern = 'mixed';
  
  for (const [pattern, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantPattern = pattern as CivilizationPattern;
    }
  }
  
  // Jeśli brak wyraźnego wzorca, zwróć 'mixed'
  if (maxScore < 2) {
    return 'mixed';
  }
  
  return dominantPattern;
}

// ============================================================================
// OCENA WIARYGODNOŚCI ŹRÓDŁA
// ============================================================================

/**
 * @cybernetic Obliczanie wagi zaufania dla źródła
 * Bazuje na typie systemu i poziomie szumu
 */
export function calculateSourceReliability(
  sourceType: SourceType,
  noiseLevel: number
): number {
  // Pobierz bazową wagę z constants.ts
  const baseWeight = SOURCE_TYPE_WEIGHTS[sourceType];
  
  // Zredukuj wagę o poziom szumu
  const noisePenalty = noiseLevel * 0.5;
  
  const reliability = Math.max(0, baseWeight - noisePenalty);
  
  return reliability;
}

// ============================================================================
// ANALIZA OBIEKTÓW I RELACJI
// ============================================================================

/**
 * @cybernetic Analiza jakości wyekstrahowanych obiektów
 * Zwraca score (0-1) wskazujący na kompletność ekstrakcji
 */
export function analyzeObjectQuality(objects: ExtractedObject[]): number {
  if (objects.length === 0) return 0;
  
  let qualityScore = 0;
  
  for (const obj of objects) {
    // Punkty za kompletność
    if (obj.description) qualityScore += 0.2;
    if (obj.estimated_energy !== undefined) qualityScore += 0.1;
    if (obj.label.length > 3) qualityScore += 0.1; // Nazwa nie jest jednowyrazowa
    
    // Kara za zbyt ogólne nazwy
    const genericNames = ['system', 'rzecz', 'element', 'coś'];
    if (genericNames.some(name => obj.label.toLowerCase().includes(name))) {
      qualityScore -= 0.2;
    }
  }
  
  // Średnia jakość na obiekt
  return Math.max(0, Math.min(1, qualityScore / objects.length));
}

/**
 * @cybernetic Analiza jakości wyekstrahowanych relacji
 * Zwraca score (0-1) wskazujący na precyzję relacji
 */
export function analyzeRelationQuality(relations: ExtractedRelation[]): number {
  if (relations.length === 0) return 0.5; // Brak relacji nie jest błędem
  
  let qualityScore = 0;
  
  for (const rel of relations) {
    // Punkty za kompletność
    if (rel.description.length > 10) qualityScore += 0.2;
    if (rel.evidence && rel.evidence.length > 0) qualityScore += 0.3;
    if (rel.influence_strength > 0 && rel.influence_strength <= 1) qualityScore += 0.1;
    
    // Kara za zbyt mętny opis
    const vagueWords = ['może', 'prawdopodobnie', 'wydaje się'];
    if (vagueWords.some(word => rel.description.toLowerCase().includes(word))) {
      qualityScore -= 0.1;
    }
  }
  
  // Średnia jakość na relację
  return Math.max(0, Math.min(1, qualityScore / relations.length));
}

