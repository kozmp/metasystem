/**
 * @fileoverview Podstawowe typy cybernetyczne oparte na teorii Mazura i Kosseckiego
 * @cybernetic Implementacja parametrów energetyczno-informacyjnych zgodnie z "Metacybernetyką" (2005)
 * @author KOSSECKI METASYSTEM (KMS)
 */

// ============================================================================
// PARAMETRY ENERGETYCZNE (MODEL MAZURA)
// ============================================================================

/**
 * @cybernetic Energia w ujęciu cybernetycznym - Rozdział 2 Mazura
 * System operuje na trzech rodzajach mocy:
 * - working_power: moc robocza (rzeczywista zdolność do zmiany stanów)
 * - idle_power: moc jałowa (energia utrzymania homeostazy)
 * - available_power: moc swobodna (zasoby na sterowanie strategiczne)
 */
export interface EnergyParameters {
  /** Moc robocza - energia wykorzystywana do realnych transformacji */
  working_power: number;
  
  /** Moc jałowa - energia na utrzymanie struktury wewnętrznej */
  idle_power: number;
  
  /** Moc swobodna - zasoby dostępne na nowe sterowanie */
  available_power: number;
  
  /** Całkowita energia systemu */
  total_energy: number;
  
  /** Jednostka energii (J, kWh, USD, man-hours) */
  energy_unit: string;
}

// ============================================================================
// PARAMETRY INFORMACYJNE (MODEL KOSSECKIEGO)
// ============================================================================

/**
 * @cybernetic Informacja jako transformacja stanów korelatora
 * Nie jest to "tekst", ale wektor zmiany w przestrzeni stanów poznawczych
 */
export interface InformationParameters {
  /** Waga pewności (0-1): jak bardzo ufamy tej informacji */
  certainty_weight: number;
  
  /** Współczynnik retencji: trwałość informacji w pamięci (czas połowicznego rozpadu) */
  retention_factor: number;
  
  /** Koszt energetyczny pozyskania tej informacji */
  acquisition_cost: number;
  
  /** Potencjał korelacyjny: jak bardzo ta informacja zwiększa możliwości sterownicze */
  correlation_potential: number;
  
  /** Źródło informacji - typ systemu sterowania */
  source_type: SourceType;
}

/**
 * @cybernetic Klasyfikacja systemów sterowania wg Kosseckiego
 * Każdy system społeczny operuje według dominującego wzorca
 */
export type SourceType = 
  | 'cognitive'    // System poznawczy (nauka, empiria)
  | 'ideological'  // System ideologiczny (doktryna, propaganda)
  | 'ethical'      // System etyczny (normy moralne)
  | 'economic';    // System gospodarczy (maksymalizacja zysku)

// ============================================================================
// TYPY SPRZĘŻEŃ ZWROTNYCH
// ============================================================================

/**
 * @cybernetic Sprzężenia zwrotne - kluczowy mechanizm cybernetyczny
 * Określają charakter relacji między elementami systemu
 */
export type FeedbackType = 
  | 'positive'   // Dodatnie - wzmacnianie (niestabilność)
  | 'negative'   // Ujemne - tłumienie (stabilność, homeostaza)
  | 'neutral';   // Neutralne - brak wpływu zwrotnego

/**
 * @cybernetic Typ sterowania
 */
export type ControlType = 
  | 'energy'       // Sterowanie energią (fizyczne)
  | 'information'  // Sterowanie informacją (symboliczne)
  | 'hybrid';      // Sterowanie hybrydowe

// ============================================================================
// OBIEKT CYBERNETYCZNY
// ============================================================================

/**
 * @cybernetic Obiekt Cybernetyczny - podstawowa jednostka analizy
 * Zgodnie z aksjomatami Kosseckiego:
 * - Obiekt NIE jest zbiorem cech statycznych
 * - Obiekt jest węzłem w sieci relacji
 * - Obiekt jest definiowany przez relacje z innymi obiektami
 */
export interface CyberneticObject {
  /** Unikalny identyfikator obiektu w systemie */
  id: string;
  
  /** Nazwa/etykieta obiektu (dla interfejsu użytkownika) */
  name: string;
  
  /** Typ systemu */
  system_type: SystemType;
  
  /** Parametry energetyczne obiektu */
  energy: EnergyParameters;
  
  /** Parametry informacyjne obiektu */
  information: InformationParameters;
  
  /** Czy system jest autonomiczny (samosterowny) czy heteronomiczny (sterowany z zewnątrz) */
  is_autonomous: boolean;
  
  /** Identyfikatory obiektów, z którymi ten obiekt jest powiązany relacjami */
  related_objects: string[];
  
  /** Metadane dodatkowe (JSONB w bazie danych) */
  metadata?: Record<string, unknown>;
  
  /** Timestamp utworzenia */
  created_at: Date;
  
  /** Timestamp ostatniej modyfikacji */
  updated_at: Date;
}

/**
 * @cybernetic Typ systemu cybernetycznego
 */
export type SystemType = 
  | 'autonomous'     // System autonomiczny (samosterowny)
  | 'heteronomous'   // System heteronomiczny (sterowany z zewnątrz)
  | 'composite';     // System złożony (zawiera podsystemy)

// ============================================================================
// PROCES STEROWANIA
// ============================================================================

/**
 * @cybernetic Proces Sterowania - kluczowa abstrakcja metacybernetyki
 * Opisuje jak jeden obiekt wpływa na drugi poprzez transformację energii/informacji
 * 
 * Zgodnie z modelem Kosseckiego, proces sterowania zawsze:
 * 1. Ma źródło (sterownik)
 * 2. Ma cel (obiekt sterowany)
 * 3. Wymaga energii (koszt sterowania)
 * 4. Przenosi informację (zawartość sterowania)
 * 5. Ma charakter sprzężenia (dodatnie/ujemne)
 */
export interface ControlProcess {
  /** Unikalny identyfikator procesu */
  id: string;
  
  /** ID obiektu źródłowego (sterownik) */
  source_id: string;
  
  /** ID obiektu docelowego (sterowany) */
  target_id: string;
  
  /** Typ relacji/sterowania */
  relation_type: RelationType;
  
  /** Typ sprzężenia zwrotnego */
  feedback_type: FeedbackType;
  
  /** Typ sterowania (energia/informacja/hybrid) */
  control_type: ControlType;
  
  /** Waga pewności tej relacji (weryfikowana przez Homeostat) */
  certainty_weight: number;
  
  /** Koszt energetyczny utrzymania tej relacji */
  energy_cost: number;
  
  /** Siła wpływu (0-1): jak silnie source wpływa na target */
  influence_strength: number;
  
  /** Opis relacji w metajęzyku cybernetycznym */
  description: string;
  
  /** Dowód empiryczny potwierdzający istnienie tej relacji */
  evidence?: string[];
  
  /** Timestamp utworzenia */
  created_at: Date;
  
  /** Timestamp ostatniej weryfikacji */
  verified_at?: Date;
}

/**
 * @cybernetic Typy relacji cybernetycznych
 */
export type RelationType = 
  | 'control'          // Sterowanie bezpośrednie
  | 'feedback'         // Sprzężenie zwrotne
  | 'energy_flow'      // Przepływ energii
  | 'info_flow'        // Przepływ informacji
  | 'dependency'       // Zależność (A nie może funkcjonować bez B)
  | 'correlation'      // Korelacja (współwystępowanie)
  | 'causation';       // Przyczynowość (A powoduje B)

// ============================================================================
// ALERT HOMEOSTATYCZNY
// ============================================================================

/**
 * @cybernetic Alert generowany przez Homeostat przy wykryciu zagrożenia stabilności
 */
export interface HomeostatAlert {
  /** Typ zagrożenia */
  type: AlertType;
  
  /** Powaga zagrożenia (0-1) */
  severity: number;
  
  /** Opis zagrożenia w metajęzyku */
  description: string;
  
  /** Wymagana akcja */
  action_required: AlertAction;
  
  /** ID obiektu lub procesu, którego dotyczy alert */
  subject_id: string;
  
  /** Timestamp wykrycia */
  detected_at: Date;
}

/**
 * @cybernetic Typy alertów
 */
export type AlertType = 
  | 'CONTRADICTION'       // Sprzeczność logiczna z faktami
  | 'IDEOLOGICAL_BIAS'    // Wykryto ideologię zamiast poznania
  | 'INFORMATION_GAP'     // Brak kluczowych danych
  | 'ENERGY_DEFICIT'      // Niewystarczające zasoby energetyczne
  | 'MANIPULATION'        // Wykryto próbę manipulacji
  | 'INSTABILITY';        // Zagrożenie homeostazy systemu

/**
 * @cybernetic Wymagane akcje w odpowiedzi na alert
 */
export type AlertAction = 
  | 'REJECT'              // Odrzuć informację
  | 'INVESTIGATE'         // Wymaga głębszej analizy
  | 'FLAG'                // Oznacz jako podejrzaną
  | 'REQUEST_EVIDENCE';   // Zażądaj dodatkowych dowodów

// ============================================================================
// WYNIK ANALIZY (DLA EFEKTORA)
// ============================================================================

/**
 * @cybernetic Wynik analizy systemu - output dla użytkownika
 */
export interface AnalysisResult {
  /** Główna teza/wniosek */
  thesis: string;
  
  /** Lista faktów (obiektów i relacji) wspierających tezę */
  evidence: {
    objects: CyberneticObject[];
    processes: ControlProcess[];
  };
  
  /** Metryka rzetelności (score z Homeostatu) */
  reliability_score: number;
  
  /** Alerty wykryte podczas analizy */
  alerts: HomeostatAlert[];
  
  /** Czy wynik wymaga dodatkowych pytań QA */
  requires_qa: boolean;
  
  /** Pytania dla użytkownika (jeśli requires_qa = true) */
  qa_questions?: string[];
  
  /** Timestamp analizy */
  analyzed_at: Date;
}

// ============================================================================
// KONTEKST CYBERNETYCZNY (DLA CAŁEGO SYSTEMU)
// ============================================================================

/**
 * @cybernetic Kontekst globalny systemu KMS
 */
export interface CyberneticContext {
  /** Wszystkie obiekty w systemie */
  objects: Map<string, CyberneticObject>;
  
  /** Wszystkie procesy sterowania */
  processes: Map<string, ControlProcess>;
  
  /** Aktywne alerty */
  active_alerts: HomeostatAlert[];
  
  /** Całkowita energia dostępna w systemie */
  system_energy: number;
  
  /** Timestamp ostatniej aktualizacji */
  last_updated: Date;
}

