/**
 * @fileoverview Przykład użycia Receptora
 * @cybernetic Demonstracja transformacji tekstu na graf cybernetyczny
 * 
 * Ten plik NIE jest częścią systemu produkcyjnego - służy tylko do testów.
 */

import { processInput, testReceptorConnection } from './index';

/**
 * @cybernetic Przykład 1: Analiza prostego tekstu o sterowaniu energetycznym
 */
async function example1_energetic_control() {
  console.log('\n=== PRZYKŁAD 1: Sterowanie Energetyczne ===\n');
  
  const text = `
    Państwo Polskie poprzez ministerstwo finansów dotuje firmę Orlen S.A. kwotą 500 mln PLN.
    Dotacja ma na celu stabilizację cen paliw na rynku krajowym.
  `;
  
  const result = await processInput(text);
  
  if ('error_type' in result) {
    console.error('BŁĄD:', result.message);
    console.error('Poziom szumu:', result.noise_level);
    return;
  }
  
  console.log('✓ Analiza zakończona pomyślnie');
  console.log('\nObiekty:');
  result.objects.forEach(obj => {
    console.log(`  - ${obj.label} (${obj.type})`);
  });
  
  console.log('\nRelacje:');
  result.relations.forEach(rel => {
    const subject = result.objects.find(o => o.id === rel.subject_id)?.label;
    const object = result.objects.find(o => o.id === rel.object_id)?.label;
    console.log(`  - ${subject} → ${object}`);
    console.log(`    Typ: ${rel.process_type}`);
    console.log(`    Klasa: ${rel.system_class}`);
    console.log(`    Siła: ${rel.influence_strength}`);
    console.log(`    Opis: ${rel.description}`);
  });
  
  console.log('\nMetadane:');
  console.log(`  Szum semantyczny: ${result.metadata.semantic_noise_level}`);
  console.log(`  Dominujący system: ${result.metadata.dominant_system_type}`);
  console.log(`  Flagi ideologiczne: ${result.metadata.ideological_flags?.join(', ') || 'brak'}`);
}

/**
 * @cybernetic Przykład 2: Analiza tekstu ideologicznego (wysoki szum)
 */
async function example2_ideological_noise() {
  console.log('\n=== PRZYKŁAD 2: Tekst Ideologiczny ===\n');
  
  const text = `
    Wróg ludu próbuje zniszczyć nasz wielki naród poprzez zdradę i manipulację.
    Tylko prawdziwy patriota może zrozumieć historyczną konieczność naszej walki.
  `;
  
  const result = await processInput(text);
  
  if ('error_type' in result) {
    console.error('BŁĄD:', result.message);
    console.error('Poziom szumu:', result.noise_level);
    console.error('Sugestie:', result.suggestions?.join(', '));
    return;
  }
  
  console.log('✓ Analiza zakończona');
  console.log(`Wykryte flagi ideologiczne: ${result.metadata.ideological_flags?.join(', ')}`);
  console.log(`Poziom szumu: ${result.metadata.semantic_noise_level}`);
}

/**
 * @cybernetic Przykład 3: Analiza tekstu naukowego (niski szum)
 */
async function example3_scientific_text() {
  console.log('\n=== PRZYKŁAD 3: Tekst Naukowy ===\n');
  
  const text = `
    Badanie wykazało, że wzrost temperatury o 2°C powoduje 15% wzrost zużycia energii w systemie chłodzenia.
    Pomiary zostały przeprowadzone w kontrolowanych warunkach laboratoryjnych przez zespół 5 naukowców.
    Wyniki zostały zweryfikowane metodą podwójnie ślepej próby.
  `;
  
  const result = await processInput(text);
  
  if ('error_type' in result) {
    console.error('BŁĄD:', result.message);
    return;
  }
  
  console.log('✓ Analiza zakończona');
  console.log(`Dominujący system: ${result.metadata.dominant_system_type}`);
  console.log(`Poziom szumu: ${result.metadata.semantic_noise_level}`);
  console.log(`Liczba obiektów: ${result.objects.length}`);
  console.log(`Liczba relacji: ${result.relations.length}`);
}

/**
 * @cybernetic Główna funkcja testowa
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║      RECEPTOR - Przykłady Użycia                        ║');
  console.log('║      KOSSECKI METASYSTEM (KMS)                           ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  // Test połączenia
  console.log('\n→ Testowanie połączenia z API...');
  const connected = await testReceptorConnection();
  
  if (!connected) {
    console.error('✗ Brak połączenia z API. Sprawdź konfigurację OPENROUTER_API_KEY w .env');
    return;
  }
  
  console.log('✓ Połączenie z API działa poprawnie\n');
  
  // Uruchom przykłady
  try {
    await example1_energetic_control();
    await example2_ideological_noise();
    await example3_scientific_text();
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║      Wszystkie przykłady wykonane pomyślnie             ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('\n✗ Błąd podczas wykonywania przykładów:', error);
  }
}

// Uruchom tylko jeśli plik jest uruchamiany bezpośrednio
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as runReceptorExamples };

