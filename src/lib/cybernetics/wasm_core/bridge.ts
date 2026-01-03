/**
 * @fileoverview Bridge TypeScript ↔ Rust/Wasm
 * @cybernetic Mostek integracyjny z smart fallback
 *
 * Ładuje moduł Wasm i eksportuje funkcje gotowe do użycia w React/Astro.
 * Jeśli Wasm się nie załaduje, fallback na TypeScript implementation.
 */

import type { CyberneticObject, Correlation } from '../../supabase/types';
import type { InfluentialNode, SteeringGoal } from '../decisions/types';

// ============================================================================
// TYPY
// ============================================================================

interface WasmModule {
  wasm_find_influence_paths(
    objectsJson: string,
    correlationsJson: string,
    targetId: string,
    goal: string
  ): string;
}

// ============================================================================
// LAZY LOADING WASM
// ============================================================================

let wasmModule: WasmModule | null = null;
let wasmLoadError: Error | null = null;
let wasmLoadPromise: Promise<void> | null = null;

/**
 * @cybernetic Lazy load modułu Wasm
 */
async function loadWasmModule(): Promise<void> {
  if (wasmModule) return; // Już załadowany
  if (wasmLoadError) throw wasmLoadError; // Błąd już wystąpił
  if (wasmLoadPromise) return wasmLoadPromise; // Ładowanie w toku

  wasmLoadPromise = (async () => {
    try {
      console.log('[WASM] Ładowanie modułu Rust/Wasm...');

      // Dynamiczny import modułu Wasm
      // wasm-pack generuje moduł w pkg/
      const module = await import('./pkg/wasm_core.js');

      // Inicjalizacja Wasm - wasm-pack używa default export jako init function
      await module.default();

      wasmModule = module as unknown as WasmModule;
      console.log('[WASM] ✓ Moduł załadowany pomyślnie');
      console.log('[WASM] ✓ Funkcja wasm_find_influence_paths dostępna');
    } catch (error) {
      wasmLoadError = error as Error;
      console.error('[WASM] ✗ Błąd ładowania modułu:', error);
      console.warn('[WASM] Fallback na TypeScript implementation');
      throw error;
    }
  })();

  return wasmLoadPromise;
}

// ============================================================================
// SMART FALLBACK
// ============================================================================

/**
 * @cybernetic Smart wrapper z fallback
 *
 * Próbuje użyć Wasm, jeśli fail → fallback na TypeScript
 */
export async function findInfluencePathsWasm(
  objects: CyberneticObject[],
  correlations: Correlation[],
  targetId: string,
  goal: SteeringGoal
): Promise<InfluentialNode[]> {
  try {
    // Spróbuj załadować Wasm
    await loadWasmModule();

    if (!wasmModule) {
      throw new Error('Wasm module not loaded');
    }

    // Serialize input
    const objectsJson = JSON.stringify(objects);
    const correlationsJson = JSON.stringify(correlations);

    // Wywołaj Rust BFS
    const startTime = performance.now();
    const resultJson = wasmModule.wasm_find_influence_paths(
      objectsJson,
      correlationsJson,
      targetId,
      goal
    );
    const endTime = performance.now();

    // Parse output
    const result: InfluentialNode[] = JSON.parse(resultJson);

    console.log(`[WASM] BFS completed in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`[WASM] Found ${result.length} influential nodes`);

    return result;
  } catch (error) {
    console.warn('[WASM] Fallback to TypeScript implementation due to error:', error);

    // Fallback na TypeScript
    const { findInfluencePathsTS } = await import('./fallback');
    return findInfluencePathsTS(objects, correlations, targetId, goal);
  }
}

/**
 * @cybernetic Sprawdza czy Wasm jest dostępny
 */
export async function isWasmAvailable(): Promise<boolean> {
  try {
    await loadWasmModule();
    return wasmModule !== null;
  } catch {
    return false;
  }
}

/**
 * @cybernetic Export główny (kompatybilny z istniejącym API)
 */
export default {
  findInfluencePathsWasm,
  isWasmAvailable,
};
