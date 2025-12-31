/**
 * @fileoverview Pathfinder - Silnik Analizy Wpływu
 * @cybernetic Symulator Sterowania zgodnie z teorią Kosseckiego
 * 
 * Algorytm przeszukuje graf relacji i znajduje obiekty o największym wpływie
 * na wybrany cel, biorąc pod uwagę sprzężenia zwrotne i bilans mocy swobodnej.
 */

import { supabase } from '../../supabase/client';
import type { CyberneticObject, Correlation } from '../../supabase/types';
import type {
  SteeringGoal,
  SteeringSimulationResult,
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

const PATHFINDER_CONFIG = {
  MAX_DEPTH: 5,                    // Maksymalna głębokość przeszukiwania
  MAX_PATHS: 100,                  // Maksymalna liczba ścieżek do analizy
  MIN_INFLUENCE_THRESHOLD: 0.1,   // Minimalny wpływ do rozważenia
  TOP_RECOMMENDATIONS: 5,          // Liczba top rekomendacji
};

// ============================================================================
// GŁÓWNA FUNKCJA SYMULACJI
// ============================================================================

/**
 * @cybernetic Symuluje sterowanie obiektem docelowym
 * 
 * Algorytm:
 * 1. Pobiera wszystkie obiekty i relacje z bazy
 * 2. Buduje graf kierunkowy
 * 3. Znajduje wszystkie ścieżki wpływu prowadzące do celu (BFS)
 * 4. Oblicza siłę wpływu każdego węzła
 * 5. Uwzględnia sprzężenia zwrotne (positive/negative feedback)
 * 6. Oblicza dźwignię sterowniczą (leverage) na podstawie mocy swobodnej
 * 7. Generuje rekomendacje
 * 
 * @param targetObjectId - ID obiektu docelowego
 * @param goal - Cel: strengthen (wzmocnić) lub weaken (osłabić)
 * @returns Wynik symulacji z rekomendacjami
 */
export async function simulateSteering(
  targetObjectId: string,
  goal: SteeringGoal
): Promise<SteeringSimulationResult> {
  const startTime = performance.now();
  
  console.log(`[PATHFINDER] Rozpoczynam symulację sterowania`);
  console.log(`[PATHFINDER] Cel: ${targetObjectId}, Goal: ${goal}`);
  
  try {
    // Krok 1: Pobierz wszystkie obiekty i relacje
    const [objects, correlations, targetObject] = await Promise.all([
      fetchAllObjects(),
      fetchAllCorrelations(),
      fetchObjectById(targetObjectId),
    ]);
    
    if (!targetObject) {
      throw new Error(`Obiekt ${targetObjectId} nie istnieje`);
    }
    
    console.log(`[PATHFINDER] Pobrano ${objects.length} obiektów, ${correlations.length} relacji`);
    
    // Krok 2: Zbuduj graf
    const graph = buildGraph(objects, correlations);
    console.log(`[PATHFINDER] Graf zbudowany`);
    
    // Krok 3: Znajdź wszystkie ścieżki wpływu
    const paths = findInfluencePaths(graph, targetObjectId, goal);
    console.log(`[PATHFINDER] Znaleziono ${paths.length} ścieżek wpływu`);
    
    // Krok 4: Oblicz wpływ każdego węzła
    const influentialNodes = calculateNodeInfluences(paths, graph);
    console.log(`[PATHFINDER] Obliczono wpływy dla ${influentialNodes.length} węzłów`);
    
    // Krok 5: Sortuj według dźwigni sterowniczej
    influentialNodes.sort((a, b) => b.control_leverage - a.control_leverage);
    
    // Krok 6: Generuj rekomendacje
    const recommendations = generateRecommendations(
      influentialNodes,
      targetObject,
      goal
    );
    
    const endTime = performance.now();
    const computationTime = endTime - startTime;
    
    console.log(`[PATHFINDER] ✓ Symulacja zakończona w ${computationTime.toFixed(2)}ms`);
    
    return {
      target_object_id: targetObjectId,
      target_object_name: targetObject.name,
      goal,
      influential_nodes: influentialNodes.slice(0, 10), // Top 10
      primary_recommendation: recommendations.primary,
      alternative_recommendations: recommendations.alternatives,
      warnings: recommendations.warnings,
      simulation_metadata: {
        total_paths_analyzed: paths.length,
        max_depth: PATHFINDER_CONFIG.MAX_DEPTH,
        computation_time_ms: computationTime,
      },
    };
    
  } catch (error) {
    console.error('[PATHFINDER] Błąd symulacji:', error);
    throw error;
  }
}

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * @cybernetic Pobiera wszystkie obiekty z bazy
 */
async function fetchAllObjects(): Promise<CyberneticObject[]> {
  const { data, error } = await supabase
    .from('cybernetic_objects')
    .select('*');
  
  if (error) throw error;
  return data || [];
}

/**
 * @cybernetic Pobiera wszystkie relacje z bazy
 */
async function fetchAllCorrelations(): Promise<Correlation[]> {
  const { data, error } = await supabase
    .from('correlations')
    .select('*')
    .is('superseded_at', null); // Tylko aktywne relacje
  
  if (error) throw error;
  return data || [];
}

/**
 * @cybernetic Pobiera obiekt po ID
 */
async function fetchObjectById(id: string): Promise<CyberneticObject | null> {
  const { data, error } = await supabase
    .from('cybernetic_objects')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
}

/**
 * @cybernetic Struktura grafu
 */
interface Graph {
  objects: Map<string, CyberneticObject>;
  adjacencyList: Map<string, Correlation[]>; // source_id -> [correlations]
  reverseAdjacencyList: Map<string, Correlation[]>; // target_id -> [correlations]
}

/**
 * @cybernetic Buduje graf z obiektów i relacji
 */
function buildGraph(
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
 * Szuka ścieżek prowadzących DO targetId (idąc wstecz po grafie)
 */
function findInfluencePaths(
  graph: Graph,
  targetId: string,
  goal: SteeringGoal
): InfluencePath[] {
  const paths: InfluencePath[] = [];
  const visited = new Set<string>();
  
  // Kolejka: [currentId, path, totalStrength, feedbackTypes, certainties]
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
 */
function calculateNodeInfluences(
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
 * @cybernetic Generuje rekomendacje sterowania
 */
function generateRecommendations(
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

/**
 * @cybernetic Generuje uzasadnienie rekomendacji
 */
function generateRationale(node: InfluentialNode, goal: SteeringGoal): string {
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
 * @cybernetic Export
 */
export default {
  simulateSteering,
};

