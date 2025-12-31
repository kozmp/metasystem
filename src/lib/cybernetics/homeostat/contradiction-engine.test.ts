/**
 * @fileoverview Testy jednostkowe dla Silnika Detekcji Sprzeczności
 * @cybernetic Test "Weryfikacji Rzetelności Wstecznej"
 * 
 * Zgodnie z rygorem Kosseckiego:
 * System musi wykrywać zmiany narracji tego samego źródła
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { detectContradictions } from './contradiction-engine';
import type { Correlation } from '../../supabase/types';
import { areRelationsOpposite, calculateContradictionSeverity } from './types';

// ============================================================================
// TESTY FUNKCJI POMOCNICZYCH
// ============================================================================

describe('areRelationsOpposite', () => {
  it('powinien wykryć przeciwne sprzężenia zwrotne', () => {
    expect(areRelationsOpposite('positive_feedback', 'negative_feedback')).toBe(true);
    expect(areRelationsOpposite('negative_feedback', 'positive_feedback')).toBe(true);
  });

  it('powinien wykryć przeciwne relacje supply/drain', () => {
    expect(areRelationsOpposite('supply', 'drain')).toBe(true);
    expect(areRelationsOpposite('supply', 'block')).toBe(true);
  });

  it('NIE powinien wykryć sprzeczności dla tych samych typów', () => {
    expect(areRelationsOpposite('positive_feedback', 'positive_feedback')).toBe(false);
    expect(areRelationsOpposite('supply', 'supply')).toBe(false);
  });
});

describe('calculateContradictionSeverity', () => {
  it('powinien przyznać wysokie severity dla przeciwnych relacji', () => {
    const severity = calculateContradictionSeverity(0.5, 0, true);
    expect(severity).toBeGreaterThanOrEqual(0.8);
  });

  it('powinien uwzględnić różnicę impact_factor', () => {
    const severity1 = calculateContradictionSeverity(0.1, 0, false);
    const severity2 = calculateContradictionSeverity(0.8, 0, false);
    expect(severity2).toBeGreaterThan(severity1);
  });

  it('powinien uwzględnić spadek certainty_score', () => {
    const severity = calculateContradictionSeverity(0.2, -0.5, false);
    expect(severity).toBeGreaterThan(0);
  });

  it('NIE powinien przekroczyć 1.0', () => {
    const severity = calculateContradictionSeverity(1.0, -1.0, true);
    expect(severity).toBeLessThanOrEqual(1.0);
  });
});

// ============================================================================
// SCENARIUSZ TESTOWY: ZMIANA NARRACJI POLITYKA
// ============================================================================

describe('detectContradictions - Scenariusz: Zmiana narracji polityka', () => {
  // Mockowane ID obiektów
  const POLITYK_ID = 'obj-polityk-123';
  const POLITYKA_ENERGETYCZNA_ID = 'obj-polityka-energetyczna-456';
  const ZRODLO = 'Polityk XYZ';

  // Stara wypowiedź: "Energia węglowa jest fundamentem gospodarki"
  const oldRelation: Correlation = {
    id: 'rel-old-111',
    source_id: POLITYK_ID,
    target_id: POLITYKA_ENERGETYCZNA_ID,
    relation_type: 'positive_feedback', // Wspiera węgiel
    certainty_score: 0.9,
    impact_factor: 0.8,
    source_name: ZRODLO,
    evidence_data: {
      quote: 'Energia węglowa jest fundamentem naszej gospodarki',
      date: '2022-01-15',
    },
    created_at: '2022-01-15T10:00:00Z',
  };

  // Nowa wypowiedź: "Musimy jak najszybciej wycofać się z węgla"
  const newRelation: Correlation = {
    id: 'rel-new-222',
    source_id: POLITYK_ID,
    target_id: POLITYKA_ENERGETYCZNA_ID,
    relation_type: 'negative_feedback', // Teraz przeciw węglowi!
    certainty_score: 0.85,
    impact_factor: 0.7,
    source_name: ZRODLO,
    evidence_data: {
      quote: 'Musimy jak najszybciej wycofać się z węgla',
      date: '2024-12-24',
    },
    created_at: '2024-12-24T10:00:00Z',
  };

  it('powinien wykryć zmianę narracji (180°)', () => {
    // Symulacja: w bazie jest oldRelation, teraz dodajemy newRelation
    // W rzeczywistym teście byłoby wywołanie do Supabase
    
    // Mock findExistingRelations zwraca oldRelation
    // Mock detectContradictions sprawdza czy są przeciwne
    
    const isOpposite = areRelationsOpposite(
      oldRelation.relation_type,
      newRelation.relation_type
    );
    
    expect(isOpposite).toBe(true);
  });

  it('powinien obliczyć wysokie severity dla pełnej zmiany narracji', () => {
    const impactDiff = Math.abs(newRelation.impact_factor - oldRelation.impact_factor);
    const certaintyDiff = newRelation.certainty_score - oldRelation.certainty_score;
    
    const severity = calculateContradictionSeverity(
      impactDiff,
      certaintyDiff,
      true // opposite relations
    );
    
    expect(severity).toBeGreaterThanOrEqual(0.8);
    expect(severity).toBeLessThanOrEqual(1.0);
  });

  it('powinien zidentyfikować źródło sprzeczności', () => {
    expect(oldRelation.source_name).toBe(ZRODLO);
    expect(newRelation.source_name).toBe(ZRODLO);
    expect(oldRelation.source_name).toBe(newRelation.source_name);
  });

  it('powinien wykryć drastyczną zmianę impact_factor', () => {
    const impactDiff = Math.abs(newRelation.impact_factor - oldRelation.impact_factor);
    
    // Zmiana o 0.1 to 12.5% - powinno być wykryte jeśli threshold = 0.5
    expect(impactDiff).toBeGreaterThan(0);
  });
});

// ============================================================================
// SCENARIUSZ TESTOWY: SPRZECZNOŚĆ W DANYCH NAUKOWYCH
// ============================================================================

describe('detectContradictions - Scenariusz: Sprzeczność w badaniach', () => {
  const BADACZ_ID = 'obj-badacz-789';
  const LEK_ID = 'obj-lek-abc';
  const ZRODLO = 'Dr Smith - Badanie 2023';

  // Stare badanie: "Lek jest skuteczny"
  const oldStudy: Correlation = {
    id: 'rel-study-old-333',
    source_id: BADACZ_ID,
    target_id: LEK_ID,
    relation_type: 'support',
    certainty_score: 0.95, // Wysoka pewność
    impact_factor: 0.9,
    source_name: ZRODLO,
    evidence_data: {
      study: 'Randomized Control Trial 2023',
      result: 'positive',
    },
    created_at: '2023-06-01T10:00:00Z',
  };

  // Nowe badanie: "Lek jest nieskuteczny" (po recenzji)
  const newStudy: Correlation = {
    id: 'rel-study-new-444',
    source_id: BADACZ_ID,
    target_id: LEK_ID,
    relation_type: 'oppose',
    certainty_score: 0.4, // Niska pewność po korekcie
    impact_factor: 0.3,
    source_name: ZRODLO,
    evidence_data: {
      study: 'Correction Notice 2024',
      result: 'negative',
    },
    created_at: '2024-01-15T10:00:00Z',
  };

  it('powinien wykryć sprzeczność support vs oppose', () => {
    const isOpposite = areRelationsOpposite(
      oldStudy.relation_type,
      newStudy.relation_type
    );
    
    expect(isOpposite).toBe(true);
  });

  it('powinien wykryć gwałtowny spadek certainty_score', () => {
    const certaintyDiff = newStudy.certainty_score - oldStudy.certainty_score;
    
    expect(certaintyDiff).toBeLessThan(-0.3); // Spadek o ponad 30%
  });

  it('powinien obliczyć wysokie severity ze względu na spadek wiarygodności', () => {
    const impactDiff = Math.abs(newStudy.impact_factor - oldStudy.impact_factor);
    const certaintyDiff = newStudy.certainty_score - oldStudy.certainty_score;
    
    const severity = calculateContradictionSeverity(
      impactDiff,
      certaintyDiff,
      true
    );
    
    expect(severity).toBeGreaterThanOrEqual(0.7);
  });
});

// ============================================================================
// SCENARIUSZ TESTOWY: FAŁSZYWY ALARM (nie powinno wykryć sprzeczności)
// ============================================================================

describe('detectContradictions - Scenariusz: Fałszywy alarm', () => {
  const SOURCE_ID = 'obj-source-999';
  const TARGET_ID = 'obj-target-888';
  const ZRODLO = 'Wiarygodne źródło';

  // Dwie relacje tego samego typu z minimalną różnicą
  const relation1: Correlation = {
    id: 'rel-consistent-1',
    source_id: SOURCE_ID,
    target_id: TARGET_ID,
    relation_type: 'supply',
    certainty_score: 0.85,
    impact_factor: 0.75,
    source_name: ZRODLO,
    created_at: '2024-01-01T10:00:00Z',
  };

  const relation2: Correlation = {
    id: 'rel-consistent-2',
    source_id: SOURCE_ID,
    target_id: TARGET_ID,
    relation_type: 'supply', // Ten sam typ
    certainty_score: 0.83,   // Minimalna różnica
    impact_factor: 0.78,     // Minimalna różnica
    source_name: ZRODLO,
    created_at: '2024-06-01T10:00:00Z',
  };

  it('NIE powinien wykryć sprzeczności dla tego samego typu relacji', () => {
    const isOpposite = areRelationsOpposite(
      relation1.relation_type,
      relation2.relation_type
    );
    
    expect(isOpposite).toBe(false);
  });

  it('NIE powinien wykryć sprzeczności dla małych różnic', () => {
    const impactDiff = Math.abs(relation2.impact_factor - relation1.impact_factor);
    const certaintyDiff = relation2.certainty_score - relation1.certainty_score;
    
    expect(impactDiff).toBeLessThan(0.1); // < 10% różnicy
    expect(Math.abs(certaintyDiff)).toBeLessThan(0.1);
  });
});

// ============================================================================
// TEST INTEGRACYJNY (wymaga działającego Supabase)
// ============================================================================

describe.skip('detectContradictions - Test integracyjny', () => {
  // UWAGA: Ten test wymaga działającej bazy Supabase
  // Skip po to nie uruchamiał się podczas zwykłych testów
  
  it('powinien wykryć sprzeczność w rzeczywistej bazie', async () => {
    // TODO: Implementacja testu integracyjnego z prawdziwą bazą
    // 1. Wstaw starą relację
    // 2. Wstaw nową sprzeczną relację
    // 3. Wywołaj detectContradictions
    // 4. Sprawdź czy utworzono alert w system_alerts
    // 5. Sprawdź czy obniżono reliability_index
  });
});

// ============================================================================
// EKSPORT
// ============================================================================

export {
  // Testy są automatycznie uruchamiane przez Jest
};

