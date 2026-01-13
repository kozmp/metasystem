/**
 * @fileoverview API Endpoint - Przetwarzanie sygnału przez Receptor
 * @cybernetic Receptor -> Korelator -> Homeostat Pipeline
 * 
 * ROZSZERZONO: Integracja z Homeostat Security Layer
 */

import type { APIRoute } from 'astro';
import { processAndStoreSignal } from '../../../lib/cybernetics/korelator/store';
import { validateOperation } from '../../../lib/cybernetics/homeostat/security-layer';
import { logSecurityDecision } from '../../../lib/cybernetics/homeostat/audit-logger';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parsowanie JSON z body
    const body = await request.json();
    const { text, model } = body;

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

    // ✅ HOMEOSTAT SECURITY CHECK - Walidacja przed przetworzeniem
    const securityCheck = validateOperation({
      type: 'api_call',
      payload: text,
      metadata: { model, endpoint: 'receptor/process' },
    });

    // Loguj decyzję bezpieczeństwa
    await logSecurityDecision(securityCheck, {
      type: 'api_call',
      payload: text.substring(0, 200), // Ogranicz długość dla logu
    });

    // Jeśli zablokowano
    if (securityCheck.action === 'block') {
      console.warn(`[API] 🛡️ SECURITY BLOCK: ${securityCheck.reason}`);
      
      return new Response(
        JSON.stringify({
          success: false,
          objects_created: 0,
          relations_created: 0,
          error: 'SECURITY_VIOLATION',
          reason: securityCheck.reason,
          severity: securityCheck.severity,
        }),
        {
          status: 403, // Forbidden
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Jeśli wymaga potwierdzenia użytkownika
    if (securityCheck.action === 'ask_user') {
      console.warn(`[API] ⚠️ SECURITY CONFIRMATION REQUIRED: ${securityCheck.message}`);
      
      return new Response(
        JSON.stringify({
          success: false,
          requires_confirmation: true,
          message: securityCheck.message,
          context: securityCheck.context,
          severity: securityCheck.severity,
        }),
        {
          status: 202, // Accepted, but requires action
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Przetwarzanie przez Korelator (jeśli security check passed)
    console.log(`[API] ✓ Security check passed. Rozpoczynam przetwarzanie sygnału (model: ${model || 'default'})...`);
    const result = await processAndStoreSignal(text, model);

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

