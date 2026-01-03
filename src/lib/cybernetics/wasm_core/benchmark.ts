/**
 * @fileoverview Benchmark Rust/Wasm vs TypeScript
 * @cybernetic Pomiar wydajności dla różnych rozmiarów grafów
 */

import type { CyberneticObject, Correlation, SteeringGoal } from '../decisions/types';
import { buildGraph, findInfluencePaths, calculateNodeInfluences } from '../decisions/pathfinder-core';
import { findInfluencePathsWasm, isWasmAvailable } from './bridge';

// ============================================================================
// TYPY
// ============================================================================

export interface BenchmarkResult {
  object_count: number;
  correlation_count: number;
  typescript_time_ms: number;
  wasm_time_ms: number | null;
  speedup: number | null;
  results_match: boolean;
  wasm_available: boolean;
  error?: string;
}

export interface BenchmarkReport {
  timestamp: string;
  wasm_available: boolean;
  results: BenchmarkResult[];
  summary: {
    avg_speedup: number;
    min_speedup: number;
    max_speedup: number;
    recommended_threshold: number;
  };
}

// ============================================================================
// GENEROWANIE GRAFÓW TESTOWYCH
// ============================================================================

/**
 * @cybernetic Generuje graf testowy o zadanym rozmiarze
 *
 * Struktura:
 * - Obiekty: name = "Node_1", "Node_2", ...
 * - Korelacje: losowe połączenia z prawdopodobieństwem 0.3
 * - Energy params: losowe wartości 50-1000
 * - Relation types: mix (direct_control, positive_feedback, negative_feedback, supply)
 *
 * @param objectCount - Liczba obiektów w grafie
 * @param connectionProbability - Prawdopodobieństwo połączenia (0.0-1.0)
 * @returns Tuple [objects, correlations]
 */
export function generateTestGraph(
  objectCount: number,
  connectionProbability: number = 0.3
): [CyberneticObject[], Correlation[]] {
  const objects: CyberneticObject[] = [];
  const correlations: Correlation[] = [];

  // Generuj obiekty
  for (let i = 0; i < objectCount; i++) {
    const power = Math.floor(Math.random() * 950) + 50; // 50-1000
    const idle = Math.floor(power * 0.2);
    const available = power - idle;

    objects.push({
      id: `node_${i}`,
      name: `Node ${i}`,
      description: `Test node ${i}`,
      system_class: i % 3 === 0 ? 'autonomous_system' : 'environment',
      control_system_type: i % 2 === 0 ? 'ethical' : 'economic',
      energy_params: {
        working_power: power,
        idle_power: idle,
        available_power: available,
      },
      created_at: new Date().toISOString(),
    });
  }

  // Generuj korelacje
  const relationTypes = ['direct_control', 'positive_feedback', 'negative_feedback', 'supply'] as const;

  for (let i = 0; i < objectCount; i++) {
    for (let j = 0; j < objectCount; j++) {
      if (i === j) continue;

      if (Math.random() < connectionProbability) {
        const relationType = relationTypes[Math.floor(Math.random() * relationTypes.length)];

        correlations.push({
          id: `corr_${i}_${j}`,
          source_id: `node_${i}`,
          target_id: `node_${j}`,
          relation_type: relationType,
          certainty_score: Math.random() * 0.3 + 0.7, // 0.7-1.0
          impact_factor: Math.random() * 0.4 + 0.6, // 0.6-1.0
          source_name: `Test correlation ${i}->${j}`,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  return [objects, correlations];
}

// ============================================================================
// BENCHMARK
// ============================================================================

/**
 * @cybernetic Uruchamia benchmark dla pojedynczego rozmiaru grafu
 *
 * @param objectCount - Liczba obiektów
 * @param goal - Cel sterowania
 * @returns Wynik benchmarku
 */
export async function benchmarkGraphSize(
  objectCount: number,
  goal: SteeringGoal = 'strengthen'
): Promise<BenchmarkResult> {
  console.log(`\n[BENCHMARK] Testowanie grafu z ${objectCount} obiektami...`);

  // Generuj graf
  const [objects, correlations] = generateTestGraph(objectCount);
  console.log(`[BENCHMARK] Wygenerowano ${correlations.length} korelacji`);

  // Wybierz losowy obiekt docelowy
  const targetId = objects[Math.floor(Math.random() * objects.length)].id;

  const result: BenchmarkResult = {
    object_count: objectCount,
    correlation_count: correlations.length,
    typescript_time_ms: 0,
    wasm_time_ms: null,
    speedup: null,
    results_match: false,
    wasm_available: false,
  };

  try {
    // ========================================
    // TEST 1: TypeScript
    // ========================================
    console.log('[BENCHMARK] Running TypeScript...');
    const tsStart = performance.now();

    // Bezpośrednie wywołanie core logic (bez bazy danych)
    const graph = buildGraph(objects, correlations);
    const paths = findInfluencePaths(graph, targetId, goal);
    const tsResult = calculateNodeInfluences(paths, graph);
    tsResult.sort((a, b) => b.control_leverage - a.control_leverage);

    const tsEnd = performance.now();
    result.typescript_time_ms = tsEnd - tsStart;

    console.log(`[BENCHMARK] ✓ TypeScript: ${result.typescript_time_ms.toFixed(2)}ms`);
    console.log(`[BENCHMARK]   Wpływowych węzłów: ${tsResult.length}`);

    // ========================================
    // TEST 2: Wasm (jeśli dostępny)
    // ========================================
    const wasmAvailable = await isWasmAvailable();
    result.wasm_available = wasmAvailable;

    if (wasmAvailable) {
      console.log('[BENCHMARK] Running Wasm...');
      const wasmStart = performance.now();
      const wasmResult = await findInfluencePathsWasm(objects, correlations, targetId, goal);
      const wasmEnd = performance.now();
      result.wasm_time_ms = wasmEnd - wasmStart;

      console.log(`[BENCHMARK] ✓ Wasm: ${result.wasm_time_ms.toFixed(2)}ms`);
      console.log(`[BENCHMARK]   Wpływowych węzłów: ${wasmResult.length}`);

      // Oblicz speedup
      result.speedup = result.typescript_time_ms / result.wasm_time_ms;
      console.log(`[BENCHMARK] ⚡ Speedup: ${result.speedup.toFixed(2)}x`);

      // Sprawdź zgodność wyników
      result.results_match = compareResults(tsResult, wasmResult);
      console.log(`[BENCHMARK] ${result.results_match ? '✓' : '❌'} Wyniki zgodne: ${result.results_match}`);

    } else {
      console.log('[BENCHMARK] ⚠️ Wasm niedostępny - pomijam test');
    }

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[BENCHMARK] ❌ Błąd: ${result.error}`);
  }

  return result;
}

/**
 * @cybernetic Uruchamia pełny benchmark dla wielu rozmiarów grafów
 *
 * @param sizes - Tablica rozmiarów do przetestowania
 * @returns Pełny raport z benchmarku
 */
export async function runFullBenchmark(
  sizes: number[] = [50, 100, 200, 500, 1000]
): Promise<BenchmarkReport> {
  console.log('\n' + '='.repeat(60));
  console.log('BENCHMARK RUST/WASM vs TYPESCRIPT');
  console.log('='.repeat(60));

  const wasmAvailable = await isWasmAvailable();
  console.log(`\nWasm Status: ${wasmAvailable ? '✅ Dostępny' : '❌ Niedostępny'}`);

  if (!wasmAvailable) {
    console.log('⚠️ Wasm niedostępny - benchmark będzie tylko TypeScript');
  }

  const results: BenchmarkResult[] = [];

  for (const size of sizes) {
    const result = await benchmarkGraphSize(size);
    results.push(result);

    // Krótka pauza między testami
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Oblicz statystyki
  const speedups = results
    .filter(r => r.speedup !== null)
    .map(r => r.speedup!);

  const avgSpeedup = speedups.length > 0
    ? speedups.reduce((sum, s) => sum + s, 0) / speedups.length
    : 0;

  const minSpeedup = speedups.length > 0 ? Math.min(...speedups) : 0;
  const maxSpeedup = speedups.length > 0 ? Math.max(...speedups) : 0;

  // Rekomendowany threshold - pierwszy rozmiar gdzie speedup >= 2x
  const recommendedThreshold = results.find(r => r.speedup && r.speedup >= 2.0)?.object_count || 100;

  const report: BenchmarkReport = {
    timestamp: new Date().toISOString(),
    wasm_available: wasmAvailable,
    results,
    summary: {
      avg_speedup: avgSpeedup,
      min_speedup: minSpeedup,
      max_speedup: maxSpeedup,
      recommended_threshold: recommendedThreshold,
    },
  };

  // Wyświetl podsumowanie
  printBenchmarkSummary(report);

  return report;
}

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * @cybernetic Porównuje wyniki TypeScript i Wasm
 *
 * Sprawdza czy:
 * - Liczba węzłów się zgadza
 * - Top 5 węzłów ma te same ID
 * - control_leverage różni się max o 1%
 */
function compareResults(tsNodes: any[], wasmNodes: any[]): boolean {
  if (tsNodes.length !== wasmNodes.length) {
    console.warn(`[COMPARE] Różna liczba węzłów: TS=${tsNodes.length}, Wasm=${wasmNodes.length}`);
    return false;
  }

  // Porównaj top 5
  const top5TS = tsNodes.slice(0, 5).map(n => n.object_id);
  const top5Wasm = wasmNodes.slice(0, 5).map(n => n.object_id);

  const top5Match = top5TS.every((id, i) => id === top5Wasm[i]);

  if (!top5Match) {
    console.warn(`[COMPARE] Top 5 węzłów różni się`);
    console.warn(`[COMPARE] TS: ${top5TS.join(', ')}`);
    console.warn(`[COMPARE] Wasm: ${top5Wasm.join(', ')}`);
    return false;
  }

  // Porównaj control_leverage (tolerancja 1%)
  for (let i = 0; i < Math.min(5, tsNodes.length); i++) {
    const tsLeverage = tsNodes[i].control_leverage;
    const wasmLeverage = wasmNodes[i].control_leverage;
    const diff = Math.abs(tsLeverage - wasmLeverage) / tsLeverage;

    if (diff > 0.01) {
      console.warn(`[COMPARE] Różnica w control_leverage dla ${tsNodes[i].object_id}: ${(diff * 100).toFixed(2)}%`);
      return false;
    }
  }

  return true;
}

/**
 * @cybernetic Wyświetla czytelne podsumowanie benchmarku
 */
function printBenchmarkSummary(report: BenchmarkReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('PODSUMOWANIE BENCHMARKU');
  console.log('='.repeat(60));

  console.log('\n📊 WYNIKI:');
  console.log('─'.repeat(60));
  console.log('Rozmiar | TS (ms) | Wasm (ms) | Speedup | Zgodność');
  console.log('─'.repeat(60));

  for (const result of report.results) {
    const size = result.object_count.toString().padEnd(7);
    const tsTime = result.typescript_time_ms.toFixed(2).padStart(7);
    const wasmTime = result.wasm_time_ms?.toFixed(2).padStart(9) || '     N/A';
    const speedup = result.speedup?.toFixed(2).padStart(7) + 'x' || '    N/A';
    const match = result.results_match ? '   ✅' : (result.wasm_available ? '   ❌' : '    -');

    console.log(`${size} | ${tsTime} | ${wasmTime} | ${speedup} | ${match}`);
  }

  if (report.wasm_available) {
    console.log('\n📈 STATYSTYKI:');
    console.log(`  • Średnie przyspieszenie: ${report.summary.avg_speedup.toFixed(2)}x`);
    console.log(`  • Min przyspieszenie: ${report.summary.min_speedup.toFixed(2)}x`);
    console.log(`  • Max przyspieszenie: ${report.summary.max_speedup.toFixed(2)}x`);
    console.log(`  • Rekomendowany threshold: ${report.summary.recommended_threshold} węzłów`);

    console.log('\n💡 REKOMENDACJA:');
    if (report.summary.avg_speedup >= 2.0) {
      console.log(`  ✅ Użyj Wasm dla grafów >= ${report.summary.recommended_threshold} węzłów`);
      console.log(`  ✅ Średnie przyspieszenie ${report.summary.avg_speedup.toFixed(2)}x jest znaczące`);
    } else if (report.summary.avg_speedup >= 1.2) {
      console.log(`  ⚠️ Wasm przyspiesza ${report.summary.avg_speedup.toFixed(2)}x - umiarkowana korzyść`);
      console.log(`  ⚠️ Rozważ threshold >= ${report.summary.recommended_threshold} węzłów`);
    } else {
      console.log(`  ❌ Wasm nie daje znaczącego przyspieszenia (${report.summary.avg_speedup.toFixed(2)}x)`);
      console.log(`  ❌ Pozostań przy TypeScript lub optymalizuj Wasm`);
    }
  } else {
    console.log('\n⚠️ Wasm niedostępny - brak porównania wydajności');
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Raport wygenerowany: ${new Date(report.timestamp).toLocaleString()}`);
  console.log('='.repeat(60) + '\n');
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  generateTestGraph,
  benchmarkGraphSize,
  runFullBenchmark,
};
