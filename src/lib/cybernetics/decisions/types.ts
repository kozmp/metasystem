/**
 * @fileoverview Typy dla Modułu Decyzyjnego
 * @cybernetic Symulator Sterowania - doradztwo oparte na grafie relacji
 */

import type { CyberneticObject, Correlation, RelationType } from '../../supabase/types';

// ============================================================================
// TYPY SYMULATORA STEROWANIA
// ============================================================================

/**
 * @cybernetic Cel symulacji
 */
export type SteeringGoal = 'strengthen' | 'weaken';

/**
 * @cybernetic Ścieżka wpływu w grafie
 */
export interface InfluencePath {
  path: string[];                    // Array ID obiektów w ścieżce
  path_names: string[];              // Array nazw obiektów
  total_strength: number;            // Łączna siła wpływu (iloczyn impact_factor)
  feedback_types: RelationType[];    // Typy sprzężeń w ścieżce
  certainty_score: number;           // Średnia rzetelność relacji w ścieżce
  depth: number;                     // Długość ścieżki
  is_feedback_loop: boolean;         // Czy ścieżka zawiera pętlę sprzężenia zwrotnego
}

/**
 * @cybernetic Węzeł wpływowy w grafie
 */
export interface InfluentialNode {
  object_id: string;
  object_name: string;
  influence_strength: number;        // Siła wpływu na cel (0-1)
  path_count: number;                // Liczba ścieżek wpływu
  feedback_multiplier: number;       // Mnożnik sprzężeń zwrotnych
  available_power: number;           // Moc swobodna obiektu
  certainty_score: number;           // Średnia rzetelność relacji
  control_leverage: number;          // Dźwignia sterownicza (power * influence * certainty)
  paths: InfluencePath[];            // Ścieżki wpływu
}

/**
 * @cybernetic Wynik symulacji sterowania
 */
export interface SteeringSimulationResult {
  target_object_id: string;
  target_object_name: string;
  goal: SteeringGoal;
  
  // Top węzły wpływowe
  influential_nodes: InfluentialNode[];
  
  // Rekomendacje
  primary_recommendation: {
    object_id: string;
    object_name: string;
    action: string;                  // Co zrobić
    rationale: string;               // Dlaczego (oparty na sprzężeniach)
    expected_impact: number;         // Oczekiwany wpływ (0-1)
    confidence: number;              // Pewność rekomendacji (0-1)
  };
  
  // Alternatywne rekomendacje
  alternative_recommendations: Array<{
    object_id: string;
    object_name: string;
    action: string;
    rationale: string;
    expected_impact: number;
    confidence: number;
  }>;
  
  // AI-generated strategia
  ai_strategy?: string;
  
  // Ostrzeżenia
  warnings: string[];
  
  // Metadata
  simulation_metadata: {
    total_paths_analyzed: number;
    max_depth: number;
    computation_time_ms: number;
  };
}

/**
 * @cybernetic Kontekst dla AI strategii
 */
export interface AIStrategyContext {
  target_object: CyberneticObject;
  goal: SteeringGoal;
  influential_nodes: InfluentialNode[];
  current_system_state: {
    total_objects: number;
    total_relations: number;
    average_certainty: number;
  };
}

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * @cybernetic Oblicza mnożnik sprzężenia zwrotnego
 */
export function calculateFeedbackMultiplier(feedbackTypes: RelationType[]): number {
  let multiplier = 1.0;
  
  for (const type of feedbackTypes) {
    if (type === 'positive_feedback') {
      multiplier *= 1.5;  // Sprzężenie dodatnie wzmacnia
    } else if (type === 'negative_feedback') {
      multiplier *= 0.7;  // Sprzężenie ujemne osłabia
    }
  }
  
  return multiplier;
}

/**
 * @cybernetic Oblicza dźwignię sterowniczą
 */
export function calculateControlLeverage(
  availablePower: number,
  influenceStrength: number,
  certaintyScore: number
): number {
  // Wzór Kosseckiego: Leverage = Power * Influence * Certainty
  return availablePower * influenceStrength * certaintyScore;
}

