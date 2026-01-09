/**
 * @fileoverview Homeostat Security Layer - Warstwa bezpieczeństwa systemu
 * @cybernetic Zgodnie z Rozdziałem 5 Metacybernetyki: Homeostat stabilizuje system
 * 
 * Implementacja sprzężenia zwrotnego ujemnego - blokuje destrukcyjne operacje AI.
 * 
 * Inspiracja: Claude Code Damage Control
 * Adaptacja: Czysto TypeScript, zintegrowana z architekturą KMS
 * 
 * P = v × a × c
 * Gdzie Security Layer zwiększa "c" (certainty) systemu przez eliminację ryzyka
 */

import { z } from 'zod';

// ============================================================================
// TYPY I SCHEMATY
// ============================================================================

/**
 * Typ operacji podlegających kontroli bezpieczeństwa
 */
export type OperationType = 
  | 'sql_query'      // Zapytania do bazy danych
  | 'file_write'     // Zapis do pliku
  | 'file_delete'    // Usunięcie pliku
  | 'api_call'       // Wywołanie zewnętrznego API
  | 'data_delete'    // Usunięcie danych z bazy
  | 'schema_change'; // Zmiana schematu bazy

/**
 * Poziom zagrożenia wykrytej operacji
 */
export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Decyzja systemu bezpieczeństwa
 */
export type SecurityAction = 'allow' | 'block' | 'ask_user';

/**
 * Wynik walidacji bezpieczeństwa
 */
export type SecurityDecision = 
  | { action: 'allow' }
  | { action: 'block'; reason: string; severity: SecuritySeverity; pattern?: string }
  | { action: 'ask_user'; message: string; context: unknown; severity: SecuritySeverity };

/**
 * Schemat walidacji operacji wejściowej
 */
export const OperationSchema = z.object({
  type: z.enum(['sql_query', 'file_write', 'file_delete', 'api_call', 'data_delete', 'schema_change']),
  payload: z.union([z.string(), z.record(z.unknown())]),
  target: z.string().optional(), // Ścieżka pliku lub nazwa tabeli
  metadata: z.record(z.unknown()).optional(),
});

export type Operation = z.infer<typeof OperationSchema>;

// ============================================================================
// DANGEROUS PATTERNS - Wzorce Zagrożeń
// ============================================================================

/**
 * @cybernetic Definicje wzorców zagrożeń
 * 
 * Każdy pattern reprezentuje potencjalnie destrukcyjną operację.
 * Analogia do patterns.yaml z Damage Control, ale w TypeScript.
 */
interface SecurityPattern {
  pattern: RegExp;
  reason: string;
  severity: SecuritySeverity;
  action: SecurityAction;
}

/**
 * Wzorce dla zapytań SQL
 */
const SQL_DANGEROUS_PATTERNS: SecurityPattern[] = [
  // CRITICAL - Blokada totalna
  {
    pattern: /DELETE\s+FROM\s+\w+\s*;/i,
    reason: 'DELETE bez WHERE clause - utrata wszystkich danych w tabeli',
    severity: 'CRITICAL',
    action: 'block',
  },
  {
    pattern: /DROP\s+TABLE/i,
    reason: 'Próba usunięcia tabeli',
    severity: 'CRITICAL',
    action: 'block',
  },
  {
    pattern: /DROP\s+DATABASE/i,
    reason: 'Próba usunięcia bazy danych',
    severity: 'CRITICAL',
    action: 'block',
  },
  {
    pattern: /TRUNCATE\s+TABLE/i,
    reason: 'Wyczyszczenie całej tabeli',
    severity: 'CRITICAL',
    action: 'block',
  },
  
  // HIGH - Wymaga potwierdzenia użytkownika
  {
    pattern: /DELETE\s+FROM\s+cybernetic_objects\s+WHERE/i,
    reason: 'Usunięcie obiektów cybernetycznych z bazy - wymaga potwierdzenia',
    severity: 'HIGH',
    action: 'ask_user',
  },
  {
    pattern: /DELETE\s+FROM\s+correlations\s+WHERE/i,
    reason: 'Usunięcie korelacji z bazy - wymaga potwierdzenia',
    severity: 'HIGH',
    action: 'ask_user',
  },
  {
    pattern: /UPDATE\s+cybernetic_objects\s+SET.*WHERE/i,
    reason: 'Modyfikacja obiektów cybernetycznych - wymaga potwierdzenia',
    severity: 'MEDIUM',
    action: 'ask_user',
  },
  
  // MEDIUM - Potencjalnie ryzykowne
  {
    pattern: /ALTER\s+TABLE/i,
    reason: 'Zmiana struktury tabeli',
    severity: 'MEDIUM',
    action: 'ask_user',
  },
];

/**
 * Wzorce dla ekspozycji kluczy API
 */
const API_KEY_PATTERNS: SecurityPattern[] = [
  {
    pattern: /SUPABASE_KEY|SUPABASE_ANON_KEY|PUBLIC_SUPABASE_KEY/i,
    reason: 'Próba ekspozycji klucza Supabase',
    severity: 'CRITICAL',
    action: 'block',
  },
  {
    pattern: /GEMINI_API_KEY|AIza[A-Za-z0-9_-]{35}/,
    reason: 'Próba ekspozycji klucza Gemini API',
    severity: 'CRITICAL',
    action: 'block',
  },
  {
    pattern: /OPENROUTER_API_KEY|sk-or-v1-[A-Za-z0-9]{64}/,
    reason: 'Próba ekspozycji klucza OpenRouter',
    severity: 'CRITICAL',
    action: 'block',
  },
  {
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
    reason: 'Próba ekspozycji JWT token',
    severity: 'CRITICAL',
    action: 'block',
  },
];

/**
 * Wzorce dla operacji na plikach
 */
const FILE_DANGEROUS_PATTERNS: SecurityPattern[] = [
  {
    pattern: /\.env/i,
    reason: 'Próba modyfikacji pliku .env z kluczami API',
    severity: 'CRITICAL',
    action: 'block',
  },
  {
    pattern: /METACYBERNETYKA.*\.pdf/i,
    reason: 'Próba modyfikacji źródłowego PDF Kosseckiego',
    severity: 'CRITICAL',
    action: 'block',
  },
  {
    pattern: /migrations\//i,
    reason: 'Próba usunięcia migracji bazy danych',
    severity: 'HIGH',
    action: 'block',
  },
  {
    pattern: /constants\.ts/i,
    reason: 'Próba modyfikacji aksjomatów systemu',
    severity: 'HIGH',
    action: 'ask_user',
  },
];

// ============================================================================
// GŁÓWNA FUNKCJA WALIDACJI
// ============================================================================

/**
 * @cybernetic Walidacja operacji przed wykonaniem
 * 
 * Implementacja homeostatu - sprzężenie zwrotne ujemne.
 * 
 * Zgodnie z zasadą Kosseckiego:
 * - System autonomiczny musi chronić swoją integralność
 * - Operacje destrukcyjne wymagają zwiększenia "mocy swobodnej" użytkownika
 * 
 * @param operation Operacja do zwalidowania
 * @returns Decyzja bezpieczeństwa (allow/block/ask_user)
 */
export function validateOperation(operation: Operation): SecurityDecision {
  
  // Walidacja schematu
  const validationResult = OperationSchema.safeParse(operation);
  if (!validationResult.success) {
    return {
      action: 'block',
      reason: `Nieprawidłowa struktura operacji: ${validationResult.error.message}`,
      severity: 'HIGH',
    };
  }
  
  const payload = typeof operation.payload === 'string' 
    ? operation.payload 
    : JSON.stringify(operation.payload);
  
  // 1. Sprawdź wzorce dla kluczy API (najwyższy priorytet)
  for (const pattern of API_KEY_PATTERNS) {
    if (pattern.pattern.test(payload)) {
      return {
        action: pattern.action,
        reason: pattern.reason,
        severity: pattern.severity,
        pattern: pattern.pattern.source,
      };
    }
  }
  
  // 2. Sprawdź wzorce SQL (dla sql_query i data_delete)
  if (operation.type === 'sql_query' || operation.type === 'data_delete') {
    for (const pattern of SQL_DANGEROUS_PATTERNS) {
      if (pattern.pattern.test(payload)) {
        
        if (pattern.action === 'block') {
          return {
            action: 'block',
            reason: pattern.reason,
            severity: pattern.severity,
            pattern: pattern.pattern.source,
          };
        }
        
        if (pattern.action === 'ask_user') {
          return {
            action: 'ask_user',
            message: `AI próbuje wykonać operację: ${pattern.reason}`,
            context: {
              operation_type: operation.type,
              payload: payload.substring(0, 200), // Ogranicz długość dla UI
              pattern: pattern.reason,
            },
            severity: pattern.severity,
          };
        }
      }
    }
  }
  
  // 3. Sprawdź wzorce plików (dla file_write i file_delete)
  if ((operation.type === 'file_write' || operation.type === 'file_delete') && operation.target) {
    for (const pattern of FILE_DANGEROUS_PATTERNS) {
      if (pattern.pattern.test(operation.target)) {
        
        if (pattern.action === 'block') {
          return {
            action: 'block',
            reason: pattern.reason,
            severity: pattern.severity,
            pattern: pattern.pattern.source,
          };
        }
        
        if (pattern.action === 'ask_user') {
          return {
            action: 'ask_user',
            message: `AI próbuje ${operation.type === 'file_delete' ? 'usunąć' : 'zmodyfikować'} plik: ${operation.target}`,
            context: {
              operation_type: operation.type,
              target: operation.target,
              pattern: pattern.reason,
            },
            severity: pattern.severity,
          };
        }
      }
    }
  }
  
  // 4. Domyślnie: allow (brak wykrytych zagrożeń)
  return { action: 'allow' };
}

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * Sprawdza czy operacja jest bezpieczna (skrócona wersja)
 */
export function isOperationSafe(operation: Operation): boolean {
  const decision = validateOperation(operation);
  return decision.action === 'allow';
}

/**
 * Sprawdza czy operacja wymaga potwierdzenia użytkownika
 */
export function requiresUserConfirmation(operation: Operation): boolean {
  const decision = validateOperation(operation);
  return decision.action === 'ask_user';
}

/**
 * Formatuje decyzję bezpieczeństwa do czytelnej wiadomości
 */
export function formatSecurityDecision(decision: SecurityDecision): string {
  if (decision.action === 'allow') {
    return '✓ Operacja dozwolona';
  }
  
  if (decision.action === 'block') {
    return `✗ BLOKADA [${decision.severity}]: ${decision.reason}`;
  }
  
  if (decision.action === 'ask_user') {
    return `⚠ WYMAGA POTWIERDZENIA [${decision.severity}]: ${decision.message}`;
  }
  
  return 'Nieznana decyzja';
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  validateOperation,
  isOperationSafe,
  requiresUserConfirmation,
  formatSecurityDecision,
};

