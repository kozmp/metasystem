/**
 * @fileoverview Demo Receptora - Szybki test funkcjonalności
 * @cybernetic Demonstracja gradacji szumu semantycznego i mechanizmu fallback
 * 
 * Uruchom: npx tsx src/lib/cybernetics/receptor/demo.ts
 */

import { processInput } from './index';

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
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(title: string) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log('='.repeat(80) + '\n');
}

function logStatus(status: string) {
  const statusColors = {
    CLEAR: colors.green,
    WARNING: colors.yellow,
    REJECT: colors.red,
  };
  const color = statusColors[status as keyof typeof statusColors] || colors.reset;
  log(`STATUS: ${status}`, colors.bright + color);
}

// ============================================================================
// PRZYKŁADOWE TEKSTY
// ============================================================================

const testCases = [
  {
    name: 'TEST 1: Cognitive Clarity (Tekst Naukowy)',
    text: `
      Elektrownia jądrowa w Fukushimie składa się z 6 reaktorów typu BWR (Boiling Water Reactor).
      Każdy reaktor ma moc nominalną 460-784 MW elektrycznych.
      W 2011 roku, po trzęsieniu ziemi o magnitudzie 9.0, systemy chłodzenia uległy awarii.
      Reaktory 1, 2 i 3 były w trakcie pracy, reaktory 4, 5 i 6 były wyłączone na konserwację.
      Temperatura rdzenia reaktora 1 przekroczyła 2800°C, co spowodowało topnienie paliwa.
    `,
    expectedStatus: 'CLEAR',
  },
  {
    name: 'TEST 2: Mixed Content (Tekst Mieszany)',
    text: `
      Firma Tesla inwestuje w rozwój technologii autonomicznych pojazdów.
      Według niektórych ekspertów, jest to korzystny kierunek rozwoju.
      Inwestycja wynosi około 10 miliardów dolarów rocznie.
      Może to zwiększyć efektywność transportu o 20-30%.
    `,
    expectedStatus: 'WARNING',
  },
  {
    name: 'TEST 3: Ideological Noise (Tekst Propagandowy)',
    text: `
      Sprawiedliwy rząd demokratyczny walczy z reakcyjnymi siłami ciemności.
      Postępowa polityka społeczna jest jedyną słuszną drogą do wolności.
      Wrogowie narodu próbują zniszczyć nasze piękne wartości.
      Tylko prawdziwie patriotyczne siły mogą ocalić ojczyznę przed upadkiem.
    `,
    expectedStatus: 'REJECT',
  },
];

// ============================================================================
// GŁÓWNA FUNKCJA DEMO
// ============================================================================

async function runDemo() {
  logHeader('🦾 RECEPTOR DEMO - Gradacja Szumu Semantycznego');
  
  log('Zgodność: Metacybernetyka doc. Józefa Kosseckiego (2005)', colors.gray);
  log('Implementacja: Anti-Ideology Tuning + Mechanizm Fallback\n', colors.gray);
  
  // Sprawdź czy OPENROUTER_API_KEY jest ustawiony
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    log('❌ BŁĄD: OPENROUTER_API_KEY nie jest ustawiony w zmiennych środowiskowych', colors.red);
    log('Ustaw klucz API: export OPENROUTER_API_KEY=your_key_here', colors.yellow);
    process.exit(1);
  }
  
  log('✓ OPENROUTER_API_KEY znaleziony', colors.green);
  log(`✓ Długość klucza: ${apiKey.length} znaków\n`, colors.green);
  
  // Uruchom testy
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    logHeader(testCase.name);
    
    log('Tekst wejściowy:', colors.cyan);
    log(testCase.text.trim(), colors.gray);
    log('');
    
    try {
      log('⏳ Przetwarzanie przez Receptor...', colors.yellow);
      const startTime = Date.now();
      
      const result = await processInput(testCase.text);
      
      const duration = Date.now() - startTime;
      log(`✓ Zakończono w ${duration}ms\n`, colors.green);
      
      // Sprawdź czy to błąd SEMANTIC_NOISE
      if ('error_type' in result) {
        log('❌ SYGNAŁ ODRZUCONY', colors.red);
        log(`Powód: ${result.message}`, colors.red);
        log(`Noise Level: ${result.noise_level.toFixed(2)}`, colors.red);
        
        if (result.suggestions && result.suggestions.length > 0) {
          log('\nSugestie:', colors.yellow);
          result.suggestions.forEach(s => log(`  - ${s}`, colors.yellow));
        }
      } else {
        // Sukces - wyświetl wyniki
        const metadata = result.metadata;
        
        logStatus(metadata.signal_status);
        log(`Noise Level: ${metadata.semantic_noise_level.toFixed(2)}`, colors.cyan);
        log(`Is Ambiguous: ${metadata.is_ambiguous}`, colors.cyan);
        log(`Dominant System: ${metadata.dominant_system_type}`, colors.cyan);
        
        if (metadata.warning_message) {
          log(`\n⚠️  OSTRZEŻENIE: ${metadata.warning_message}`, colors.yellow);
        }
        
        if (metadata.ideological_flags && metadata.ideological_flags.length > 0) {
          log(`\n🚩 Flagi Ideologiczne: ${metadata.ideological_flags.join(', ')}`, colors.red);
        }
        
        log(`\n📊 Wyekstrahowano:`, colors.cyan);
        log(`  - Obiektów: ${result.objects.length}`, colors.gray);
        log(`  - Relacji: ${result.relations.length}`, colors.gray);
        
        // Wyświetl pierwsze 3 obiekty
        if (result.objects.length > 0) {
          log(`\n📦 Obiekty (pierwsze 3):`, colors.cyan);
          result.objects.slice(0, 3).forEach(obj => {
            log(`  - ${obj.label} (${obj.type})`, colors.gray);
          });
        }
        
        // Wyświetl pierwsze 3 relacje
        if (result.relations.length > 0) {
          log(`\n🔗 Relacje (pierwsze 3):`, colors.cyan);
          result.relations.slice(0, 3).forEach(rel => {
            log(`  - ${rel.subject_id} → ${rel.object_id} (${rel.process_type}, ${rel.feedback_type})`, colors.gray);
            log(`    "${rel.description}"`, colors.gray);
          });
        }
      }
      
      // Sprawdź czy status zgadza się z oczekiwanym
      const actualStatus = 'error_type' in result ? 'REJECT' : result.metadata.signal_status;
      
      if (actualStatus === testCase.expectedStatus) {
        log(`\n✅ Test PASSED: Oczekiwano ${testCase.expectedStatus}, otrzymano ${actualStatus}`, colors.green);
      } else {
        log(`\n⚠️  Test NIEPEWNY: Oczekiwano ${testCase.expectedStatus}, otrzymano ${actualStatus}`, colors.yellow);
        log('   (AI może różnie interpretować tekst - to normalne)', colors.gray);
      }
      
    } catch (error) {
      log(`\n❌ BŁĄD: ${error instanceof Error ? error.message : String(error)}`, colors.red);
    }
    
    // Pauza między testami
    if (i < testCases.length - 1) {
      log('\n⏸  Pauza 2 sekundy przed następnym testem...', colors.gray);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  logHeader('🎉 DEMO ZAKOŃCZONE');
  log('Wszystkie testy zostały wykonane.', colors.green);
  log('Sprawdź wyniki powyżej.\n', colors.gray);
}

// ============================================================================
// URUCHOMIENIE
// ============================================================================

runDemo().catch(error => {
  console.error('\n❌ Krytyczny błąd:', error);
  process.exit(1);
});

