/**
 * @fileoverview Supabase Client - Połączenie z bazą danych
 * @cybernetic Implementacja Korelatora - warstwa Retencji (pamięć operacyjna systemu)
 * 
 * Zgodnie z teorią Kosseckiego:
 * Retencja = trwała pamięć obiektów i relacji sterowniczych
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ============================================================================
// KONFIGURACJA SUPABASE
// ============================================================================

// W Node.js używamy process.env, w Astro używamy import.meta.env
// Dla klienta (przeglądarki) Astro wymaga prefiksu PUBLIC_
const supabaseUrl = 
  typeof process !== 'undefined' && process.env.SUPABASE_URL 
    ? process.env.SUPABASE_URL
    : (typeof import.meta !== 'undefined' && (import.meta.env?.PUBLIC_SUPABASE_URL || import.meta.env?.SUPABASE_URL)) || '';

const supabaseKey = 
  typeof process !== 'undefined' && process.env.SUPABASE_KEY
    ? process.env.SUPABASE_KEY
    : (typeof import.meta !== 'undefined' && (import.meta.env?.PUBLIC_SUPABASE_KEY || import.meta.env?.SUPABASE_KEY)) || '';

// Funkcja walidująca konfigurację (wywołuj przed użyciem klienta)
function validateSupabaseConfig() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Brak konfiguracji Supabase. Ustaw SUPABASE_URL i SUPABASE_KEY w pliku .env'
    );
  }
}

// ============================================================================
// KLIENT SUPABASE (SINGLETON)
// ============================================================================

/**
 * @cybernetic Klient Supabase - interfejs do Korelatora (baza danych)
 * 
 * Zgodnie z architekturą KMS:
 * - Receptor → transformuje sygnał
 * - Korelator → przechowuje w pamięci (Supabase)
 * - Homeostat → weryfikuje rzetelność
 * - Efektor → prezentuje wyniki
 * 
 * UWAGA: Używaj validateSupabaseConfig() przed pierwszym użyciem w Node.js
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', // Placeholder aby nie rzucić błędu przy imporcie
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // Server-side, nie potrzebujemy sesji
    },
    db: {
      schema: 'public',
    },
  }
);

/**
 * @cybernetic Test połączenia z bazą danych
 * Sprawdza czy system ma dostęp do Retencji (pamięci operacyjnej)
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    validateSupabaseConfig(); // Waliduj przed użyciem
    
    console.log('[SUPABASE] Testuję połączenie z bazą danych...');
    
    const { data, error } = await supabase
      .from('cybernetic_objects')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('[SUPABASE] Błąd połączenia:', error.message);
      return false;
    }
    
    console.log('[SUPABASE] ✓ Połączenie z bazą danych działa');
    return true;
  } catch (error) {
    console.error('[SUPABASE] Krytyczny błąd:', error);
    return false;
  }
}

/**
 * @cybernetic Sprawdzenie czy schemat bazy danych został wdrożony
 */
export async function checkDatabaseSchema(): Promise<{
  ready: boolean;
  missingTables: string[];
}> {
  validateSupabaseConfig(); // Waliduj przed użyciem
  
  const requiredTables = [
    'cybernetic_objects',
    'correlations',
    'source_intelligence',
    'raw_signals',
  ];
  
  const missingTables: string[] = [];
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.error(`[SUPABASE] Tabela ${table} nie istnieje:`, error.message);
        missingTables.push(table);
      }
    } catch (error) {
      console.error(`[SUPABASE] Błąd sprawdzania tabeli ${table}:`, error);
      missingTables.push(table);
    }
  }
  
  return {
    ready: missingTables.length === 0,
    missingTables,
  };
}

export { validateSupabaseConfig };

export default supabase;

