/**
 * @fileoverview Główny punkt wejścia do systemu cybernetycznego KMS
 * @cybernetic Eksport wszystkich typów i interfejsów organów cybernetycznych
 */

// ============================================================================
// TYPY PODSTAWOWE
// ============================================================================

export type {
  // Parametry energetyczno-informacyjne
  EnergyParameters,
  InformationParameters,
  
  // Typy podstawowe
  SourceType,
  FeedbackType,
  ControlType,
  SystemType,
  RelationType,
  AlertType,
  AlertAction,
  
  // Obiekty i procesy
  CyberneticObject,
  ControlProcess,
  
  // Alerty i wyniki
  HomeostatAlert,
  AnalysisResult,
  
  // Kontekst globalny
  CyberneticContext,
} from './types';

// ============================================================================
// STAŁE I PROGI
// ============================================================================

export * from './constants';

// ============================================================================
// MODUŁY ORGANÓW
// ============================================================================

// RECEPTOR - Organ wejściowy (✓ Zaimplementowany)
export * from './receptor';

// KORELATOR - Organ logiki i pamięci (TODO)
// export * from './korelator';

// HOMEOSTAT - Organ weryfikacji (TODO)
// export * from './homeostat';

// EFEKTOR - Organ wyjściowy (TODO)
// export * from './efektor';

