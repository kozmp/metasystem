/**
 * @fileoverview Homeostat - Główny punkt eksportu
 * @cybernetic Zgodnie z Metacybernetyką 2015 - Rozdział 5: Homeostat
 * 
 * Homeostat stabilizuje system przez:
 * 1. Wykrywanie sprzeczności (contradiction-engine.ts)
 * 2. Blokowanie destrukcyjnych operacji (security-layer.ts)
 * 3. Kontrolę dostępu do plików (file-access-control.ts)
 * 4. Audyt zdarzeń bezpieczeństwa (audit-logger.ts)
 */

// ============================================================================
// SECURITY LAYER (Nowe)
// ============================================================================

export {
  validateOperation,
  isOperationSafe,
  requiresUserConfirmation,
  formatSecurityDecision,
  type Operation,
  type OperationType,
  type SecuritySeverity,
  type SecurityAction,
  type SecurityDecision,
} from './security-layer';

export {
  validateFileAccess,
  isProtectedFile,
  getProtectionLevel,
  formatProtectionLevel,
  isFileOperationSafe,
  getAllProtectedPaths,
  FILE_PROTECTION_MATRIX,
  type FileOperation,
  type FileAccessResult,
} from './file-access-control';

export {
  logSecurityEvent,
  logSecurityDecision,
  getRecentSecurityEvents,
  getSecurityStats,
  type SecurityEvent,
  type LogResult,
} from './audit-logger';

// ============================================================================
// CONTRADICTION ENGINE (Istniejące)
// ============================================================================

export {
  detectContradictions,
  type ContradictionResult,
} from './contradiction-engine';

// ============================================================================
// TYPES (Istniejące)
// ============================================================================

export type {
  ContradictionAlert,
  ContradictionSeverity,
} from './types';
