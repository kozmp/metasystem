/**
 * @fileoverview Silnik Detekcji Sprzeczności - Głęboki Homeostat
 * @cybernetic Implementacja "Weryfikacji Rzetelności Wstecznej"
 * 
 * Zgodnie z teorią Kosseckiego:
 * Homeostat to organ stabilizujący system poprzez wykrywanie i eliminację sprzeczności.
 * System musi "pamiętać" historię i wykrywać zmiany narracji u tego samego źródła.
 */

import { supabase } from '../../supabase/client';
import type { Correlation } from '../../supabase/types';
import type {
  ContradictionReport,
  Contradiction,
  ContradictionType,
  ContradictionDetectionParams,
  SystemAlert,
} from './types';
import {
  DEFAULT_DETECTION_PARAMS,
  areRelationsOpposite,
  calculateContradictionSeverity,
} from './types';

// ============================================================================
// GŁÓWNA FUNKCJA DETEKCJI
// ============================================================================

/**
 * @cybernetic Wykrywa sprzeczności w nowych relacjach
 * 
 * Algorytm:
 * 1. Dla każdej nowej relacji sprawdź czy istnieje już relacja między tymi samymi obiektami
 * 2. Jeśli tak, porównaj:
 *    - relation_type (czy przeciwne?)
 *    - impact_factor (drastyczna zmiana?)
 *    - certainty_score (spadek rzetelności?)
 * 3. Jeśli wykryto sprzeczność:
 *    - Utwórz ContradictionReport
 *    - Zapisz alert w system_alerts
 *    - Obniż reliability_index źródła (jeśli włączone)
 * 
 * @param newRelations - Nowo dodane relacje do sprawdzenia
 * @param params - Parametry detekcji (opcjonalne)
 * @returns Raport sprzeczności
 */
export async function detectContradictions(
  newRelations: Correlation[],
  params: Partial<ContradictionDetectionParams> = {}
): Promise<ContradictionReport> {
  const config = { ...DEFAULT_DETECTION_PARAMS, ...params };
  const contradictions: Contradiction[] = [];
  
  console.log('[HOMEOSTAT] Rozpoczynam detekcję sprzeczności...');
  console.log(`[HOMEOSTAT] Liczba nowych relacji do sprawdzenia: ${newRelations.length}`);
  
  for (const newRel of newRelations) {
    // Pobierz istniejące relacje między tymi samymi obiektami
    const existingRelations = await findExistingRelations(
      newRel.source_id,
      newRel.target_id,
      config.lookback_days
    );
    
    if (existingRelations.length === 0) {
      console.log(`[HOMEOSTAT] Brak historii dla relacji ${newRel.source_id} → ${newRel.target_id}`);
      continue;
    }
    
    console.log(`[HOMEOSTAT] Znaleziono ${existingRelations.length} historycznych relacji`);
    
    // Sprawdź każdą istniejącą relację pod kątem sprzeczności
    for (const existingRel of existingRelations) {
      const contradiction = analyzeContradiction(newRel, existingRel, config);
      
      if (contradiction) {
        contradictions.push(contradiction);
        console.log(`[HOMEOSTAT] ⚠ Wykryto sprzeczność! Typ: ${contradiction.type}, Severity: ${contradiction.severity.toFixed(2)}`);
      }
    }
  }
  
  // Utwórz podsumowanie
  const summary = createSummary(contradictions, config);
  
  console.log(`[HOMEOSTAT] Wykryto ${contradictions.length} sprzeczności`);
  console.log(`[HOMEOSTAT] Max severity: ${summary.max_severity.toFixed(2)}`);
  console.log(`[HOMEOSTAT] Zalecana akcja: ${summary.recommended_action}`);
  
  // Jeśli wykryto sprzeczności, zapisz alerty i zaktualizuj reliability_index
  if (contradictions.length > 0) {
    await processContradictions(contradictions, config);
  }
  
  return {
    detected: contradictions.length > 0,
    contradictions,
    summary,
  };
}

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * @cybernetic Znajdź istniejące relacje między tymi samymi obiektami
 */
async function findExistingRelations(
  sourceId: string,
  targetId: string,
  lookbackDays: number
): Promise<Correlation[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);
  
  const { data, error } = await supabase
    .from('correlations')
    .select('*')
    .eq('source_id', sourceId)
    .eq('target_id', targetId)
    .gte('created_at', cutoffDate.toISOString())
    .is('superseded_at', null) // Tylko aktywne (niewycofane)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('[HOMEOSTAT] Błąd pobierania historycznych relacji:', error);
    return [];
  }
  
  return data || [];
}

/**
 * @cybernetic Analizuje czy nowa relacja jest sprzeczna z istniejącą
 */
function analyzeContradiction(
  newRel: Correlation,
  existingRel: Correlation,
  config: ContradictionDetectionParams
): Contradiction | null {
  // Pomijamy porównanie z samym sobą
  if (newRel.id === existingRel.id) {
    return null;
  }
  
  let contradictionType: ContradictionType | null = null;
  let severity = 0;
  let description = '';
  
  // 1. Sprawdź przeciwne typy relacji
  if (config.check_opposite_relations && 
      areRelationsOpposite(newRel.relation_type, existingRel.relation_type)) {
    contradictionType = 'opposite_relation';
    severity = 0.8;
    description = `Wykryto przeciwne typy relacji: "${existingRel.relation_type}" → "${newRel.relation_type}"`;
  }
  
  // 2. Sprawdź drastyczną zmianę impact_factor
  const impactDiff = Math.abs(newRel.impact_factor - existingRel.impact_factor);
  if (impactDiff >= config.impact_diff_threshold) {
    if (!contradictionType || severity < 0.6) {
      contradictionType = 'impact_reversal';
      severity = calculateContradictionSeverity(
        impactDiff,
        newRel.certainty_score - existingRel.certainty_score,
        false
      );
      description = `Drastyczna zmiana siły wpływu: ${existingRel.impact_factor.toFixed(2)} → ${newRel.impact_factor.toFixed(2)} (różnica: ${impactDiff.toFixed(2)})`;
    }
  }
  
  // 3. Sprawdź spadek certainty_score
  const certaintyDiff = newRel.certainty_score - existingRel.certainty_score;
  if (certaintyDiff < -config.certainty_diff_threshold) {
    if (!contradictionType || severity < 0.5) {
      contradictionType = 'certainty_drop';
      severity = Math.max(severity, 0.5);
      description = `Spadek rzetelności: ${(existingRel.certainty_score * 100).toFixed(0)}% → ${(newRel.certainty_score * 100).toFixed(0)}%`;
    }
  }
  
  // 4. Jeśli wszystkie wskaźniki się zmieniły drastycznie = pełna zmiana narracji (180°)
  if (contradictionType === 'opposite_relation' && impactDiff >= 0.4) {
    contradictionType = 'narrative_180';
    severity = 1.0;
    description = `Pełna zmiana narracji (180°): zmiana typu relacji + drastyczna zmiana siły wpływu`;
  }
  
  // Jeśli nie wykryto sprzeczności
  if (!contradictionType) {
    return null;
  }
  
  // Utwórz raport sprzeczności
  return {
    existing_relation: existingRel,
    new_relation: newRel,
    type: contradictionType,
    details: {
      object_source_name: 'Obiekt źródłowy', // TODO: Pobierz nazwy z bazy
      object_target_name: 'Obiekt docelowy',
      relation_type_conflict: {
        existing: existingRel.relation_type,
        new: newRel.relation_type,
      },
      impact_factor_diff: impactDiff,
      certainty_score_diff: certaintyDiff,
    },
    severity,
    description,
  };
}

/**
 * @cybernetic Tworzy podsumowanie sprzeczności
 */
function createSummary(
  contradictions: Contradiction[],
  config: ContradictionDetectionParams
): any {
  const byType: Record<string, number> = {
    opposite_relation: 0,
    impact_reversal: 0,
    certainty_drop: 0,
    narrative_180: 0,
  };
  
  let maxSeverity = 0;
  const affectedSources = new Set<string>();
  
  for (const c of contradictions) {
    byType[c.type] = (byType[c.type] || 0) + 1;
    maxSeverity = Math.max(maxSeverity, c.severity);
    
    if (c.new_relation.source_name) {
      affectedSources.add(c.new_relation.source_name);
    }
  }
  
  // Zalecana akcja na podstawie severity i liczby sprzeczności
  let recommendedAction: any = 'flag_for_review';
  
  if (maxSeverity >= 0.9) {
    recommendedAction = 'reject_new'; // Krytyczna sprzeczność - odrzuć nowe dane
  } else if (maxSeverity >= 0.7) {
    recommendedAction = 'lower_reliability'; // Obniż wiarygodność źródła
  } else if (contradictions.length >= 3) {
    recommendedAction = 'lower_reliability'; // Wiele sprzeczności = nieretelne źródło
  }
  
  return {
    total_contradictions: contradictions.length,
    by_type: byType,
    max_severity: maxSeverity,
    affected_sources: Array.from(affectedSources),
    recommended_action: recommendedAction,
  };
}

/**
 * @cybernetic Przetwarza wykryte sprzeczności (alerty + penalty)
 */
async function processContradictions(
  contradictions: Contradiction[],
  config: ContradictionDetectionParams
): Promise<void> {
  console.log('[HOMEOSTAT] Przetwarzam sprzeczności...');
  
  for (const contradiction of contradictions) {
    // Twórz alert tylko dla wystarczająco wysokiego severity
    if (contradiction.severity >= config.min_severity_for_alert) {
      await createAlert(contradiction);
    }
    
    // Automatycznie obniż reliability_index źródła
    if (config.auto_penalize_source && contradiction.new_relation.source_name) {
      await penalizeSource(
        contradiction.new_relation.source_name,
        config.reliability_penalty
      );
    }
  }
  
  console.log('[HOMEOSTAT] ✓ Sprzeczności przetworzone');
}

/**
 * @cybernetic Tworzy alert w bazie danych
 */
async function createAlert(contradiction: Contradiction): Promise<void> {
  const alert: Partial<SystemAlert> = {
    alert_type: 'contradiction',
    severity: contradiction.severity,
    title: `Sprzeczność: ${contradiction.type}`,
    description: contradiction.description,
    conflicting_relation_ids: [
      contradiction.existing_relation.id,
      contradiction.new_relation.id,
    ],
    affected_object_ids: [
      contradiction.new_relation.source_id,
      contradiction.new_relation.target_id,
    ],
    source_name: contradiction.new_relation.source_name,
    metadata: {
      contradiction_type: contradiction.type,
      details: contradiction.details,
    },
    status: 'active',
  };
  
  const { error } = await supabase
    .from('system_alerts')
    .insert(alert);
  
  if (error) {
    console.error('[HOMEOSTAT] Błąd tworzenia alertu:', error);
  } else {
    console.log(`[HOMEOSTAT] ✓ Utworzono alert: ${alert.title}`);
  }
}

/**
 * @cybernetic Obniża reliability_index źródła (kara za nieretelność)
 */
async function penalizeSource(
  sourceName: string,
  penalty: number
): Promise<void> {
  console.log(`[HOMEOSTAT] Obniżam reliability_index dla: ${sourceName}`);
  
  // Pobierz aktualny reliability_index
  const { data: source, error: fetchError } = await supabase
    .from('source_intelligence')
    .select('reliability_index')
    .eq('source_name', sourceName)
    .single();
  
  if (fetchError) {
    // Jeśli źródło nie istnieje, utwórz je z niskim reliability_index
    const { error: insertError } = await supabase
      .from('source_intelligence')
      .insert({
        source_name: sourceName,
        reliability_index: 0.5 - penalty, // Startuje z karą
        last_verified_at: new Date().toISOString(),
      });
    
    if (insertError) {
      console.error('[HOMEOSTAT] Błąd tworzenia źródła:', insertError);
    } else {
      console.log(`[HOMEOSTAT] ✓ Utworzono źródło z reliability_index: ${0.5 - penalty}`);
    }
    return;
  }
  
  // Obniż reliability_index (nie niżej niż 0)
  const newReliability = Math.max(0, source.reliability_index - penalty);
  
  const { error: updateError } = await supabase
    .from('source_intelligence')
    .update({
      reliability_index: newReliability,
      last_verified_at: new Date().toISOString(),
    })
    .eq('source_name', sourceName);
  
  if (updateError) {
    console.error('[HOMEOSTAT] Błąd aktualizacji reliability_index:', updateError);
  } else {
    console.log(`[HOMEOSTAT] ✓ Obniżono reliability_index: ${source.reliability_index.toFixed(2)} → ${newReliability.toFixed(2)}`);
  }
}

// ============================================================================
// EKSPORT
// ============================================================================

export default {
  detectContradictions,
};

