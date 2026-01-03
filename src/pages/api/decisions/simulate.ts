/**
 * @fileoverview API Endpoint - Symulacja sterowania
 * @cybernetic POST /api/decisions/simulate
 *
 * UPDATED: Smart loading - Wasm dla dużych grafów, TypeScript dla małych
 */

import type { APIRoute } from 'astro';
import { simulateSteeringOptimized } from '../../../lib/cybernetics/decisions/pathfinder-optimized';

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

    // ⭐ Użyj zoptymalizowanej wersji z smart loading (Wasm/TypeScript)
    const result = await simulateSteeringOptimized(target_object_id, goal);

    // Log użytego engine
    if (result._metadata) {
      console.log(`[API /decisions/simulate] Engine: ${result._metadata.engine.toUpperCase()}`);
      console.log(`[API /decisions/simulate] Reason: ${result._metadata.reason}`);
    }

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

