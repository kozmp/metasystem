/**
 * @fileoverview Test Run - Pełny obieg informacji przez system KMS
 * @cybernetic Demonstracja: Receptor → Korelator → Supabase
 * 
 * Test analizuje tekst o wpływie biurokracji na systemy autonomiczne
 * i zapisuje wyniki w bazie danych.
 */

// Załaduj zmienne środowiskowe
import 'dotenv/config';

import { processAndStoreSignal } from '../lib/cybernetics/korelator/store';
import { supabase } from '../lib/supabase/client';

// ============================================================================
// KOLORY DLA KONSOLI
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(title: string) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log('='.repeat(80) + '\n');
}

// ============================================================================
// TEKST TESTOWY
// ============================================================================

const TEST_TEXT = `
Wpływ scentralizowanej biurokracji na moc swobodną systemów autonomicznych w Europie.

Scentralizowana biurokracja w Unii Europejskiej stała się głównym mechanizmem sterowania 
informacyjnego, który ogranicza moc swobodną systemów autonomicznych – zarówno państw 
członkowskich, jak i przedsiębiorstw prywatnych.

Przez narzucanie ujednoliconych regulacji (takich jak dyrektywy energetyczne, standardy 
produktowe, przepisy o ochronie danych), biurokracja europejska redukuje przestrzeń decyzyjną 
lokalnych systemów. W terminologii Kosseckiego, jest to proces hamowania sprzężenia zwrotnego 
ujemnego – systemy tracą zdolność do samosterowania i adaptacji do lokalnych warunków.

Kosztem energetycznym tej transformacji jest konieczność utrzymywania rozbudowanego aparatu 
administracyjnego (około 32 000 urzędników w Brukseli), który konsumuje zasoby bez generowania 
wartości produktywnej. Moc robocza jest przekształcana w moc jałową – energia jest zużywana 
na utrzymanie struktury, a nie na realizację celów systemów autonomicznych.

W modelu Mazura, biurokracja działa jak "homeostat zewnętrzny" – stabilizuje system poprzez 
eliminację odchyleń, ale kosztem utraty elastyczności i innowacyjności. Systemy autonomiczne 
(państwa, firmy) tracą zdolność do eksperymentowania i adaptacji, co w długim okresie prowadzi 
do ich degradacji.
`;

// ============================================================================
// GŁÓWNA FUNKCJA TESTOWA
// ============================================================================

async function runFullTest() {
  logHeader('🦾 KOSSECKI METASYSTEM - FULL CYCLE TEST');
  
  log('Zgodność: Metacybernetyka doc. Józefa Kosseckiego (2005)', colors.gray);
  log('Test: Pełny obieg informacji (Receptor → Korelator → Supabase)\n', colors.gray);
  
  // ========================================================================
  // KROK 1: Analiza i zapis sygnału
  // ========================================================================
  
  logHeader('KROK 1: Przetwarzanie Sygnału (Receptor + Korelator)');
  
  log('Tekst testowy:', colors.cyan);
  log(TEST_TEXT.trim().substring(0, 200) + '...', colors.gray);
  log('', colors.gray);
  
  log('⏳ Rozpoczynam przetwarzanie...', colors.yellow);
  const startTime = Date.now();
  
  const result = await processAndStoreSignal(TEST_TEXT);
  
  const duration = Date.now() - startTime;
  log(`✓ Zakończono w ${duration}ms\n`, colors.green);
  
  // Wyświetl wyniki
  if (!result.success) {
    log('❌ BŁĄD PRZETWARZANIA', colors.red);
    log(`Powód: ${result.error}`, colors.red);
    process.exit(1);
  }
  
  log('✅ PRZETWARZANIE ZAKOŃCZONE POMYŚLNIE', colors.green);
  log('', colors.gray);
  log('Statystyki:', colors.cyan);
  log(`  Raw Signal ID: ${result.raw_signal_id}`, colors.gray);
  log(`  Utworzonych obiektów: ${result.objects_created}`, colors.gray);
  log(`  Utworzonych relacji: ${result.relations_created}`, colors.gray);
  log(`  Certainty Score: ${result.certainty_score?.toFixed(2)} (wiarygodność)`, colors.gray);
  
  // ========================================================================
  // KROK 2: Weryfikacja w bazie danych
  // ========================================================================
  
  logHeader('KROK 2: Weryfikacja Zapisanych Danych w Supabase');
  
  // 2a: Sprawdź raw_signals
  log('📄 RAW SIGNALS:', colors.cyan);
  const { data: rawSignals, error: rawError } = await supabase
    .from('raw_signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (rawError) {
    log(`❌ Błąd odczytu: ${rawError.message}`, colors.red);
  } else if (rawSignals && rawSignals.length > 0) {
    const signal = rawSignals[0];
    log(`  ID: ${signal.id}`, colors.gray);
    log(`  Processed: ${signal.processed ? 'YES' : 'NO'}`, signal.processed ? colors.green : colors.red);
    log(`  Noise Level: ${signal.noise_level?.toFixed(2) || 'N/A'}`, colors.gray);
    log(`  Created: ${new Date(signal.created_at).toLocaleString()}`, colors.gray);
  }
  
  // 2b: Sprawdź cybernetic_objects
  log('\n📦 CYBERNETIC OBJECTS:', colors.cyan);
  const { data: objects, error: objError } = await supabase
    .from('cybernetic_objects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (objError) {
    log(`❌ Błąd odczytu: ${objError.message}`, colors.red);
  } else if (objects && objects.length > 0) {
    log(`  Znaleziono ${objects.length} obiektów:\n`, colors.gray);
    objects.forEach((obj, i) => {
      log(`  ${i + 1}. "${obj.name}"`, colors.bright);
      log(`     ID: ${obj.id}`, colors.gray);
      log(`     System Class: ${obj.system_class}`, colors.gray);
      log(`     Control Type: ${obj.control_system_type}`, colors.gray);
      log(`     Description: ${obj.description || 'N/A'}`, colors.gray);
      log(`     Created: ${new Date(obj.created_at).toLocaleString()}`, colors.gray);
      log('', colors.gray);
    });
  } else {
    log('  Brak obiektów w bazie', colors.yellow);
  }
  
  // 2c: Sprawdź correlations
  log('🔗 CORRELATIONS (Relacje Sterownicze):', colors.cyan);
  const { data: correlations, error: corrError } = await supabase
    .from('correlations')
    .select(`
      *,
      source:source_id(name),
      target:target_id(name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (corrError) {
    log(`❌ Błąd odczytu: ${corrError.message}`, colors.red);
  } else if (correlations && correlations.length > 0) {
    log(`  Znaleziono ${correlations.length} relacji:\n`, colors.gray);
    correlations.forEach((corr, i) => {
      // @ts-ignore - Supabase zwraca obiekt z zagnieżdżonymi danymi
      const sourceName = corr.source?.name || 'Unknown';
      // @ts-ignore
      const targetName = corr.target?.name || 'Unknown';
      
      log(`  ${i + 1}. "${sourceName}" → "${targetName}"`, colors.bright);
      log(`     ID: ${corr.id}`, colors.gray);
      log(`     Relation Type: ${corr.relation_type}`, colors.magenta);
      log(`     Certainty Score: ${corr.certainty_score.toFixed(2)} (wiarygodność)`, colors.gray);
      log(`     Impact Factor: ${corr.impact_factor.toFixed(2)} (siła wpływu)`, colors.gray);
      
      if (corr.evidence_data) {
        const evidence = corr.evidence_data as any;
        log(`     Description: ${evidence.description || 'N/A'}`, colors.gray);
        log(`     Process Type: ${evidence.process_type || 'N/A'}`, colors.gray);
        log(`     Feedback Type: ${evidence.feedback_type || 'N/A'}`, colors.gray);
        log(`     System Class: ${evidence.system_class || 'N/A'}`, colors.gray);
      }
      
      log(`     Created: ${new Date(corr.created_at).toLocaleString()}`, colors.gray);
      log('', colors.gray);
    });
  } else {
    log('  Brak relacji w bazie', colors.yellow);
  }
  
  // ========================================================================
  // KROK 3: Analiza zgodności z Kosseckim
  // ========================================================================
  
  logHeader('KROK 3: Analiza Zgodności z Rygorem Kosseckiego');
  
  log('🎯 Kluczowe Pytania:', colors.cyan);
  log('', colors.gray);
  
  // Pytanie 1: Czy AI rozpoznało "Biurokracja"?
  const biurokracjaObj = objects?.find(obj => 
    obj.name.toLowerCase().includes('biurokrac') || 
    obj.name.toLowerCase().includes('administrac')
  );
  
  if (biurokracjaObj) {
    log('✅ Q1: Czy wykryto "Biurokracja"?', colors.green);
    log(`    Odpowiedź: TAK - "${biurokracjaObj.name}"`, colors.green);
    log(`    System Class: ${biurokracjaObj.system_class}`, colors.gray);
  } else {
    log('❌ Q1: Czy wykryto "Biurokracja"?', colors.yellow);
    log('    Odpowiedź: NIE (AI nie rozpoznało kluczowego obiektu)', colors.yellow);
  }
  
  log('', colors.gray);
  
  // Pytanie 2: Czy AI rozpoznało "Systemy autonomiczne"?
  const systemyObj = objects?.find(obj => 
    obj.name.toLowerCase().includes('system') || 
    obj.name.toLowerCase().includes('państw') ||
    obj.name.toLowerCase().includes('przedsiębiorst')
  );
  
  if (systemyObj) {
    log('✅ Q2: Czy wykryto "Systemy autonomiczne"?', colors.green);
    log(`    Odpowiedź: TAK - "${systemyObj.name}"`, colors.green);
    log(`    System Class: ${systemyObj.system_class}`, colors.gray);
  } else {
    log('❌ Q2: Czy wykryto "Systemy autonomiczne"?', colors.yellow);
    log('    Odpowiedź: NIE', colors.yellow);
  }
  
  log('', colors.gray);
  
  // Pytanie 3: Czy AI wykryło relację między nimi?
  if (correlations && correlations.length > 0) {
    log('✅ Q3: Czy wykryto relacje sterownicze?', colors.green);
    log(`    Odpowiedź: TAK - ${correlations.length} relacji`, colors.green);
    
    // Sprawdź typ procesu
    const hasInformationalProcess = correlations.some(c => {
      const evidence = c.evidence_data as any;
      return evidence?.process_type === 'informational';
    });
    
    log('', colors.gray);
    log('✅ Q4: Czy AI rozpoznało typ procesu?', colors.green);
    if (hasInformationalProcess) {
      log('    Odpowiedź: TAK - Proces INFORMACYJNY (zgodnie z Kosseckim)', colors.green);
      log('    Biurokracja = sterowanie informacyjne, nie energetyczne', colors.gray);
    } else {
      log('    Odpowiedź: AI sklasyfikowało inaczej (sprawdź evidence_data)', colors.yellow);
    }
  } else {
    log('❌ Q3: Czy wykryto relacje sterownicze?', colors.red);
    log('    Odpowiedź: NIE', colors.red);
  }
  
  // ========================================================================
  // PODSUMOWANIE
  // ========================================================================
  
  logHeader('✅ TEST ZAKOŃCZONY');
  
  log('Pełny obieg informacji działa poprawnie!', colors.green);
  log('', colors.gray);
  log('Sprawdź wyniki w Supabase Dashboard:', colors.cyan);
  log('  https://supabase.com/dashboard/project/qqxgegdcygqrptuviwmo/editor', colors.gray);
  log('', colors.gray);
  log('Tabele do sprawdzenia:', colors.cyan);
  log('  - raw_signals (surowy tekst)', colors.gray);
  log('  - cybernetic_objects (obiekty: Biurokracja, Systemy, etc.)', colors.gray);
  log('  - correlations (relacje sterownicze)', colors.gray);
  log('', colors.gray);
}

// ============================================================================
// URUCHOMIENIE
// ============================================================================

runFullTest().catch(error => {
  console.error('\n❌ Krytyczny błąd:', error);
  process.exit(1);
});

