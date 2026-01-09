/**
 * @fileoverview KOSSECKI METASYSTEM - Rust/Wasm Core
 * @cybernetic Rdzeń obliczeniowy dla algorytmów grafowych
 *
 * Implementuje BFS Graph Traversal dla symulatora sterowania zgodnie z teorią Kosseckiego.
 * Port z TypeScript (pathfinder.ts) na Rust dla maksymalnej wydajności.
 */

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};

// ============================================================================
// TYPY DANYCH (Mapowane z TypeScript)
// ============================================================================

/// @cybernetic Typ systemu zgodnie z klasyfikacją Kosseckiego/Mazura
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SystemClass {
    #[serde(rename = "autonomous_system")]
    AutonomousSystem,
    #[serde(rename = "heteronomous_system")]
    HeteronomousSystem,
    Environment,
    Tool,
}

/// @cybernetic Typ systemu sterowania źródła
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ControlSystemType {
    Cognitive,
    Ideological,
    Ethical,
    Economic,
}

/// @cybernetic Typ relacji sterowniczej
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RelationType {
    DirectControl,
    PositiveFeedback,
    NegativeFeedback,
    Supply,
}

/// @cybernetic Parametry energetyczne systemu
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnergyParams {
    pub working_power: f64,
    pub idle_power: f64,
    pub available_power: f64,
}

/// @cybernetic Obiekt cybernetyczny
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CyberneticObject {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub system_class: SystemClass,
    pub control_system_type: ControlSystemType,

    // LEGACY: Stare parametry energetyczne
    pub energy_params: EnergyParams,

    // METACYBERNETYKA 2015: Parametry mocy systemowej
    pub power_v: f64,              // v - Moc jednostkowa [W]
    pub quality_a: f64,            // a - Jakość/sprawność (0-1)
    pub mass_c: f64,               // c - Ilość/masa

    pub created_at: String,
}

/// @cybernetic Relacja sterownicza (krawędź grafu)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Correlation {
    pub id: String,
    pub source_id: String,
    pub target_id: String,
    pub relation_type: RelationType,
    pub certainty_score: f64,
    pub impact_factor: f64,
    pub source_name: Option<String>,
    pub created_at: String,
}

/// @cybernetic Typ celu symulacji
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SteeringGoal {
    Strengthen,
    Weaken,
}

/// @cybernetic Ścieżka wpływu w grafie
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfluencePath {
    pub path: Vec<String>,
    pub path_names: Vec<String>,
    pub total_strength: f64,
    pub feedback_types: Vec<RelationType>,
    pub certainty_score: f64,
    pub depth: usize,
    pub is_feedback_loop: bool,
}

/// @cybernetic Węzeł wpływowy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfluentialNode {
    pub object_id: String,
    pub object_name: String,
    pub influence_strength: f64,
    pub path_count: usize,
    pub feedback_multiplier: f64,
    pub available_power: f64,
    pub certainty_score: f64,
    pub control_leverage: f64,
    pub paths: Vec<InfluencePath>,
}

// ============================================================================
// KONFIGURACJA BFS
// ============================================================================

const MAX_DEPTH: usize = 5;
const MAX_PATHS: usize = 100;
const MIN_INFLUENCE_THRESHOLD: f64 = 0.1;

// ============================================================================
// STRUKTURA GRAFU
// ============================================================================

/// @cybernetic Graf obiektów i relacji
pub struct Graph {
    objects: HashMap<String, CyberneticObject>,
    adjacency_list: HashMap<String, Vec<Correlation>>,
    reverse_adjacency_list: HashMap<String, Vec<Correlation>>,
}

impl Graph {
    /// @cybernetic Buduje graf z obiektów i relacji
    pub fn new(objects: Vec<CyberneticObject>, correlations: Vec<Correlation>) -> Self {
        let mut graph = Graph {
            objects: HashMap::new(),
            adjacency_list: HashMap::new(),
            reverse_adjacency_list: HashMap::new(),
        };

        // Dodaj obiekty
        for obj in objects {
            graph.objects.insert(obj.id.clone(), obj.clone());
            graph.adjacency_list.insert(obj.id.clone(), Vec::new());
            graph.reverse_adjacency_list.insert(obj.id.clone(), Vec::new());
        }

        // Dodaj relacje
        for corr in correlations {
            // Forward (source → target)
            if let Some(forward) = graph.adjacency_list.get_mut(&corr.source_id) {
                forward.push(corr.clone());
            }

            // Reverse (target ← source)
            if let Some(reverse) = graph.reverse_adjacency_list.get_mut(&corr.target_id) {
                reverse.push(corr);
            }
        }

        graph
    }

    /// @cybernetic Znajduje wszystkie ścieżki wpływu do celu (BFS)
    ///
    /// Szuka ścieżek prowadzących DO targetId (idąc wstecz po grafie).
    /// Algorytm identyczny z TypeScript findInfluencePaths (pathfinder.ts:215-300)
    pub fn find_influence_paths(
        &self,
        target_id: &str,
        _goal: &SteeringGoal,
    ) -> Vec<InfluencePath> {
        let mut paths = Vec::new();

        #[derive(Clone)]
        struct QueueItem {
            current_id: String,
            path: Vec<String>,
            total_strength: f64,
            feedback_types: Vec<RelationType>,
            certainties: Vec<f64>,
            depth: usize,
        }

        let mut queue = VecDeque::new();
        queue.push_back(QueueItem {
            current_id: target_id.to_string(),
            path: vec![target_id.to_string()],
            total_strength: 1.0,
            feedback_types: Vec::new(),
            certainties: Vec::new(),
            depth: 0,
        });

        while !queue.is_empty() && paths.len() < MAX_PATHS {
            let current = queue.pop_front().unwrap();

            if current.depth >= MAX_DEPTH {
                continue;
            }

            // Pobierz relacje wpływające na current (reverse)
            let incoming_relations = self
                .reverse_adjacency_list
                .get(&current.current_id)
                .cloned()
                .unwrap_or_default();

            for relation in incoming_relations {
                let source_id = &relation.source_id;

                // Unikaj cykli (chyba że to pętla sprzężenia zwrotnego)
                if current.path.contains(source_id) && source_id != target_id {
                    continue;
                }

                // Oblicz siłę wpływu
                let impact_factor = relation.impact_factor;
                let new_strength = current.total_strength * impact_factor;

                // Filtruj słabe wpływy
                if new_strength < MIN_INFLUENCE_THRESHOLD {
                    continue;
                }

                let mut new_path = vec![source_id.clone()];
                new_path.extend_from_slice(&current.path);

                let mut new_feedback_types = vec![relation.relation_type.clone()];
                new_feedback_types.extend_from_slice(&current.feedback_types);

                let mut new_certainties = vec![relation.certainty_score];
                new_certainties.extend_from_slice(&current.certainties);

                // Zapisz ścieżkę
                let path_names: Vec<String> = new_path
                    .iter()
                    .map(|id| {
                        self.objects
                            .get(id)
                            .map(|obj| obj.name.clone())
                            .unwrap_or_else(|| id.clone())
                    })
                    .collect();

                let avg_certainty = if !new_certainties.is_empty() {
                    new_certainties.iter().sum::<f64>() / new_certainties.len() as f64
                } else {
                    0.0
                };

                paths.push(InfluencePath {
                    path: new_path.clone(),
                    path_names,
                    total_strength: new_strength,
                    feedback_types: new_feedback_types.clone(),
                    certainty_score: avg_certainty,
                    depth: current.depth + 1,
                    is_feedback_loop: source_id == target_id,
                });

                // Kontynuuj przeszukiwanie
                queue.push_back(QueueItem {
                    current_id: source_id.clone(),
                    path: new_path,
                    total_strength: new_strength,
                    feedback_types: new_feedback_types,
                    certainties: new_certainties,
                    depth: current.depth + 1,
                });
            }
        }

        paths
    }

    /// @cybernetic Oblicza wpływ każdego węzła na cel
    ///
    /// Agreguje ścieżki według pierwszego węzła i oblicza dźwignię sterowniczą.
    /// Identyczny algorytm z TypeScript calculateNodeInfluences (pathfinder.ts:305-372)
    pub fn calculate_node_influences(&self, paths: &[InfluencePath]) -> Vec<InfluentialNode> {
        let mut node_influence: HashMap<
            String,
            (Vec<InfluencePath>, f64, f64),
        > = HashMap::new();

        // Agreguj ścieżki według pierwszego węzła (najbliższego wpływu)
        for path in paths {
            if path.path.len() < 2 {
                continue; // Pomijamy sam cel
            }

            let influencer_id = &path.path[0]; // Pierwszy węzeł w ścieżce

            let entry = node_influence
                .entry(influencer_id.clone())
                .or_insert((Vec::new(), 0.0, 0.0));

            entry.0.push(path.clone());
            entry.1 += path.total_strength;
            entry.2 += path.certainty_score;
        }

        // Przekształć na InfluentialNode[]
        let mut result = Vec::new();

        for (object_id, (paths, total_strength, total_certainty)) in node_influence {
            if let Some(obj) = self.objects.get(&object_id) {
                let path_count = paths.len();
                let avg_influence = total_strength / path_count as f64;
                let avg_certainty = total_certainty / path_count as f64;

                // Oblicz mnożnik sprzężeń zwrotnych
                let all_feedback_types: Vec<RelationType> = paths
                    .iter()
                    .flat_map(|p| p.feedback_types.clone())
                    .collect();
                let feedback_multiplier = calculate_feedback_multiplier(&all_feedback_types);

                // Oblicz dźwignię sterowniczą
                let available_power = obj.energy_params.available_power;
                let control_leverage = calculate_control_leverage(
                    available_power,
                    avg_influence * feedback_multiplier,
                    avg_certainty,
                );

                result.push(InfluentialNode {
                    object_id: object_id.clone(),
                    object_name: obj.name.clone(),
                    influence_strength: avg_influence,
                    path_count,
                    feedback_multiplier,
                    available_power,
                    certainty_score: avg_certainty,
                    control_leverage,
                    paths,
                });
            }
        }

        result
    }
}

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/// @cybernetic Oblicza mnożnik sprzężenia zwrotnego
///
/// Identyczny z TypeScript calculateFeedbackMultiplier (types.ts:111-123)
fn calculate_feedback_multiplier(feedback_types: &[RelationType]) -> f64 {
    let mut multiplier = 1.0;

    for feedback_type in feedback_types {
        match feedback_type {
            RelationType::PositiveFeedback => multiplier *= 1.5, // Wzmacnia
            RelationType::NegativeFeedback => multiplier *= 0.7, // Osłabia
            _ => {}
        }
    }

    multiplier
}

/// @cybernetic Oblicza dźwignię sterowniczą
///
/// Wzór Kosseckiego: Leverage = Power * Influence * Certainty
/// Identyczny z TypeScript calculateControlLeverage (types.ts:128-135)
fn calculate_control_leverage(
    available_power: f64,
    influence_strength: f64,
    certainty_score: f64,
) -> f64 {
    available_power * influence_strength * certainty_score
}

// ============================================================================
// METACYBERNETYKA 2015: WZORY DYNAMIZMU I LOGIKI AKSJOMATYCZNEJ
// ============================================================================

/// @cybernetic Oblicza moc całkowitą systemu
///
/// Wzór: P = v × a × c
/// - v (power_v): moc jednostkowa [W]
/// - a (quality_a): jakość/sprawność (0-1)
/// - c (mass_c): ilość/masa
///
/// Fundament Dynamizmu - pozwala określić, czy system rośnie w siłę czy upada
#[wasm_bindgen]
pub fn calculate_total_power(v: f64, a: f64, c: f64) -> f64 {
    v * a * c
}

/// @cybernetic Oblicza współczynnik spójności aksjomatycznej
///
/// Wzór: Integrity = 1 - |V1 - V2| / 2
/// - V1, V2: wektory intencji sygnałów (-1.0 do 1.0)
///   - 1.0 = pełna aprobata
///   - -1.0 = pełna negacja
///
/// Wynik:
/// - 1.0: Pełna spójność (oba źródła mówią to samo)
/// - 0.5: Neutralność/brak powiązania
/// - 0.0: Sprzeczność absolutna (Antynomia) → Alarm Homeostatyczny
///
/// Służy do wykrywania sprzeczności między źródłami informacji
#[wasm_bindgen]
pub fn calculate_axiological_integrity(v1: f64, v2: f64) -> f64 {
    1.0 - ((v1 - v2).abs() / 2.0)
}

/// @cybernetic Oblicza zniekształcenie informacji
///
/// Wzór: Z = I_in / I_real
/// - I_in: informacja wejściowa (zasilająca)
/// - I_real: informacja rzeczywista (oryginalna)
///
/// Wynik:
/// - Z = 1.0: Informacja rzetelna (brak zniekształceń)
/// - Z > 1.0: Dezinformacja dodatnia (przesada/propaganda)
/// - Z < 1.0: Dezinformacja ujemna (tuszowanie/przemilczanie)
///
/// Kluczowe narzędzie do walki z dezinformacją
#[wasm_bindgen]
pub fn calculate_distortion(i_in: f64, i_real: f64) -> f64 {
    if i_real == 0.0 {
        // Unikaj dzielenia przez zero
        if i_in == 0.0 {
            1.0 // Brak informacji = brak zniekształcenia
        } else {
            f64::INFINITY // Informacja z niczego = nieskończona propaganda
        }
    } else {
        i_in / i_real
    }
}

/// @cybernetic Struktura wyniku analizy zniekształcenia
#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct DistortionAnalysis {
    pub distortion_coefficient: f64,
    pub is_distorted: bool,
    distortion_type: String, // "neutral", "propaganda", "suppression" - private, accessible via getter
}

#[wasm_bindgen]
impl DistortionAnalysis {
    /// Getter for distortion_type (private field)
    #[wasm_bindgen(getter)]
    pub fn distortion_type(&self) -> String {
        self.distortion_type.clone()
    }
}

/// @cybernetic Analizuje zniekształcenie informacji z flagami
///
/// Rozszerzona wersja calculate_distortion z automatyczną detekcją typu zniekształcenia
#[wasm_bindgen]
pub fn analyze_distortion(i_in: f64, i_real: f64) -> DistortionAnalysis {
    let z = calculate_distortion(i_in, i_real);

    const TOLERANCE: f64 = 0.05; // 5% tolerancji

    let is_distorted = (z - 1.0).abs() > TOLERANCE;
    let distortion_type = if !is_distorted {
        "neutral".to_string()
    } else if z > 1.0 {
        "propaganda".to_string() // Przesada
    } else {
        "suppression".to_string() // Tuszowanie
    };

    DistortionAnalysis {
        distortion_coefficient: z,
        is_distorted,
        distortion_type,
    }
}

// ============================================================================
// WASM BINDINGS (FFI do TypeScript)
// ============================================================================

/// @cybernetic WASM Entry Point - Główna funkcja BFS
///
/// Przyjmuje JSON z obiektami i relacjami, zwraca JSON z węzłami wpływowymi.
/// Wywoływana z TypeScript przez bridge.ts
#[wasm_bindgen]
pub fn wasm_find_influence_paths(
    objects_json: &str,
    correlations_json: &str,
    target_id: &str,
    goal: &str,
) -> Result<String, JsValue> {
    // Parse input
    let objects: Vec<CyberneticObject> = serde_json::from_str(objects_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse objects: {}", e)))?;

    let correlations: Vec<Correlation> = serde_json::from_str(correlations_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse correlations: {}", e)))?;

    let steering_goal: SteeringGoal = match goal {
        "strengthen" => SteeringGoal::Strengthen,
        "weaken" => SteeringGoal::Weaken,
        _ => return Err(JsValue::from_str("Invalid goal: must be 'strengthen' or 'weaken'")),
    };

    // Buduj graf
    let graph = Graph::new(objects, correlations);

    // Znajdź ścieżki wpływu (BFS)
    let paths = graph.find_influence_paths(target_id, &steering_goal);

    // Oblicz wpływy węzłów
    let mut influential_nodes = graph.calculate_node_influences(&paths);

    // Sortuj według dźwigni sterowniczej (DESC)
    influential_nodes.sort_by(|a, b| {
        b.control_leverage
            .partial_cmp(&a.control_leverage)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    // Serialize do JSON
    let result_json = serde_json::to_string(&influential_nodes)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))?;

    Ok(result_json)
}

/// @cybernetic WASM Entry Point - Obliczanie mocy P = v × a × c
///
/// Funkcja dla integracji Gemini -> Rust -> Supabase
/// METACYBERNETYKA 2015: Moc systemowa jako ILOCZYN, nie suma!
#[wasm_bindgen]
pub fn wasm_calculate_power(power_v: f64, quality_a: f64, mass_c: f64) -> f64 {
    calculate_total_power(power_v, quality_a, mass_c)
}

// ============================================================================
// TESTY JEDNOSTKOWE
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_feedback_multiplier() {
        let types = vec![RelationType::PositiveFeedback, RelationType::PositiveFeedback];
        let result = calculate_feedback_multiplier(&types);
        assert_eq!(result, 2.25); // 1.5 * 1.5
    }

    #[test]
    fn test_control_leverage() {
        let leverage = calculate_control_leverage(10.0, 0.5, 0.8);
        assert_eq!(leverage, 4.0); // 10 * 0.5 * 0.8
    }

    #[test]
    fn test_graph_building() {
        let objects = vec![
            CyberneticObject {
                id: "obj1".to_string(),
                name: "Object 1".to_string(),
                description: None,
                system_class: SystemClass::AutonomousSystem,
                control_system_type: ControlSystemType::Cognitive,
                energy_params: EnergyParams {
                    working_power: 5.0,
                    idle_power: 2.0,
                    available_power: 3.0,
                },
                power_v: 100.0,
                quality_a: 0.8,
                mass_c: 10.0,
                created_at: "2025-01-01T00:00:00Z".to_string(),
            },
        ];

        let correlations = vec![];

        let graph = Graph::new(objects, correlations);
        assert_eq!(graph.objects.len(), 1);
    }

    #[test]
    fn test_calculate_total_power() {
        // P = v × a × c = 100 × 0.8 × 10 = 800
        let power = calculate_total_power(100.0, 0.8, 10.0);
        assert_eq!(power, 800.0);
    }

    #[test]
    fn test_axiological_integrity_full_agreement() {
        // Oba sygnały pełna aprobata (1.0)
        let integrity = calculate_axiological_integrity(1.0, 1.0);
        assert_eq!(integrity, 1.0); // Pełna spójność
    }

    #[test]
    fn test_axiological_integrity_contradiction() {
        // Jeden aprobata (1.0), drugi negacja (-1.0)
        let integrity = calculate_axiological_integrity(1.0, -1.0);
        assert_eq!(integrity, 0.0); // Antynomia
    }

    #[test]
    fn test_axiological_integrity_neutral() {
        // Jeden aprobata (1.0), drugi neutralny (0.0)
        let integrity = calculate_axiological_integrity(1.0, 0.0);
        assert_eq!(integrity, 0.5); // Neutralność
    }

    #[test]
    fn test_distortion_neutral() {
        // Informacja rzetelna
        let z = calculate_distortion(100.0, 100.0);
        assert_eq!(z, 1.0);
    }

    #[test]
    fn test_distortion_propaganda() {
        // Przesada 2x
        let z = calculate_distortion(200.0, 100.0);
        assert_eq!(z, 2.0);
    }

    #[test]
    fn test_distortion_suppression() {
        // Tuszowanie (połowa prawdy)
        let z = calculate_distortion(50.0, 100.0);
        assert_eq!(z, 0.5);
    }

    #[test]
    fn test_analyze_distortion() {
        // Propaganda
        let analysis = analyze_distortion(150.0, 100.0);
        assert_eq!(analysis.distortion_coefficient, 1.5);
        assert!(analysis.is_distorted);
        assert_eq!(analysis.distortion_type, "propaganda");

        // Neutralne
        let analysis2 = analyze_distortion(100.0, 100.0);
        assert_eq!(analysis2.distortion_coefficient, 1.0);
        assert!(!analysis2.is_distorted);
        assert_eq!(analysis2.distortion_type, "neutral");
    }
}
