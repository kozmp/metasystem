/**
 * @fileoverview Test RSS Monitora - Receptor 2.0
 * @cybernetic Testowanie autonomicznego zwiadu RSS
 */

import { checkFeeds, DEFAULT_RSS_SOURCES } from './src/lib/cybernetics/receptor/rss-monitor';

async function testRSSMonitor() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          RECEPTOR 2.0 - TEST RSS MONITORA                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log();
  
  console.log('Testowanie w trybie LISTA (bez przetwarzania)...');
  console.log('To pozwoli zobaczyć co jest dostępne bez kosztów API.');
  console.log();
  console.log('Źródła do sprawdzenia:');
  DEFAULT_RSS_SOURCES.forEach((source, idx) => {
    console.log(`  ${idx + 1}. ${source.name} (${source.category})`);
  });
  console.log();
  console.log('⚠ To może potrwać 10-30 sekund (pobieranie RSS feeds)...');
  console.log();
  
  try {
    const report = await checkFeeds(DEFAULT_RSS_SOURCES, false);
    
    console.log('═'.repeat(65));
    console.log('RAPORT RSS MONITOR');
    console.log('═'.repeat(65));
    console.log();
    console.log('--- PODSUMOWANIE ---');
    console.log('✓ Łącznie źródeł:', report.total_sources);
    console.log('✓ Sprawdzonych źródeł:', report.sources_checked);
    console.log('✓ Błędnych źródeł:', report.sources_failed);
    console.log('✓ Znalezionych wpisów:', report.total_items_found);
    console.log('✓ Przetworzonych wpisów:', report.total_items_processed);
    console.log();
    
    if (report.errors.length > 0) {
      console.log('--- BŁĘDY ---');
      report.errors.forEach(err => {
        console.log('✗', err);
      });
      console.log();
    }
    
    console.log('--- SZCZEGÓŁY ŹRÓDEŁ ---');
    console.log();
    
    report.results.forEach((result, idx) => {
      const status = result.success ? '✓' : '✗';
      const statusText = result.success ? 'OK' : 'FAIL';
      
      console.log(`${idx + 1}. ${status} ${result.source.name}`);
      console.log(`   Status: ${statusText}`);
      console.log(`   Kategoria: ${result.source.category}`);
      console.log(`   URL: ${result.source.url}`);
      console.log(`   Znaleziono wpisów: ${result.items_found}`);
      console.log(`   Reliability Bias: ${result.source.reliability_bias}`);
      
      if (result.error) {
        console.log(`   Błąd: ${result.error}`);
      }
      
      if (result.items.length > 0) {
        console.log(`   Przykładowy wpis:`);
        console.log(`     - Tytuł: ${result.items[0].title}`);
        console.log(`     - Link: ${result.items[0].link}`);
        if (result.items[0].pubDate) {
          console.log(`     - Data: ${result.items[0].pubDate}`);
        }
      }
      
      console.log();
    });
    
    console.log('═'.repeat(65));
    console.log();
    
    if (report.total_items_found > 0) {
      console.log('💡 WSKAZÓWKA:');
      console.log('   Znaleziono nowe wpisy RSS. Aby je przetworzyć przez AI:');
      console.log('   1. Otwórz: http://localhost:4321/dashboard/recon');
      console.log('   2. Kliknij: [SPRAWDŹ RSS FEEDS]');
      console.log('   3. Lub zmień parametr processItems=true w API call');
      console.log();
    }
    
  } catch (error) {
    console.error('✗ Wyjątek:', error);
  }
  
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          TESTY ZAKOŃCZONE                                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
}

// Uruchom testy
testRSSMonitor().catch(console.error);

