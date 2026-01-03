/**
 * @fileoverview Pathfinder Core - Logic bez zależności od bazy danych
 * @cybernetic Czysta logika algorytmiczna do benchmark i fallback
 *
 * Wyekstraktowane funkcje z pathfinder.ts, które nie wymagają Supabase.
 * Używane w:
 * - benchmark.ts (testy wydajności)
 * - fallback.ts (TypeScript fallback dla Wasm)
 */

import type { CyberneticObject, Correlation } from '../../supabase/types';
import type {
  SteeringGoal,
  InfluentialNode,
  InfluencePath,
} from './types';
import {
  calculateFeedbackMultiplier,
  calculateControlLeverage,
} from './types';

// ============================================================================
// KONFIGURACJA
// ============================================================================

export const PATHFINDER_CONFIG = {
  MAX_DEPTH: 5,                    // Maksymalna głębokość przeszukiwania
  MAX_PATHS: 100,                  // Maksymalna liczba ścieżek do analizy
  MIN_INFLUENCE_THRESHOLD: 0.1,   // Minimalny wpływ do rozważenia
  TOP_RECOMMENDATIONS: 5,          // Liczba top rekomendacji
};

// ============================================================================
// TYPY
// ============================================================================

/**
 * @cybernetic Struktura grafu
 */
export interface Graph {
  objects: Map<string, CyberneticObject>;
  adjacencyList: Map<string, Correlation[]>; // source_id -> [correlations]
  reverseAdjacencyList: Map<string, Correlation[]>; // target_id -> [correlations]
}

// ============================================================================
// CORE LOGIC
// ============================================================================

/**
 * @cybernetic Buduje graf z obiektów i relacji
 *
 * @param objects - Tablica obiektów cybernetycznych
 * @param correlations - Tablica relacji
 * @returns Graf z listami sąsiedztwa
 */
export function buildGraph(
  objects: CyberneticObject[],
  correlations: Correlation[]
): Graph {
  const graph: Graph = {
    objects: new Map(),
    adjacencyList: new Map(),
    reverseAdjacencyList: new Map(),
  };

  // Dodaj obiekty
  for (const obj of objects) {
    graph.objects.set(obj.id, obj);
    graph.adjacencyList.set(obj.id, []);
    graph.reverseAdjacencyList.set(obj.id, []);
  }

  // Dodaj relacje
  for (const corr of correlations) {
    // Forward (source -> target)
    const forward = graph.adjacencyList.get(corr.source_id);
    if (forward) forward.push(corr);

    // Reverse (target <- source)
    const reverse = graph.reverseAdjacencyList.get(corr.target_id);
    if (reverse) reverse.push(corr);
  }

  return graph;
}

/**
 * @cybernetic Znajduje wszystkie ścieżki wpływu do celu (BFS)
 *
 * Algorytm:
 * 1. Start od targetId
 * 2. BFS wstecz (reverse edges)
 * 3. Buduj ścieżki [source -> ... -> target]
 * 4. Filtruj słabe wpływy (< threshold)
 * 5. Limit głębokości (MAX_DEPTH) i liczby ścieżek (MAX_PATHS)
 *
 * @param graph - Graf obiektów i relacji
 * @param targetId - ID obiektu docelowego
 * @param goal - Cel sterowania (strengthen/weaken)
 * @returns Tablica ścieżek wpływu
 */
export function findInfluencePaths(
  graph: Graph,
  targetId: string,
  goal: SteeringGoal
): InfluencePath[] {
  const paths: InfluencePath[] = [];
  const visited = new Set<string>();

  // Kolejka: [currentId, path, totalStrength, feedbackTypes, certainties, depth]
  interface QueueItem {
    currentId: string;
    path: string[];
    totalStrength: number;
    feedbackTypes: string[];
    certainties: number[];
    depth: number;
  }

  const queue: QueueItem[] = [{
    currentId: targetId,
    path: [targetId],
    totalStrength: 1.0,
    feedbackTypes: [],
    certainties: [],
    depth: 0,
  }];

  while (queue.length > 0 && paths.length < PATHFINDER_CONFIG.MAX_PATHS) {
    const current = queue.shift()!;

    if (current.depth >= PATHFINDER_CONFIG.MAX_DEPTH) {
      continue;
    }

    // Pobierz relacje wpływające na current (reverse)
    const incomingRelations = graph.reverseAdjacencyList.get(current.currentId) || [];

    for (const relation of incomingRelations) {
      const sourceId = relation.source_id;

      // Unikaj cykli (chyba że to pętla sprzężenia zwrotnego)
      if (current.path.includes(sourceId) && sourceId !== targetId) {
        continue;
      }

      // Oblicz siłę wpływu
      const impactFactor = relation.impact_factor;
      const newStrength = current.totalStrength * impactFactor;

      // Filtruj słabe wpływy
      if (newStrength < PATHFINDER_CONFIG.MIN_INFLUENCE_THRESHOLD) {
        continue;
      }

      const newPath = [sourceId, ...current.path];
      const newFeedbackTypes = [relation.relation_type, ...current.feedbackTypes];
      const newCertainties = [relation.certainty_score, ...current.certainties];

      // Zapisz ścieżkę
      const pathNames = newPath.map(id => graph.objects.get(id)?.name || id);
      const avgCertainty = newCertainties.reduce((a, b) => a + b, 0) / newCertainties.length;

      paths.push({
        path: newPath,
        path_names: pathNames,
        total_strength: newStrength,
        feedback_types: newFeedbackTypes as any,
        certainty_score: avgCertainty,
        depth: current.depth + 1,
        is_feedback_loop: sourceId === targetId,
      });

      // Kontynuuj przeszukiwanie
      queue.push({
        currentId: sourceId,
        path: newPath,
        totalStrength: newStrength,
        feedbackTypes: newFeedbackTypes,
        certainties: newCertainties,
        depth: current.depth + 1,
      });
    }
  }

  return paths;
}

/**
 * @cybernetic Oblicza wpływ każdego węzła na cel
 *
 * Algorytm:
 * 1. Grupuj ścieżki według pierwszego węzła (influencer)
 * 2. Agreguj siłę wpływu i rzetelność
 * 3. Oblicz feedback multiplier z typów relacji
 * 4. Oblicz control leverage (dźwignia sterownicza)
 *
 * @param paths - Ścieżki wpływu z BFS
 * @param graph - Graf obiektów
 * @returns Posortowana lista wpływowych węzłów
 */
export function calculateNodeInfluences(
  paths: InfluencePath[],
  graph: Graph
): InfluentialNode[] {
  const nodeInfluence = new Map<string, {
    paths: InfluencePath[];
    totalStrength: number;
    totalCertainty: number;
  }>();

  // Agreguj ścieżki według pierwszego węzła (najbliższego wpływu)
  for (const path of paths) {
    if (path.path.length < 2) continue; // Pomijamy sam cel

    const influencerId = path.path[0]; // Pierwszy węzeł w ścieżce

    if (!nodeInfluence.has(influencerId)) {
      nodeInfluence.set(influencerId, {
        paths: [],
        totalStrength: 0,
        totalCertainty: 0,
      });
    }

    const node = nodeInfluence.get(influencerId)!;
    node.paths.push(path);
    node.totalStrength += path.total_strength;
    node.totalCertainty += path.certainty_score;
  }

  // Przekształć na InfluentialNode[]
  const result: InfluentialNode[] = [];

  for (const [objectId, data] of nodeInfluence.entries()) {
    const obj = graph.objects.get(objectId);
    if (!obj) continue;

    const pathCount = data.paths.length;
    const avgInfluence = data.totalStrength / pathCount;
    const avgCertainty = data.totalCertainty / pathCount;

    // Oblicz mnożnik sprzężeń zwrotnych
    const allFeedbackTypes = data.paths.flatMap(p => p.feedback_types);
    const feedbackMultiplier = calculateFeedbackMultiplier(allFeedbackTypes);

    // Oblicz dźwignię sterowniczą
    const availablePower = obj.energy_params.available_power || 0;
    const controlLeverage = calculateControlLeverage(
      availablePower,
      avgInfluence * feedbackMultiplier,
      avgCertainty
    );

    result.push({
      object_id: objectId,
      object_name: obj.name,
      influence_strength: avgInfluence,
      path_count: pathCount,
      feedback_multiplier: feedbackMultiplier,
      available_power: availablePower,
      certainty_score: avgCertainty,
      control_leverage: controlLeverage,
      paths: data.paths,
    });
  }

  return result;
}

/**
 * @cybernetic Generuje uzasadnienie rekomendacji
 *
 * @param node - Wpływowy węzeł
 * @param goal - Cel sterowania
 * @returns Opis uzasadnienia
 */
export function generateRationale(node: InfluentialNode, goal: SteeringGoal): string {
  const feedbackDesc = node.feedback_multiplier > 1
    ? 'sprzężenie dodatnie (wzmacniające)'
    : node.feedback_multiplier < 1
    ? 'sprzężenie ujemne (hamujące)'
    : 'brak sprzężenia zwrotnego';

  return `Obiekt generuje ${feedbackDesc} i ma ${node.path_count} ścieżek wpływu. ` +
         `Dźwignia sterownicza: ${node.control_leverage.toFixed(2)} ` +
         `(moc: ${node.available_power.toFixed(2)}, wpływ: ${node.influence_strength.toFixed(2)}, ` +
         `rzetelność: ${node.certainty_score.toFixed(2)}).`;
}

/**
 * @cybernetic Generuje rekomendacje sterowania
 *
 * @param influentialNodes - Posortowana lista wpływowych węzłów
 * @param targetObject - Obiekt docelowy
 * @param goal - Cel sterowania
 * @returns Rekomendacje + ostrzeżenia
 */
export function generateRecommendations(
  influentialNodes: InfluentialNode[],
  targetObject: CyberneticObject,
  goal: SteeringGoal
) {
  const warnings: string[] = [];

  if (influentialNodes.length === 0) {
    warnings.push('Nie znaleziono żadnych ścieżek wpływu na obiekt docelowy.');
    return {
      primary: {
        object_id: '',
        object_name: 'Brak rekomendacji',
        action: 'Brak dostępnych akcji',
        rationale: 'Obiekt jest izolowany w grafie relacji.',
        expected_impact: 0,
        confidence: 0,
      },
      alternatives: [],
      warnings,
    };
  }

  // Primary recommendation - najwyższa dźwignia sterownicza
  const top = influentialNodes[0];
  const actionVerb = goal === 'strengthen' ? 'wzmocnić' : 'osłabić';

  const primary = {
    object_id: top.object_id,
    object_name: top.object_name,
    action: `${actionVerb} "${top.object_name}"`,
    rationale: generateRationale(top, goal),
    expected_impact: Math.min(top.influence_strength * top.feedback_multiplier, 1.0),
    confidence: top.certainty_score,
  };

  // Alternative recommendations
  const alternatives = influentialNodes.slice(1, PATHFINDER_CONFIG.TOP_RECOMMENDATIONS).map(node => ({
    object_id: node.object_id,
    object_name: node.object_name,
    action: `${actionVerb} "${node.object_name}"`,
    rationale: generateRationale(node, goal),
    expected_impact: Math.min(node.influence_strength * node.feedback_multiplier, 1.0),
    confidence: node.certainty_score,
  }));

  // Warnings
  if (primary.confidence < 0.5) {
    warnings.push('OSTRZEŻENIE: Niska rzetelność relacji. Rekomendacja wymaga weryfikacji.');
  }

  if (top.available_power < 1.0) {
    warnings.push('OSTRZEŻENIE: Obiekt ma niską moc swobodną. Wpływ może być ograniczony.');
  }

  return { primary, alternatives, warnings };
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  buildGraph,
  findInfluencePaths,
  calculateNodeInfluences,
  generateRationale,
  generateRecommendations,
  PATHFINDER_CONFIG,
};
