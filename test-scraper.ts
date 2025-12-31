/**
 * @fileoverview Test Scrapera - Receptor 2.0
 * @cybernetic Testowanie autonomicznego zwiadu
 */

import { scrapeAndProcess, scrapeURL } from './src/lib/cybernetics/receptor/scraper';

async function testScraper() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          RECEPTOR 2.0 - TEST SCRAPERA                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log();
  
  // Test 1: Scraping prostej strony (tylko HTML)
  console.log('[TEST 1] Scraping HTML (bez przetwarzania)...');
  console.log('URL: https://example.com');
  console.log();
  
  try {
    const result1 = await scrapeURL('https://example.com');
    
    console.log('✓ Status:', result1.success ? 'SUCCESS' : 'FAILED');
    console.log('✓ Tytuł:', result1.title);
    console.log('✓ Długość tekstu:', result1.extracted_text_length);
    console.log('✓ URL:', result1.url);
    
    if (result1.success && result1.content) {
      console.log('✓ Pierwsze 200 znaków treści:');
      console.log(result1.content.substring(0, 200));
    }
    
    if (result1.error) {
      console.log('✗ Błąd:', result1.error);
    }
  } catch (error) {
    console.error('✗ Wyjątek:', error);
  }
  
  console.log();
  console.log('─'.repeat(65));
  console.log();
  
  // Test 2: Pełny cykl (Scraping + Receptor + Korelator)
  console.log('[TEST 2] Pełny cykl zwiadu (Scraping + AI + Database)...');
  console.log('URL: https://example.com');
  console.log();
  console.log('⚠ To może potrwać 15-30 sekund (AI processing)...');
  console.log();
  
  try {
    const result2 = await scrapeAndProcess('https://example.com');
    
    console.log('═'.repeat(65));
    console.log('WYNIKI PEŁNEGO CYKLU ZWIADU');
    console.log('═'.repeat(65));
    console.log();
    console.log('✓ Status:', result2.success ? 'SUCCESS' : 'FAILED');
    console.log('✓ URL:', result2.url);
    console.log('✓ Tytuł:', result2.title);
    console.log('✓ Długość tekstu:', result2.extracted_text_length, 'znaków');
    console.log();
    console.log('--- METRYKI RECEPTORA ---');
    console.log('✓ Utworzono obiektów:', result2.objects_created);
    console.log('✓ Utworzono relacji:', result2.relations_created);
    console.log('✓ Certainty Score:', result2.certainty_score?.toFixed(2));
    console.log('✓ Raw Signal ID:', result2.raw_signal_id);
    console.log();
    
    if (result2.metadata) {
      console.log('--- METADANE ŹRÓDŁA ---');
      console.log('✓ Autor:', result2.metadata.author || 'brak');
      console.log('✓ Data publikacji:', result2.metadata.published_date || 'brak');
      console.log('✓ Opis:', result2.metadata.description || 'brak');
      console.log();
    }
    
    if (result2.error) {
      console.log('✗ Błąd:', result2.error);
    }
    
    console.log('═'.repeat(65));
    
  } catch (error) {
    console.error('✗ Wyjątek:', error);
  }
  
  console.log();
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          TESTY ZAKOŃCZONE                                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
}

// Uruchom testy
testScraper().catch(console.error);

