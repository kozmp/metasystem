/**
 * @fileoverview Test połączenia z Supabase
 * @cybernetic Weryfikacja dostępu do Korelatora (pamięć operacyjna systemu)
 */

// Załaduj zmienne środowiskowe z .env
import 'dotenv/config';

import { testSupabaseConnection, checkDatabaseSchema } from './client';

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

// ============================================================================
// GŁÓWNA FUNKCJA TESTOWA
// ============================================================================

async function runTest() {
  logHeader('🗄️ SUPABASE CONNECTION TEST');
  
  log('Zgodność: Metacybernetyka doc. Józefa Kosseckiego (2005)', colors.gray);
  log('Komponent: KORELATOR (Retencja - pamięć operacyjna systemu)\n', colors.gray);
  
  // Test 1: Konfiguracja zmiennych środowiskowych
  logHeader('TEST 1: Konfiguracja Zmiennych Środowiskowych');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl) {
    log('❌ SUPABASE_URL nie jest ustawiony', colors.red);
    log('   Dodaj do .env: SUPABASE_URL=https://your-project.supabase.co', colors.yellow);
    process.exit(1);
  }
  
  if (!supabaseKey) {
    log('❌ SUPABASE_KEY nie jest ustawiony', colors.red);
    log('   Dodaj do .env: SUPABASE_KEY=your_anon_or_service_role_key', colors.yellow);
    process.exit(1);
  }
  
  log(`✓ SUPABASE_URL: ${supabaseUrl}`, colors.green);
  log(`✓ SUPABASE_KEY: ${supabaseKey.substring(0, 20)}...`, colors.green);
  
  // Test 2: Połączenie z bazą danych
  logHeader('TEST 2: Połączenie z Bazą Danych');
  
  const isConnected = await testSupabaseConnection();
  
  if (!isConnected) {
    log('❌ Nie udało się połączyć z bazą danych', colors.red);
    log('   Sprawdź czy klucz API jest poprawny', colors.yellow);
    log('   Sprawdź czy schemat został wdrożony (patrz: SUPABASE_SETUP.md)', colors.yellow);
    process.exit(1);
  }
  
  log('✓ Połączenie z bazą danych działa', colors.green);
  
  // Test 3: Sprawdzenie schematu
  logHeader('TEST 3: Weryfikacja Schematu Bazy Danych');
  
  const schemaCheck = await checkDatabaseSchema();
  
  if (!schemaCheck.ready) {
    log(`❌ Brakujące tabele: ${schemaCheck.missingTables.join(', ')}`, colors.red);
    log('\n📝 Instrukcje wdrożenia schematu:', colors.yellow);
    log('   1. Otwórz: https://supabase.com/dashboard', colors.gray);
    log('   2. Przejdź do SQL Editor', colors.gray);
    log('   3. Wykonaj kod z pliku schema.sql', colors.gray);
    log('   4. Szczegóły: SUPABASE_SETUP.md', colors.gray);
    process.exit(1);
  }
  
  log('✓ Wszystkie wymagane tabele istnieją:', colors.green);
  log('   - cybernetic_objects', colors.gray);
  log('   - correlations', colors.gray);
  log('   - source_intelligence', colors.gray);
  log('   - raw_signals', colors.gray);
  
  // Podsumowanie
  logHeader('✅ WSZYSTKIE TESTY ZAKOŃCZONE POMYŚLNIE');
  
  log('Baza danych Supabase jest gotowa do użycia!', colors.green);
  log('', colors.gray);
  log('Następne kroki:', colors.cyan);
  log('  1. Zintegruj Receptor z Korelatorem', colors.gray);
  log('  2. Zapisz pierwsze obiekty i relacje do bazy', colors.gray);
  log('  3. Przetestuj hybrydowe wyszukiwanie', colors.gray);
  log('', colors.gray);
}

// ============================================================================
// URUCHOMIENIE
// ============================================================================

runTest().catch(error => {
  console.error('\n❌ Krytyczny błąd:', error);
  process.exit(1);
});

