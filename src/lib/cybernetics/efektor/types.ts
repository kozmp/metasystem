/**
 * @fileoverview Typy TypeScript dla Efektora
 * @cybernetic Efektor - organ wyjściowy systemu KMS
 * 
 * Zgodnie z teorią Kosseckiego:
 * Efektor odpowiada za prezentację wyników analizy w sposób rzetelny,
 * zrozumiały i sterowniczy (bez halucynacji AI).
 */

import type { 
  CyberneticObject, 
  Correlation, 
  EnergyParams,
  SystemClass,
  ControlSystemType,
  RelationType 
} from '../../supabase/types';

// ============================================================================
// TYPY DASHBOARDU
// ============================================================================

/**
 * @cybernetic Rozszerzony obiekt cybernetyczny z obliczonymi metrykami
 */
export interface DashboardObject extends CyberneticObject {
  // Metryki obliczane przez Efektor
  steering_potential: number;      // Potencjał sterowniczy (liczba relacji wychodzących)
  dependency_count: number;        // Liczba zależności (relacje przychodzące)
  total_impact: number;            // Suma impact_factor wszystkich relacji
  average_certainty: number;       // Średnia certainty_score relacji
}

/**
 * @cybernetic Rozszerzona relacja z informacjami o obiektach
 */
export interface DashboardCorrelation extends Correlation {
  // Informacje o obiektach źródłowych i docelowych
  source_name?: string;
  target_name?: string;
  source_class?: SystemClass;
  target_class?: SystemClass;
  // Flagi ostrzegawcze
  is_high_noise?: boolean;         // Wysoki poziom szumu (certainty_score < 0.3)
  is_ideological?: boolean;        // Wykryto ideologię
}

/**
 * @cybernetic Statystyki systemu dla dashboardu
 */
export interface SystemStats {
  total_objects: number;
  total_relations: number;
  average_certainty: number;
  
  // Rozkład typów systemów
  system_class_distribution: Record<SystemClass, number>;
  control_type_distribution: Record<ControlSystemType, number>;
  
  // Ostrzeżenia
  high_noise_relations: number;    // Liczba relacji z certainty_score < 0.3
  ideological_sources: number;     // Liczba źródeł ideologicznych
  
  // Homeostat - wykryte sprzeczności
  contradiction_alerts: number;    // Liczba aktywnych alertów sprzeczności
  max_contradiction_severity: number; // Najwyższy poziom severity (0-1)
}

/**
 * @cybernetic Stan formularza Receptor Input
 */
export interface ReceptorInputState {
  text: string;
  is_processing: boolean;
  result?: {
    success: boolean;
    objects_created: number;
    relations_created: number;
    certainty_score?: number;
    error?: string;
  };
}

// ============================================================================
// TYPY WIZUALIZACJI GRAFU
// ============================================================================

/**
 * @cybernetic Węzeł grafu (obiekt cybernetyczny)
 */
export interface GraphNode {
  id: string;
  name: string;
  val: number;                     // Rozmiar węzła (potencjał sterowniczy)
  color: string;                   // Kolor zależny od control_system_type
  system_class: SystemClass;
  control_system_type: ControlSystemType;
  energy_params: EnergyParams;
  
  // Metryki
  outgoing_relations: number;
  incoming_relations: number;
  average_certainty: number;
}

/**
 * @cybernetic Krawędź grafu (relacja)
 */
export interface GraphLink {
  source: string;                  // ID źródła
  target: string;                  // ID celu
  value: number;                   // Grubość krawędzi (impact_factor)
  color: string;                   // Kolor zależny od relation_type
  curvature: number;               // Zakrzywienie (dla wielu relacji między tym samym parze)
  
  // Metadata
  relation_type: RelationType;
  certainty_score: number;
  is_high_noise: boolean;
  label?: string;                  // Etykieta do wyświetlenia
}

/**
 * @cybernetic Dane grafu gotowe do wizualizacji
 */
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * @cybernetic Ustawienia wizualizacji grafu
 */
export interface GraphConfig {
  width: number;
  height: number;
  backgroundColor: string;
  nodeRelSize: number;             // Rozmiar węzła względem val
  linkWidth: number;               // Grubość linków
  linkDirectionalArrowLength: number;
  linkDirectionalArrowRelPos: number;
  linkCurvature: number;
  dagMode?: 'td' | 'bu' | 'lr' | 'rl' | null;  // Tryb DAG (Directed Acyclic Graph)
}

// ============================================================================
// FUNKCJE POMOCNICZE (TYPE GUARDS)
// ============================================================================

/**
 * @cybernetic Sprawdza czy relacja ma wysoki poziom szumu
 */
export function isHighNoise(certaintyScore: number): boolean {
  return certaintyScore < 0.3;
}

/**
 * @cybernetic Sprawdza czy typ sterowania jest ideologiczny
 */
export function isIdeological(controlType: ControlSystemType): boolean {
  return controlType === 'ideological';
}

/**
 * @cybernetic Mapuje typ sterowania na kolor
 */
export function getControlTypeColor(controlType: ControlSystemType): string {
  const colorMap: Record<ControlSystemType, string> = {
    cognitive: '#3b82f6',    // Niebieski
    ideological: '#ef4444',  // Czerwony (OSTRZEŻENIE)
    ethical: '#8b5cf6',      // Fioletowy
    economic: '#f59e0b',     // Żółty
  };
  return colorMap[controlType];
}

/**
 * @cybernetic Mapuje typ relacji na kolor
 */
export function getRelationTypeColor(relationType: RelationType): string {
  const colorMap: Record<RelationType, string> = {
    direct_control: '#6b7280',      // Szary
    positive_feedback: '#10b981',   // Zielony (wzrost)
    negative_feedback: '#ef4444',   // Czerwony (hamowanie)
    supply: '#3b82f6',              // Niebieski (zasilanie)
  };
  return colorMap[relationType];
}

/**
 * @cybernetic Mapuje certainty_score na klasę CSS badge
 */
export function getCertaintyBadgeClass(certaintyScore: number): string {
  if (certaintyScore >= 0.7) return 'badge-certainty-high';
  if (certaintyScore >= 0.4) return 'badge-certainty-medium';
  return 'badge-certainty-low';
}

/**
 * @cybernetic Formatuje liczbę energii na string z jednostkami
 */
export function formatEnergy(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toFixed(2);
}

