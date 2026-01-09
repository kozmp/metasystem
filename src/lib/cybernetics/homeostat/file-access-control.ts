/**
 * @fileoverview File Access Control - Macierz ochrony zasobów systemowych
 * @cybernetic Implementacja homeostatu - zapobieganie utracie retencji
 * 
 * Zgodnie z Metacybernetyką 2015:
 * Retencja (pamięć operacyjna) musi być chroniona przed destrukcją.
 * 
 * Inspiracja: Path Protection Matrix z Claude Code Damage Control
 * Adaptacja: Macierz dostępu dla systemu KMS
 */

// ============================================================================
// MACIERZ OCHRONY ZASOBÓW
// ============================================================================

/**
 * @cybernetic Kategorie ochrony plików
 * 
 * Zgodnie z gradacją:
 * - zeroAccess: Pełna blokada (nawet odczyt może być ryzykowny)
 * - readOnly: Tylko odczyt dozwolony
 * - noDelete: Wszystkie operacje poza usunięciem
 */
export const FILE_PROTECTION_MATRIX = {
  /**
   * Zero Access - Żadne operacje niedozwolone
   * Pliki zawierające sekrety, klucze, wrażliwe dane
   */
  zeroAccess: [
    '.env',
    '.env.local',
    '.env.production',
    'METACYBERNETYKA - Józef Kossecki 2015_compressed.pdf', // Źródło wiedzy
    '.git/config', // Konfiguracja git (może zawierać credentiale)
  ],
  
  /**
   * Read Only - Tylko odczyt dozwolony
   * Pliki krytyczne dla działania systemu, które nie powinny być modyfikowane
   */
  readOnly: [
    'src/lib/cybernetics/constants.ts',       // Aksjomaty Kosseckiego
    'src/lib/cybernetics/types.ts',           // Definicje typów cybernetycznych
    'package.json',                           // Dependencies
    'package-lock.json',                      // Lockfile
    'tsconfig.json',                          // Konfiguracja TypeScript
    'astro.config.mjs',                       // Konfiguracja Astro
    'tailwind.config.mjs',                    // Konfiguracja Tailwind
    '.gitignore',                             // Ochrona przed przypadkowym odgitignore
  ],
  
  /**
   * No Delete - Wszystkie operacje poza usunięciem
   * Pliki, które mogą być modyfikowane, ale nie usuwane
   */
  noDelete: [
    'migrations/',                            // Historia migracji bazy danych
    'schema.sql',                             // Główny schemat bazy
    'schema-homeostat-alerts.sql',            // Schemat alertów
    'schema-receptor-sources.sql',            // Schemat źródeł
    'src/lib/cybernetics/wasm_core/pkg/',    // Skompilowany WASM (drogie do odbudowy)
    'src/lib/cybernetics/wasm_core/Cargo.toml', // Konfiguracja Rust
    'README.md',                              // Dokumentacja główna
    'INITIALIZATION_REPORT.md',               // Historia inicjalizacji
  ],
} as const;

// ============================================================================
// TYPY I INTERFEJSY
// ============================================================================

/**
 * Typ operacji na plikach
 */
export type FileOperation = 'read' | 'write' | 'append' | 'delete' | 'execute' | 'move' | 'chmod';

/**
 * Wynik walidacji dostępu do pliku
 */
export interface FileAccessResult {
  allowed: boolean;
  reason?: string;
  protectionLevel?: 'zeroAccess' | 'readOnly' | 'noDelete' | 'none';
}

// ============================================================================
// FUNKCJE WALIDACJI
// ============================================================================

/**
 * @cybernetic Walidacja dostępu do pliku
 * 
 * Macierz decyzji:
 * 
 * | Operacja     | zeroAccess | readOnly | noDelete |
 * |--------------|------------|----------|----------|
 * | read         | ✗ BLOK     | ✓ OK     | ✓ OK     |
 * | write        | ✗ BLOK     | ✗ BLOK   | ✓ OK     |
 * | append       | ✗ BLOK     | ✗ BLOK   | ✓ OK     |
 * | delete       | ✗ BLOK     | ✗ BLOK   | ✗ BLOK   |
 * | move         | ✗ BLOK     | ✗ BLOK   | ✓ OK     |
 * | chmod        | ✗ BLOK     | ✗ BLOK   | ✓ OK     |
 * | execute      | ✗ BLOK     | ✓ OK     | ✓ OK     |
 * 
 * @param filePath Ścieżka do pliku
 * @param operation Typ operacji
 * @returns Wynik walidacji z powodem blokady
 */
export function validateFileAccess(
  filePath: string,
  operation: FileOperation
): FileAccessResult {
  
  // Normalizacja ścieżki (zamień \ na / dla Windows)
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // 1. Zero Access - wszystko zablokowane
  const isZeroAccess = FILE_PROTECTION_MATRIX.zeroAccess.some(protectedPath => 
    normalizedPath.includes(protectedPath)
  );
  
  if (isZeroAccess) {
    return {
      allowed: false,
      reason: `Plik "${filePath}" jest w strefie zero-access. Żadne operacje niedozwolone (CRITICAL).`,
      protectionLevel: 'zeroAccess',
    };
  }
  
  // 2. Read Only - tylko odczyt i execute
  const isReadOnly = FILE_PROTECTION_MATRIX.readOnly.some(protectedPath => 
    normalizedPath.includes(protectedPath)
  );
  
  if (isReadOnly) {
    const allowedOperations: FileOperation[] = ['read', 'execute'];
    
    if (!allowedOperations.includes(operation)) {
      return {
        allowed: false,
        reason: `Plik "${filePath}" jest chroniony jako read-only. Dozwolone: odczyt i wykonanie. Operacja "${operation}" jest zablokowana.`,
        protectionLevel: 'readOnly',
      };
    }
  }
  
  // 3. No Delete - wszystko poza delete
  const isNoDelete = FILE_PROTECTION_MATRIX.noDelete.some(protectedPath => 
    normalizedPath.includes(protectedPath)
  );
  
  if (isNoDelete && operation === 'delete') {
    return {
      allowed: false,
      reason: `Plik "${filePath}" jest chroniony przed usunięciem. Inne operacje są dozwolone.`,
      protectionLevel: 'noDelete',
    };
  }
  
  // 4. Brak ochrony - wszystko dozwolone
  return { 
    allowed: true,
    protectionLevel: 'none',
  };
}

/**
 * Sprawdza czy plik jest chroniony (jakikolwiek poziom ochrony)
 */
export function isProtectedFile(filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  return (
    FILE_PROTECTION_MATRIX.zeroAccess.some(p => normalizedPath.includes(p)) ||
    FILE_PROTECTION_MATRIX.readOnly.some(p => normalizedPath.includes(p)) ||
    FILE_PROTECTION_MATRIX.noDelete.some(p => normalizedPath.includes(p))
  );
}

/**
 * Pobiera poziom ochrony pliku
 */
export function getProtectionLevel(filePath: string): 'zeroAccess' | 'readOnly' | 'noDelete' | 'none' {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  if (FILE_PROTECTION_MATRIX.zeroAccess.some(p => normalizedPath.includes(p))) {
    return 'zeroAccess';
  }
  
  if (FILE_PROTECTION_MATRIX.readOnly.some(p => normalizedPath.includes(p))) {
    return 'readOnly';
  }
  
  if (FILE_PROTECTION_MATRIX.noDelete.some(p => normalizedPath.includes(p))) {
    return 'noDelete';
  }
  
  return 'none';
}

/**
 * Formatuje poziom ochrony do czytelnej wiadomości
 */
export function formatProtectionLevel(level: 'zeroAccess' | 'readOnly' | 'noDelete' | 'none'): string {
  const messages = {
    zeroAccess: '🚫 Zero Access - Pełna blokada',
    readOnly: '👁️ Read Only - Tylko odczyt',
    noDelete: '🛡️ No Delete - Chroniony przed usunięciem',
    none: '✓ Brak ochrony',
  };
  
  return messages[level];
}

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * Sprawdza czy operacja na pliku jest bezpieczna (skrócona wersja)
 */
export function isFileOperationSafe(filePath: string, operation: FileOperation): boolean {
  const result = validateFileAccess(filePath, operation);
  return result.allowed;
}

/**
 * Pobiera listę wszystkich chronionych plików
 */
export function getAllProtectedPaths(): {
  zeroAccess: readonly string[];
  readOnly: readonly string[];
  noDelete: readonly string[];
} {
  return FILE_PROTECTION_MATRIX;
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  validateFileAccess,
  isProtectedFile,
  getProtectionLevel,
  formatProtectionLevel,
  isFileOperationSafe,
  getAllProtectedPaths,
};

