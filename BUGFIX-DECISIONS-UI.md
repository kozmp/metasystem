# 🐛 BUGFIX: Strona /dashboard/decisions nie ładowała komponentu React

**Data:** 2024-12-31  
**Problem:** Komponent DecisionSimulator nie był renderowany na stronie

---

## 🔍 Diagnoza:

**Problem:**
W Astro 5.x, manualna hydracja React komponentów za pomocą `createRoot()` w tag `<script>` nie działa poprawnie. Astro wymaga użycia **client directives**.

**Symptomy:**
- Strona się ładowała (200 OK)
- Ale komponent React nie był widoczny
- Tylko instrukcja i footer były renderowane

---

## ✅ Rozwiązanie:

### Przed (❌ Nie działa):
```astro
<div id="decision-simulator" data-objects={JSON.stringify(objects)}></div>

<script>
  import { createRoot } from 'react-dom/client';
  import { createElement } from 'react';
  import { DecisionSimulator } from '../../components/cybernetics/DecisionSimulator';

  const simulatorContainer = document.getElementById('decision-simulator');
  if (simulatorContainer) {
    const root = createRoot(simulatorContainer);
    root.render(createElement(DecisionSimulator, {}));
  }
</script>
```

### Po (✅ Działa):
```astro
---
import { DecisionSimulator } from '../../components/cybernetics/DecisionSimulator';
---

<DecisionSimulator client:load />
```

---

## 📚 Co to są Client Directives?

Client directives w Astro określają **kiedy i jak** komponent React powinien być załadowany:

| Directive | Kiedy ładuje | Użycie |
|-----------|-------------|---------|
| `client:load` | Natychmiast przy załadowaniu strony | Dla komponentów interaktywnych (formularze, dashboardy) |
| `client:idle` | Po załadowaniu strony, gdy przeglądarka jest bezczynna | Dla mniej priorytetowych komponentów |
| `client:visible` | Gdy komponent jest widoczny w viewport | Dla komponentów poniżej fold |
| `client:only="react"` | Tylko po stronie klienta | Dla komponentów z window/document |

**Wybór:** `client:load` - DecisionSimulator jest kluczowym komponentem strony.

---

## 🧪 Test:

1. Otwórz: http://localhost:4322/dashboard/decisions
2. Sprawdź czy komponent się renderuje:
   - ✅ Nagłówek [SYMULATOR STEROWANIA]
   - ✅ Sekcja [1] KONFIGURACJA
   - ✅ Wybór obiektu docelowego
   - ✅ Przyciski WZMOCNIĆ / OSŁABIĆ
   - ✅ Przycisk [URUCHOM SYMULACJĘ]

---

## 📊 Status:

**NAPRAWIONE** ✅

**Commit:** (pending)  
**Plików zmienionych:** 1 (`src/pages/dashboard/decisions.astro`)  
**Linii usuniętych:** 15 (manualna hydracja)  
**Linii dodanych:** 2 (import + directive)  

---

## 🎓 Lekcja:

W Astro 5:
- ❌ NIE używaj `createRoot()` w `<script>` tag
- ✅ Używaj client directives (`client:load`, `client:idle`, etc.)
- ✅ Importuj komponent w frontmatter (`---`)
- ✅ Renderuj bezpośrednio: `<Component client:load />`

---

**Dokumentacja Astro:**
https://docs.astro.build/en/guides/framework-components/#hydrating-interactive-components

