/**
 * @fileoverview API Endpoint - Symulacja sterowania
 * @cybernetic POST /api/decisions/simulate
 */

import type { APIRoute } from 'astro';
import { simulateSteering } from '../../../lib/cybernetics/decisions/pathfinder';

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
    
    if (goal !== 'strengthen' && goal !== 'weaken') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'goal musi być "strengthen" lub "weaken"',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log(`[API /decisions/simulate] Symulacja dla ${target_object_id}, goal: ${goal}`);
    
    const result = await simulateSteering(target_object_id, goal);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[API /decisions/simulate] Błąd:', error);
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

