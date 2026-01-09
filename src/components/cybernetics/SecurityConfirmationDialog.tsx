/**
 * @fileoverview Security Confirmation Dialog - UI dla potwierdzania ryzykownych operacji
 * @cybernetic Efektor - warstwa interakcji z użytkownikiem
 * 
 * Zgodnie z Metacybernetyką 2015:
 * Zwiększa "moc swobodną" człowieka w systemie - ostateczna decyzja należy do użytkownika.
 * 
 * Inspiracja: Ask Patterns z Claude Code Damage Control
 * Adaptacja: React 19 + Tailwind CSS 4
 */

import { useState } from 'react';
import type { SecuritySeverity } from '@/lib/cybernetics/homeostat/security-layer';

// ============================================================================
// TYPY I INTERFEJSY
// ============================================================================

export interface SecurityConfirmationProps {
  /** Wiadomość do wyświetlenia użytkownikowi */
  message: string;
  
  /** Poziom zagrożenia */
  severity: SecuritySeverity;
  
  /** Kontekst operacji (szczegóły techniczne) */
  context: unknown;
  
  /** Callback gdy użytkownik potwierdzi */
  onConfirm: () => void;
  
  /** Callback gdy użytkownik odrzuci */
  onReject: () => void;
  
  /** Czy dialog jest widoczny */
  isOpen?: boolean;
}

// ============================================================================
// KOMPONENT GŁÓWNY
// ============================================================================

/**
 * @cybernetic Dialog potwierdzenia operacji bezpieczeństwa
 * 
 * Zgodnie z zasadą Kosseckiego:
 * System autonomiczny może proponować akcje, ale człowiek ma ostateczną decyzję.
 * 
 * To jest implementacja zwiększenia "mocy swobodnej" (P_user) w systemie.
 */
export function SecurityConfirmationDialog({
  message,
  severity,
  context,
  onConfirm,
  onReject,
  isOpen = true,
}: SecurityConfirmationProps) {
  
  const [showDetails, setShowDetails] = useState(false);
  
  // Jeśli dialog nie jest otwarty, nie renderuj nic
  if (!isOpen) {
    return null;
  }
  
  // Mapowanie severity na kolory i ikony
  const severityConfig = {
    LOW: {
      color: 'border-blue-500 bg-blue-50',
      icon: 'ℹ️',
      label: 'Informacja',
      textColor: 'text-blue-900',
    },
    MEDIUM: {
      color: 'border-yellow-500 bg-yellow-50',
      icon: '⚠️',
      label: 'Ostrzeżenie',
      textColor: 'text-yellow-900',
    },
    HIGH: {
      color: 'border-orange-500 bg-orange-50',
      icon: '⚠️',
      label: 'Wysokie Ryzyko',
      textColor: 'text-orange-900',
    },
    CRITICAL: {
      color: 'border-red-500 bg-red-50',
      icon: '🚨',
      label: 'Krytyczne',
      textColor: 'text-red-900',
    },
  };
  
  const config = severityConfig[severity];
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div 
        className={`max-w-2xl w-full border-2 rounded-lg shadow-2xl ${config.color} p-6`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="security-dialog-title"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl" role="img" aria-label={config.label}>
            {config.icon}
          </span>
          <div className="flex-1">
            <h3 
              id="security-dialog-title"
              className={`font-bold text-lg ${config.textColor}`}
            >
              🛡️ Wykryto Potencjalnie Niebezpieczną Operację
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Poziom zagrożenia: <span className="font-semibold">{config.label}</span>
            </p>
          </div>
        </div>
        
        {/* Message */}
        <div className={`mb-4 p-4 bg-white rounded border ${config.textColor}`}>
          <p className="text-base leading-relaxed">{message}</p>
        </div>
        
        {/* Details (collapsible) */}
        <div className="mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-700 hover:text-gray-900 underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded"
            aria-expanded={showDetails}
          >
            {showDetails ? '▼' : '▶'} Szczegóły techniczne
          </button>
          
          {showDetails && (
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64 border border-gray-300">
              {JSON.stringify(context, null, 2)}
            </pre>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-semibold transition-colors"
            aria-label="Potwierdź operację"
          >
            ✓ Akceptuję (Zwiększam P_user)
          </button>
          
          <button
            onClick={onReject}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-semibold transition-colors"
            aria-label="Odrzuć operację"
          >
            ✗ Odrzucam (Homeostat blokuje)
          </button>
        </div>
        
        {/* Footer - Cybernetyczna nota */}
        <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
          <p className="flex items-start gap-2">
            <span className="text-base">💡</span>
            <span>
              <strong>Zgodnie z zasadą Kosseckiego:</strong> Człowiek ma ostateczną decyzję w systemie poznawczym. 
              AI może wykryć potencjalne zagrożenie, ale Ty decydujesz czy operacja jest uzasadniona w kontekście.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOOK DLA ZARZĄDZANIA STANEM DIALOGU
// ============================================================================

/**
 * Custom hook do zarządzania stanem Security Dialog
 * 
 * @example
 * const { showDialog, confirmationData, requestConfirmation, handleConfirm, handleReject } = useSecurityConfirmation();
 * 
 * // W komponencie:
 * <SecurityConfirmationDialog
 *   isOpen={showDialog}
 *   message={confirmationData.message}
 *   severity={confirmationData.severity}
 *   context={confirmationData.context}
 *   onConfirm={handleConfirm}
 *   onReject={handleReject}
 * />
 */
export function useSecurityConfirmation() {
  const [showDialog, setShowDialog] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    message: string;
    severity: SecuritySeverity;
    context: unknown;
    onConfirm: () => void;
    onReject: () => void;
  } | null>(null);
  
  /**
   * Żądanie potwierdzenia od użytkownika
   */
  const requestConfirmation = (
    message: string,
    severity: SecuritySeverity,
    context: unknown,
    onConfirm: () => void,
    onReject: () => void
  ) => {
    setConfirmationData({
      message,
      severity,
      context,
      onConfirm,
      onReject,
    });
    setShowDialog(true);
  };
  
  /**
   * Użytkownik potwierdził operację
   */
  const handleConfirm = () => {
    if (confirmationData) {
      confirmationData.onConfirm();
    }
    setShowDialog(false);
    setConfirmationData(null);
  };
  
  /**
   * Użytkownik odrzucił operację
   */
  const handleReject = () => {
    if (confirmationData) {
      confirmationData.onReject();
    }
    setShowDialog(false);
    setConfirmationData(null);
  };
  
  return {
    showDialog,
    confirmationData,
    requestConfirmation,
    handleConfirm,
    handleReject,
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default SecurityConfirmationDialog;

