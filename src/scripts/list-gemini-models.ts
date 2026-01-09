/**
 * @fileoverview Lista dostępnych modeli Gemini
 * @cybernetic Debug - sprawdzenie jakie modele są dostępne dla danego klucza
 */

import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

config({ path: '.env.local' });
config({ path: '.env' });

const apiKey = 
	process.env.GEMINI_API_KEY || 
	process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
	console.error("❌ Brak klucza API!");
	process.exit(1);
}

console.log("🔍 Sprawdzam dostępne modele Gemini...\n");

const genAI = new GoogleGenerativeAI(apiKey);

(async () => {
	try {
		// Testuj różne modele
		const modelsToTest = [
			'gemini-pro',
			'gemini-1.5-pro',
			'gemini-1.5-flash',
			'models/gemini-pro',
			'models/gemini-1.5-pro',
			'models/gemini-1.5-flash',
		];

		console.log("Testuję modele:\n");

		for (const modelName of modelsToTest) {
			try {
				const model = genAI.getGenerativeModel({ model: modelName });
				const result = await model.generateContent("Hi");
				console.log(`✅ ${modelName} - DZIAŁA`);
			} catch (error: any) {
				if (error.status === 404) {
					console.log(`❌ ${modelName} - nie znaleziono`);
				} else {
					console.log(`⚠️  ${modelName} - błąd: ${error.message.substring(0, 50)}...`);
				}
			}
		}

	} catch (error) {
		console.error("\n❌ Błąd:", error);
	}
})();

