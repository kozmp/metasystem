/**
 * @fileoverview Test importu modułu Wasm
 * @cybernetic Weryfikacja konfiguracji Vite
 *
 * Uruchom: npx tsx src/lib/cybernetics/wasm_core/test-import.ts
 */

import type { CyberneticObject, Correlation } from '../../supabase/types';
import type { SteeringGoal } from '../decisions/types';

// ============================================================================
// TEST DATA
// ============================================================================

const testObjects: CyberneticObject[] = [
  {
    id: 'obj1',
    name: 'Parlament RP',
    description: 'Sejm i Senat',
    system_class: 'autonomous_system',
    control_system_type: 'ethical',
    energy_params: {
      working_power: 100,
      idle_power: 20,
      available_power: 80,
    },
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'obj2',
    name: 'Rząd RP',
    description: 'Rada Ministrów',
    system_class: 'autonomous_system',
    control_system_type: 'economic',
    energy_params: {
      working_power: 150,
      idle_power: 30,
      available_power: 120,
    },
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'obj3',
    name: 'Obywatele',
    description: 'Społeczeństwo polskie',
    system_class: 'environment',
    control_system_type: 'ethical',
    energy_params: {
      working_power: 1000,
      idle_power: 200,
      available_power: 800,
    },
    created_at: '2025-01-01T00:00:00Z',
  },
];

const testCorrelations: Correlation[] = [
  {
    id: 'corr1',
    source_id: 'obj3', // Obywatele
    target_id: 'obj1', // → Parlament
    relation_type: 'direct_control', // Wybory
    certainty_score: 0.9,
    impact_factor: 0.8,
    source_name: 'Konstytucja RP',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'corr2',
    source_id: 'obj1', // Parlament
    target_id: 'obj2', // → Rząd
    relation_type: 'positive_feedback', // Wotum zaufania
    certainty_score: 0.85,
    impact_factor: 0.7,
    source_name: 'Konstytucja RP',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'corr3',
    source_id: 'obj2', // Rząd
    target_id: 'obj3', // → Obywatele
    relation_type: 'supply', // Usługi publiczne
    certainty_score: 0.75,
    impact_factor: 0.6,
    source_name: 'Ustawa budżetowa',
    created_at: '2025-01-01T00:00:00Z',
  },
];

// ============================================================================
// TESTS
// ============================================================================

async function testWasmImport() {
  console.log('=====================================');
  console.log('TEST IMPORTU MODUŁU WASM');
  console.log('=====================================\n');

  try {
    console.log('[1/4] Importowanie bridge.ts...');
    const { findInfluencePathsWasm, isWasmAvailable } = await import('./bridge');
    console.log('✅ Bridge zaimportowany\n');

    console.log('[2/4] Sprawdzanie dostępności Wasm...');
    const wasmAvailable = await isWasmAvailable();
    console.log(`✅ Wasm ${wasmAvailable ? 'DOSTĘPNY' : 'NIEDOSTĘPNY'}\n`);

    if (!wasmAvailable) {
      console.log('⚠️ Wasm niedostępny - test zakończony');
      console.log('Możliwe przyczyny:');
      console.log('1. Błąd ładowania modułu (sprawdź konsolę przeglądarki)');
      console.log('2. Nieprawidłowa ścieżka do pkg/');
      console.log('3. Brak wsparcia Wasm w środowisku\n');
      return;
    }

    console.log('[3/4] Wywołanie wasm_find_influence_paths...');
    const targetId = 'obj1'; // Parlament
    const goal: SteeringGoal = 'strengthen';

    const startTime = performance.now();
    const result = await findInfluencePathsWasm(
      testObjects,
      testCorrelations,
      targetId,
      goal
    );
    const endTime = performance.now();

    console.log(`✅ Funkcja wykonana w ${(endTime - startTime).toFixed(2)}ms\n`);

    console.log('[4/4] Analiza wyników...');
    console.log(`Znaleziono ${result.length} wpływowych węzłów:\n`);

    for (const node of result) {
      console.log(`  • ${node.object_name}`);
      console.log(`    - Dźwignia sterownicza: ${node.control_leverage.toFixed(3)}`);
      console.log(`    - Siła wpływu: ${node.influence_strength.toFixed(3)}`);
      console.log(`    - Ścieżek: ${node.path_count}`);
      console.log(`    - Mnożnik sprzężeń: ${node.feedback_multiplier.toFixed(2)}x`);
      console.log(`    - Rzetelność: ${(node.certainty_score * 100).toFixed(0)}%`);
      console.log('');
    }

    console.log('=====================================');
    console.log('TEST ZAKOŃCZONY SUKCESEM! ✅');
    console.log('=====================================\n');

    console.log('NASTĘPNE KROKI:');
    console.log('1. Zintegruj z DecisionSimulator');
    console.log('2. Uruchom benchmark (Rust vs TypeScript)');
    console.log('3. Dodaj conditional loading (Wasm dla dużych grafów)\n');

  } catch (error) {
    console.error('=====================================');
    console.error('TEST FAILED! ❌');
    console.error('=====================================\n');
    console.error('Błąd:', error);
    console.error('\nSzczegóły:', error instanceof Error ? error.stack : 'Brak stack trace');
  }
}

// ============================================================================
// RUN
// ============================================================================

console.log('\n🚀 Uruchamiam test importu Wasm...\n');
testWasmImport().catch(console.error);
