/**
 * @fileoverview Pathfinder Optimized - Wrapper z smart loading Wasm/TypeScript
 * @cybernetic Automatyczny wybór Wasm (duże grafy) lub TypeScript (małe grafy)
 */

import { simulateSteering as simulateSteeringTS } from './pathfinder';
import type { SteeringGoal, SteeringSimulationResult } from './types';

// ============================================================================
// KONFIGURACJA
// ============================================================================

/**
 * @cybernetic Próg rozmiaru grafu dla użycia Wasm
 *
 * BENCHMARK RESULTS (2026-01-02):
 * - 50 nodes:   TS 1.5ms   vs Wasm 8.5ms    (5.7x slower)
 * - 100 nodes:  TS 2.0ms   vs Wasm 16.6ms   (8.3x slower)
 * - 200 nodes:  TS 2.7ms   vs Wasm 53.7ms   (19.9x slower)
 * - 500 nodes:  TS 22.4ms  vs Wasm 524.1ms  (23.4x slower)
 * - 1000 nodes: TS 41.1ms  vs Wasm 6425.1ms (156x slower)
 *
 * ROOT CAUSE: JSON serialization overhead dominates Wasm performance.
 * DECISION: Use TypeScript for all graph sizes.
 */
const USE_WASM_THRESHOLD = Infinity; // NEVER use Wasm (benchmark showed TS is faster)

/**
 * @cybernetic Flag kontrolujący czy Wasm jest włączony globalnie
 *
 * DISABLED based on benchmark results - TypeScript is 5-156x faster.
 */
let WASM_ENABLED = false;

// ============================================================================
// INTERFACE
// ============================================================================

export interface SimulationMetadata {
  engine: 'wasm' | 'typescript';
  reason: string;
  wasm_available: boolean;
  graph_size: number;
  threshold: number;
}

export interface OptimizedSimulationResult extends SteeringSimulationResult {
  _metadata?: SimulationMetadata;
}

// ============================================================================
// SMART LOADING
// ============================================================================

/**
 * @cybernetic Wrapper z automatycznym wyborem engine (Wasm vs TypeScript)
 *
 * Algorytm decyzji:
 * 1. Sprawdź czy Wasm jest globalnie włączony
 * 2. Pobierz liczbę obiektów z bazy
 * 3. Jeśli >= THRESHOLD i Wasm dostępny → użyj Wasm
 * 4. W przeciwnym razie → użyj TypeScript
 *
 * @param targetObjectId - ID obiektu docelowego
 * @param goal - Cel sterowania
 * @returns Wynik symulacji + metadata o użytym engine
 */
export async function simulateSteeringOptimized(
  targetObjectId: string,
  goal: SteeringGoal
): Promise<OptimizedSimulationResult> {
  console.log('[PATHFINDER-OPT] Rozpoczynam zoptymalizowaną symulację...');

  const startTime = performance.now();

  // Sprawdź rozmiar grafu
  const graphSize = await getGraphSize();
  console.log(`[PATHFINDER-OPT] Rozmiar grafu: ${graphSize} obiektów`);

  // Decyzja: Wasm czy TypeScript?
  const useWasm = WASM_ENABLED && graphSize >= USE_WASM_THRESHOLD;

  let result: SteeringSimulationResult;
  let engine: 'wasm' | 'typescript';
  let reason: string;
  let wasmAvailable = false;

  // ⚡ BENCHMARK DECISION: TypeScript is 5-156x faster than Wasm
  // Root cause: JSON serialization overhead dominates Wasm performance
  // See pathfinder-optimized.ts lines 16-24 for benchmark results

  console.log('[PATHFINDER-OPT] Używam TypeScript (fastest option)');
  console.log('[PATHFINDER-OPT] Wasm disabled - benchmark showed TS is 5-156x faster');

  result = await simulateSteeringTS(targetObjectId, goal);
  engine = 'typescript';
  reason = `TypeScript is faster (benchmark: Wasm 156x slower for 1000 nodes due to JSON overhead)`;
  wasmAvailable = false;

  const endTime = performance.now();
  const totalTime = endTime - startTime;

  console.log(`[PATHFINDER-OPT] ✓ Symulacja zakończona w ${totalTime.toFixed(2)}ms`);
  console.log(`[PATHFINDER-OPT] Engine: ${engine.toUpperCase()}`);
  console.log(`[PATHFINDER-OPT] Reason: ${reason}`);

  // Dodaj metadata o użytym engine
  return {
    ...result,
    _metadata: {
      engine,
      reason,
      wasm_available: wasmAvailable,
      graph_size: graphSize,
      threshold: USE_WASM_THRESHOLD,
    },
  };
}

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * @cybernetic Pobiera rozmiar grafu (liczba obiektów)
 */
async function getGraphSize(): Promise<number> {
  try {
    const { supabase } = await import('../../supabase/client');

    const { count, error } = await supabase
      .from('cybernetic_objects')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('[PATHFINDER-OPT] Błąd pobierania rozmiaru grafu:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.warn('[PATHFINDER-OPT] Błąd getGraphSize:', error);
    return 0;
  }
}

/**
 * @cybernetic Globalnie włącz/wyłącz Wasm
 */
export function setWasmEnabled(enabled: boolean): void {
  WASM_ENABLED = enabled;
  console.log(`[PATHFINDER-OPT] Wasm globally ${enabled ? 'ENABLED' : 'DISABLED'}`);
}

/**
 * @cybernetic Sprawdź status Wasm
 */
export async function getWasmStatus() {
  try {
    const { isWasmAvailable } = await import('../wasm_core/bridge');
    const available = await isWasmAvailable();
    const graphSize = await getGraphSize();

    return {
      enabled: WASM_ENABLED,
      available,
      threshold: USE_WASM_THRESHOLD,
      graph_size: graphSize,
      will_use_wasm: WASM_ENABLED && available && graphSize >= USE_WASM_THRESHOLD,
    };
  } catch (error) {
    return {
      enabled: WASM_ENABLED,
      available: false,
      threshold: USE_WASM_THRESHOLD,
      graph_size: await getGraphSize(),
      will_use_wasm: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  simulateSteeringOptimized,
  setWasmEnabled,
  getWasmStatus,
};
