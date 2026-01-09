/**
 * @fileoverview Test Receptora z parametrami Metacybernetyki 2015
 * @cybernetic Weryfikacja ekstrakcji v, a, c oraz klasyfikacji cywilizacyjnej
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Załaduj .env
config({ path: resolve(process.cwd(), '.env') });

// Import Receptora
import { getReceptorExtractor } from './src/lib/cybernetics/receptor/extractor.ts';

// ============================================================================
// PRZYKŁADOWY TEKST DO ANALIZY
// ============================================================================

const EXAMPLE_TEXT = `
Uniwersytet Jagielloński (UJ) uruchomił nowy program badawczy w dziedzinie sztucznej inteligencji.
Projekt będzie prowadzony przez zespół 50 naukowców z Wydziału Matematyki i Informatyki.

Program wykorzystuje najnowsze technologie uczenia maszynowego oraz dysponuje budżetem 10 milionów złotych
na pierwsze 3 lata działania. Kierownik projektu, prof. Jan Kowalski, ma 20 lat doświadczenia w dziedzinie AI.

Uniwersytet współpracuje z Ministerstwem Nauki i Szkolnictwa Wyższego, które finansuje 70% budżetu projektu.
Pozostałe 30% pochodzi z grantów Unii Europejskiej.

Celem projektu jest opracowanie nowych algorytmów rozpoznawania obrazów medycznych, które pomogą
w diagnostyce nowotworów. Wyniki badań będą publikowane w międzynarodowych czasopismach naukowych
i udostępniane jako open source.

Ministerstwo wymaga od uniwersytetu raportów co 6 miesięcy oraz ma prawo do audytowania postępów prac.
`;

// ============================================================================
// FUNKCJA TESTOWA
// ============================================================================

async function testReceptor() {
  console.log('='.repeat(80));
  console.log('TEST RECEPTORA - METACYBERNETYKA 2015');
  console.log('='.repeat(80));
  console.log('');

  console.log('📄 Tekst wejściowy:');
  console.log('-'.repeat(80));
  console.log(EXAMPLE_TEXT.trim());
  console.log('-'.repeat(80));
  console.log('');

  try {
    // Inicjalizacja Receptora
    const receptor = getReceptorExtractor();

    console.log('🔄 Wysyłam do Receptora...');
    console.log('');

    // Transformacja sygnału
    const result = await receptor.transformSignal(EXAMPLE_TEXT);

    // Sprawdź czy jest błąd
    if ('error_type' in result) {
      console.error('❌ BŁĄD RECEPTORA:');
      console.error(`   Typ: ${result.error_type}`);
      console.error(`   Wiadomość: ${result.message}`);
      console.error(`   Noise Level: ${result.noise_level}`);
      if (result.suggestions) {
        console.error(`   Sugestie: ${result.suggestions.join(', ')}`);
      }
      process.exit(1);
    }

    // Sukces - wyświetl wyniki
    console.log('✅ RECEPTOR PRZETWORZYŁSYGNAŁ POMYŚLNIE');
    console.log('');

    // Metadane
    console.log('📊 METADANE:');
    console.log(`   Noise Level: ${result.metadata.semantic_noise_level.toFixed(2)}`);
    console.log(`   Status: ${result.metadata.signal_status}`);
    console.log(`   Is Ambiguous: ${result.metadata.is_ambiguous}`);
    console.log(`   Dominant System: ${result.metadata.dominant_system_type}`);
    if (result.metadata.ideological_flags && result.metadata.ideological_flags.length > 0) {
      console.log(`   Ideological Flags: ${result.metadata.ideological_flags.join(', ')}`);
    }
    console.log('');

    // Obiekty
    console.log('🎯 WYEKSTRAHOWANE OBIEKTY:');
    console.log('');

    result.objects.forEach((obj, index) => {
      console.log(`${index + 1}. ${obj.label} (${obj.id})`);
      console.log(`   Typ: ${obj.type}`);
      console.log(`   Opis: ${obj.description || 'brak'}`);
      console.log('');
      console.log('   METACYBERNETYKA 2015:');
      console.log(`   ├─ power_v (moc jednostkowa): ${obj.power_v} W`);
      console.log(`   ├─ quality_a (jakość): ${obj.quality_a.toFixed(2)} (0-1)`);
      console.log(`   ├─ mass_c (ilość): ${obj.mass_c}`);
      console.log(`   ├─ P = v × a × c = ${(obj.power_v * obj.quality_a * obj.mass_c).toFixed(2)} W`);
      console.log(`   ├─ civilization_code: ${obj.civilization_code}`);
      console.log(`   └─ motivation_type: ${obj.motivation_type}`);
      console.log('');
    });

    // Relacje
    console.log('🔗 WYEKSTRAHOWANE RELACJE:');
    console.log('');

    result.relations.forEach((rel, index) => {
      const source = result.objects.find(o => o.id === rel.subject_id);
      const target = result.objects.find(o => o.id === rel.object_id);

      console.log(`${index + 1}. ${source?.label || rel.subject_id} → ${target?.label || rel.object_id}`);
      console.log(`   Process Type: ${rel.process_type}`);
      console.log(`   Feedback Type: ${rel.feedback_type}`);
      console.log(`   System Class: ${rel.system_class}`);
      console.log(`   Influence Strength: ${rel.influence_strength.toFixed(2)}`);
      console.log(`   Norm Category: ${rel.norm_category || 'brak'}`);
      console.log(`   Opis: ${rel.description}`);
      if (rel.evidence && rel.evidence.length > 0) {
        console.log(`   Evidence: "${rel.evidence[0].substring(0, 80)}..."`);
      }
      console.log('');
    });

    // Podsumowanie
    console.log('='.repeat(80));
    console.log('📈 PODSUMOWANIE:');
    console.log(`   ✓ Obiektów: ${result.objects.length}`);
    console.log(`   ✓ Relacji: ${result.relations.length}`);
    console.log(`   ✓ Noise Level: ${result.metadata.semantic_noise_level.toFixed(2)}`);
    console.log(`   ✓ Status: ${result.metadata.signal_status}`);
    console.log('='.repeat(80));

    // Zwróć wynik dla dalszego użycia
    return result;

  } catch (error) {
    console.error('❌ BŁĄD PODCZAS TESTU:');
    console.error(error);
    process.exit(1);
  }
}

// Uruchom test
testReceptor()
  .then(() => {
    console.log('');
    console.log('✅ Test zakończony pomyślnie!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test nie powiódł się:', error);
    process.exit(1);
  });
