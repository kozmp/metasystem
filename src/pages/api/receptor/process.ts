/**
 * @fileoverview API Endpoint - Przetwarzanie sygnału przez Receptor
 * @cybernetic Receptor -> Korelator -> Homeostat Pipeline
 */

import type { APIRoute } from 'astro';
import { processAndStoreSignal } from '../../../lib/cybernetics/korelator/store';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parsowanie JSON z body
    const body = await request.json();
    const { text } = body;

    // Walidacja
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          objects_created: 0,
          relations_created: 0,
          error: 'Brak tekstu do przetworzenia',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Przetwarzanie przez Korelator
    console.log('[API] Rozpoczynam przetwarzanie sygnału...');
    const result = await processAndStoreSignal(text);

    // Zwróć wynik
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[API] Błąd przetwarzania sygnału:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        objects_created: 0,
        relations_created: 0,
        error: error instanceof Error ? error.message : 'Nieznany błąd serwera',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

