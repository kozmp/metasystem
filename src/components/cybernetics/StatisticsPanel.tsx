/**
 * @fileoverview Panel statystyk systemu
 * @cybernetic Efektor - metryki rzetelności i stanu systemu
 */

import { Activity, AlertTriangle, Database, GitBranch } from 'lucide-react';
import type { SystemStats } from '../../lib/cybernetics/efektor/types';

interface StatisticsPanelProps {
  stats: SystemStats;
}

const SYSTEM_CLASS_LABELS: Record<string, string> = {
  autonomous_system: 'Autonomiczne',
  heteronomous_system: 'Heteronomiczne',
  environment: 'Otoczenie',
  tool: 'Narzędzia',
};

const CONTROL_TYPE_LABELS: Record<string, string> = {
  cognitive: 'Poznawcze',
  ideological: 'Ideologiczne',
  ethical: 'Etyczne',
  economic: 'Gospodarcze',
};

export function StatisticsPanel({ stats }: StatisticsPanelProps) {
  const certaintyPercentage = (stats.average_certainty * 100).toFixed(1);
  const certaintyColor = 
    stats.average_certainty >= 0.7 
      ? 'text-feedback-positive' 
      : stats.average_certainty >= 0.4 
      ? 'text-feedback-neutral' 
      : 'text-feedback-negative';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Obiekty w systemie */}
      <div className="card-terminal p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-terminal-accent/10 border border-terminal-accent/30">
            <Database className="w-5 h-5 text-terminal-accent" />
          </div>
          <span className="text-2xl font-bold text-terminal-text">
            {stats.total_objects}
          </span>
        </div>
        <h3 className="text-xs uppercase tracking-wider text-terminal-muted mb-2">
          Obiekty cybernetyczne
        </h3>
        <div className="space-y-1 text-xs">
          {Object.entries(stats.system_class_distribution).map(([key, value]) => (
            value > 0 && (
              <div key={key} className="flex justify-between text-terminal-muted">
                <span>{SYSTEM_CLASS_LABELS[key] || key}:</span>
                <span className="text-terminal-text font-bold">{value}</span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Relacje sterownicze */}
      <div className="card-terminal p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-feedback-positive/10 border border-feedback-positive/30">
            <GitBranch className="w-5 h-5 text-feedback-positive" />
          </div>
          <span className="text-2xl font-bold text-terminal-text">
            {stats.total_relations}
          </span>
        </div>
        <h3 className="text-xs uppercase tracking-wider text-terminal-muted mb-2">
          Relacje sterownicze
        </h3>
        <div className="text-xs text-terminal-muted">
          Sprzężenia zwrotne i przepływy energii między obiektami
        </div>
      </div>

      {/* Rzetelność systemu */}
      <div className="card-terminal p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-terminal-accent/10 border border-terminal-accent/30">
            <Activity className="w-5 h-5 text-terminal-accent" />
          </div>
          <span className={`text-2xl font-bold ${certaintyColor}`}>
            {certaintyPercentage}%
          </span>
        </div>
        <h3 className="text-xs uppercase tracking-wider text-terminal-muted mb-2">
          Średnia rzetelność
        </h3>
        <div className="text-xs text-terminal-muted">
          Certainty Score - wskaźnik pewności danych w systemie
        </div>
      </div>

      {/* Ostrzeżenia */}
      <div className="card-terminal p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 border ${
            stats.high_noise_relations > 0 || stats.ideological_sources > 0
              ? 'bg-feedback-negative/10 border-feedback-negative/30'
              : 'bg-terminal-border/10 border-terminal-border'
          }`}>
            <AlertTriangle className={`w-5 h-5 ${
              stats.high_noise_relations > 0 || stats.ideological_sources > 0
                ? 'text-feedback-negative'
                : 'text-terminal-muted'
            }`} />
          </div>
          <span className={`text-2xl font-bold ${
            stats.high_noise_relations > 0 || stats.ideological_sources > 0
              ? 'text-feedback-negative'
              : 'text-terminal-muted'
          }`}>
            {stats.high_noise_relations + stats.ideological_sources}
          </span>
        </div>
        <h3 className="text-xs uppercase tracking-wider text-terminal-muted mb-2">
          Ostrzeżenia systemowe
        </h3>
        <div className="space-y-1 text-xs">
          {stats.high_noise_relations > 0 && (
            <div className="text-feedback-negative">
              ⚠ {stats.high_noise_relations} relacji wysokiego szumu
            </div>
          )}
          {stats.ideological_sources > 0 && (
            <div className="text-feedback-negative">
              ⚠ {stats.ideological_sources} źródeł ideologicznych
            </div>
          )}
          {stats.high_noise_relations === 0 && stats.ideological_sources === 0 && (
            <div className="text-terminal-muted">
              Brak ostrzeżeń
            </div>
          )}
        </div>
      </div>

      {/* Rozkład typów sterowania */}
      <div className="card-terminal p-4 md:col-span-2 lg:col-span-4">
        <h3 className="text-xs uppercase tracking-wider text-terminal-muted mb-3">
          Rozkład systemów sterowania:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(stats.control_type_distribution).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 border"
                style={{ 
                  backgroundColor: 
                    key === 'cognitive' ? '#3b82f6' :
                    key === 'ideological' ? '#ef4444' :
                    key === 'ethical' ? '#8b5cf6' :
                    '#f59e0b',
                }}
              />
              <span className="text-xs text-terminal-muted">
                {CONTROL_TYPE_LABELS[key] || key}:
              </span>
              <span className="text-sm font-bold text-terminal-text">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

