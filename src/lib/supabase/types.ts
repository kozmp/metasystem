/**
 * @fileoverview Typy TypeScript dla bazy danych Supabase
 * @cybernetic Mapowanie schematu PostgreSQL na typy TypeScript
 * 
 * Wygenerowane na podstawie schema.sql
 */

// ============================================================================
// TYPY BAZODANOWE
// ============================================================================

/**
 * @cybernetic Typ systemu zgodnie z klasyfikacją Kosseckiego/Mazura
 */
export type SystemClass = 
  | 'autonomous_system'     // System autonomiczny (samosterowny)
  | 'heteronomous_system'   // System heteronomiczny (sterowany z zewnątrz)
  | 'environment'           // Otoczenie
  | 'tool';                 // Narzędzie

/**
 * @cybernetic Typ systemu sterowania źródła
 */
export type ControlSystemType =
  | 'cognitive'      // System poznawczy (nauka, fakty)
  | 'ideological'    // System ideologiczny (propaganda, doktryna)
  | 'ethical'        // System etyczny (normy moralne)
  | 'economic';      // System gospodarczy (biznes, zysk)

/**
 * @cybernetic Kod cywilizacyjny (Metacybernetyka 2015)
 */
export type CivilizationCode =
  | 'latin'          // Cywilizacja łacińska (nauka, prawo)
  | 'byzantine'      // Cywilizacja bizantyjska (religia, tradycja)
  | 'turandot'       // Cywilizacja turandot (ideologia, totalitaryzm)
  | 'mixed'          // Mieszana
  | 'unknown';       // Nieznana

/**
 * @cybernetic Typ motywacji systemu (Metacybernetyka 2015)
 */
export type MotivationType =
  | 'vital'          // Motywacje witalne (przeżycie biologiczne)
  | 'informational'  // Motywacje informacyjne (poznanie)
  | 'mixed';         // Mieszane

/**
 * @cybernetic Typ relacji sterowniczej
 */
export type RelationType = 
  | 'direct_control'        // Sterowanie bezpośrednie
  | 'positive_feedback'     // Sprzężenie zwrotne dodatnie
  | 'negative_feedback'     // Sprzężenie zwrotne ujemne
  | 'supply';               // Dostarczanie zasobów

/**
 * @cybernetic Parametry energetyczne systemu
 */
export interface EnergyParams {
  working_power: number;    // Moc robocza
  idle_power: number;       // Moc jałowa
  available_power: number;  // Moc swobodna
}

// ============================================================================
// TABELE BAZY DANYCH
// ============================================================================

/**
 * @cybernetic Tabela: cybernetic_objects
 * Reprezentuje obiekty elementarne z teorii poznania Kosseckiego
 * ZAKTUALIZOWANO: Metacybernetyka 2015 - dodano v, a, c oraz P
 */
export interface CyberneticObject {
  id: string;
  name: string;
  description?: string;
  system_class: SystemClass;
  control_system_type: ControlSystemType;

  // LEGACY: Stare parametry energetyczne (do usunięcia w przyszłości)
  energy_params: EnergyParams;

  // METACYBERNETYKA 2015: Parametry mocy systemowej
  power_v: number;              // v - Moc jednostkowa [W]
  quality_a: number;            // a - Jakość/sprawność (0-1)
  mass_c: number;               // c - Ilość/masa
  total_power_p: number;        // P = v × a × c - moc całkowita [W] (generated)

  // METACYBERNETYKA 2015: Klasyfikacja cywilizacyjna
  civilization_code: CivilizationCode;
  motivation_type: MotivationType;

  created_at: string;
}

/**
 * @cybernetic Tabela: correlations
 * Reprezentuje relacje sterownicze między obiektami
 */
export interface Correlation {
  id: string;
  source_id: string;
  target_id: string;
  relation_type: RelationType;
  certainty_score: number;      // 0-1, waga rzetelności
  impact_factor: number;         // Siła wpływu
  evidence_data?: Record<string, unknown>;
  source_name?: string;          // Nazwa źródła (dla detekcji sprzeczności)
  superseded_at?: string;        // Kiedy relacja została wycofana
  superseded_by?: string;        // ID nowej relacji która tę zastąpiła
  created_at: string;
}

/**
 * @cybernetic Tabela: source_intelligence
 * Służy do oceny reaktywności i wiarygodności dostarczycieli informacji
 */
export interface SourceIntelligence {
  id: string;
  source_name: string;
  source_url: string;
  reliability_index: number;     // 0-1, indeks rzetelności poznawczej
  civilization_profile?: string; // 'latin', 'byzantine', 'turandot'
  last_verified_at: string;
}

/**
 * @cybernetic Tabela: raw_signals
 * Przechowuje surowe wpisy przed przetworzeniem na obiekty
 */
export interface RawSignal {
  id: string;
  content: string;
  processed: boolean;
  noise_level?: number;          // semanticNoiseLevel z Receptora
  created_at: string;
}

/**
 * @cybernetic Tabela: system_alerts
 * Alerty systemowe (wykryte sprzeczności, zmiany narracji)
 */
export interface SystemAlert {
  id: string;
  alert_type: 'contradiction' | 'narrative_shift' | 'low_certainty' | 'ideological_flag';
  severity: number;              // 0-1, gdzie 1 = krytyczne
  title: string;
  description: string;
  conflicting_relation_ids: string[];
  affected_object_ids: string[];
  source_name?: string;
  metadata: Record<string, unknown>;
  status: 'active' | 'resolved' | 'dismissed';
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

// ============================================================================
// SCHEMAT BAZY DANYCH DLA SUPABASE CLIENT
// ============================================================================

/**
 * @cybernetic Główny typ schematu bazy danych
 * Używany przez Supabase Client dla type safety
 */
export interface Database {
  public: {
    Tables: {
      cybernetic_objects: {
        Row: CyberneticObject;
        // total_power_p jest generated column - nie można jej ustawiać przy INSERT/UPDATE
        Insert: Omit<CyberneticObject, 'id' | 'created_at' | 'total_power_p'>;
        Update: Partial<Omit<CyberneticObject, 'id' | 'created_at' | 'total_power_p'>>;
      };
      correlations: {
        Row: Correlation;
        Insert: Omit<Correlation, 'id' | 'created_at'>;
        Update: Partial<Omit<Correlation, 'id' | 'created_at'>>;
      };
      source_intelligence: {
        Row: SourceIntelligence;
        Insert: Omit<SourceIntelligence, 'id' | 'last_verified_at'>;
        Update: Partial<Omit<SourceIntelligence, 'id' | 'last_verified_at'>>;
      };
      raw_signals: {
        Row: RawSignal;
        Insert: Omit<RawSignal, 'id' | 'created_at'>;
        Update: Partial<Omit<RawSignal, 'id' | 'created_at'>>;
      };
      system_alerts: {
        Row: SystemAlert;
        Insert: Omit<SystemAlert, 'id' | 'created_at'>;
        Update: Partial<Omit<SystemAlert, 'id' | 'created_at'>>;
      };
    };
    Views: {
      v_control_chains: {
        Row: {
          source_id: string;
          target_id: string;
          relation_type: RelationType;
          depth: number;
        };
      };
      v_power_ranking: {
        Row: {
          id: string;
          name: string;
          system_class: SystemClass;
          power_v: number;
          quality_a: number;
          mass_c: number;
          total_power_p: number;
          civilization_code: CivilizationCode;
          motivation_type: MotivationType;
          power_rank_in_class: number;
          power_rank_global: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

