/**
 * @fileoverview TEST GEMINI INTEGRATION
 * @cybernetic Skrypt testowy dla video_pipeline
 */

import { processVideoAndStore } from '../lib/cybernetics/receptor/video_pipeline';

async function testGeminiIntegration() {
  console.log('🔬 Testing Gemini Integration...\n');
  console.log('========================================');

  // Test URL (przykładowe wideo YouTube)
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  try {
    console.log(`Analyzing video: ${testUrl}\n`);

    const result = await processVideoAndStore(testUrl, {
      useWasm: true,   // Użyj Rust dla obliczeń
      autoStore: true, // Zapisz do Supabase
    });

    console.log('\n========================================');
    console.log('✅ SUCCESS!\n');
    console.log('RESULTS:');
    console.log('========================================');
    console.log(`Power (v):           ${result.power_v} W`);
    console.log(`Quality (a):         ${result.quality_a.toFixed(3)}`);
    console.log(`Mass (c):            ${result.mass_c}`);
    console.log(`Total Power (P):     ${result.total_power_p.toFixed(2)} W`);
    console.log(`Civilization:        ${result.civilization_code}`);
    console.log(`Control System:      ${result.control_system_type}`);
    console.log(`Distortion (Z):      ${result.distortion_z.toFixed(3)}`);
    console.log(`Propaganda Warning:  ${result.propaganda_warning ? '⚠️  YES' : '✓ NO'}`);
    
    if (result.visual_symbols.length > 0) {
      console.log(`Visual Symbols:      [${result.visual_symbols.join(', ')}]`);
    }
    
    if (result.stored_object_id) {
      console.log(`\nStored in Supabase:  ${result.stored_object_id}`);
    }

    if (result.propaganda_warning) {
      console.log('\n========================================');
      console.log('⚠️  PROPAGANDA RISK ANALYSIS');
      console.log('========================================');
      console.log(`Reasoning: ${result.reasoning}`);
    }

    console.log('\n========================================');
    console.log('Test completed successfully! ✅');
    console.log('========================================\n');
    
  } catch (error: unknown) {
    console.log('\n========================================');
    console.error('❌ FAILED:', error);
    console.log('========================================\n');
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    process.exit(1);
  }
}

// Uruchom test
testGeminiIntegration();

