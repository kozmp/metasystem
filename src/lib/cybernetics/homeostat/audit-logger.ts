/**
 * @fileoverview Audit Logger - System logowania zdarzeń bezpieczeństwa
 * @cybernetic Retencja zdarzeń bezpieczeństwa dla analizy homeostatu
 * 
 * Zgodnie z Metacybernetyką 2015:
 * System musi posiadać pamięć operacyjną (retencję) swoich decyzji.
 * Audit log umożliwia:
 * 1. Analizę wzorców zagrożeń
 * 2. Weryfikację skuteczności homeostatu
 * 3. Transparentność decyzji AI
 */

import { supabase, validateSupabaseConfig } from '@/lib/supabase/client';
import type { SecurityDecision, OperationType, SecuritySeverity } from './security-layer';
import type { FileOperation } from './file-access-control';

// ============================================================================
// TYPY I INTERFEJSY
// ============================================================================

/**
 * Zdarzenie bezpieczeństwa do zalogowania
 */
export interface SecurityEvent {
  operation_type: OperationType | FileOperation | string;
  payload: string | object;
  decision: 'allow' | 'block' | 'ask_user';
  severity: SecuritySeverity;
  reason?: string;
  target?: string; // Ścieżka pliku lub nazwa tabeli
  user_confirmed?: boolean; // TRUE = zaakceptowano, FALSE = odrzucono, NULL = nie wymagało
  pattern_matched?: string; // Który pattern wykrył zagrożenie
  metadata?: Record<string, unknown>;
}

/**
 * Wynik operacji logowania
 */
export interface LogResult {
  success: boolean;
  error?: string;
  alert_id?: string;
}

// ============================================================================
// GŁÓWNA FUNKCJA LOGOWANIA
// ============================================================================

/**
 * @cybernetic Logowanie zdarzenia bezpieczeństwa do tabeli homeostat_alerts
 * 
 * Każde zdarzenie jest zapisywane z pełnym kontekstem dla późniejszej analizy.
 * 
 * @param event Zdarzenie do zalogowania
 * @returns Wynik operacji logowania
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<LogResult> {
  try {
    // Walidacja konfiguracji Supabase
    validateSupabaseConfig();
    
    // Mapowanie decyzji na alert_type
    const alert_type = mapDecisionToAlertType(event.decision, event.severity);
    
    // Przygotowanie payload (maksymalnie 500 znaków dla bazy)
    const payloadString = typeof event.payload === 'string' 
      ? event.payload 
      : JSON.stringify(event.payload);
    
    const truncatedPayload = payloadString.substring(0, 500);
    
    // Przygotowanie metadanych
    const metadata = {
      operation_type: event.operation_type,
      payload: truncatedPayload,
      target: event.target,
      pattern_matched: event.pattern_matched,
      timestamp: new Date().toISOString(),
      ...(event.metadata || {}),
    };
    
    // Wstawienie do tabeli system_alerts
    const { data, error } = await supabase
      .from('system_alerts')
      .insert({
        alert_type,
        severity: mapSeverityToFloat(event.severity),
        title: `Security Event: ${event.operation_type}`,
        description: event.reason || formatEventMessage(event),
        conflicting_relation_ids: [], // Pusta tablica dla security events
        affected_object_ids: [],
        source_name: 'Homeostat Security Layer',
        // Nowe kolumny security
        operation_type: event.operation_type,
        blocked_by_security: event.decision === 'block',
        user_confirmed: event.user_confirmed !== undefined ? event.user_confirmed : null,
        target: event.target,
        pattern_matched: event.pattern_matched,
        metadata,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('[AUDIT LOGGER] Błąd zapisu zdarzenia bezpieczeństwa:', error);
      return {
        success: false,
        error: error.message,
      };
    }
    
    console.log(`[AUDIT LOGGER] ✓ Zalogowano zdarzenie [${event.decision.toUpperCase()}]: ${event.reason || event.operation_type}`);
    
    return {
      success: true,
      alert_id: data?.id,
    };
    
  } catch (error) {
    console.error('[AUDIT LOGGER] Krytyczny błąd logowania:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * @cybernetic Logowanie decyzji bezpieczeństwa z pełnego SecurityDecision
 * 
 * Ułatwia integrację z validateOperation()
 */
export async function logSecurityDecision(
  decision: SecurityDecision,
  operation: {
    type: OperationType | FileOperation | string;
    payload: string | object;
    target?: string;
  },
  userConfirmed?: boolean
): Promise<LogResult> {
  
  if (decision.action === 'allow') {
    // Opcjonalnie: możemy nie logować wszystkich "allow" aby nie zaśmiecać bazy
    // Ale dla pełnego audytu, logujemy wszystko
    return logSecurityEvent({
      operation_type: operation.type,
      payload: operation.payload,
      decision: 'allow',
      severity: 'LOW',
      reason: 'Operacja dozwolona - brak wykrytych zagrożeń',
      target: operation.target,
    });
  }
  
  if (decision.action === 'block') {
    return logSecurityEvent({
      operation_type: operation.type,
      payload: operation.payload,
      decision: 'block',
      severity: decision.severity,
      reason: decision.reason,
      target: operation.target,
      pattern_matched: decision.pattern,
    });
  }
  
  if (decision.action === 'ask_user') {
    return logSecurityEvent({
      operation_type: operation.type,
      payload: operation.payload,
      decision: 'ask_user',
      severity: decision.severity,
      reason: decision.message,
      target: operation.target,
      user_confirmed: userConfirmed,
      metadata: decision.context as Record<string, unknown>,
    });
  }
  
  return { success: false, error: 'Unknown decision action' };
}

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * Mapowanie severity na float (0-1)
 */
function mapSeverityToFloat(severity: SecuritySeverity): number {
  const severityMap = {
    LOW: 0.2,
    MEDIUM: 0.5,
    HIGH: 0.7,
    CRITICAL: 1.0,
  };
  return severityMap[severity];
}

/**
 * Mapowanie decyzji i severity na alert_type
 */
function mapDecisionToAlertType(decision: 'allow' | 'block' | 'ask_user', severity: SecuritySeverity): string {
  if (decision === 'block') {
    return severity === 'CRITICAL' ? 'CRITICAL_SECURITY_VIOLATION' : 'SECURITY_VIOLATION';
  }
  
  if (decision === 'ask_user') {
    return 'SECURITY_CONFIRMATION_REQUIRED';
  }
  
  return 'SECURITY_CHECK_PASSED';
}

/**
 * Formatowanie zdarzenia do czytelnej wiadomości
 */
function formatEventMessage(event: SecurityEvent): string {
  const action = {
    allow: 'dozwolono',
    block: 'zablokowano',
    ask_user: 'wymaga potwierdzenia',
  }[event.decision];
  
  return `Operacja ${event.operation_type}: ${action}${event.target ? ` (target: ${event.target})` : ''}`;
}

// ============================================================================
// FUNKCJE RAPORTOWANIA
// ============================================================================

/**
 * @cybernetic Pobranie ostatnich zdarzeń bezpieczeństwa
 * 
 * Umożliwia analizę aktywności systemu security
 */
export async function getRecentSecurityEvents(limit: number = 50): Promise<{
  success: boolean;
  events?: Array<{
    id: string;
    created_at: string;
    alert_type: string;
    severity: SecuritySeverity;
    message: string;
    operation_type: string;
    blocked_by_security: boolean;
    user_confirmed: boolean | null;
    metadata: Record<string, unknown>;
  }>;
  error?: string;
}> {
  try {
    validateSupabaseConfig();
    
    const { data, error } = await supabase
      .from('system_alerts')
      .select('*')
      .not('operation_type', 'is', null) // Tylko zdarzenia security (mają operation_type)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[AUDIT LOGGER] Błąd pobierania zdarzeń:', error);
      return { success: false, error: error.message };
    }
    
    return {
      success: true,
      events: data as any[],
    };
    
  } catch (error) {
    console.error('[AUDIT LOGGER] Krytyczny błąd pobierania:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Statystyki bezpieczeństwa (liczba bloków, potwierdzeń, etc.)
 */
export async function getSecurityStats(days: number = 7): Promise<{
  success: boolean;
  stats?: {
    total_events: number;
    blocked_count: number;
    confirmed_count: number;
    rejected_count: number;
    critical_count: number;
  };
  error?: string;
}> {
  try {
    validateSupabaseConfig();
    
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    
    const { data, error } = await supabase
      .from('system_alerts')
      .select('blocked_by_security, user_confirmed, severity')
      .not('operation_type', 'is', null)
      .gte('created_at', dateFrom.toISOString());
    
    if (error) {
      console.error('[AUDIT LOGGER] Błąd pobierania statystyk:', error);
      return { success: false, error: error.message };
    }
    
    const stats = {
      total_events: data.length,
      blocked_count: data.filter(e => e.blocked_by_security).length,
      confirmed_count: data.filter(e => e.user_confirmed === true).length,
      rejected_count: data.filter(e => e.user_confirmed === false).length,
      critical_count: data.filter(e => e.severity === 'CRITICAL').length,
    };
    
    return { success: true, stats };
    
  } catch (error) {
    console.error('[AUDIT LOGGER] Krytyczny błąd statystyk:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  logSecurityEvent,
  logSecurityDecision,
  getRecentSecurityEvents,
  getSecurityStats,
};

