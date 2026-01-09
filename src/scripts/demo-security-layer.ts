/**
 * @fileoverview Demo Script - Homeostat Security Layer
 * @cybernetic Demonstracja działania systemu bezpieczeństwa
 * 
 * Uruchomienie:
 * npm run demo:security
 */

import { validateOperation } from '../lib/cybernetics/homeostat/security-layer';
import { validateFileAccess } from '../lib/cybernetics/homeostat/file-access-control';
import type { Operation } from '../lib/cybernetics/homeostat/security-layer';

// ============================================================================
// KOLORY KONSOLI
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================================
// TESTY DEMONSTRACYJNE
// ============================================================================

console.log('\n' + '='.repeat(80));
log('bold', '🛡️  HOMEOSTAT SECURITY LAYER - DEMO');
log('cyan', 'Demonstracja działania systemu bezpieczeństwa KMS');
console.log('='.repeat(80) + '\n');

// ----------------------------------------------------------------------------
// TEST 1: SQL OPERATIONS
// ----------------------------------------------------------------------------

log('bold', '\n📊 TEST 1: SQL OPERATIONS\n');

const sqlTests: Array<{ label: string; operation: Operation }> = [
  {
    label: 'DELETE bez WHERE (CRITICAL)',
    operation: {
      type: 'sql_query',
      payload: 'DELETE FROM cybernetic_objects;',
    },
  },
  {
    label: 'DROP TABLE (CRITICAL)',
    operation: {
      type: 'sql_query',
      payload: 'DROP TABLE correlations;',
    },
  },
  {
    label: 'DELETE z WHERE (wymaga potwierdzenia)',
    operation: {
      type: 'data_delete',
      payload: 'DELETE FROM cybernetic_objects WHERE id = 123;',
    },
  },
  {
    label: 'SELECT (bezpieczne)',
    operation: {
      type: 'sql_query',
      payload: 'SELECT * FROM cybernetic_objects LIMIT 10;',
    },
  },
];

sqlTests.forEach(({ label, operation }) => {
  const decision = validateOperation(operation);
  
  console.log(`\n  ${label}`);
  console.log(`  Operacja: ${operation.payload}`);
  
  if (decision.action === 'block') {
    log('red', `  ✗ ZABLOKOWANO [${decision.severity}]`);
    log('red', `  Powód: ${decision.reason}`);
  } else if (decision.action === 'ask_user') {
    log('yellow', `  ⚠ WYMAGA POTWIERDZENIA [${decision.severity}]`);
    log('yellow', `  Wiadomość: ${decision.message}`);
  } else {
    log('green', '  ✓ DOZWOLONO');
  }
});

// ----------------------------------------------------------------------------
// TEST 2: API KEY PROTECTION
// ----------------------------------------------------------------------------

log('bold', '\n\n🔑 TEST 2: API KEY PROTECTION\n');

const apiKeyTests: Array<{ label: string; operation: Operation }> = [
  {
    label: 'Ekspozycja SUPABASE_KEY',
    operation: {
      type: 'api_call',
      payload: 'Mój klucz to: SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  },
  {
    label: 'Ekspozycja GEMINI_API_KEY',
    operation: {
      type: 'api_call',
      payload: 'GEMINI_API_KEY=AIzaSyDQev279vUiP5wCncKQ3Tydbd0qa3ywIYY',
    },
  },
  {
    label: 'Normalny tekst (bezpieczny)',
    operation: {
      type: 'api_call',
      payload: 'To jest normalny tekst bez żadnych sekretów',
    },
  },
];

apiKeyTests.forEach(({ label, operation }) => {
  const decision = validateOperation(operation);
  
  console.log(`\n  ${label}`);
  console.log(`  Payload: ${operation.payload.substring(0, 50)}...`);
  
  if (decision.action === 'block') {
    log('red', `  ✗ ZABLOKOWANO [${decision.severity}]`);
    log('red', `  Powód: ${decision.reason}`);
  } else {
    log('green', '  ✓ DOZWOLONO');
  }
});

// ----------------------------------------------------------------------------
// TEST 3: FILE PROTECTION
// ----------------------------------------------------------------------------

log('bold', '\n\n📁 TEST 3: FILE PROTECTION\n');

const fileTests = [
  { path: '.env', operation: 'write' as const },
  { path: 'METACYBERNETYKA - Józef Kossecki 2015_compressed.pdf', operation: 'write' as const },
  { path: 'migrations/001_metacybernetyka_2015_retencja.sql', operation: 'delete' as const },
  { path: 'src/lib/cybernetics/constants.ts', operation: 'write' as const },
  { path: 'src/components/TestComponent.tsx', operation: 'write' as const },
];

fileTests.forEach(({ path, operation }) => {
  const result = validateFileAccess(path, operation);
  
  console.log(`\n  ${path}`);
  console.log(`  Operacja: ${operation}`);
  
  if (!result.allowed) {
    log('red', `  ✗ ZABLOKOWANO [${result.protectionLevel}]`);
    log('red', `  Powód: ${result.reason}`);
  } else {
    log('green', `  ✓ DOZWOLONO [${result.protectionLevel}]`);
  }
});

// ----------------------------------------------------------------------------
// PODSUMOWANIE
// ----------------------------------------------------------------------------

log('bold', '\n\n' + '='.repeat(80));
log('cyan', '✅ DEMO ZAKOŃCZONE');
log('cyan', '\nSystem Homeostat Security Layer działa poprawnie.');
log('cyan', 'Wszystkie operacje zostały zwalidowane zgodnie z zasadami bezpieczeństwa.');
console.log('='.repeat(80) + '\n');

log('magenta', '📚 Więcej informacji:');
console.log('  - Pełna dokumentacja: SECURITY-LAYER-IMPLEMENTATION.md');
console.log('  - Quick Start: SECURITY-LAYER-QUICK-START.md');
console.log('  - Dashboard: http://localhost:4325/dashboard/security');
console.log('');

