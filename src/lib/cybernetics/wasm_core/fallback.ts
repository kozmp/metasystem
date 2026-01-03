/**
 * @fileoverview Fallback TypeScript implementation
 * @cybernetic Używany gdy Wasm nie jest dostępny
 *
 * Używa wyekstraktowanego core logic z pathfinder-core.ts
 * Zapewnia 100% zgodność z implementacją Wasm i pathfinder.ts
 */

import type { CyberneticObject, Correlation } from '../../supabase/types';
import type { InfluentialNode, SteeringGoal } from '../decisions/types';
import { buildGraph, findInfluencePaths, calculateNodeInfluences } from '../decisions/pathfinder-core';

// ============================================================================
// FALLBACK IMPLEMENTATION
// ============================================================================

/**
 * @cybernetic Fallback na TypeScript BFS
 *
 * Algorytm:
 * 1. Buduje graf z obiektów i korelacji (buildGraph)
 * 2. Znajduje ścieżki wpływu BFS (findInfluencePaths)
 * 3. Oblicza wpływ każdego węzła (calculateNodeInfluences)
 * 4. Sortuje według control_leverage (descending)
 *
 * Zapewnia identyczne wyniki jak:
 * - Wasm implementation (src/lib.rs)
 * - pathfinder.ts (simulateSteering)
 *
 * @param objects - Tablica obiektów cybernetycznych
 * @param correlations - Tablica relacji
 * @param targetId - ID obiektu docelowego
 * @param goal - Cel sterowania (strengthen/weaken)
 * @returns Posortowana lista wpływowych węzłów
 */
export async function findInfluencePathsTS(
  objects: CyberneticObject[],
  correlations: Correlation[],
  targetId: string,
  goal: SteeringGoal
): Promise<InfluentialNode[]> {
  console.log('[FALLBACK] Using TypeScript implementation');
  console.log(`[FALLBACK] Target: ${targetId}, Goal: ${goal}`);
  console.log(`[FALLBACK] Objects: ${objects.length}, Correlations: ${correlations.length}`);

  const startTime = performance.now();

  try {
    // Krok 1: Zbuduj graf
    const graph = buildGraph(objects, correlations);
    console.log(`[FALLBACK] Graf zbudowany`);

    // Krok 2: Znajdź ścieżki wpływu (BFS)
    const paths = findInfluencePaths(graph, targetId, goal);
    console.log(`[FALLBACK] Znaleziono ${paths.length} ścieżek wpływu`);

    // Krok 3: Oblicz wpływ każdego węzła
    const influentialNodes = calculateNodeInfluences(paths, graph);
    console.log(`[FALLBACK] Obliczono wpływy dla ${influentialNodes.length} węzłów`);

    // Krok 4: Sortuj według dźwigni sterowniczej (descending)
    influentialNodes.sort((a, b) => b.control_leverage - a.control_leverage);

    const endTime = performance.now();
    const elapsed = endTime - startTime;

    console.log(`[FALLBACK] ✓ Completed in ${elapsed.toFixed(2)}ms`);
    console.log(`[FALLBACK] Top node: ${influentialNodes[0]?.object_name || 'None'} (leverage: ${influentialNodes[0]?.control_leverage.toFixed(2) || 'N/A'})`);

    return influentialNodes;

  } catch (error) {
    console.error('[FALLBACK] Błąd:', error);
    throw error;
  }
}

/**
 * @cybernetic Export
 */
export default {
  findInfluencePathsTS,
};
