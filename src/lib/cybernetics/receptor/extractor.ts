/**
 * @fileoverview Receptor Extractor - Ekstrakcja obiektów i relacji z tekstu za pomocą AI
 * @cybernetic Implementacja transformacji bodźca na sygnał korelatora
 * 
 * Wykorzystuje LLM do surowej analizy tekstu według rygoru Kosseckiego.
 * Nie pozwalamy na luźne streszczenie - wymuszamy ekstrakcję relacji sterowniczych.
 */

// Załaduj zmienne środowiskowe z .env (dla Node.js)
import { config } from 'dotenv';
import { resolve } from 'path';

// Załaduj .env z głównego katalogu projektu
config({ path: resolve(process.cwd(), '.env') });

import OpenAI from 'openai';
import {
  CyberneticInputSchema,
  type CyberneticInput,
  type SemanticNoiseError,
  validateCyberneticInput,
} from './validator';

// ============================================================================
// KONFIGURACJA AI
// ============================================================================

/**
 * @cybernetic Konfiguracja klienta OpenRouter
 * OpenRouter jest kompatybilny z API OpenAI
 */
function createAIClient(): OpenAI {
  // W Node.js używamy process.env, w Astro używamy import.meta.env
  const apiKey = 
    typeof process !== 'undefined' && process.env.OPENROUTER_API_KEY
      ? process.env.OPENROUTER_API_KEY
      : (typeof import.meta !== 'undefined' && import.meta.env?.OPENROUTER_API_KEY) || undefined;
  
  console.log(`[RECEPTOR] Debug - API Key obecny: ${apiKey ? 'TAK' : 'NIE'}`);
  console.log(`[RECEPTOR] Debug - API Key długość: ${apiKey?.length || 0}`);
  console.log(`[RECEPTOR] Debug - API Key prefix: ${apiKey?.substring(0, 10) || 'brak'}`);
  
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY nie jest ustawiony. Dodaj go do pliku .env'
    );
  }
  
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://kossecki-metasystem.local',
      'X-Title': 'KOSSECKI METASYSTEM',
    },
  });
}

// ============================================================================
// PROMPT SYSTEMOWY - RYGOR KOSSECKIEGO
// ============================================================================

/**
 * @cybernetic Prompt systemowy dla AI - wymusza rygor metacybernetyczny
 * 
 * Zgodnie z nauką Kosseckiego:
 * 1. Obiekt NIE jest zbiorem cech - jest węzłem relacji
 * 2. Każda relacja ma źródło, cel, typ sterowania (energia/informacja)
 * 3. Klasyfikacja systemu (poznawczy/ideologiczny/etyczny/ekonomiczny)
 * 4. Sprzężenie zwrotne (dodatnie/ujemne)
 * 5. ANTI-IDEOLOGY TUNING: Każdy przymiotnik wartościujący podnosi semantic_noise_level
 */
const SYSTEM_PROMPT = `
Jesteś RECEPTOREM w systemie cybernetycznym opartym na Metacybernetyce doc. Józefa Kosseckiego.

Jesteś rygorystycznym analitykiem cybernetycznym. Twoim zadaniem jest SUROWA ANALIZA tekstu zgodnie z następującymi zasadami:

## ZASADY EKSTRAKCJI

1. **OBIEKTY (Systemy)**
   - Identyfikuj tylko KONKRETNE systemy: organizacje, państwa, firmy, osoby, grupy
   - Każdy obiekt to węzeł w grafie - NIGDY nie przypisuj mu "cech", tylko identyfikuj RELACJE
   - Typ obiektu:
     * autonomous_system - system samosterowny (państwo, korporacja, osoba)
     * heteronomous_system - system sterowany z zewnątrz (kolonia, oddział firmy)
     * environment - otoczenie (rynek, natura, opinia publiczna)
     * tool - narzędzie (technologia, broń, infrastruktura)

   **METACYBERNETYKA 2015: Parametry mocy systemowej (v, a, c)**

   Dla każdego obiektu MUSISZ oszacować:

   - **power_v** (moc jednostkowa [W]) - Intensywność działania:
     * Ile energii/pracy system wykonuje na jednostkę czasu?
     * Przykłady:
       - Osoba: 100-200W (praca fizyczna/umysłowa)
       - Firma 100 osób: 10000-20000W
       - Państwo (milion ludzi): ~100000000W
     * Jeśli brak danych: użyj 1.0 jako wartości bazowej

   - **quality_a** (jakość/sprawność 0-1) - Efektywność technologiczna:
     * Jak zaawansowane są technologie, wiedza, organizacja systemu?
     * Skala:
       - 0.1-0.3: Niski poziom (chaos, brak technologii)
       - 0.4-0.6: Średni poziom (typowa organizacja)
       - 0.7-0.9: Wysoki poziom (zaawansowana technologia, dobra organizacja)
       - 0.95-1.0: Maksymalny poziom (perfekcja technologiczna)
     * Domyślnie: 0.5

   - **mass_c** (ilość/masa) - Liczebność systemu:
     * Ile OSÓB, ELEMENTÓW, JEDNOSTEK wchodzi w skład systemu?
     * Przykłady:
       - Osoba: 1
       - Organizacja 50 osób: 50
       - Firma 1000 pracowników: 1000
       - Państwo 10 mln ludzi: 10000000
     * Domyślnie: 1.0

   **METACYBERNETYKA 2015: Klasyfikacja cywilizacyjna**

   - **civilization_code** - Kod cywilizacyjny źródła:
     * "latin" - Cywilizacja łacińska:
       - Dominacja nauki, prawa, racjonalizmu
       - Fakty > emocje
       - Przykłady: uniwersytety, sądy, instytucje naukowe
     * "byzantine" - Cywilizacja bizantyjska:
       - Dominacja religii, tradycji, hierarchii
       - Wiara > logika
       - Przykłady: kościoły, dynastie, struktury feudalne
     * "turandot" - Cywilizacja turandot (totalitarna):
       - Dominacja ideologii, propagandy, doktryny
       - Partia > jednostka
       - Przykłady: państwa totalitarne, sekty, partie ideologiczne
     * "mixed" - Mieszana (więcej niż jedna cywilizacja)
     * "unknown" - Nie można określić (domyślnie)

   - **motivation_type** - Typ motywacji:
     * "vital" - Motywacje witalne (przeżycie biologiczne, jedzenie, bezpieczeństwo)
     * "informational" - Motywacje informacyjne (poznanie, wiedza, rozwój)
     * "mixed" - Mieszane
     * Domyślnie: "informational"

2. **RELACJE (Procesy Sterowania)**
   - Identyfikuj KTO steruje KIM
   - Każda relacja MUSI mieć:
     * subject_id - kto steruje (źródło)
     * object_id - kto jest sterowany (cel)
     * process_type - typ sterowania:
       - "energetic" - przepływ energii/zasobów/pieniędzy
       - "informational" - przepływ informacji/wiedzy/propagandy
       - "hybrid" - oba jednocześnie
     * feedback_type - sprzężenie zwrotne:
       - "positive" - wzmacnianie (niestabilność, wzrost)
       - "negative" - tłumienie (stabilność, homeostaza)
       - "neutral" - brak sprzężenia
     * system_class - typ systemu źródłowego:
       - "cognitive" - system poznawczy (nauka, badania, fakty)
       - "ideological" - system ideologiczny (propaganda, doktryna)
       - "ethical" - system etyczny (normy, wartości)
       - "economic" - system gospodarczy (biznes, zysk)
     * influence_strength - siła wpływu (0.0 - 1.0)
     * description - KRÓTKI opis relacji w języku cybernetycznym
     * evidence - cytaty z tekstu potwierdzające relację

   **METACYBERNETYKA 2015: Kategoria normy społecznej**

   - **norm_category** - Jaki typ normy społecznej realizuje ta relacja?
     * "cognitive" - Norma poznawcza:
       - Przekazywanie wiedzy, faktów, nauki
       - Przykłady: nauczanie, publikacja naukowa, szkolenie
     * "ideological" - Norma ideologiczna:
       - Propaganda, doktryna, narracja polityczna
       - Przykłady: kampania wyborcza, indoktrynacja, PR
     * "ethical" - Norma etyczna:
       - Normy moralne, wartości, etyka
       - Przykłady: kodeksy etyczne, sankcje moralne
     * "legal" - Norma prawna:
       - Prawo, regulacje, przepisy
       - Przykłady: ustawy, wyroki sądowe, konstytucja
     * "economic" - Norma ekonomiczna:
       - Przepływ pieniędzy, zasobów, handel
       - Przykłady: transakcje, inwestycje, podatki
     * "vital" - Norma witalna:
       - Przeżycie biologiczne, jedzenie, bezpieczeństwo fizyczne
       - Przykłady: zapewnienie posiłków, ochrona zdrowia
     * Domyślnie: "cognitive"

3. **METADANE**
   - semantic_noise_level (0.0 - 1.0) - poziom "mętności" tekstu:
     * 0.0-0.4 = STATUS: CLEAR - tekst precyzyjny, faktograficzny, bez wartościowania
     * 0.4-0.7 = STATUS: WARNING - tekst zawiera przymiotniki wartościujące, wymaga weryfikacji
     * 0.7-1.0 = STATUS: REJECT - tekst mętny, ideologiczny, manipulacyjny, bełkot
   - signal_status - status sygnału: "CLEAR" | "WARNING" | "REJECT"
   - is_ambiguous - true jeśli noise_level > 0.4 (wymaga weryfikacji użytkownika)
   - warning_message - ostrzeżenie dla Efektora (jeśli is_ambiguous = true)
   - ideological_flags - wykryte flagi ideologiczne (np. "propaganda", "manipulacja")
   - dominant_system_type - dominujący typ systemu w tekście

## ANTI-IDEOLOGY TUNING (KLUCZOWE!)

**Każdy przymiotnik wartościujący bez osadzenia w mierzalnych parametrach mocy i informacji MUSI podnosić semantic_noise_level.**

Przykłady przymiotników wartościujących (CZERWONA FLAGA):
- "sprawiedliwy", "niesprawiedliwy"
- "dobry", "zły", "słuszny", "błędny"
- "postępowy", "reakcyjny", "nowoczesny", "przestarzały"
- "demokratyczny", "autorytarny" (bez definicji operacyjnej)
- "wolny", "zniewolony" (bez kontekstu energetycznego)

**Skup się na twardych relacjach:**
- KTO (system) -> CO ROBI (proces) -> NA KOGO (obiekt) -> JAKIM KOSZTEM (energia)

Jeśli tekst zawiera więcej ocen niż faktów, ustaw:
- semantic_noise_level >= 0.6
- signal_status = "WARNING" lub "REJECT"
- is_ambiguous = true
- warning_message = "Wykryto wysokie nasycenie terminologią ocenną/ideologiczną. Wymagana weryfikacja przez użytkownika."

## ZAKAZY

- NIE streszczaj tekstu
- NIE interpretuj "co autor miał na myśli"
- NIE dodawaj wiedzy spoza tekstu
- NIE używaj pustosłowia ("może", "prawdopodobnie", "wydaje się")

## FORMAT ODPOWIEDZI

Zwróć TYLKO valid JSON zgodny ze schematem:

{
  "objects": [
    {
      "id": "obj_1",
      "label": "Nazwa obiektu",
      "type": "autonomous_system|heteronomous_system|environment|tool",
      "description": "Krótki opis",
      "estimated_energy": 0.5,
      "power_v": 100.0,
      "quality_a": 0.7,
      "mass_c": 50.0,
      "civilization_code": "latin|byzantine|turandot|mixed|unknown",
      "motivation_type": "vital|informational|mixed"
    }
  ],
  "relations": [
    {
      "subject_id": "obj_1",
      "object_id": "obj_2",
      "process_type": "energetic|informational|hybrid",
      "feedback_type": "positive|negative|neutral",
      "system_class": "cognitive|ideological|ethical|economic",
      "influence_strength": 0.8,
      "description": "X steruje Y poprzez...",
      "evidence": ["cytat z tekstu"],
      "norm_category": "cognitive|ideological|ethical|legal|economic|vital"
    }
  ],
  "metadata": {
    "semantic_noise_level": 0.3,
    "signal_status": "CLEAR",
    "is_ambiguous": false,
    "warning_message": null,
    "ideological_flags": [],
    "dominant_system_type": "cognitive",
    "raw_context": "oryginalny tekst",
    "object_count": 2,
    "relation_count": 1
  }
}

PAMIĘTAJ: Twoim celem jest MAPOWANIE RELACJI STEROWNICZYCH, nie streszczanie treści.
`;

// ============================================================================
// KLASA EXTRACTOR SERVICE
// ============================================================================

/**
 * @cybernetic Modele AI z priorytetami (fallback chain)
 * Zgodnie z zasadą homeostazy: system nie może dopuścić do przerwania
 * procesu sterowania z powodu braku zewnętrznego zasilania informacyjnego
 */
const AI_MODELS = [
  'anthropic/claude-3.5-sonnet',      // Priorytet 1: Najwyższa jakość
  'openai/gpt-4o',                     // Priorytet 2: Fallback 1
  'google/gemini-flash-1.5',           // Priorytet 3: Fallback 2 (szybki, tani)
] as const;

/**
 * @cybernetic Klasa odpowiedzialna za ekstrakcję obiektów i relacji z tekstu
 */
export class ReceptorExtractorService {
  private client: OpenAI;
  private primaryModel: string;
  private fallbackModels: string[];
  
  constructor() {
    this.client = createAIClient();
    
    // W Node.js używamy process.env, w Astro używamy import.meta.env
    const configuredModel = 
      typeof process !== 'undefined' && process.env.AI_MODEL
        ? process.env.AI_MODEL
        : (typeof import.meta !== 'undefined' && import.meta.env?.AI_MODEL) || undefined;
    
    if (configuredModel) {
      // Użytkownik wybrał konkretny model
      this.primaryModel = configuredModel;
      this.fallbackModels = AI_MODELS.filter(m => m !== configuredModel);
    } else {
      // Domyślna kolejność fallback
      this.primaryModel = AI_MODELS[0];
      this.fallbackModels = AI_MODELS.slice(1);
    }
  }
  
  /**
   * @cybernetic Główna metoda transformacji bodźca na sygnał
   * 
   * Proces:
   * 1. Walidacja długości tekstu (nie może być pusty, nie może być za długi)
   * 2. Wywołanie AI z promptem systemowym
   * 3. Parse JSON response
   * 4. Walidacja przez Zod
   * 5. Sprawdzenie integralności referencyjnej
   * 6. Zwrócenie CyberneticInput lub błąd SEMANTIC_NOISE
   */
  async transformSignal(rawText: string): Promise<CyberneticInput | SemanticNoiseError> {
    // Walidacja wejścia
    if (!rawText || rawText.trim().length === 0) {
      return {
        error_type: 'SEMANTIC_NOISE',
        message: 'Tekst wejściowy jest pusty',
        noise_level: 1.0,
        suggestions: ['Podaj tekst do analizy'],
      };
    }
    
    if (rawText.length > 50000) {
      return {
        error_type: 'SEMANTIC_NOISE',
        message: 'Tekst jest zbyt długi (max 50000 znaków)',
        noise_level: 0.8,
        suggestions: ['Podziel tekst na mniejsze fragmenty'],
      };
    }
    
    try {
      console.log('[RECEPTOR] Rozpoczynam transformację sygnału...');
      console.log(`[RECEPTOR] Model główny: ${this.primaryModel}`);
      console.log(`[RECEPTOR] Modele fallback: ${this.fallbackModels.join(', ')}`);
      console.log(`[RECEPTOR] Długość tekstu: ${rawText.length} znaków`);
      
      // Wywołanie AI z mechanizmem fallback
      const response = await this.callAIWithFallback(rawText);
      
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('AI nie zwróciło odpowiedzi');
      }
      
      console.log('[RECEPTOR] Otrzymano odpowiedź od AI');
      
      // Parse JSON
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(content);
      } catch (parseError) {
        console.error('[RECEPTOR] Błąd parsowania JSON:', parseError);
        return {
          error_type: 'SEMANTIC_NOISE',
          message: 'AI zwróciło niepoprawny JSON',
          noise_level: 0.9,
          suggestions: ['Spróbuj uprościć tekst wejściowy'],
        };
      }
      
      // Walidacja przez Zod
      const validationResult = CyberneticInputSchema.safeParse(parsedData);
      
      if (!validationResult.success) {
        console.error('[RECEPTOR] Błąd walidacji Zod:', validationResult.error);
        return {
          error_type: 'SEMANTIC_NOISE',
          message: `Błąd walidacji struktury: ${validationResult.error.message}`,
          noise_level: 0.85,
          suggestions: ['AI nie zastosowało się do schematu - spróbuj ponownie'],
        };
      }
      
      const cyberneticInput = validationResult.data;
      
      // Walidacja integralności
      const integrityCheck = validateCyberneticInput(cyberneticInput);
      
      if (!integrityCheck.valid) {
        console.error('[RECEPTOR] Błędy integralności:', integrityCheck.errors);
        return {
          error_type: 'SEMANTIC_NOISE',
          message: `Błędy integralności: ${integrityCheck.errors.join(', ')}`,
          noise_level: 0.8,
          suggestions: ['Wykryto niespójności w danych - wymagana ponowna analiza'],
        };
      }
      
      console.log('[RECEPTOR] ✓ Transformacja zakończona pomyślnie');
      console.log(`[RECEPTOR] Wyekstrahowano: ${cyberneticInput.objects.length} obiektów, ${cyberneticInput.relations.length} relacji`);
      
      return cyberneticInput;
      
    } catch (error) {
      console.error('[RECEPTOR] Błąd podczas transformacji:', error);
      
      return {
        error_type: 'SEMANTIC_NOISE',
        message: `Błąd techniczny: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
        noise_level: 1.0,
        suggestions: ['Sprawdź konfigurację API', 'Sprawdź połączenie internetowe'],
      };
    }
  }
  
  /**
   * @cybernetic Mechanizm fallback - homeostaza systemu
   * Jeśli główny model zawiedzie, próbuje alternatywnych modeli
   * Zapobiega przerwaniu procesu sterowania z powodu awarii API
   */
  private async callAIWithFallback(rawText: string): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const modelsToTry = [this.primaryModel, ...this.fallbackModels];
    let lastError: Error | null = null;
    
    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      
      try {
        console.log(`[RECEPTOR] Próba ${i + 1}/${modelsToTry.length}: Model ${model}`);
        
        const response = await this.client.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: `Przeanalizuj następujący tekst i wyekstrahuj obiekty oraz relacje sterownicze:\n\n${rawText}`,
            },
          ],
          temperature: 0.1, // Niska temperatura - precyzja zamiast kreatywności
          response_format: { type: 'json_object' },
        });
        
        console.log(`[RECEPTOR] ✓ Sukces z modelem: ${model}`);
        return response;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[RECEPTOR] ✗ Błąd z modelem ${model}:`, lastError.message);
        
        // Jeśli to nie był ostatni model, kontynuuj
        if (i < modelsToTry.length - 1) {
          console.log(`[RECEPTOR] Przełączam na fallback model...`);
          continue;
        }
      }
    }
    
    // Wszystkie modele zawiodły
    throw new Error(
      `Wszystkie modele AI zawiodły. Ostatni błąd: ${lastError?.message || 'Nieznany błąd'}`
    );
  }
  
  /**
   * @cybernetic Metoda pomocnicza do testowania połączenia z API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.primaryModel,
        messages: [
          { role: 'user', content: 'Test connection. Respond with: OK' },
        ],
        max_tokens: 10,
      });
      
      return response.choices[0]?.message?.content?.includes('OK') ?? false;
    } catch (error) {
      console.error('[RECEPTOR] Błąd połączenia:', error);
      return false;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * @cybernetic Singleton instancja Extractor Service
 * Unika wielokrotnego tworzenia klienta OpenAI
 */
let extractorInstance: ReceptorExtractorService | null = null;

export function getReceptorExtractor(): ReceptorExtractorService {
  if (!extractorInstance) {
    extractorInstance = new ReceptorExtractorService();
  }
  return extractorInstance;
}

