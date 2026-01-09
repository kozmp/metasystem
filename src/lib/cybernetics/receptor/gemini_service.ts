/**
 * @fileoverview GEMINI RECEPTOR SERVICE
 * @cybernetic Receptor multimodalny zgodny z Metacybernetyką 2015
 * 
 * FUNKCJA: Analiza wideo (YouTube) przez Gemini 1.5 Pro pod kątem:
 * - Parametrów mocy (v, a, c) według P = v × a × c
 * - Klasyfikacji cywilizacyjnej (Latin/Byzantine/Turandot)
 * - Zniekształceń informacyjnych Z = I_in / I_real
 * - Symboliki ideologicznej (system sterowania)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// ============================================================================
// METAPROMPT 2015 - AKSJOMATYKA KOSSECKIEGO
// ============================================================================

/**
 * @cybernetic METAPROMPT oparty na 8 aksjomatach teorii poznania
 * 
 * Źródło: "Metacybernetyka 2015" - doc. Józef Kossecki
 * 
 * AKSJOMAT 1: Obiekt NIE jest zbiorem cech statycznych
 * AKSJOMAT 2: Obiekt = węzeł w sieci relacji sterowniczych
 * AKSJOMAT 3: Informacja = różnica potencjałów w homeostacie
 * AKSJOMAT 4: Moc systemowa P = v × a × c (NOT v + a + c!)
 * AKSJOMAT 5: Każdy system ma dominujący system sterowania (Poznawczy/Ideologiczny/Etyczny/Gospodarczy)
 * AKSJOMAT 6: Sprzężenie zwrotne determinuje stabilność
 * AKSJOMAT 7: Retencja (pamięć) poprzez korelacje, nie przez atrybuty
 * AKSJOMAT 8: Zniekształcenie Z = I_input / I_real (jeśli Z > 1 → propaganda)
 */
const METAPROMPT_2015 = `
Jesteś ekspertem Metacybernetyki (Józef Kossecki, 2015). Analizujesz materiały wideo zgodnie z RYGOREM NAUKOWYM.

## PARAMETRY OBOWIĄZKOWE DO ZWRÓCENIA:

### 1. MOC SYSTEMOWA (P = v × a × c):
- **power_v** (float): Moc jednostkowa [W] - ENERGIA na jednostkę czasu
  Przykład: przemówienie polityczne (10^3 W), film dokumentalny (10^2 W), propaganda (10^6 W)
  
- **quality_a** (float 0-1): Jakość/sprawność informacji
  1.0 = obiektywne fakty, weryfikowalne dane
  0.5 = mieszane (fakty + opinie)
  0.1 = silnie ideologiczne, emocjonalne

- **mass_c** (float): Ilość/zasięg odbiorców
  Jednostka: ln(liczba_wyświetleń + 1) lub estymacja

### 2. KLASYFIKACJA CYWILIZACYJNA:
- **civilization_code** (enum): 'latin' | 'byzantine' | 'turandot' | 'mixed'
  - **latin**: Prawo ponad władzą, system poznawczy dominuje
  - **byzantine**: Władza ponad prawem, system ideologiczny/etyczny
  - **turandot**: Gospodarczo-ideologiczny, utylitaryzm
  
### 3. SYSTEM STEROWANIA ŹRÓDŁA:
- **control_system_type** (enum): 'cognitive' | 'ideological' | 'ethical' | 'economic'
  - **cognitive**: Faktografia, logika, sprawdzalność
  - **ideological**: Przekonania, dogmaty, narracja
  - **ethical**: Normy moralne, społeczne
  - **economic**: Korzyści materialne, handel

### 4. ZNIEKSZTAŁCENIE INFORMACYJNE:
- **distortion_z** (float): Z = I_in / I_real
  Z < 1.0: Tłumienie informacji
  Z ≈ 1.0: Transmisja neutralna
  Z > 1.5: ⚠️ OSTRZEŻENIE PROPAGANDA - wzmocnienie ideologiczne

### 5. ANALIZA WIZUALNA:
- **visual_symbols** (string[]): Lista symboli cywilizacyjnych w wideo
  Przykłady: flagi, godła, kolory (czerwony=ideologia), uniformy, architektura

## WYMAGANY FORMAT WYJŚCIOWY (JSON):
{
  "power_v": <float>,
  "quality_a": <float>,
  "mass_c": <float>,
  "civilization_code": "<latin|byzantine|turandot|mixed>",
  "control_system_type": "<cognitive|ideological|ethical|economic>",
  "distortion_z": <float>,
  "visual_symbols": ["<symbol1>", "<symbol2>", ...],
  "reasoning": "<krótkie uzasadnienie analizy>",
  "commercial_intent": <true|false>,  // CZY WYKRYTO REKLAMĘ?
  "manipulation_techniques": ["<technique1>", "<technique2>", ...]  // Opcjonalne
}

## ZASADY KRYTYCZNEJ OCENY:
1. NIE przyjmuj informacji "na słowo" - szukaj sprzeczności
2. Oddziel FAKTY (weryfikowalne) od OPINII (subiektywne)
3. Oznacz źródła ideologiczne flagą LOW quality_a
4. Uwzględnij KONTEKST cywilizacyjny (kto mówi, w jakim systemie)
5. Jeśli Z > 1.5 → dodaj explicit warning w "reasoning"

## ⚠️ WYKRYWANIE REKLAM I UKRYTEJ MANIPULACJI:

### CZERWONE FLAGI (automatyczne obniżenie quality_a + podwyższenie distortion_z):

#### A) PRODUCT PLACEMENT / REKLAMA UKRYTA:
- Widoczne produkty, logotypy, marki w tle (nawet "przypadkowe")
- Linki afiliacyjne w opisie / "kod rabatowy"
- Wymienienie konkretnych marek bez kontekstu edukacyjnego
- Disclaimer "sponsorowane" / "współpraca reklamowa"
→ Ustaw control_system_type = 'economic', quality_a ≤ 0.3, Z ≥ 2.0

#### B) MANIPULACJA EMOCJONALNA:
- Język perswazji zamiast faktografii
- Techniki "strachu" (fear mongering) lub "nadziei" (hope selling)
- Brak źródeł / odniesień do badań naukowych
- Selektywne pomijanie faktów (cherry picking)
→ Obniż quality_a o 0.3-0.5, podnieś Z proporcjonalnie

#### C) PSEUDO-NAUKOWY TON:
- "Naukowcy odkryli" (bez podania konkretnych źródeł)
- "Tajemnica, której lekarze nie chcą ujawnić"
- Fake authority (osoba w fartuchu, ale nie ekspert)
- Anegdotyczne dowody zamiast danych empirycznych
→ quality_a ≤ 0.2, Z ≥ 2.5, dodaj ostrzeżenie w reasoning

#### D) TECHNIKI SOCIAL PROOF:
- "10 milionów ludzi już kupiło"
- Testimoniale bez weryfikacji
- Presja czasowa ("tylko dzisiaj", "ostatnie sztuki")
→ control_system_type = 'economic', Z ≥ 2.0

### PRZYKŁAD ANALIZY FILMU Z REKLAMĄ:

**Film:** "Jak schudnąć naturalnie" (ale ukryta reklama suplementu)

WYNIK:
{
  "power_v": 30000.0,
  "quality_a": 0.15,
  "mass_c": 11.8,
  "civilization_code": "turandot",
  "control_system_type": "economic",
  "distortion_z": 3.5,
  "visual_symbols": [
    "supplement bottle (product placement)",
    "affiliate link visible",
    "fake doctor testimonial"
  ],
  "reasoning": "WYKRYTO UKRYTĄ REKLAMĘ: Film pozoruje edukację o zdrowiu, ale faktycznie jest reklamą suplementu. Czerwone flagi: 1) Product placement (butelka w tle przez cały film) 2) Brak źródeł naukowych 3) Link afiliacyjny w opisie 4) Pseudo-naukowy język 5) Emocjonalna perswazja zamiast faktów → Z=3.5 (ekstremalne zniekształcenie) → MANIPULACJA KOMERCYJNA"
}
`;

// ============================================================================
// SCHEMATY WALIDACJI (ZOD)
// ============================================================================

const CivilizationCodeSchema = z.enum(['latin', 'byzantine', 'turandot', 'mixed', 'unknown']);
const ControlSystemTypeSchema = z.enum(['cognitive', 'ideological', 'ethical', 'economic']);

/**
 * @cybernetic Schemat wyjściowy Gemini - zgodny z aksjomatyką 2015
 */
const GeminiOutputSchema = z.object({
  power_v: z.number().positive().describe('Moc jednostkowa [W]'),
  quality_a: z.number().min(0).max(1).describe('Jakość/sprawność (0-1)'),
  mass_c: z.number().nonnegative().describe('Ilość/zasięg'),
  civilization_code: CivilizationCodeSchema,
  control_system_type: ControlSystemTypeSchema,
  distortion_z: z.number().positive().describe('Zniekształcenie Z = I_in / I_real'),
  visual_symbols: z.array(z.string()).describe('Symbole cywilizacyjne w wideo'),
  reasoning: z.string().describe('Uzasadnienie analizy'),
  
  // Opcjonalne: flaga reklamy (jeśli wykryto)
  commercial_intent: z.boolean().optional().describe('Czy wykryto intencję komercyjną/reklamę'),
  manipulation_techniques: z.array(z.string()).optional().describe('Wykryte techniki manipulacji'),
});

export type GeminiVideoAnalysis = z.infer<typeof GeminiOutputSchema>;

// ============================================================================
// KONFIGURACJA GEMINI
// ============================================================================

let genAI: GoogleGenerativeAI | null = null;

/**
 * @cybernetic Inicjalizacja Gemini API
 */
function initGemini(): GoogleGenerativeAI {
  if (genAI) return genAI;

  // Obsługa obu nazw zmiennych: GEMINI_API_KEY i GOOGLE_GENAI_API_KEY
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    process.env.GOOGLE_GENAI_API_KEY ||
    import.meta.env?.GEMINI_API_KEY ||
    import.meta.env?.GOOGLE_GENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('[GEMINI RECEPTOR] GEMINI_API_KEY or GOOGLE_GENAI_API_KEY not found in environment');
  }

  genAI = new GoogleGenerativeAI(apiKey);
  console.log('[GEMINI RECEPTOR] ✓ Initialized');
  
  return genAI;
}

// ============================================================================
// FUNKCJA GŁÓWNA: processVideo()
// ============================================================================

/**
 * @cybernetic Receptor Multimodalny - Analiza TEKSTU z wideo przez Gemini
 * 
 * @param youtubeUrl - URL wideo YouTube do analizy
 * @param transcriptText - OPCJONALNY: Gotowa transkrypcja (jeśli już pobrana)
 * @returns Sformalizowany obiekt zgodny z Metacybernetyką 2015
 * 
 * NOWOŚĆ: System najpierw pobiera TRANSKRYPCJĘ (tekst), potem analizuje TREŚĆ (nie obraz!)
 * Zgodnie z Kosseckim: Analiza INFORMACJI (semantyki), nie FORMY (wizualizacji)
 */
export async function processVideo(
  youtubeUrl: string, 
  transcriptText?: string
): Promise<GeminiVideoAnalysis> {
  console.log(`[GEMINI RECEPTOR] Processing video: ${youtubeUrl}`);

  // Walidacja URL
  if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
    throw new Error('[GEMINI RECEPTOR] Invalid YouTube URL');
  }

  const ai = initGemini();
  
  // Gemini 2.5 Flash - najnowszy model multimodalny (wideo, obrazy, tekst)
  // Alternatywnie: 'models/gemini-2.5-pro' (bardziej zaawansowany)
  const model = ai.getGenerativeModel({ 
    model: 'models/gemini-2.5-flash', 
    generationConfig: {
      temperature: 0.2, // Niska temperatura → deterministyczna analiza
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096, // Zwiększona długość dla pełnego JSON
      // responseMimeType: 'application/json', // Nie wszystkie modele wspierają
    },
  });

  try {
    // ⚠️ KRYTYCZNE: Gemini NIE MOŻE analizować YouTube URL bezpośrednio!
    // ZAWSZE wymagamy transkrypcji - inaczej AI hallucynuje treść!
    
    if (!transcriptText) {
      throw new Error(
        '[GEMINI RECEPTOR] ❌ BRAK TRANSKRYPCJI! ' +
        'Gemini nie może analizować YouTube URL bezpośrednio. ' +
        'Użyj najpierw extractTranscript() lub wywołaj analyzeVideoSmart().'
      );
    }

    console.log(`[GEMINI RECEPTOR] ✅ Using transcript (${transcriptText.length} chars, ${transcriptText.split(' ').length} words)`);
    
    const contentToAnalyze = `TRANSKRYPCJA WIDEO Z YOUTUBE:
URL: ${youtubeUrl}

--- POCZĄTEK TRANSKRYPCJI ---
${transcriptText}
--- KONIEC TRANSKRYPCJI ---

UWAGA: To jest FAKTYCZNA transkrypcja audio z filmu. Analizuj TYLKO to co jest powiedziane w tym tekście. NIE WYMYŚLAJ treści, której tu nie ma!`;

    // Prompt: METAPROMPT + treść
    const prompt = `${METAPROMPT_2015}

${contentToAnalyze}

Przeprowadź pełną analizę zgodnie z Metacybernetyką 2015. Zwróć WYŁĄCZNIE JSON bez dodatkowych komentarzy.`;

    console.log('[GEMINI RECEPTOR] Sending request to Gemini 2.5 Flash...');
    
    const startTime = performance.now();
    
    const result = await model.generateContent([
      {
        text: prompt,
      },
    ]);

    const endTime = performance.now();
    console.log(`[GEMINI RECEPTOR] ✓ Response received in ${(endTime - startTime).toFixed(2)}ms`);

    const response = await result.response;
    let rawText = response.text();

    console.log('[GEMINI RECEPTOR] Raw response:', rawText.substring(0, 500) + (rawText.length > 500 ? '...' : ''));

    // Wyczyść odpowiedź z markdown code blocks jeśli są
    rawText = rawText.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    // Parse JSON
    let parsedOutput: unknown;
    try {
      parsedOutput = JSON.parse(rawText);
    } catch (parseError) {
      console.error('[GEMINI RECEPTOR] ✗ JSON parsing failed:', parseError);
      throw new Error(`Invalid JSON from Gemini: ${rawText.substring(0, 500)}`);
    }

    // Walidacja przez Zod (Receptor Layer!)
    const validated = GeminiOutputSchema.parse(parsedOutput);

    // Sprawdzenie FLAGI PROPAGANDY (zgodnie z AKSJOMAT 8)
    if (validated.distortion_z > 1.5) {
      console.warn(`[GEMINI RECEPTOR] ⚠️ HIGH PROPAGANDA RISK: Z = ${validated.distortion_z.toFixed(2)}`);
      console.warn(`[GEMINI RECEPTOR] Reasoning: ${validated.reasoning}`);
    }

    return validated;
    
  } catch (error: unknown) {
    console.error('[GEMINI RECEPTOR] ✗ Error:', error);
    
    if (error instanceof Error) {
      throw new Error(`[GEMINI RECEPTOR] Failed: ${error.message}`);
    }
    
    throw new Error('[GEMINI RECEPTOR] Unknown error occurred');
  }
}

// ============================================================================
// FUNKCJA: analyzeText() - Prosta analiza tekstu
// ============================================================================

/**
 * @cybernetic Analiza CZYSTEGO TEKSTU (bez YouTube/wideo)
 * 
 * Użyj gdy masz już gotowy tekst:
 * - Skopiowany z artykułu
 * - Z transkrypcji zewnętrznej
 * - Z dokumentu
 * - Dowolny tekst do analizy
 * 
 * @param text - Tekst do analizy
 * @param sourceUrl - Opcjonalnie: URL źródła (dla kontekstu)
 * @returns Analiza cybernetyczna tekstu
 */
export async function analyzeText(
  text: string,
  sourceUrl?: string
): Promise<GeminiVideoAnalysis> {
  console.log(`[GEMINI RECEPTOR] Analyzing raw text (${text.length} chars)`);

  if (!text || text.trim().length === 0) {
    throw new Error('[GEMINI RECEPTOR] ❌ Text cannot be empty!');
  }

  const ai = initGemini();
  const model = ai.getGenerativeModel({ 
    model: 'models/gemini-2.5-flash', 
    generationConfig: {
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  });

  try {
    const contentToAnalyze = `TEKST DO ANALIZY:
${sourceUrl ? `Źródło: ${sourceUrl}\n\n` : ''}
--- POCZĄTEK TEKSTU ---
${text}
--- KONIEC TEKSTU ---

UWAGA: To jest FAKTYCZNY tekst do przeanalizowania. Analizuj TYLKO to co jest w tym tekście. NIE WYMYŚLAJ treści, której tu nie ma!`;

    const prompt = `${METAPROMPT_2015}

${contentToAnalyze}

Przeprowadź pełną analizę zgodnie z Metacybernetyką 2015. Zwróć WYŁĄCZNIE JSON bez dodatkowych komentarzy.`;

    console.log('[GEMINI RECEPTOR] Sending to Gemini 2.5 Flash...');
    
    const startTime = performance.now();
    const result = await model.generateContent([{ text: prompt }]);
    const endTime = performance.now();
    
    console.log(`[GEMINI RECEPTOR] ✓ Response received in ${(endTime - startTime).toFixed(2)}ms`);

    const response = await result.response;
    let rawText = response.text();
    rawText = rawText.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    const parsedOutput = JSON.parse(rawText);
    const validated = GeminiOutputSchema.parse(parsedOutput);

    if (validated.distortion_z > 1.5) {
      console.warn(`[GEMINI RECEPTOR] ⚠️ HIGH PROPAGANDA RISK: Z = ${validated.distortion_z.toFixed(2)}`);
      console.warn(`[GEMINI RECEPTOR] Reasoning: ${validated.reasoning}`);
    }

    return {
      ...validated,
      source_url: sourceUrl || 'direct_text_input',
    };
    
  } catch (error: unknown) {
    console.error('[GEMINI RECEPTOR] ✗ Error:', error);
    
    if (error instanceof Error) {
      throw new Error(`[GEMINI RECEPTOR] Failed: ${error.message}`);
    }
    
    throw new Error('[GEMINI RECEPTOR] Unknown error occurred');
  }
}

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * @cybernetic Oblicza całkowitą moc systemową P = v × a × c
 */
export function calculateTotalPower(
  power_v: number,
  quality_a: number,
  mass_c: number
): number {
  const P = power_v * quality_a * mass_c;
  
  console.log(`[POWER CALC] v=${power_v}, a=${quality_a}, c=${mass_c} → P=${P.toFixed(2)} W`);
  
  return P;
}

/**
 * @cybernetic Sprawdza czy źródło wymaga ostrzeżenia o propagandzie
 */
export function isPropagandaRisk(distortion_z: number): boolean {
  return distortion_z > 1.5;
}

/**
 * @cybernetic Export główny
 */
export default {
  processVideo,
  calculateTotalPower,
  isPropagandaRisk,
  METAPROMPT_2015, // Dla celów testowych/dokumentacji
};

