/**
 * @fileoverview Korelator Store - Zapis obiektów i relacji w bazie danych
 * @cybernetic Implementacja Retencji (pamięć operacyjna systemu)
 * 
 * Zgodnie z teorią Kosseckiego:
 * Korelator przyjmuje przetworzone sygnały z Receptora i zapisuje je w pamięci trwałej (Supabase).
 * Każda relacja ma wagę rzetelności (certainty_score) obliczoną na podstawie poziomu szumu.
 */

import { supabase } from '../../supabase/client';
import { getReceptorExtractor } from '../receptor/extractor';
import { detectContradictions } from '../homeostat/contradiction-engine';
import type { CyberneticInput, SemanticNoiseError } from '../receptor/validator';
import type { 
  CyberneticObject, 
  Correlation, 
  RawSignal,
  SystemClass,
  ControlSystemType,
  RelationType
} from '../../supabase/types';

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * @cybernetic Obliczanie certainty_score na podstawie poziomu szumu
 * 
 * Rygor Kosseckiego: Jeśli tekst był bełkotliwy (wysoki szum), 
 * relacja musi mieć niską wiarygodność.
 * 
 * Formuła: certainty_score = 1.0 - semantic_noise_level
 * - noise_level 0.0 (czyste) → certainty_score 1.0 (pewne)
 * - noise_level 0.5 (mieszane) → certainty_score 0.5 (średnie)
 * - noise_level 1.0 (bełkot) → certainty_score 0.0 (niepewne)
 */
function calculateCertaintyScore(noiseLevel: number): number {
  return Math.max(0, Math.min(1, 1.0 - noiseLevel));
}

/**
 * @cybernetic Mapowanie typu systemu z Receptora na typ bazodanowy
 */
function mapSystemClass(type: string): SystemClass {
  // Receptor używa tej samej nomenklatury co baza
  return type as SystemClass;
}

/**
 * @cybernetic Mapowanie typu systemu sterowania
 */
function mapControlSystemType(type: string): ControlSystemType {
  // Receptor używa tej samej nomenklatury co baza
  return type as ControlSystemType;
}

/**
 * @cybernetic Mapowanie typu relacji
 * 
 * Receptor używa bardziej szczegółowych typów (process_type, feedback_type),
 * musimy je zmapować na uproszczone typy bazodanowe.
 */
function mapRelationType(
  processType: string,
  feedbackType: string
): RelationType {
  // Priorytetyzuj typ sprzężenia zwrotnego
  if (feedbackType === 'positive') {
    return 'positive_feedback';
  } else if (feedbackType === 'negative') {
    return 'negative_feedback';
  }
  
  // Jeśli neutral, użyj typu procesu
  if (processType === 'energetic') {
    return 'supply'; // Przepływ energii/zasobów
  }
  
  // Domyślnie: sterowanie bezpośrednie
  return 'direct_control';
}

// ============================================================================
// GŁÓWNA FUNKCJA KORELATORA
// ============================================================================

/**
 * @cybernetic Przetwarzanie i zapis sygnału w systemie
 * 
 * Przepływ informacji (zgodnie z architekturą KMS):
 * 1. RECEPTOR: Transformacja tekstu → obiekty + relacje
 * 2. KORELATOR: Zapis w pamięci trwałej (Supabase)
 *    a) raw_signals - surowy tekst + metadane źródła
 *    b) cybernetic_objects - wyekstrahowane obiekty
 *    c) correlations - relacje sterownicze
 * 3. HOMEOSTAT: Weryfikacja rzetelności (TODO)
 * 4. EFEKTOR: Prezentacja wyników (TODO)
 * 
 * @param text - Surowy tekst do analizy
 * @param sourceMetadata - Opcjonalne metadane źródła (URL, tytuł, etc.)
 * @returns Podsumowanie zapisanych danych lub błąd
 */
export async function processAndStoreSignal(
  text: string,
  model?: string, // Wybrany model AI (opcjonalnie)
  sourceMetadata?: {
    source_url?: string;
    source_title?: string;
    author?: string;
    published_date?: string;
    description?: string;
  }
): Promise<{
  success: boolean;
  raw_signal_id?: string;
  objects_created: number;
  relations_created: number;
  certainty_score?: number;
  error?: string;
}> {
  try {
    console.log('[KORELATOR] Rozpoczynam przetwarzanie sygnału...');
    console.log(`[KORELATOR] Długość tekstu: ${text.length} znaków`);
    console.log(`[KORELATOR] Model: ${model || 'default (OpenRouter)'}`);
    
    // ========================================================================
    // KROK 1: RECEPTOR - Transformacja sygnału
    // ========================================================================
    
    // Jeśli wybrano Gemini Direct, użyj dedykowanej funkcji
    if (model === 'gemini-direct') {
      console.log('[KORELATOR] 🔄 Wykryto Gemini Direct - używam dedykowanego API...');
      
      // Dynamiczny import żeby nie ładować Gemini jeśli nie jest potrzebny
      const { analyzeText } = await import('../receptor/gemini_service');
      
      try {
        const geminiResult = await analyzeText(text, sourceMetadata?.source_url);
        
        console.log('[KORELATOR] ✓ Gemini przeanalizował tekst');
        console.log(`[KORELATOR]   Quality: ${geminiResult.quality_a.toFixed(2)}`);
        console.log(`[KORELATOR]   Distortion Z: ${geminiResult.distortion_z.toFixed(2)}`);
        console.log(`[KORELATOR]   Control Type: ${geminiResult.control_system_type}`);
        
        // TODO: Gemini zwraca inny format niż Receptor
        // Potrzebna konwersja wyniku Gemini na format CyberneticInput
        // Na razie zwróć błąd z informacją
        return {
          success: false,
          objects_created: 0,
          relations_created: 0,
          error: '⚠️ Gemini Direct: Integracja w toku. Wynik analizy gotowy, ale wymaga konwersji na format systemu. Użyj innego modelu.',
        };
        
      } catch (geminiError) {
        console.error('[KORELATOR] ✗ Błąd Gemini:', geminiError);
        return {
          success: false,
          objects_created: 0,
          relations_created: 0,
          error: `Błąd Gemini Direct: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`,
        };
      }
    }
    
    // OpenRouter (domyślnie)
    console.log('[KORELATOR] Wywołuję Receptor (OpenRouter)...');
    const extractor = getReceptorExtractor();
    
    // Opcjonalnie: ustaw model w extractorze jeśli podany
    if (model && model !== 'gemini-direct') {
      // Extractor automatycznie użyje modelu z env lub tego co przekażemy
      // Na razie ignorujemy, bo extractor używa zmiennej środowiskowej
    }
    
    const receptorResult = await extractor.transformSignal(text);
    
    // Sprawdź czy Receptor odrzucił sygnał
    if ('error_type' in receptorResult) {
      const error = receptorResult as SemanticNoiseError;
      console.error('[KORELATOR] Receptor odrzucił sygnał:', error.message);
      
      // Zapisz odrzucony sygnał w raw_signals (z flagą processed=false)
      const { data: rawSignal, error: rawError } = await supabase
        .from('raw_signals')
        .insert({
          content: text,
          processed: false,
          noise_level: error.noise_level,
        })
        .select()
        .single();
      
      if (rawError) {
        console.error('[KORELATOR] Błąd zapisu odrzuconego sygnału:', rawError);
      }
      
      return {
        success: false,
        raw_signal_id: rawSignal?.id,
        objects_created: 0,
        relations_created: 0,
        error: error.message,
      };
    }
    
    const input = receptorResult as CyberneticInput;
    const noiseLevel = input.metadata.semantic_noise_level;
    const certaintyScore = calculateCertaintyScore(noiseLevel);
    
    console.log(`[KORELATOR] ✓ Receptor przetworzył sygnał`);
    console.log(`[KORELATOR]   Noise Level: ${noiseLevel.toFixed(2)}`);
    console.log(`[KORELATOR]   Certainty Score: ${certaintyScore.toFixed(2)}`);
    console.log(`[KORELATOR]   Status: ${input.metadata.signal_status}`);
    console.log(`[KORELATOR]   Obiekty: ${input.objects.length}`);
    console.log(`[KORELATOR]   Relacje: ${input.relations.length}`);
    
    // ========================================================================
    // KROK 2a: Zapis surowego tekstu w raw_signals
    // ========================================================================
    
    console.log('[KORELATOR] Zapisuję surowy sygnał do raw_signals...');
    const { data: rawSignal, error: rawError } = await supabase
      .from('raw_signals')
      .insert({
        content: text,
        processed: true,
        noise_level: noiseLevel,
        source_url: sourceMetadata?.source_url || null,
        source_title: sourceMetadata?.source_title || null,
        source_metadata: sourceMetadata ? {
          author: sourceMetadata.author,
          published_date: sourceMetadata.published_date,
          description: sourceMetadata.description,
        } : null,
      })
      .select()
      .single();
    
    if (rawError) {
      console.error('[KORELATOR] Błąd zapisu raw_signal:', rawError);
      throw new Error(`Błąd zapisu surowego sygnału: ${rawError.message}`);
    }
    
    console.log(`[KORELATOR] ✓ Zapisano raw_signal: ${rawSignal.id}`);
    
    // ========================================================================
    // KROK 2b: Zapis/Aktualizacja obiektów w cybernetic_objects
    // ========================================================================
    
    console.log('[KORELATOR] Zapisuję obiekty do cybernetic_objects...');
    const objectIdMap = new Map<string, string>(); // local_id -> db_id
    let objectsCreated = 0;
    
    for (const obj of input.objects) {
      // Sprawdź czy obiekt już istnieje (po nazwie)
      const { data: existingObjects } = await supabase
        .from('cybernetic_objects')
        .select('id')
        .eq('name', obj.label)
        .limit(1);
      
      if (existingObjects && existingObjects.length > 0) {
        // Obiekt już istnieje - użyj istniejącego ID
        const existingId = existingObjects[0].id;
        objectIdMap.set(obj.id, existingId);
        console.log(`[KORELATOR]   Obiekt "${obj.label}" już istnieje (${existingId})`);
      } else {
        // Utwórz nowy obiekt
        const { data: newObject, error: objError } = await supabase
          .from('cybernetic_objects')
          .insert({
            name: obj.label,
            description: obj.description,
            system_class: mapSystemClass(obj.type),
            control_system_type: input.metadata.dominant_system_type, // Typ dominujący z metadanych
            energy_params: {
              working_power: obj.estimated_energy || 0,
              idle_power: 0,
              available_power: obj.estimated_energy || 0,
            },
          })
          .select()
          .single();
        
        if (objError) {
          console.error(`[KORELATOR] Błąd zapisu obiektu "${obj.label}":`, objError);
          continue;
        }
        
        objectIdMap.set(obj.id, newObject.id);
        objectsCreated++;
        console.log(`[KORELATOR]   ✓ Utworzono obiekt "${obj.label}" (${newObject.id})`);
      }
    }
    
    console.log(`[KORELATOR] ✓ Zapisano ${objectsCreated} nowych obiektów (${input.objects.length} razem)`);
    
    // ========================================================================
    // KROK 2c: Zapis relacji w correlations
    // ========================================================================
    
    console.log('[KORELATOR] Zapisuję relacje do correlations...');
    let relationsCreated = 0;
    const newRelations: Correlation[] = []; // Zbieramy nowe relacje dla Homeostatu
    
    for (const rel of input.relations) {
      const sourceDbId = objectIdMap.get(rel.subject_id);
      const targetDbId = objectIdMap.get(rel.object_id);
      
      if (!sourceDbId || !targetDbId) {
        console.warn(`[KORELATOR] Pomijam relację: brak ID dla ${rel.subject_id} -> ${rel.object_id}`);
        continue;
      }
      
      const { data: newRelation, error: relError } = await supabase
        .from('correlations')
        .insert({
          source_id: sourceDbId,
          target_id: targetDbId,
          relation_type: mapRelationType(rel.process_type, rel.feedback_type),
          certainty_score: certaintyScore, // Waga rzetelności z poziomu szumu
          impact_factor: rel.influence_strength,
          source_name: input.metadata.source_name || 'unknown', // Śledzenie źródła
          evidence_data: {
            description: rel.description,
            evidence: rel.evidence || [],
            process_type: rel.process_type,
            feedback_type: rel.feedback_type,
            system_class: rel.system_class,
          },
        })
        .select()
        .single();
      
      if (relError) {
        console.error(`[KORELATOR] Błąd zapisu relacji:`, relError);
        continue;
      }
      
      newRelations.push(newRelation); // Dodaj do listy nowych relacji
      relationsCreated++;
      console.log(`[KORELATOR]   ✓ Utworzono relację ${rel.subject_id} → ${rel.object_id} (${newRelation.id})`);
    }
    
    console.log(`[KORELATOR] ✓ Zapisano ${relationsCreated} relacji`);
    
    // ========================================================================
    // KROK 2d: HOMEOSTAT - Detekcja Sprzeczności (Weryfikacja Rzetelności Wstecznej)
    // ========================================================================
    
    if (newRelations.length > 0) {
      console.log('[KORELATOR] Uruchamiam Homeostat - detekcja sprzeczności...');
      try {
        const contradictionReport = await detectContradictions(newRelations);
        
        if (contradictionReport.detected) {
          console.log(`[KORELATOR] ⚠ HOMEOSTAT wykrył ${contradictionReport.contradictions.length} sprzeczności!`);
          console.log(`[KORELATOR] Max severity: ${contradictionReport.summary.max_severity.toFixed(2)}`);
          console.log(`[KORELATOR] Zalecana akcja: ${contradictionReport.summary.recommended_action}`);
        } else {
          console.log('[KORELATOR] ✓ HOMEOSTAT: Brak sprzeczności');
        }
      } catch (homeostatError) {
        console.error('[KORELATOR] Błąd Homeostatu:', homeostatError);
        // Nie przerywamy procesu - to tylko weryfikacja
      }
    }
    
    // ========================================================================
    // PODSUMOWANIE
    // ========================================================================
    
    console.log('[KORELATOR] ✅ Przetwarzanie zakończone pomyślnie');
    
    return {
      success: true,
      raw_signal_id: rawSignal.id,
      objects_created: objectsCreated,
      relations_created: relationsCreated,
      certainty_score: certaintyScore,
    };
    
  } catch (error) {
    console.error('[KORELATOR] Krytyczny błąd:', error);
    return {
      success: false,
      objects_created: 0,
      relations_created: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * @cybernetic Export dla łatwiejszego użycia
 */
export default {
  processAndStoreSignal,
};

