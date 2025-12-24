/**
 * @fileoverview Wizualizacja grafu relacji cybernetycznych
 * @cybernetic Efektor - prezentacja struktury sterowniczej systemu
 * 
 * Zgodnie z teorią Kosseckiego:
 * - Węzły = obiekty elementarne (systemy autonomiczne, heteronomiczne, otoczenie)
 * - Krawędzie = relacje sterownicze (sprzężenia zwrotne, przepływy energii)
 * - Kolor krawędzi = typ sprzężenia (dodatnie/zielone, ujemne/czerwone)
 * - Grubość krawędzi = siła wpływu (impact_factor)
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import ForceGraph2D, { type ForceGraphMethods, type NodeObject, type LinkObject } from 'react-force-graph-2d';
import { supabase } from '../../lib/supabase/client';
import type { CyberneticObject, Correlation } from '../../lib/supabase/types';
import type { GraphData, GraphNode, GraphLink, GraphConfig } from '../../lib/cybernetics/efektor/types';
import { getControlTypeColor, getRelationTypeColor } from '../../lib/cybernetics/efektor/types';
import { Loader2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface RelationGraphProps {
  width?: number;
  height?: number;
  className?: string;
}

export function RelationGraph({ 
  width = 1200, 
  height = 600,
  className = '' 
}: RelationGraphProps) {
  const graphRef = useRef<ForceGraphMethods>();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Konfiguracja grafu zgodna z estetyką terminala
  const graphConfig: GraphConfig = useMemo(() => ({
    width,
    height,
    backgroundColor: '#0a0e14',
    nodeRelSize: 6,
    linkWidth: 2,
    linkDirectionalArrowLength: 6,
    linkDirectionalArrowRelPos: 0.8,
    linkCurvature: 0.2,
    dagMode: null, // Graf kierunkowy, ale bez wymuszania DAG
  }), [width, height]);

  // Pobieranie danych z Supabase
  useEffect(() => {
    async function fetchGraphData() {
      try {
        setLoading(true);
        setError(null);

        // Pobierz wszystkie obiekty
        const { data: objects, error: objectsError } = await supabase
          .from('cybernetic_objects')
          .select('*')
          .order('created_at', { ascending: false });

        if (objectsError) throw new Error(`Błąd pobierania obiektów: ${objectsError.message}`);
        if (!objects || objects.length === 0) {
          setGraphData({ nodes: [], links: [] });
          setLoading(false);
          return;
        }

        // Pobierz wszystkie relacje
        const { data: correlations, error: correlationsError } = await supabase
          .from('correlations')
          .select('*')
          .order('created_at', { ascending: false });

        if (correlationsError) throw new Error(`Błąd pobierania relacji: ${correlationsError.message}`);

        // Oblicz metryki dla każdego obiektu
        const nodeMetrics = new Map<string, { outgoing: number; incoming: number; totalCertainty: number; count: number }>();
        
        objects.forEach(obj => {
          nodeMetrics.set(obj.id, { outgoing: 0, incoming: 0, totalCertainty: 0, count: 0 });
        });

        correlations?.forEach(rel => {
          const sourceMetrics = nodeMetrics.get(rel.source_id);
          const targetMetrics = nodeMetrics.get(rel.target_id);
          
          if (sourceMetrics) {
            sourceMetrics.outgoing += 1;
            sourceMetrics.totalCertainty += rel.certainty_score;
            sourceMetrics.count += 1;
          }
          
          if (targetMetrics) {
            targetMetrics.incoming += 1;
            targetMetrics.totalCertainty += rel.certainty_score;
            targetMetrics.count += 1;
          }
        });

        // Konwertuj obiekty na węzły grafu
        const nodes: GraphNode[] = objects.map(obj => {
          const metrics = nodeMetrics.get(obj.id) || { outgoing: 0, incoming: 0, totalCertainty: 0, count: 0 };
          const avgCertainty = metrics.count > 0 ? metrics.totalCertainty / metrics.count : 0;
          
          return {
            id: obj.id,
            name: obj.name,
            val: Math.max(5, metrics.outgoing * 3), // Rozmiar proporcjonalny do potencjału sterowniczego
            color: getControlTypeColor(obj.control_system_type),
            system_class: obj.system_class,
            control_system_type: obj.control_system_type,
            energy_params: obj.energy_params,
            outgoing_relations: metrics.outgoing,
            incoming_relations: metrics.incoming,
            average_certainty: avgCertainty,
          };
        });

        // Konwertuj relacje na krawędzie grafu
        const links: GraphLink[] = (correlations || []).map(rel => ({
          source: rel.source_id,
          target: rel.target_id,
          value: rel.impact_factor * 2, // Grubość proporcjonalna do wpływu
          color: getRelationTypeColor(rel.relation_type),
          curvature: 0.2,
          relation_type: rel.relation_type,
          certainty_score: rel.certainty_score,
          is_high_noise: rel.certainty_score < 0.3,
          label: rel.relation_type,
        }));

        setGraphData({ nodes, links });
        setLoading(false);
      } catch (err) {
        console.error('[EFEKTOR] Błąd ładowania grafu:', err);
        setError(err instanceof Error ? err.message : 'Nieznany błąd');
        setLoading(false);
      }
    }

    fetchGraphData();
  }, []);

  // Obsługa kliknięcia węzła
  const handleNodeClick = (node: NodeObject) => {
    const graphNode = node as unknown as GraphNode;
    setSelectedNode(graphNode);
    
    // Wycentruj widok na węźle
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2, 1000);
    }
  };

  // Obsługa kliknięcia tła (odznaczenie węzła)
  const handleBackgroundClick = () => {
    setSelectedNode(null);
  };

  // Renderowanie etykiety węzła
  const nodeCanvasObject = (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const graphNode = node as unknown as GraphNode;
    const label = graphNode.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px JetBrains Mono, monospace`;
    
    // Tekst
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

    // Tło tekstu (dla lepszej czytelności)
    ctx.fillStyle = 'rgba(10, 14, 20, 0.8)';
    ctx.fillRect(
      node.x! - bckgDimensions[0] / 2,
      node.y! + (graphNode.val / globalScale) + 2,
      bckgDimensions[0],
      bckgDimensions[1]
    );

    // Etykieta
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = graphNode.color;
    ctx.fillText(
      label,
      node.x!,
      node.y! + (graphNode.val / globalScale) + 2 + bckgDimensions[1] / 2
    );

    // Ostrzeżenie dla źródeł ideologicznych
    if (graphNode.control_system_type === 'ideological') {
      ctx.fillStyle = '#ef4444';
      ctx.font = `bold ${fontSize * 1.2}px JetBrains Mono, monospace`;
      ctx.fillText('⚠', node.x!, node.y! - (graphNode.val / globalScale) - 8);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.5, 300);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom / 1.5, 300);
    }
  };

  const handleFitView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  };

  if (loading) {
    return (
      <div className="card-terminal p-8 flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-terminal-accent animate-spin mx-auto mb-4" />
          <p className="text-terminal-muted">Ładowanie grafu relacji...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-terminal p-8" style={{ height }}>
        <div className="text-center text-feedback-negative">
          <p className="font-bold mb-2">Błąd ładowania grafu:</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!graphData || (graphData.nodes.length === 0 && graphData.links.length === 0)) {
    return (
      <div className="card-terminal p-8 flex items-center justify-center" style={{ height }}>
        <div className="text-center text-terminal-muted">
          <p className="mb-2">Brak danych do wizualizacji</p>
          <p className="text-sm">Użyj formularza Receptor Input, aby dodać obiekty i relacje.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-terminal relative ${className}`}>
      {/* Nagłówek */}
      <div className="p-4 border-b border-terminal-border">
        <h2 className="text-xl font-bold text-terminal-accent uppercase tracking-wider">
          [KORELATOR] Graf Relacji Sterowniczych
        </h2>
        <p className="text-sm text-terminal-muted mt-1">
          {graphData.nodes.length} obiektów • {graphData.links.length} relacji
        </p>
      </div>

      {/* Kontrolki zoom */}
      <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="btn-terminal p-2"
          title="Przybliż"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="btn-terminal p-2"
          title="Oddal"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitView}
          className="btn-terminal p-2"
          title="Dopasuj widok"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Graf */}
      <div className="relative">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          width={graphConfig.width}
          height={graphConfig.height}
          backgroundColor={graphConfig.backgroundColor}
          nodeRelSize={graphConfig.nodeRelSize}
          nodeVal="val"
          nodeColor="color"
          nodeLabel={(node) => {
            const n = node as unknown as GraphNode;
            return `${n.name}\n[${n.system_class}]\nPotencjał: ${n.outgoing_relations}`;
          }}
          linkWidth="value"
          linkColor="color"
          linkDirectionalArrowLength={graphConfig.linkDirectionalArrowLength}
          linkDirectionalArrowRelPos={graphConfig.linkDirectionalArrowRelPos}
          linkCurvature="curvature"
          linkLabel={(link) => {
            const l = link as unknown as GraphLink;
            return `${l.relation_type}\nWpływ: ${l.value.toFixed(2)}\nRzetelność: ${(l.certainty_score * 100).toFixed(0)}%`;
          }}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
          nodeCanvasObject={nodeCanvasObject}
          cooldownTicks={100}
          warmupTicks={100}
        />
      </div>

      {/* Panel szczegółów wybranego węzła */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 card-terminal p-4 border-2 border-terminal-accent max-w-md">
          <h3 className="font-bold text-terminal-accent mb-2">
            {selectedNode.name}
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-terminal-muted">Klasa systemu:</span>
              <span className="text-terminal-text">{selectedNode.system_class}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">Typ sterowania:</span>
              <span style={{ color: selectedNode.color }}>
                {selectedNode.control_system_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">Potencjał sterowniczy:</span>
              <span className="text-terminal-text font-bold">
                {selectedNode.outgoing_relations}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">Zależności:</span>
              <span className="text-terminal-text font-bold">
                {selectedNode.incoming_relations}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">Średnia rzetelność:</span>
              <span className={`font-bold ${
                selectedNode.average_certainty >= 0.7 
                  ? 'text-feedback-positive' 
                  : selectedNode.average_certainty >= 0.4 
                  ? 'text-feedback-neutral' 
                  : 'text-feedback-negative'
              }`}>
                {(selectedNode.average_certainty * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="p-4 border-t border-terminal-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="text-terminal-accent font-bold mb-2 uppercase tracking-wider">Typy sterowania:</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-control-cognitive" />
                <span className="text-terminal-muted">Poznawczy (nauka, fakty)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-control-ideological animate-pulse" />
                <span className="text-control-ideological">Ideologiczny (UWAGA)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-control-ethical" />
                <span className="text-terminal-muted">Etyczny (normy moralne)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-control-economic" />
                <span className="text-terminal-muted">Gospodarczy (biznes)</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-terminal-accent font-bold mb-2 uppercase tracking-wider">Typy relacji:</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-feedback-positive" />
                <span className="text-terminal-muted">Sprzężenie dodatnie (wzrost)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-feedback-negative" />
                <span className="text-terminal-muted">Sprzężenie ujemne (hamowanie)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-terminal-accent" />
                <span className="text-terminal-muted">Zasilanie (energia/zasoby)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-feedback-neutral" />
                <span className="text-terminal-muted">Sterowanie bezpośrednie</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

