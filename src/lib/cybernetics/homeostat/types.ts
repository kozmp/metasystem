/**
 * @fileoverview Typy TypeScript dla Homeostatu
 * @cybernetic Homeostat - organ weryfikacji rzetelności systemu
 * 
 * Zgodnie z teorią Kosseckiego:
 * Homeostat utrzymuje stabilność systemu poprzez detekcję sprzeczności
 * i weryfikację rzetelności źródeł ("Weryfikacja Rzetelności Wstecznej")
 */

import type { Correlation } from '../../supabase/types';

// ============================================================================
// TYPY ALERTÓW
// ============================================================================

/**
 * @cybernetic Typ alertu systemowego
 */
export type AlertType = 
  | 'contradiction'      // Sprzeczność w relacjach
  | 'narrative_shift'    // Zmiana narracji tego samego źródła
  | 'low_certainty'      // Niska rzetelność
  | 'ideological_flag';  // Wykryto ideologię

/**
 * @cybernetic Status alertu
 */
export type AlertStatus = 
  | 'active'      // Aktywny, wymaga uwagi
  | 'resolved'    // Rozwiązany
  | 'dismissed';  // Odrzucony jako fałszywy alarm

/**
 * @cybernetic Alert systemowy (wykryta sprzeczność)
 */
export interface SystemAlert {
  id: string;
  alert_type: AlertType;
  severity: number;                    // 0-1, gdzie 1 = krytyczne
  title: string;
  description: string;
  conflicting_relation_ids: string[];  // UUID relacji w sprzeczności
  affected_object_ids: string[];       // UUID obiektów których dotyczy
  source_name?: string;                // Źródło które wygenerowało sprzeczność
  metadata: Record<string, unknown>;   // Dodatkowe dane
  status: AlertStatus;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

// ============================================================================
// TYPY DETEKCJI SPRZECZNOŚCI
// ============================================================================

/**
 * @cybernetic Raport sprzeczności
 */
export interface ContradictionReport {
  detected: boolean;
  contradictions: Contradiction[];
  summary: ContradictionSummary;
}

/**
 * @cybernetic Pojedyncza sprzeczność
 */
export interface Contradiction {
  // Relacje będące w sprzeczności
  existing_relation: Correlation;
  new_relation: Correlation;
  
  // Typ sprzeczności
  type: ContradictionType;
  
  // Szczegóły
  details: {
    object_source_name: string;
    object_target_name: string;
    relation_type_conflict?: {
      existing: string;
      new: string;
    };
    impact_factor_diff?: number;
    certainty_score_diff?: number;
  };
  
  // Poziom krytyczności (0-1)
  severity: number;
  
  // Opis dla użytkownika
  description: string;
}

/**
 * @cybernetic Typ sprzeczności
 */
export type ContradictionType =
  | 'opposite_relation'     // Przeciwne typy relacji (support vs oppose)
  | 'impact_reversal'       // Drastyczna zmiana siły wpływu
  | 'certainty_drop'        // Gwałtowny spadek rzetelności
  | 'narrative_180';        // Pełna zmiana narracji (180°)

/**
 * @cybernetic Podsumowanie sprzeczności
 */
export interface ContradictionSummary {
  total_contradictions: number;
  by_type: Record<ContradictionType, number>;
  max_severity: number;
  affected_sources: string[];
  recommended_action: RecommendedAction;
}

/**
 * @cybernetic Zalecana akcja
 */
export type RecommendedAction =
  | 'reject_new'        // Odrzuć nowe dane (pamięć ma pierwszeństwo)
  | 'supersede_old'     // Zastąp stare dane nowymi
  | 'flag_for_review'   // Oznacz do ręcznej weryfikacji
  | 'lower_reliability';// Obniż reliability_index źródła

// ============================================================================
// PARAMETRY DETEKCJI
// ============================================================================

/**
 * @cybernetic Parametry silnika detekcji sprzeczności
 */
export interface ContradictionDetectionParams {
  // Próg różnicy impact_factor uznawany za sprzeczność (0-1)
  impact_diff_threshold: number;
  
  // Próg różnicy certainty_score uznawany za sprzeczność (0-1)
  certainty_diff_threshold: number;
  
  // Czy sprawdzać przeciwne typy relacji (support vs oppose)
  check_opposite_relations: boolean;
  
  // Jak daleko w historii patrzeć (liczba dni)
  lookback_days: number;
  
  // Minimalny severity do utworzenia alertu (0-1)
  min_severity_for_alert: number;
  
  // Czy automatycznie obniżać reliability_index przy sprzeczności
  auto_penalize_source: boolean;
  
  // O ile obniżyć reliability_index (0-1)
  reliability_penalty: number;
}

/**
 * @cybernetic Domyślne parametry zgodne z rygorem Kosseckiego
 */
export const DEFAULT_DETECTION_PARAMS: ContradictionDetectionParams = {
  impact_diff_threshold: 0.5,           // 50% różnicy to już sprzeczność
  certainty_diff_threshold: 0.3,        // 30% spadku rzetelności to alert
  check_opposite_relations: true,       // Zawsze sprawdzaj przeciwne relacje
  lookback_days: 365,                   // Rok pamięci historycznej
  min_severity_for_alert: 0.5,          // Twórz alert tylko dla severity >= 0.5
  auto_penalize_source: true,           // Automatycznie karz nieretelne źródła
  reliability_penalty: 0.1,             // Obniż o 10% za każdą sprzeczność
};

// ============================================================================
// MAPOWANIA TYPÓW RELACJI
// ============================================================================

/**
 * @cybernetic Mapa przeciwnych typów relacji
 * 
 * Zgodnie z teorią sprzężeń zwrotnych Kosseckiego:
 * - positive_feedback ↔ negative_feedback (przeciwne kierunki)
 * - supply ↔ drain (zasilanie vs wyczerpywanie)
 */
export const OPPOSITE_RELATIONS: Record<string, string[]> = {
  'positive_feedback': ['negative_feedback'],
  'negative_feedback': ['positive_feedback'],
  'supply': ['drain', 'block'],
  'support': ['oppose', 'contradict'],
  'amplify': ['dampen', 'suppress'],
  'enable': ['disable', 'prevent'],
};

/**
 * @cybernetic Sprawdza czy dwa typy relacji są przeciwne
 */
export function areRelationsOpposite(type1: string, type2: string): boolean {
  const opposites = OPPOSITE_RELATIONS[type1] || [];
  return opposites.includes(type2);
}

/**
 * @cybernetic Oblicza severity sprzeczności na podstawie różnic
 */
export function calculateContradictionSeverity(
  impactDiff: number,
  certaintyDiff: number,
  isOppositeRelation: boolean
): number {
  let severity = 0;
  
  // Przeciwne relacje = natychmiastowe 0.8 severity
  if (isOppositeRelation) {
    severity = 0.8;
  }
  
  // Dodaj severity na podstawie różnicy impact_factor
  severity += impactDiff * 0.3;
  
  // Dodaj severity na podstawie spadku certainty
  if (certaintyDiff < 0) {
    severity += Math.abs(certaintyDiff) * 0.2;
  }
  
  // Ogranicz do 0-1
  return Math.max(0, Math.min(1, severity));
}

