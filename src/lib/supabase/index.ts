/**
 * @fileoverview Supabase Module - Publiczne API
 * @cybernetic Warstwa Korelatora - Retencja (pamięć operacyjna systemu KMS)
 */

export { supabase, testSupabaseConnection, checkDatabaseSchema } from './client';
export type { Database } from './types';
export type {
  CyberneticObject,
  Correlation,
  SourceIntelligence,
  RawSignal,
  SystemClass,
  ControlSystemType,
  RelationType,
  EnergyParams,
} from './types';

