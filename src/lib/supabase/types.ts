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
 */
export interface CyberneticObject {
  id: string;
  name: string;
  description?: string;
  system_class: SystemClass;
  control_system_type: ControlSystemType;
  energy_params: EnergyParams;
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
        Insert: Omit<CyberneticObject, 'id' | 'created_at'>;
        Update: Partial<Omit<CyberneticObject, 'id' | 'created_at'>>;
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
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

