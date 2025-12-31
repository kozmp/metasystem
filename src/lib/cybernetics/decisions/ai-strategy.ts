/**
 * @fileoverview AI Strategy Generator
 * @cybernetic Generowanie strategii sterowania przez AI zgodnie z rygorem Kosseckiego
 */

import OpenAI from 'openai';
import { config } from 'dotenv';
import { resolve } from 'path';
import type { AIStrategyContext, SteeringGoal } from './types';

// Załaduj .env
config({ path: resolve(process.cwd(), '.env') });

// ============================================================================
// KONFIGURACJA AI
// ============================================================================

function createAIClient(): OpenAI {
  const apiKey = 
    typeof process !== 'undefined' && process.env.OPENROUTER_API_KEY
      ? process.env.OPENROUTER_API_KEY
      : (typeof import.meta !== 'undefined' && import.meta.env?.OPENROUTER_API_KEY) || undefined;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY nie jest ustawiony');
  }
  
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://kossecki-metasystem.local',
      'X-Title': 'KOSSECKI METASYSTEM - Decision Module',
    },
  });
}

// ============================================================================
// PROMPT SYSTEMOWY
// ============================================================================

const STRATEGY_SYSTEM_PROMPT = `
Jesteś strategiem cybernetycznym specjalizującym się w teorii sterowania doc. Józefa Kosseckiego.

Twoim zadaniem jest analiza grafu relacji sterowniczych i generowanie PRECYZYJNEJ strategii działania.

## RYGOR KOSSECKIEGO:

1. **Moc Swobodna** - Obiekt może wpływać tylko w granicach swojej mocy swobodnej (available_power)
2. **Sprzężenia Zwrotne** - Positive feedback wzmacnia, negative feedback hamuje
3. **Rzetelność** - Im wyższa certainty_score, tym pewniejsza relacja
4. **Dźwignia Sterownicza** - Leverage = Power × Influence × Certainty

## FORMAT ODPOWIEDZI:

Napisz krótką (2-3 akapity), konkretną strategię:

Akapit 1: **Analiza sytuacji** - jaki jest stan obecny, jakie sprzężenia dominują
Akapit 2: **Rekomendacja główna** - CO KONKRETNIE zrobić i DLACZEGO (oparcie na parametrach cybernetycznych)
Akapit 3: **Ostrzeżenia** - jakie ryzyka, jakie ograniczenia mocy/rzetelności

## ZAKAZY:

- NIE używaj pustosłowia ("może", "prawdopodobnie", "wydaje się")
- NIE dodawaj wiedzy spoza dostarczonego kontekstu
- NIE używaj przymiotników wartościujących bez osadzenia w parametrach
- ZAWSZE odwołuj się do konkretnych liczb (leverage, certainty, power)

Odpowiadaj TYLKO po polsku.
`;

// ============================================================================
// FUNKCJA GENEROWANIA STRATEGII
// ============================================================================

/**
 * @cybernetic Generuje strategię AI na podstawie kontekstu symulacji
 * 
 * @param context - Kontekst symulacji (cel, wpływowe węzły, stan systemu)
 * @returns Strategia w formie tekstu
 */
export async function generateAIStrategy(context: AIStrategyContext): Promise<string> {
  console.log('[AI-STRATEGY] Generuję strategię AI...');
  
  try {
    const client = createAIClient();
    
    // Przygotuj prompt użytkownika
    const userPrompt = buildUserPrompt(context);
    
    console.log('[AI-STRATEGY] Wywołuję AI...');
    const response = await client.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: STRATEGY_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Niska temperatura - precyzja
      max_tokens: 800,
    });
    
    const strategy = response.choices[0]?.message?.content || '';
    
    console.log('[AI-STRATEGY] ✓ Strategia wygenerowana');
    return strategy;
    
  } catch (error) {
    console.error('[AI-STRATEGY] Błąd generowania strategii:', error);
    return generateFallbackStrategy(context);
  }
}

/**
 * @cybernetic Buduje prompt dla AI na podstawie kontekstu
 */
function buildUserPrompt(context: AIStrategyContext): string {
  const { target_object, goal, influential_nodes, current_system_state } = context;
  
  const goalText = goal === 'strengthen' ? 'wzmocnić' : 'osłabić';
  
  // Top 3 węzły wpływowe
  const topNodes = influential_nodes.slice(0, 3);
  const nodesDescription = topNodes.map((node, idx) => {
    return `${idx + 1}. "${node.object_name}"
   - Control Leverage: ${node.control_leverage.toFixed(2)}
   - Available Power: ${node.available_power.toFixed(2)}
   - Influence Strength: ${node.influence_strength.toFixed(2)}
   - Certainty Score: ${node.certainty_score.toFixed(2)}
   - Feedback Multiplier: ${node.feedback_multiplier.toFixed(2)}
   - Liczba ścieżek wpływu: ${node.path_count}`;
  }).join('\n\n');
  
  return `
## CEL STEROWANIA:
${goalText} obiekt: "${target_object.name}"

## PARAMETRY CELU:
- System Class: ${target_object.system_class}
- Control System Type: ${target_object.control_system_type}
- Available Power: ${target_object.energy_params.available_power}
- Working Power: ${target_object.energy_params.working_power}
- Idle Power: ${target_object.energy_params.idle_power}

## TOP 3 WĘZŁY WPŁYWOWE:

${nodesDescription}

## STAN SYSTEMU:
- Łącznie obiektów: ${current_system_state.total_objects}
- Łącznie relacji: ${current_system_state.total_relations}
- Średnia rzetelność: ${current_system_state.average_certainty.toFixed(2)}

## ZADANIE:
Napisz konkretną strategię sterowania zgodnie z zasadami Kosseckiego. Uwzględnij parametry cybernetyczne (leverage, power, certainty) i wyjaśnij mechanizmy sprzężeń zwrotnych.
`;
}

/**
 * @cybernetic Fallback strategia (gdy AI nie działa)
 */
function generateFallbackStrategy(context: AIStrategyContext): string {
  const { target_object, goal, influential_nodes } = context;
  const top = influential_nodes[0];
  
  if (!top) {
    return `
Analiza: Obiekt "${target_object.name}" jest izolowany w grafie relacji. Nie znaleziono ścieżek wpływu.

Rekomendacja: Aby móc ${goal === 'strengthen' ? 'wzmocnić' : 'osłabić'} ten obiekt, należy najpierw zbudować relacje sterownicze z innymi obiektami systemu.

Ostrzeżenia: Brak danych do wygenerowania strategii. System wymaga więcej informacji o relacjach.
`;
  }
  
  const actionVerb = goal === 'strengthen' ? 'wzmocnić' : 'osłabić';
  
  return `
Analiza: Obiekt "${target_object.name}" ma ${influential_nodes.length} węzłów wpływowych. Dominujące sprzężenie: ${top.feedback_multiplier > 1 ? 'dodatnie (wzmacniające)' : 'ujemne (hamujące)'}.

Rekomendacja główna: ${actionVerb} "${top.object_name}", który ma najwyższą dźwignię sterowniczą (${top.control_leverage.toFixed(2)}). Obiekt ten generuje ${top.path_count} ścieżek wpływu z rzetelności ${top.certainty_score.toFixed(2)}.

Ostrzeżenia: ${top.certainty_score < 0.5 ? 'Niska rzetelność relacji - wymagana weryfikacja.' : ''} ${top.available_power < 1.0 ? 'Niska moc swobodna - wpływ może być ograniczony.' : ''}
`.trim();
}

/**
 * @cybernetic Export
 */
export default {
  generateAIStrategy,
};

