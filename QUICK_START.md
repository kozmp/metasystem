# 🚀 QUICK START - KOSSECKI METASYSTEM (KMS)

## 📋 Wymagania

- Node.js 18+ (zalecane: 20+)
- npm lub yarn
- Klucz API OpenRouter (darmowy na start)

---

## ⚡ Szybki Start (5 minut)

### 1. Pobierz Klucz API

1. Wejdź na: https://openrouter.ai/keys
2. Zaloguj się (przez Google/GitHub)
3. Skopiuj klucz API

### 2. Konfiguracja

```bash
# Sklonuj/otwórz projekt
cd "KOSSECKI METASYSTEM (KMS)"

# Instalacja zależności
npm install

# Utwórz plik .env
echo "OPENROUTER_API_KEY=your_api_key_here" > .env
```

**WAŻNE:** Zamień `your_api_key_here` na swój prawdziwy klucz API!

### 3. Uruchom Demo

```bash
npm run demo:receptor
```

**Co zobaczysz:**
- Test 1: Tekst naukowy (Fukushima) → STATUS: CLEAR
- Test 2: Tekst mieszany (Tesla) → STATUS: WARNING
- Test 3: Tekst propagandowy → STATUS: REJECT

---

## 🧪 Uruchomienie Pełnych Testów

```bash
# Wszystkie testy jednostkowe
npm test

# Tylko testy Receptora
npm run test:receptor

# Tryb watch (automatyczne ponowne uruchamianie)
npm run test:watch
```

---

## 🎯 Co Robi Receptor?

Receptor to **organ wejściowy** systemu KMS. Jego zadanie:

1. **Przyjmuje tekst** (np. artykuł, raport, tweet)
2. **Wyodrębnia obiekty** (systemy: państwa, firmy, osoby)
3. **Wyodrębnia relacje** (kto na kogo wpływa, jak, jakim kosztem)
4. **Klasyfikuje źródło:**
   - `cognitive` - nauka, fakty, parametry mierzalne
   - `ideological` - propaganda, wartościowanie, doktryna
   - `ethical` - normy moralne
   - `economic` - biznes, zysk
5. **Ocenia szum semantyczny:**
   - `0.0-0.4` = **CLEAR** (akceptacja)
   - `0.4-0.7` = **WARNING** (wymaga weryfikacji)
   - `>0.7` = **REJECT** (odrzucenie)

---

## 📊 Przykład Użycia w Kodzie

```typescript
import { processInput } from './src/lib/cybernetics/receptor';

const text = "Państwo X dotuje firmę Y kwotą 100 mln EUR.";
const result = await processInput(text);

if ('error_type' in result) {
  console.error('Błąd:', result.message);
} else {
  console.log('Status:', result.metadata.signal_status);
  console.log('Noise Level:', result.metadata.semantic_noise_level);
  console.log('Obiekty:', result.objects);
  console.log('Relacje:', result.relations);
}
```

---

## 🔧 Rozwiązywanie Problemów

### Problem: "OPENROUTER_API_KEY nie jest ustawiony"

**Rozwiązanie:**
```bash
# Sprawdź czy plik .env istnieje
ls -la .env

# Jeśli nie, utwórz go:
echo "OPENROUTER_API_KEY=your_api_key_here" > .env

# Jeśli istnieje, sprawdź zawartość:
cat .env
```

### Problem: "Cannot find module 'openai'"

**Rozwiązanie:**
```bash
npm install
```

### Problem: "Timeout" lub "API Error"

**Rozwiązanie:**
- System automatycznie przełączy się na alternatywny model (fallback)
- Jeśli wszystkie modele zawiodą, sprawdź połączenie internetowe
- Sprawdź czy klucz API jest poprawny

### Problem: Testy nie przechodzą

**Rozwiązanie:**
- AI może różnie interpretować tekst - to normalne
- Sprawdź czy `semantic_noise_level` jest w odpowiednim zakresie
- Jeśli test "Cognitive Clarity" daje WARNING zamiast CLEAR, to może być OK (AI jest ostrożny)

---

## 📚 Dokumentacja

- [README.md](README.md) - Główna dokumentacja projektu
- [ENV_SETUP.md](ENV_SETUP.md) - Szczegółowa konfiguracja środowiska
- [RECEPTOR_IMPLEMENTATION_SUMMARY.md](RECEPTOR_IMPLEMENTATION_SUMMARY.md) - Podsumowanie implementacji
- [src/lib/cybernetics/receptor/README.md](src/lib/cybernetics/receptor/README.md) - Dokumentacja Receptora

---

## 🎓 Podstawy Teoretyczne

System KMS jest oparty na **Metacybernetyce** doc. Józefa Kosseckiego (2005).

**Kluczowe zasady:**
1. **Obiekt ≠ Cechy** - Obiekt jest węzłem w sieci relacji
2. **Informacja ≠ Tekst** - Informacja to transformacja stanów korelatora
3. **Prawda = Zgodność z rzeczywistością** - Nie "prawda ideologiczna"
4. **Dezinformacja = Szum sterowniczy** - Celowe wprowadzanie zakłóceń
5. **Homeostaza = Stabilność** - System musi być odporny na awarie

---

## ✅ Następne Kroki

Po uruchomieniu demo i testów, możesz:

1. **Przetestować własne teksty** - Edytuj `demo.ts` i dodaj swoje przykłady
2. **Zintegrować z aplikacją** - Użyj `processInput()` w swoim kodzie
3. **Przejść do Korelatora** - Następny organ: baza danych + graf wiedzy
4. **Przeczytać książkę** - "Metacybernetyka" Józefa Kosseckiego (2005)

---

## 🤝 Wsparcie

Jeśli masz pytania lub problemy:
1. Sprawdź dokumentację w folderze `.ai/`
2. Przeczytaj `RECEPTOR_IMPLEMENTATION_SUMMARY.md`
3. Sprawdź logi w konsoli (są bardzo szczegółowe)

---

**Powodzenia w budowie systemu rzetelnego researchu! 🚀**

---

**Autor:** KOSSECKI METASYSTEM (KMS)  
**Zgodność:** Metacybernetyka doc. Józefa Kosseckiego (2005)  
**Data:** 2025-01-22

