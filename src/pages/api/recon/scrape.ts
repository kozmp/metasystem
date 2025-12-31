/**
 * @fileoverview API Endpoint - Scraping pojedynczego URL
 * @cybernetic Efektor → Receptor → Korelator (pełny cykl)
 */

import type { APIRoute } from 'astro';
import { scrapeAndProcess } from '../../../lib/cybernetics/receptor/scraper';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Wymagany parametr: url (string)',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log(`[API /recon/scrape] Rozpoczynam scraping: ${url}`);
    
    const result = await scrapeAndProcess(url);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[API /recon/scrape] Błąd:', error);
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

