/**
 * @fileoverview Decision Simulator - Symulator Sterowania
 * @cybernetic Panel rekomendacji sterowniczych zgodnie z teorią Kosseckiego
 */

import { useState } from 'react';
import type { SteeringGoal, SteeringSimulationResult, InfluentialNode } from '../../lib/cybernetics/decisions/types';

// ============================================================================
// TYPY
// ============================================================================

export interface DecisionSimulatorProps {
  objectId?: string;
  objectName?: string;
}

// ============================================================================
// KOMPONENT GŁÓWNY
// ============================================================================

export function DecisionSimulator({ objectId, objectName }: DecisionSimulatorProps) {
  const [selectedObjectId, setSelectedObjectId] = useState<string>(objectId || '');
  const [selectedObjectName, setSelectedObjectName] = useState<string>(objectName || '');
  const [goal, setGoal] = useState<SteeringGoal>('strengthen');
  const [simulation, setSimulation] = useState<SteeringSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIStrategy, setShowAIStrategy] = useState(false);
  const [aiStrategyLoading, setAIStrategyLoading] = useState(false);
  
  // Uruchom symulację
  async function runSimulation() {
    if (!selectedObjectId) {
      setError('Wybierz obiekt z grafu');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSimulation(null);
    
    try {
      const response = await fetch('/api/decisions/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_object_id: selectedObjectId,
          goal,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Błąd symulacji');
      }
      
      setSimulation(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  }
  
  // Generuj strategię AI
  async function generateAIStrategy() {
    if (!simulation) return;
    
    setAIStrategyLoading(true);
    
    try {
      const response = await fetch('/api/decisions/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_object_id: simulation.target_object_id,
          goal: simulation.goal,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Błąd generowania strategii');
      }
      
      setSimulation({
        ...simulation,
        ai_strategy: data.strategy,
      });
      
      setShowAIStrategy(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd AI');
    } finally {
      setAIStrategyLoading(false);
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <header className="card-terminal p-6">
        <h1 className="text-3xl font-bold text-terminal-accent uppercase tracking-wider mb-2">
          [SYMULATOR STEROWANIA]
        </h1>
        <p className="text-terminal-muted text-sm">
          Moduł Decyzyjny - Analiza wpływu i rekomendacje sterownicze
        </p>
      </header>
      
      {/* Konfiguracja symulacji */}
      <section className="card-terminal p-6">
        <h2 className="text-xl font-bold text-terminal-accent uppercase tracking-wider mb-4">
          [1] KONFIGURACJA
        </h2>
        
        <div className="space-y-4">
          {/* Obiekt docelowy */}
          <div>
            <label className="block text-sm font-bold text-terminal-text mb-2">
              Obiekt docelowy
            </label>
            {selectedObjectName ? (
              <div className="px-4 py-2 bg-terminal-bg border border-terminal-border text-terminal-accent font-mono">
                {selectedObjectName}
              </div>
            ) : (
              <div className="px-4 py-2 bg-terminal-bg border border-terminal-border text-terminal-muted font-mono">
                Kliknij obiekt na grafie relacji...
              </div>
            )}
          </div>
          
          {/* Cel sterowania */}
          <div>
            <label className="block text-sm font-bold text-terminal-text mb-2">
              Cel sterowania
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setGoal('strengthen')}
                className={`flex-1 px-4 py-2 font-bold uppercase border-2 transition-colors ${
                  goal === 'strengthen'
                    ? 'bg-control-cognitive text-white border-control-cognitive'
                    : 'bg-terminal-bg text-terminal-text border-terminal-border hover:border-control-cognitive'
                }`}
              >
                WZMOCNIĆ
              </button>
              <button
                onClick={() => setGoal('weaken')}
                className={`flex-1 px-4 py-2 font-bold uppercase border-2 transition-colors ${
                  goal === 'weaken'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-terminal-bg text-terminal-text border-terminal-border hover:border-red-500'
                }`}
              >
                OSŁABIĆ
              </button>
            </div>
          </div>
          
          {/* Przycisk symulacji */}
          <button
            onClick={runSimulation}
            disabled={!selectedObjectId || loading}
            className="w-full px-6 py-3 bg-terminal-accent text-terminal-bg font-bold uppercase tracking-wider hover:bg-terminal-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '[ANALIZUJĘ...]' : '[URUCHOM SYMULACJĘ]'}
          </button>
        </div>
      </section>
      
      {/* Błąd */}
      {error && (
        <div className="card-terminal p-4 border-2 border-red-500 bg-red-500/10">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div className="flex-1">
              <h3 className="font-bold text-red-500 mb-1 uppercase">Błąd</h3>
              <p className="text-sm text-terminal-text">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Wyniki symulacji */}
      {simulation && (
        <>
          {/* Rekomendacja główna */}
          <section className="card-terminal p-6 border-2 border-control-cognitive">
            <h2 className="text-xl font-bold text-control-cognitive uppercase tracking-wider mb-4">
              [2] REKOMENDACJA GŁÓWNA
            </h2>
            
            <div className="space-y-4">
              <div className="bg-control-cognitive/10 p-4 border border-control-cognitive">
                <h3 className="font-bold text-lg mb-2">{simulation.primary_recommendation.action}</h3>
                <p className="text-sm text-terminal-text mb-3">
                  {simulation.primary_recommendation.rationale}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-terminal-muted">Oczekiwany wpływ:</span>{' '}
                    <span className="font-bold text-control-cognitive">
                      {(simulation.primary_recommendation.expected_impact * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-terminal-muted">Pewność:</span>{' '}
                    <span className="font-bold text-control-cognitive">
                      {(simulation.primary_recommendation.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Przycisk AI Strategy */}
              <button
                onClick={generateAIStrategy}
                disabled={aiStrategyLoading || showAIStrategy}
                className="w-full px-4 py-2 bg-terminal-border text-terminal-text font-bold uppercase hover:bg-terminal-border/80 disabled:opacity-50"
              >
                {aiStrategyLoading ? '[GENERUJĘ STRATEGIĘ AI...]' : showAIStrategy ? '[STRATEGIA WYGENEROWANA]' : '[GENERUJ STRATEGIĘ AI]'}
              </button>
            </div>
          </section>
          
          {/* Strategia AI */}
          {showAIStrategy && simulation.ai_strategy && (
            <section className="card-terminal p-6 border-2 border-terminal-accent">
              <h2 className="text-xl font-bold text-terminal-accent uppercase tracking-wider mb-4">
                [2.1] STRATEGIA AI (KOSSECKI)
              </h2>
              <div className="prose prose-invert max-w-none">
                <div className="text-sm text-terminal-text whitespace-pre-line leading-relaxed">
                  {simulation.ai_strategy}
                </div>
              </div>
            </section>
          )}
          
          {/* Ostrzeżenia */}
          {simulation.warnings.length > 0 && (
            <section className="card-terminal p-4 border-2 border-yellow-500 bg-yellow-500/10">
              <h3 className="font-bold text-yellow-500 mb-2 uppercase flex items-center gap-2">
                <span>⚠</span> OSTRZEŻENIA
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-terminal-text">
                {simulation.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </section>
          )}
          
          {/* Alternatywne rekomendacje */}
          {simulation.alternative_recommendations.length > 0 && (
            <section className="card-terminal p-6">
              <h2 className="text-xl font-bold text-terminal-accent uppercase tracking-wider mb-4">
                [3] ALTERNATYWNE REKOMENDACJE
              </h2>
              
              <div className="space-y-3">
                {simulation.alternative_recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-terminal-bg border border-terminal-border">
                    <h4 className="font-bold mb-1">{rec.action}</h4>
                    <p className="text-xs text-terminal-muted mb-2">{rec.rationale}</p>
                    <div className="flex gap-4 text-xs">
                      <span>
                        <span className="text-terminal-muted">Wpływ:</span>{' '}
                        {(rec.expected_impact * 100).toFixed(0)}%
                      </span>
                      <span>
                        <span className="text-terminal-muted">Pewność:</span>{' '}
                        {(rec.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Top węzły wpływowe */}
          <section className="card-terminal p-6">
            <h2 className="text-xl font-bold text-terminal-accent uppercase tracking-wider mb-4">
              [4] TOP WĘZŁY WPŁYWOWE
            </h2>
            
            <div className="space-y-2">
              {simulation.influential_nodes.map((node, idx) => (
                <div key={idx} className="p-3 bg-terminal-bg border border-terminal-border text-xs">
                  <div className="font-bold mb-1">{idx + 1}. {node.object_name}</div>
                  <div className="grid grid-cols-3 gap-2 text-terminal-muted">
                    <div>Leverage: {node.control_leverage.toFixed(2)}</div>
                    <div>Wpływ: {node.influence_strength.toFixed(2)}</div>
                    <div>Ścieżki: {node.path_count}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Metadata */}
          <section className="card-terminal p-4">
            <h3 className="text-sm font-bold text-terminal-muted uppercase mb-2">
              [METADATA]
            </h3>
            <div className="grid grid-cols-3 gap-4 text-xs text-terminal-muted">
              <div>
                Ścieżek: {simulation.simulation_metadata.total_paths_analyzed}
              </div>
              <div>
                Max głębokość: {simulation.simulation_metadata.max_depth}
              </div>
              <div>
                Czas: {simulation.simulation_metadata.computation_time_ms.toFixed(0)}ms
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

