/**
 * @fileoverview API Endpoint - Sprawdzanie kanałów RSS
 * @cybernetic Autonomiczny zwiad - monitoring RSS feeds
 */

import type { APIRoute } from 'astro';
import { checkFeeds, DEFAULT_RSS_SOURCES } from '../../../lib/cybernetics/receptor/rss-monitor';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { processItems = false, sources } = body;
    
    console.log(`[API /recon/rss-check] Rozpoczynam monitoring RSS`);
    console.log(`[API /recon/rss-check] Process items: ${processItems}`);
    
    const sourcesToCheck = sources || DEFAULT_RSS_SOURCES;
    const result = await checkFeeds(sourcesToCheck, processItems);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[API /recon/rss-check] Błąd:', error);
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

