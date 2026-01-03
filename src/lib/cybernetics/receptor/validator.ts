/**
 * @fileoverview Receptor Validator - Schematy Zod dla walidacji sygnałów wejściowych
 * @cybernetic Zgodnie z Rozdziałem 2 Metacybernetyki: Transformacja bodźca na sygnał korelatora
 * 
 * Każdy komunikat musi zostać zmapowany na relację sterowniczą.
 * Receptor nie interpretuje - tylko strukturyzuje i waliduje.
 */

import { z } from 'zod';
import type { FeedbackType, ControlType } from '../types';

// ============================================================================
// SCHEMAT OBIEKTU WEJŚCIOWEGO
// ============================================================================

/**
 * @cybernetic Obiekt elementarny w sensie Kosseckiego
 * System autonomiczny, heteronomiczny lub element otoczenia
 * ZAKTUALIZOWANO: Metacybernetyka 2015 - dodano parametry v, a, c oraz klasyfikację cywilizacyjną
 */
export const ExtractedObjectSchema = z.object({
  /** Unikalny identyfikator w kontekście ekstrakcji */
  id: z.string().min(1),

  /** Etykieta obiektu (np. "Państwo X", "Organizacja Y") */
  label: z.string().min(1),

  /** Typ systemu */
  type: z.enum(['autonomous_system', 'heteronomous_system', 'environment', 'tool']),

  /** Opis obiektu w kontekście */
  description: z.string().optional(),

  /** LEGACY: Szacowana energia dostępna (0-1, relatywna) */
  estimated_energy: z.number().min(0).max(1).optional(),

  // ========== METACYBERNETYKA 2015: Parametry mocy systemowej ==========

  /** v - Moc jednostkowa [W]: energia na jednostkę czasu */
  power_v: z.number().min(0).default(1.0),

  /** a - Jakość/sprawność (0-1): efektywność, technologia, organizacja */
  quality_a: z.number().min(0).max(1).default(1.0),

  /** c - Ilość/masa: liczba ludzi, zasobów, elementów systemu */
  mass_c: z.number().min(0).default(1.0),

  // ========== METACYBERNETYKA 2015: Klasyfikacja cywilizacyjna ==========

  /** Kod cywilizacyjny źródła */
  civilization_code: z.enum([
    'latin',      // Cywilizacja łacińska (nauka, prawo, racjonalizm)
    'byzantine',  // Cywilizacja bizantyjska (religia, tradycja, hierarchia)
    'turandot',   // Cywilizacja turandot (ideologia, totalitaryzm)
    'mixed',      // Mieszana
    'unknown'     // Nieznana
  ]).default('unknown'),

  /** Typ motywacji systemu */
  motivation_type: z.enum([
    'vital',         // Motywacje witalne (przeżycie biologiczne)
    'informational', // Motywacje informacyjne (poznanie)
    'economic',      // Motywacje ekonomiczne (zysk, zasoby)
    'mixed'          // Mieszane
  ]).default('informational'),
});

export type ExtractedObject = z.infer<typeof ExtractedObjectSchema>;

/**
 * @cybernetic Status sygnału po analizie szumu semantycznego
 * Gradacja zgodna z rygorem Kosseckiego:
 * - CLEAR (0.0-0.4): Pełna akceptacja sygnału
 * - WARNING (0.4-0.7): Akceptacja warunkowa, wymaga weryfikacji użytkownika
 * - REJECT (>0.7): Odrzucenie sygnału, zbyt wysoki poziom szumu ideologicznego/semantycznego
 */
export type SignalStatus = 'CLEAR' | 'WARNING' | 'REJECT';

// ============================================================================
// SCHEMAT RELACJI (PROCESU STEROWANIA)
// ============================================================================

/**
 * @cybernetic Relacja sterownicza między obiektami
 * Zgodnie z modelem Mazura: każdy proces ma źródło, cel, typ i koszt
 * ZAKTUALIZOWANO: Metacybernetyka 2015 - dodano kategorię normy społecznej
 */
export const ExtractedRelationSchema = z.object({
  /** ID obiektu źródłowego (kto steruje) */
  subject_id: z.string().min(1),

  /** ID obiektu docelowego (kto jest sterowany) */
  object_id: z.string().min(1),

  /** Typ procesu: energia czy informacja */
  process_type: z.enum(['energetic', 'informational', 'hybrid'] as const),

  /** Typ sprzężenia zwrotnego */
  feedback_type: z.enum(['positive', 'negative', 'neutral'] as const),

  /** Klasyfikacja systemu źródłowego */
  system_class: z.enum(['cognitive', 'ideological', 'ethical', 'economic'] as const),

  /** Szacowana siła wpływu (0-1) */
  influence_strength: z.number().min(0).max(1),

  /** Opis relacji w metajęzyku cybernetycznym */
  description: z.string(),

  /** Dowody lub cytaty z tekstu źródłowego */
  evidence: z.array(z.string()).optional(),

  // ========== METACYBERNETYKA 2015: Kategoria normy społecznej ==========

  /** Kategoria normy społecznej realizowanej przez relację */
  norm_category: z.enum([
    'cognitive',      // Norma poznawcza (wiedza, fakty, nauka)
    'ideological',    // Norma ideologiczna (propaganda, doktryna)
    'ethical',        // Norma etyczna (moralność, wartości)
    'legal',          // Norma prawna (prawo, regulacje)
    'economic',       // Norma ekonomiczna (biznes, handel, zasoby)
    'vital'           // Norma witalna (przeżycie, biologiczne)
  ] as const).default('cognitive'),
});

export type ExtractedRelation = z.infer<typeof ExtractedRelationSchema>;

// ============================================================================
// SCHEMAT METADANYCH ANALIZY
// ============================================================================

/**
 * @cybernetic Metadane procesu ekstrakcji
 */
export const ExtractionMetadataSchema = z.object({
  /** Poziom szumu semantycznego (0-1): jak bardzo tekst jest "mętny" */
  semantic_noise_level: z.number().min(0).max(1),
  
  /** Status sygnału na podstawie poziomu szumu */
  signal_status: z.enum(['CLEAR', 'WARNING', 'REJECT'] as const),
  
  /** Czy sygnał jest niejednoznaczny (wymaga weryfikacji) */
  is_ambiguous: z.boolean().default(false),
  
  /** Wykryte flagi ideologiczne */
  ideological_flags: z.array(z.string()).optional(),
  
  /** Typ dominującego systemu sterowania w tekście */
  dominant_system_type: z.enum(['cognitive', 'ideological', 'ethical', 'economic'] as const),
  
  /** Surowy kontekst (oryginalny tekst) */
  raw_context: z.string(),
  
  /** Liczba wykrytych obiektów */
  object_count: z.number().int().min(0),
  
  /** Liczba wykrytych relacji */
  relation_count: z.number().int().min(0),
  
  /** Timestamp ekstrakcji */
  extracted_at: z.date().optional(),
  
  /** Ostrzeżenie dla Efektora (jeśli is_ambiguous = true) */
  warning_message: z.string().optional().nullable(),
  
  /** Nazwa źródła (dla detekcji sprzeczności przez Homeostat) */
  source_name: z.string().optional().default('unknown'),
});

export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>;

// ============================================================================
// GŁÓWNY SCHEMAT WEJŚCIA CYBERNETYCZNEGO
// ============================================================================

/**
 * @cybernetic Pełna struktura sygnału po transformacji przez Receptor
 * To jest output Receptora, który trafia do Korelatora
 */
export const CyberneticInputSchema = z.object({
  /** Lista wyekstrahowanych obiektów */
  objects: z.array(ExtractedObjectSchema).min(1, 'Musi być co najmniej 1 obiekt'),
  
  /** Lista wyekstrahowanych relacji */
  relations: z.array(ExtractedRelationSchema),
  
  /** Metadane analizy */
  metadata: ExtractionMetadataSchema,
});

export type CyberneticInput = z.infer<typeof CyberneticInputSchema>;

// ============================================================================
// SCHEMAT BŁĘDU SEMANTYCZNEGO
// ============================================================================

/**
 * @cybernetic Błąd generowany gdy Receptor nie może przetworzyć sygnału
 * Zgodnie z zasadą: jeśli tekst jest niejasny, Receptor musi odrzucić
 */
export const SemanticNoiseErrorSchema = z.object({
  error_type: z.literal('SEMANTIC_NOISE'),
  message: z.string(),
  noise_level: z.number().min(0).max(1),
  suggestions: z.array(z.string()).optional(),
});

export type SemanticNoiseError = z.infer<typeof SemanticNoiseErrorSchema>;

// ============================================================================
// FUNKCJE POMOCNICZE WALIDACJI
// ============================================================================

/**
 * @cybernetic Walidacja czy obiekt jest systemem autonomicznym
 */
export function isAutonomousSystem(obj: ExtractedObject): boolean {
  return obj.type === 'autonomous_system';
}

/**
 * @cybernetic Obliczanie statusu sygnału na podstawie poziomu szumu semantycznego
 * Implementacja gradacji zgodnej z rygorem Kosseckiego
 */
export function calculateSignalStatus(noiseLevel: number): SignalStatus {
  if (noiseLevel <= 0.4) {
    return 'CLEAR';
  } else if (noiseLevel <= 0.7) {
    return 'WARNING';
  } else {
    return 'REJECT';
  }
}

/**
 * @cybernetic Walidacja czy relacja jest poprawna (subject i object istnieją)
 */
export function validateRelation(
  relation: ExtractedRelation,
  objects: ExtractedObject[]
): boolean {
  const objectIds = objects.map(o => o.id);
  return (
    objectIds.includes(relation.subject_id) &&
    objectIds.includes(relation.object_id) &&
    relation.subject_id !== relation.object_id // Zakaz samozamykających się relacji
  );
}

/**
 * @cybernetic Walidacja całego sygnału wejściowego
 * Sprawdza integralność referencyjną i spójność logiczną
 */
export function validateCyberneticInput(input: CyberneticInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Sprawdź czy wszystkie relacje wskazują na istniejące obiekty
  for (const relation of input.relations) {
    if (!validateRelation(relation, input.objects)) {
      errors.push(
        `Relacja ${relation.subject_id} -> ${relation.object_id} wskazuje na nieistniejący obiekt`
      );
    }
  }
  
  // Sprawdź czy liczba obiektów/relacji zgadza się z metadanymi
  if (input.metadata.object_count !== input.objects.length) {
    errors.push(
      `Niezgodność: metadata.object_count (${input.metadata.object_count}) != objects.length (${input.objects.length})`
    );
  }
  
  if (input.metadata.relation_count !== input.relations.length) {
    errors.push(
      `Niezgodność: metadata.relation_count (${input.metadata.relation_count}) != relations.length (${input.relations.length})`
    );
  }
  
  // Sprawdź poziom szumu semantycznego i status sygnału
  const expectedStatus = calculateSignalStatus(input.metadata.semantic_noise_level);
  
  if (input.metadata.signal_status !== expectedStatus) {
    errors.push(
      `Niezgodność statusu sygnału: oczekiwano ${expectedStatus}, otrzymano ${input.metadata.signal_status}`
    );
  }
  
  // REJECT: Odrzuć sygnał jeśli noise_level > 0.7
  if (input.metadata.semantic_noise_level > 0.7 || input.metadata.signal_status === 'REJECT') {
    errors.push(
      `STATUS: REJECT - Sygnał zbyt zniekształcony ideologicznie lub merytorycznie pusty. Noise level: ${input.metadata.semantic_noise_level.toFixed(2)}`
    );
  }
  
  // WARNING: Sygnał niejednoznaczny wymaga is_ambiguous = true
  if (input.metadata.semantic_noise_level > 0.4 && input.metadata.semantic_noise_level <= 0.7) {
    if (!input.metadata.is_ambiguous) {
      errors.push(
        `STATUS: WARNING - Sygnał wymaga flagi is_ambiguous=true. Noise level: ${input.metadata.semantic_noise_level.toFixed(2)}`
      );
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// MAPOWANIE NA TYPY GŁÓWNE
// ============================================================================

/**
 * @cybernetic Konwersja ExtractedRelation na ControlProcess (typ z types.ts)
 * Uzupełnia brakujące pola domyślnymi wartościami
 */
export function toControlProcess(
  relation: ExtractedRelation,
  certaintyWeight: number = 0.7
): Omit<import('../types').ControlProcess, 'id' | 'created_at'> {
  return {
    source_id: relation.subject_id,
    target_id: relation.object_id,
    relation_type: 'control', // Domyślnie "control", może być zmienione przez Korelator
    feedback_type: relation.feedback_type as FeedbackType,
    control_type: relation.process_type as ControlType,
    certainty_weight: certaintyWeight,
    energy_cost: 1.0, // Domyślny koszt, może być obliczony przez Homeostat
    influence_strength: relation.influence_strength,
    description: relation.description,
    evidence: relation.evidence,
  };
}

