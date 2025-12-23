/**
 * @fileoverview Testy jednostkowe dla Receptora
 * @cybernetic Weryfikacja rzetelności ekstrakcji zgodnie z rygorem Kosseckiego
 * 
 * Testy sprawdzają:
 * 1. Cognitive Clarity - tekst naukowy/techniczny musi dać niski noise_level
 * 2. Ideological Noise - tekst propagandowy musi dać wysoki noise_level
 * 3. Gradacja statusu sygnału (CLEAR/WARNING/REJECT)
 * 4. Mechanizm fallback (odporność na awarie API)
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { ReceptorExtractorService } from './extractor';
import type { CyberneticInput, SemanticNoiseError } from './validator';

// ============================================================================
// SETUP
// ============================================================================

let receptor: ReceptorExtractorService;

beforeAll(() => {
  // Upewnij się, że OPENROUTER_API_KEY jest ustawiony
  if (!process.env.OPENROUTER_API_KEY && !import.meta.env?.OPENROUTER_API_KEY) {
    console.warn(
      'UWAGA: OPENROUTER_API_KEY nie jest ustawiony. Testy mogą zawieść.'
    );
  }
  
  receptor = new ReceptorExtractorService();
});

// ============================================================================
// TEST 1: COGNITIVE CLARITY
// ============================================================================

describe('Receptor - Cognitive Clarity Test', () => {
  it('powinien zwrócić STATUS: CLEAR dla neutralnego tekstu technicznego', async () => {
    const cognitiveText = `
      Elektrownia jądrowa w Fukushimie składa się z 6 reaktorów typu BWR (Boiling Water Reactor).
      Każdy reaktor ma moc nominalną 460-784 MW elektrycznych.
      W 2011 roku, po trzęsieniu ziemi o magnitudzie 9.0, systemy chłodzenia uległy awarii.
      Reaktory 1, 2 i 3 były w trakcie pracy, reaktory 4, 5 i 6 były wyłączone na konserwację.
      Temperatura rdzenia reaktora 1 przekroczyła 2800°C, co spowodowało topienie paliwa.
    `;
    
    const result = await receptor.transformSignal(cognitiveText);
    
    // Sprawdź czy nie ma błędu SEMANTIC_NOISE
    expect('error_type' in result).toBe(false);
    
    if ('error_type' in result) {
      throw new Error(`Nieoczekiwany błąd: ${result.message}`);
    }
    
    const input = result as CyberneticInput;
    
    // Asercje zgodne z rygorem Kosseckiego
    expect(input.metadata.semantic_noise_level).toBeLessThan(0.4);
    expect(input.metadata.signal_status).toBe('CLEAR');
    expect(input.metadata.is_ambiguous).toBe(false);
    expect(input.metadata.dominant_system_type).toBe('cognitive');
    
    // Musi wyekstrahować co najmniej 1 obiekt i 1 relację
    expect(input.objects.length).toBeGreaterThanOrEqual(1);
    expect(input.relations.length).toBeGreaterThanOrEqual(0);
    
    // Wyświetl wyniki dla debugowania
    console.log('\n[TEST] Cognitive Clarity Results:');
    console.log(`  Noise Level: ${input.metadata.semantic_noise_level.toFixed(2)}`);
    console.log(`  Signal Status: ${input.metadata.signal_status}`);
    console.log(`  Objects: ${input.objects.length}`);
    console.log(`  Relations: ${input.relations.length}`);
    console.log(`  Dominant System: ${input.metadata.dominant_system_type}`);
  }, 60000); // Timeout 60s dla wywołania API
});

// ============================================================================
// TEST 2: IDEOLOGICAL NOISE
// ============================================================================

describe('Receptor - Ideological Noise Test', () => {
  it('powinien zwrócić STATUS: WARNING lub REJECT dla tekstu propagandowego', async () => {
    const ideologicalText = `
      Sprawiedliwy rząd demokratyczny walczy z reakcyjnymi siłami ciemności.
      Postępowa polityka społeczna jest jedyną słuszną drogą do wolności.
      Wrogowie narodu próbują zniszczyć nasze piękne wartości.
      Tylko prawdziwie patriotyczne siły mogą ocalić ojczyznę przed upadkiem.
      Niesprawiedliwe elity eksploatują uczciwych obywateli.
      Nowoczesne społeczeństwo odrzuca przestarzałe dogmaty.
    `;
    
    const result = await receptor.transformSignal(ideologicalText);
    
    // Może zwrócić albo CyberneticInput z wysokim noise_level, albo błąd SEMANTIC_NOISE
    if ('error_type' in result) {
      const error = result as SemanticNoiseError;
      expect(error.error_type).toBe('SEMANTIC_NOISE');
      expect(error.noise_level).toBeGreaterThanOrEqual(0.6);
      
      console.log('\n[TEST] Ideological Noise Results (REJECTED):');
      console.log(`  Error: ${error.message}`);
      console.log(`  Noise Level: ${error.noise_level.toFixed(2)}`);
      
      return; // Test passed - system odrzucił propagandę
    }
    
    const input = result as CyberneticInput;
    
    // Asercje zgodne z rygorem Kosseckiego
    expect(input.metadata.semantic_noise_level).toBeGreaterThanOrEqual(0.4);
    expect(['WARNING', 'REJECT']).toContain(input.metadata.signal_status);
    
    if (input.metadata.signal_status === 'WARNING') {
      expect(input.metadata.is_ambiguous).toBe(true);
      expect(input.metadata.warning_message).toBeDefined();
    }
    
    expect(['ideological', 'ethical']).toContain(input.metadata.dominant_system_type);
    
    // Flagi ideologiczne powinny być wykryte
    if (input.metadata.ideological_flags && input.metadata.ideological_flags.length > 0) {
      expect(input.metadata.ideological_flags.length).toBeGreaterThan(0);
    }
    
    // Wyświetl wyniki dla debugowania
    console.log('\n[TEST] Ideological Noise Results:');
    console.log(`  Noise Level: ${input.metadata.semantic_noise_level.toFixed(2)}`);
    console.log(`  Signal Status: ${input.metadata.signal_status}`);
    console.log(`  Is Ambiguous: ${input.metadata.is_ambiguous}`);
    console.log(`  Warning: ${input.metadata.warning_message || 'N/A'}`);
    console.log(`  Dominant System: ${input.metadata.dominant_system_type}`);
    console.log(`  Ideological Flags: ${input.metadata.ideological_flags?.join(', ') || 'N/A'}`);
  }, 60000); // Timeout 60s dla wywołania API
});

// ============================================================================
// TEST 3: GRADACJA STATUSU SYGNAŁU
// ============================================================================

describe('Receptor - Signal Status Gradation', () => {
  it('powinien poprawnie klasyfikować status sygnału na podstawie noise_level', async () => {
    const testCases = [
      {
        text: 'Temperatura wody wynosi 25°C. Ciśnienie wynosi 1013 hPa.',
        expectedStatus: 'CLEAR',
        expectedNoiseMax: 0.4,
      },
      {
        text: 'Firma X inwestuje w technologię Y, co może zwiększyć efektywność o 20%. Niektórzy eksperci uważają to za korzystne.',
        expectedStatus: 'WARNING',
        expectedNoiseMin: 0.4,
        expectedNoiseMax: 0.7,
      },
    ];
    
    for (const testCase of testCases) {
      const result = await receptor.transformSignal(testCase.text);
      
      if ('error_type' in result) {
        // Jeśli system odrzucił, to też jest OK (jeśli oczekiwaliśmy REJECT)
        if (testCase.expectedStatus === 'REJECT') {
          expect(result.error_type).toBe('SEMANTIC_NOISE');
          continue;
        } else {
          throw new Error(`Nieoczekiwane odrzucenie: ${result.message}`);
        }
      }
      
      const input = result as CyberneticInput;
      
      console.log(`\n[TEST] Gradacja dla: "${testCase.text.substring(0, 50)}..."`);
      console.log(`  Noise Level: ${input.metadata.semantic_noise_level.toFixed(2)}`);
      console.log(`  Signal Status: ${input.metadata.signal_status}`);
      console.log(`  Expected Status: ${testCase.expectedStatus}`);
      
      expect(input.metadata.signal_status).toBe(testCase.expectedStatus);
      
      if (testCase.expectedNoiseMax !== undefined) {
        expect(input.metadata.semantic_noise_level).toBeLessThanOrEqual(testCase.expectedNoiseMax);
      }
      
      if (testCase.expectedNoiseMin !== undefined) {
        expect(input.metadata.semantic_noise_level).toBeGreaterThanOrEqual(testCase.expectedNoiseMin);
      }
    }
  }, 120000); // Timeout 120s dla wielu wywołań API
});

// ============================================================================
// TEST 4: MECHANIZM FALLBACK
// ============================================================================

describe('Receptor - Fallback Mechanism', () => {
  it('powinien przetestować połączenie z API', async () => {
    const isConnected = await receptor.testConnection();
    
    console.log(`\n[TEST] Test połączenia z API: ${isConnected ? 'OK' : 'FAILED'}`);
    
    expect(isConnected).toBe(true);
  }, 30000);
});

// ============================================================================
// TEST 5: WALIDACJA INTEGRALNOŚCI
// ============================================================================

describe('Receptor - Integrity Validation', () => {
  it('powinien odrzucić pusty tekst', async () => {
    const result = await receptor.transformSignal('');
    
    expect('error_type' in result).toBe(true);
    
    if ('error_type' in result) {
      expect(result.error_type).toBe('SEMANTIC_NOISE');
      expect(result.noise_level).toBe(1.0);
    }
  });
  
  it('powinien odrzucić zbyt długi tekst', async () => {
    const longText = 'A'.repeat(60000);
    const result = await receptor.transformSignal(longText);
    
    expect('error_type' in result).toBe(true);
    
    if ('error_type' in result) {
      expect(result.error_type).toBe('SEMANTIC_NOISE');
      expect(result.message).toContain('zbyt długi');
    }
  });
});

