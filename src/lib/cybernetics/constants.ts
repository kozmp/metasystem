/**
 * @fileoverview Stałe cybernetyczne i progi decyzyjne systemu KMS
 * @cybernetic Wartości progowe oparte na teorii Mazura i Kosseckiego
 */

// ============================================================================
// PROGI PEWNOŚCI (CERTAINTY THRESHOLDS)
// ============================================================================

/**
 * @cybernetic Minimalna waga pewności dla akceptacji informacji
 * Poniżej tego progu Homeostat wymusza dodatkową weryfikację
 */
export const MIN_CERTAINTY_THRESHOLD = 0.7;

/**
 * @cybernetic Wysoka pewność - informacja może być użyta do wnioskowania
 */
export const HIGH_CERTAINTY_THRESHOLD = 0.85;

/**
 * @cybernetic Absolutna pewność - fakty empiryczne, aksjomaty
 */
export const ABSOLUTE_CERTAINTY = 1.0;

// ============================================================================
// PROGI ENERGETYCZNE
// ============================================================================

/**
 * @cybernetic Minimalna moc swobodna wymagana do rozpoczęcia analizy
 * W jednostkach względnych (0-1)
 */
export const MIN_AVAILABLE_POWER = 0.1;

/**
 * @cybernetic Próg krytyczny - poniżej system przechodzi w tryb oszczędnościowy
 */
export const CRITICAL_ENERGY_THRESHOLD = 0.05;

// ============================================================================
// PROGI ALERTÓW
// ============================================================================

/**
 * @cybernetic Minimalna powaga alertu do wyświetlenia użytkownikowi
 */
export const MIN_ALERT_SEVERITY = 0.5;

/**
 * @cybernetic Krytyczna powaga - natychmiastowa akcja wymagana
 */
export const CRITICAL_ALERT_SEVERITY = 0.8;

// ============================================================================
// PARAMETRY RETENCJI (PAMIĘCI)
// ============================================================================

/**
 * @cybernetic Domyślny współczynnik retencji dla nowych informacji
 * 1.0 = pamięć trwała, < 1.0 = zanikanie w czasie
 */
export const DEFAULT_RETENTION_FACTOR = 0.95;

/**
 * @cybernetic Czas połowicznego rozpadu informacji (w dniach)
 * Dla retention_factor < 1.0
 */
export const INFORMATION_HALF_LIFE_DAYS = 30;

// ============================================================================
// WAGI TYPÓW ŹRÓDEŁ
// ============================================================================

/**
 * @cybernetic Wagi zaufania dla różnych typów źródeł
 * Zgodnie z klasyfikacją Kosseckiego
 */
export const SOURCE_TYPE_WEIGHTS = {
  cognitive: 1.0,     // System poznawczy - najwyższe zaufanie
  ethical: 0.7,       // System etyczny - normatywny
  economic: 0.5,      // System gospodarczy - interes własny
  ideological: 0.3,   // System ideologiczny - najniższe zaufanie
} as const;

// ============================================================================
// PROGI WPŁYWU (INFLUENCE)
// ============================================================================

/**
 * @cybernetic Minimalna siła wpływu dla uznania relacji za znaczącą
 */
export const MIN_INFLUENCE_STRENGTH = 0.2;

/**
 * @cybernetic Silny wpływ - relacja kluczowa dla systemu
 */
export const STRONG_INFLUENCE_THRESHOLD = 0.7;

// ============================================================================
// PARAMETRY QA (QUALITY ASSURANCE)
// ============================================================================

/**
 * @cybernetic Maksymalna liczba pytań QA generowanych jednocześnie
 */
export const MAX_QA_QUESTIONS = 5;

/**
 * @cybernetic Próg luki informacyjnej - wymusza pytania QA
 */
export const INFORMATION_GAP_THRESHOLD = 0.6;

// ============================================================================
// PARAMETRY WYSZUKIWANIA
// ============================================================================

/**
 * @cybernetic Maksymalna głębokość rekurencji w grafie wiedzy
 */
export const MAX_GRAPH_DEPTH = 5;

/**
 * @cybernetic Maksymalna liczba wyników wyszukiwania
 */
export const MAX_SEARCH_RESULTS = 50;

// ============================================================================
// KLASYFIKACJA CYWILIZACYJNA
// ============================================================================

/**
 * @cybernetic Wzorce cywilizacyjne wg Kosseckiego
 */
export const CIVILIZATION_PATTERNS = {
  LATIN: 'latin',           // Prawo ponad władzą
  BYZANTINE: 'byzantine',   // Władza ponad prawem
  TURANIAN: 'turanian',     // Siła ponad wszystkim
  JEWISH: 'jewish',         // Tożsamość grupowa
} as const;

/**
 * @cybernetic Wskaźniki wykrywania wzorców cywilizacyjnych
 */
export const CIVILIZATION_INDICATORS = {
  latin: ['prawo', 'konstytucja', 'sprawiedliwość', 'niezależność sądów'],
  byzantine: ['biurokracja', 'hierarchia', 'posłuszeństwo', 'władza'],
  turanian: ['siła', 'dominacja', 'podbój', 'honor'],
  jewish: ['wspólnota', 'tożsamość', 'tradycja', 'przetrwanie'],
} as const;

// ============================================================================
// TYPY SPRZĘŻEŃ ZWROTNYCH
// ============================================================================

/**
 * @cybernetic Współczynniki wzmocnienia dla sprzężeń
 */
export const FEEDBACK_AMPLIFICATION = {
  positive: 1.5,    // Sprzężenie dodatnie - wzmacnia zmiany
  negative: 0.5,    // Sprzężenie ujemne - tłumi zmiany
  neutral: 1.0,     // Sprzężenie neutralne - bez wpływu
} as const;

// ============================================================================
// KOSZTY OPERACJI
// ============================================================================

/**
 * @cybernetic Względne koszty energetyczne operacji cybernetycznych
 */
export const OPERATION_COSTS = {
  RECEPTOR_VALIDATION: 1,
  KORELATOR_SEARCH: 5,
  KORELATOR_INFERENCE: 10,
  HOMEOSTAT_VERIFICATION: 15,
  EFEKTOR_REPORT: 3,
} as const;

