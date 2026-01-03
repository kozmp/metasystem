/**
 * @fileoverview Tabela obiektów cybernetycznych
 * @cybernetic Efektor - prezentacja obiektów z bazy danych
 */

import React from 'react';
import { Eye } from 'lucide-react';
import type { DashboardObject } from '../../lib/cybernetics/efektor/types';
import { 
  formatEnergy, 
  getCertaintyBadgeClass,
  getControlTypeColor 
} from '../../lib/cybernetics/efektor/types';

interface ObjectsTableProps {
  objects: DashboardObject[];
  onObjectClick?: (objectId: string) => void;
}

const SYSTEM_CLASS_LABELS: Record<string, string> = {
  autonomous_system: 'System Autonomiczny',
  heteronomous_system: 'System Heteronomiczny',
  environment: 'Otoczenie',
  tool: 'Narzędzie',
};

const CONTROL_TYPE_LABELS: Record<string, string> = {
  cognitive: 'Poznawczy',
  ideological: 'Ideologiczny',
  ethical: 'Etyczny',
  economic: 'Gospodarczy',
};

export function ObjectsTable({ objects, onObjectClick }: ObjectsTableProps) {
  if (objects.length === 0) {
    return (
      <div className="card-terminal p-8 text-center">
        <p className="text-terminal-muted">
          Brak obiektów w systemie. Użyj formularza Receptor Input, aby dodać dane.
        </p>
      </div>
    );
  }

  return (
    <div className="card-terminal overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-cyber">
          <thead>
            <tr>
              <th>Nazwa obiektu</th>
              <th>Klasa systemu</th>
              <th>Typ sterowania</th>
              <th className="text-right">Moc swobodna</th>
              <th className="text-right">Potencjał sterowniczy</th>
              <th className="text-right">Średnia rzetelność</th>
              <th className="text-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {objects.map((obj) => (
              <tr key={obj.id} className="hover:bg-terminal-surface/80 transition-colors">
                <td>
                  <div>
                    <div className="font-bold text-terminal-text">{obj.name}</div>
                    {obj.description && (
                      <div className="text-xs text-terminal-muted mt-1 truncate max-w-md">
                        {obj.description}
                      </div>
                    )}
                  </div>
                </td>
                
                <td>
                  <span className="text-xs px-2 py-1 bg-terminal-bg border border-terminal-border">
                    {SYSTEM_CLASS_LABELS[obj.system_class] || obj.system_class}
                  </span>
                </td>
                
                <td>
                  <span 
                    className={`text-xs px-2 py-1 border ${
                      obj.control_system_type === 'ideological' 
                        ? 'border-control-ideological text-control-ideological bg-control-ideological/10 animate-pulse font-bold' 
                        : 'border-terminal-border bg-terminal-bg'
                    }`}
                    style={{ 
                      borderColor: getControlTypeColor(obj.control_system_type),
                      color: getControlTypeColor(obj.control_system_type),
                    }}
                  >
                    {CONTROL_TYPE_LABELS[obj.control_system_type] || obj.control_system_type}
                  </span>
                </td>
                
                <td className="text-right font-mono">
                  <span className="text-terminal-accent">
                    {formatEnergy(obj.energy_params.available_power)}
                  </span>
                </td>
                
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-bold text-terminal-text">
                      {obj.steering_potential}
                    </span>
                    <span className="text-xs text-terminal-muted">
                      ↑{obj.steering_potential} ↓{obj.dependency_count}
                    </span>
                  </div>
                </td>
                
                <td className="text-right">
                  <span className={getCertaintyBadgeClass(obj.average_certainty)}>
                    {(obj.average_certainty * 100).toFixed(0)}%
                  </span>
                </td>
                
                <td className="text-center">
                  <button
                    onClick={() => onObjectClick?.(obj.id)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-terminal-border hover:border-terminal-accent hover:text-terminal-accent transition-colors"
                    title="Podgląd szczegółów"
                  >
                    <Eye className="w-3 h-3" />
                    Podgląd
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-terminal-border bg-terminal-bg">
        <p className="text-xs text-terminal-muted">
          Wyświetlono {objects.length} obiekt(ów) cybernetycznych
        </p>
      </div>
    </div>
  );
}

