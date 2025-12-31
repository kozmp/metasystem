/**
 * @fileoverview API Endpoint - Zarządzanie celami zwiadu
 * @cybernetic CRUD dla recon_targets
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase/client';

// GET - Pobierz wszystkie cele zwiadu
export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabase
      .from('recon_targets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[API /recon/targets GET] Błąd:', error);
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

// POST - Dodaj nowy cel zwiadu
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { url, name, target_type, category, reliability_bias, scan_interval_minutes, enabled } = body;
    
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
    
    const { data, error } = await supabase
      .from('recon_targets')
      .insert({
        url,
        name: name || null,
        target_type: target_type || 'webpage',
        category: category || 'other',
        reliability_bias: reliability_bias || 0.5,
        scan_interval_minutes: scan_interval_minutes || 60,
        enabled: enabled !== undefined ? enabled : true,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return new Response(JSON.stringify({ success: true, data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[API /recon/targets POST] Błąd:', error);
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

// PUT - Aktualizuj cel zwiadu
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Wymagany parametr: id',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    const { data, error } = await supabase
      .from('recon_targets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[API /recon/targets PUT] Błąd:', error);
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

// DELETE - Usuń cel zwiadu
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Wymagany parametr: id',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    const { error } = await supabase
      .from('recon_targets')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[API /recon/targets DELETE] Błąd:', error);
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

