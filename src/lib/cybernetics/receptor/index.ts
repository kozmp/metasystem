/**
 * @fileoverview RECEPTOR - Publiczne API modułu wejściowego
 * @cybernetic Organ wejściowy systemu KMS
 * 
 * Receptor transformuje nieuporządkowane dane wejściowe (tekst naturalny)
 * na ustrukturyzowany metajęzyk cybernetyczny.
 * 
 * Zgodnie z zasadą Kosseckiego: Receptor NIE interpretuje, tylko strukturyzuje.
 */

// ============================================================================
// EKSPORT TYPÓW I SCHEMATÓW
// ============================================================================

export type {
  ExtractedObject,
  ExtractedRelation,
  ExtractionMetadata,
  CyberneticInput,
  SemanticNoiseError,
  SignalStatus,
} from './validator';

export {
  ExtractedObjectSchema,
  ExtractedRelationSchema,
  ExtractionMetadataSchema,
  CyberneticInputSchema,
  SemanticNoiseErrorSchema,
  isAutonomousSystem,
  validateRelation,
  validateCyberneticInput,
  toControlProcess,
  calculateSignalStatus,
} from './validator';

// ============================================================================
// EKSPORT EXTRACTORA
// ============================================================================

export { 
  ReceptorExtractorService,
  getReceptorExtractor,
} from './extractor';

// ============================================================================
// EKSPORT KLASYFIKATORA
// ============================================================================

export type { CivilizationPattern } from './classifier';

export {
  classifySourceType,
  calculateSemanticNoise,
  detectIdeologicalFlags,
  classifyCivilizationPattern,
  calculateSourceReliability,
  analyzeObjectQuality,
  analyzeRelationQuality,
} from './classifier';

// ============================================================================
// FASADA - UPROSZCZONE API
// ============================================================================

import { getReceptorExtractor } from './extractor';
import type { CyberneticInput, SemanticNoiseError } from './validator';

/**
 * @cybernetic Funkcja fasady - najprostszy sposób użycia Receptora
 * 
 * @param rawText - Surowy tekst do analizy
 * @returns CyberneticInput lub błąd SEMANTIC_NOISE
 * 
 * @example
 * ```typescript
 * const result = await processInput("Państwo X steruje organizacją Y poprzez dotacje.");
 * 
 * if ('error_type' in result) {
 *   console.error('Błąd:', result.message);
 * } else {
 *   console.log('Obiekty:', result.objects);
 *   console.log('Relacje:', result.relations);
 * }
 * ```
 */
export async function processInput(
  rawText: string
): Promise<CyberneticInput | SemanticNoiseError> {
  const extractor = getReceptorExtractor();
  return await extractor.transformSignal(rawText);
}

/**
 * @cybernetic Test połączenia z API
 */
export async function testReceptorConnection(): Promise<boolean> {
  const extractor = getReceptorExtractor();
  return await extractor.testConnection();
}

