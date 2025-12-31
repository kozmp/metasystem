/**
 * @fileoverview API Endpoint - Generowanie strategii AI
 * @cybernetic POST /api/decisions/strategy
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase/client';
import { simulateSteering } from '../../../lib/cybernetics/decisions/pathfinder';
import { generateAIStrategy } from '../../../lib/cybernetics/decisions/ai-strategy';
import type { AIStrategyContext } from '../../../lib/cybernetics/decisions/types';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { target_object_id, goal } = body;
    
    if (!target_object_id || !goal) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Wymagane parametry: target_object_id, goal',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log(`[API /decisions/strategy] Generuję strategię dla ${target_object_id}`);
    
    // Pobierz obiekt docelowy
    const { data: targetObject, error: objError } = await supabase
      .from('cybernetic_objects')
      .select('*')
      .eq('id', target_object_id)
      .single();
    
    if (objError || !targetObject) {
      throw new Error('Obiekt nie istnieje');
    }
    
    // Uruchom symulację
    const simulation = await simulateSteering(target_object_id, goal);
    
    // Pobierz statystyki systemu
    const { count: totalObjects } = await supabase
      .from('cybernetic_objects')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalRelations } = await supabase
      .from('correlations')
      .select('*', { count: 'exact', head: true });
    
    const { data: avgCertaintyData } = await supabase
      .from('correlations')
      .select('certainty_score');
    
    const avgCertainty = avgCertaintyData && avgCertaintyData.length > 0
      ? avgCertaintyData.reduce((sum, r) => sum + r.certainty_score, 0) / avgCertaintyData.length
      : 0;
    
    // Przygotuj kontekst dla AI
    const context: AIStrategyContext = {
      target_object: targetObject,
      goal,
      influential_nodes: simulation.influential_nodes,
      current_system_state: {
        total_objects: totalObjects || 0,
        total_relations: totalRelations || 0,
        average_certainty: avgCertainty,
      },
    };
    
    // Generuj strategię
    const strategy = await generateAIStrategy(context);
    
    return new Response(
      JSON.stringify({
        success: true,
        strategy,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    console.error('[API /decisions/strategy] Błąd:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

