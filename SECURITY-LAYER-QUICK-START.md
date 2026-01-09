# 🛡️ HOMEOSTAT SECURITY LAYER - Quick Start

**Szybki przewodnik uruchomienia systemu bezpieczeństwa KMS**

---

## ⚡ SZYBKI START (5 minut)

### Krok 1: Uruchom migrację bazy danych

1. Otwórz **Supabase Dashboard**: https://supabase.com/dashboard
2. Wybierz swój projekt KMS
3. Przejdź do **SQL Editor**
4. Otwórz plik `migrations/002_security_layer_extension.sql`
5. Skopiuj całą zawartość i wklej do SQL Editor
6. Kliknij **"Run"**
7. Sprawdź output - powinien pokazać: `"Security Layer Extension - SUKCES"`

### Krok 2: Sprawdź Dashboard

```bash
# Uruchom serwer dev (jeśli nie jest uruchomiony)
npm run dev

# Otwórz w przeglądarce:
# http://localhost:4325/dashboard/security
```

### Krok 3: Przetestuj system

```bash
# Test 1: Bezpieczna operacja (powinno przejść)
curl -X POST http://localhost:4325/api/receptor/process \
  -H "Content-Type: application/json" \
  -d '{"text":"Analiza: Polska jest krajem w Europie."}'

# Test 2: Niebezpieczna operacja (powinno zablokować)
curl -X POST http://localhost:4325/api/receptor/process \
  -H "Content-Type: application/json" \
  -d '{"text":"DELETE FROM cybernetic_objects;"}'
```

**Oczekiwany wynik Test 2:**
```json
{
  "success": false,
  "error": "SECURITY_VIOLATION",
  "reason": "DELETE bez WHERE clause - utrata wszystkich danych w tabeli",
  "severity": "CRITICAL"
}
```

---

## 📊 CO ZOSTAŁO ZAIMPLEMENTOWANE?

### ✅ Core Modules

| Moduł | Plik | Funkcja |
|-------|------|---------|
| **Security Layer** | `src/lib/cybernetics/homeostat/security-layer.ts` | Walidacja operacji przed wykonaniem |
| **File Access Control** | `src/lib/cybernetics/homeostat/file-access-control.ts` | Macierz ochrony plików |
| **Audit Logger** | `src/lib/cybernetics/homeostat/audit-logger.ts` | Logowanie zdarzeń do bazy |

### ✅ UI Components

| Komponent | Plik | Funkcja |
|-----------|------|---------|
| **Security Dialog** | `src/components/cybernetics/SecurityConfirmationDialog.tsx` | Dialog potwierdzenia operacji |
| **Security Dashboard** | `src/pages/dashboard/security.astro` | Przegląd zdarzeń bezpieczeństwa |

### ✅ API Integration

| Endpoint | Status | Funkcja |
|----------|--------|---------|
| `/api/receptor/process.ts` | ✅ Zintegrowany | Walidacja przed przetworzeniem sygnału |

### ✅ Database

| Tabela | Rozszerzenie | Funkcja |
|--------|--------------|---------|
| `system_alerts` | +5 kolumn security | Przechowywanie zdarzeń bezpieczeństwa |

---

## 🎯 PRZYKŁADY UŻYCIA

### 1. Walidacja w API Endpoint

```typescript
import { validateOperation } from '@/lib/cybernetics/homeostat/security-layer';
import { logSecurityDecision } from '@/lib/cybernetics/homeostat/audit-logger';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  
  // ✅ Security check
  const securityCheck = validateOperation({
    type: 'sql_query',
    payload: body.query,
  });
  
  // Loguj decyzję
  await logSecurityDecision(securityCheck, {
    type: 'sql_query',
    payload: body.query,
  });
  
  // Jeśli zablokowano
  if (securityCheck.action === 'block') {
    return new Response(
      JSON.stringify({ error: securityCheck.reason }),
      { status: 403 }
    );
  }
  
  // Jeśli wymaga potwierdzenia
  if (securityCheck.action === 'ask_user') {
    return new Response(
      JSON.stringify({ requires_confirmation: true, ...securityCheck }),
      { status: 202 }
    );
  }
  
  // Kontynuuj normalnie...
};
```

### 2. Walidacja dostępu do pliku

```typescript
import { validateFileAccess } from '@/lib/cybernetics/homeostat/file-access-control';

const result = validateFileAccess('.env', 'write');

if (!result.allowed) {
  console.error(`BLOKADA: ${result.reason}`);
  // Nie wykonuj operacji
}
```

### 3. Dialog potwierdzenia w React

```tsx
import { SecurityConfirmationDialog, useSecurityConfirmation } from '@/components/cybernetics/SecurityConfirmationDialog';

function MyComponent() {
  const { showDialog, confirmationData, requestConfirmation, handleConfirm, handleReject } = useSecurityConfirmation();
  
  const handleRiskyOperation = async () => {
    const response = await fetch('/api/receptor/process', {
      method: 'POST',
      body: JSON.stringify({ text: 'DELETE FROM users WHERE id = 1;' })
    });
    
    const data = await response.json();
    
    if (data.requires_confirmation) {
      requestConfirmation(
        data.message,
        data.severity,
        data.context,
        () => console.log('User confirmed'),
        () => console.log('User rejected')
      );
    }
  };
  
  return (
    <>
      <button onClick={handleRiskyOperation}>Wykonaj operację</button>
      
      {showDialog && confirmationData && (
        <SecurityConfirmationDialog
          isOpen={showDialog}
          message={confirmationData.message}
          severity={confirmationData.severity}
          context={confirmationData.context}
          onConfirm={handleConfirm}
          onReject={handleReject}
        />
      )}
    </>
  );
}
```

---

## 🛡️ CO JEST CHRONIONE?

### SQL Operations (BLOKADA)
- ❌ `DELETE FROM table;` (bez WHERE)
- ❌ `DROP TABLE table;`
- ❌ `TRUNCATE TABLE table;`
- ❌ `DROP DATABASE db;`

### SQL Operations (WYMAGA POTWIERDZENIA)
- ⚠️ `DELETE FROM table WHERE id = 1;`
- ⚠️ `UPDATE table SET ... WHERE ...;`
- ⚠️ `ALTER TABLE ...;`

### Pliki (BLOKADA)
- ❌ `.env` (zero access)
- ❌ `METACYBERNETYKA - Józef Kossecki 2015_compressed.pdf` (zero access)
- ❌ `migrations/` (no delete)
- ❌ `package.json` (read-only)

### API Keys (BLOKADA)
- ❌ `SUPABASE_KEY`
- ❌ `GEMINI_API_KEY`
- ❌ `OPENROUTER_API_KEY`
- ❌ JWT tokens (`eyJ...`)

---

## 📈 DASHBOARD

### Dostęp
```
http://localhost:4325/dashboard/security
```

### Funkcje
- 📊 **Statystyki** (ostatnie 7 dni):
  - Wszystkie zdarzenia
  - Zablokowane operacje
  - Potwierdzone przez użytkownika
  - Odrzucone przez użytkownika
  - Krytyczne zagrożenia

- 📋 **Lista zdarzeń** (ostatnie 50):
  - Data i czas
  - Typ operacji
  - Decyzja (🚫/✓/✗)
  - Severity (CRITICAL/HIGH/MEDIUM/LOW)
  - Opis
  - Target (plik/tabela)

---

## 🧪 TESTOWANIE

### Uruchom testy jednostkowe
```bash
npm test security-layer.test.ts
```

### Testy manualne (curl)

#### Test 1: Bezpieczna operacja
```bash
curl -X POST http://localhost:4325/api/receptor/process \
  -H "Content-Type: application/json" \
  -d '{"text":"SELECT * FROM cybernetic_objects LIMIT 10;"}'
```
**Oczekiwany wynik:** HTTP 200, operacja wykonana

#### Test 2: DELETE bez WHERE (CRITICAL)
```bash
curl -X POST http://localhost:4325/api/receptor/process \
  -H "Content-Type: application/json" \
  -d '{"text":"DELETE FROM cybernetic_objects;"}'
```
**Oczekiwany wynik:** HTTP 403, SECURITY_VIOLATION

#### Test 3: DELETE z WHERE (wymaga potwierdzenia)
```bash
curl -X POST http://localhost:4325/api/receptor/process \
  -H "Content-Type: application/json" \
  -d '{"text":"DELETE FROM cybernetic_objects WHERE id = 123;"}'
```
**Oczekiwany wynik:** HTTP 202, requires_confirmation: true

#### Test 4: Ekspozycja klucza API
```bash
curl -X POST http://localhost:4325/api/receptor/process \
  -H "Content-Type: application/json" \
  -d '{"text":"Mój klucz to GEMINI_API_KEY=AIzaSyD..."}'
```
**Oczekiwany wynik:** HTTP 403, SECURITY_VIOLATION

---

## 🔧 KONFIGURACJA

### Dodanie nowego dangerous pattern

Edytuj `src/lib/cybernetics/homeostat/security-layer.ts`:

```typescript
const SQL_DANGEROUS_PATTERNS: SecurityPattern[] = [
  // ... istniejące patterns
  
  // Dodaj nowy pattern
  {
    pattern: /YOUR_REGEX_HERE/i,
    reason: 'Opis zagrożenia',
    severity: 'HIGH',
    action: 'block', // lub 'ask_user'
  },
];
```

### Dodanie chronionego pliku

Edytuj `src/lib/cybernetics/homeostat/file-access-control.ts`:

```typescript
export const FILE_PROTECTION_MATRIX = {
  zeroAccess: [
    '.env',
    'YOUR_FILE_HERE', // Dodaj tutaj
  ],
  // ...
};
```

---

## 📚 DOKUMENTACJA

- **Pełna dokumentacja:** `SECURITY-LAYER-IMPLEMENTATION.md`
- **Testy:** `src/lib/cybernetics/homeostat/security-layer.test.ts`
- **Migracja SQL:** `migrations/002_security_layer_extension.sql`

---

## 🎯 ZGODNOŚĆ Z METACYBERNETYKĄ 2015

### Homeostat (Rozdział 5)
✅ Security Layer = **sprzężenie zwrotne ujemne**  
✅ Stabilizuje system przez blokowanie destrukcyjnych operacji

### Moc Swobodna (P = v × a × c)
✅ Dialog potwierdzenia = zwiększenie **P_user**  
✅ Człowiek ma ostateczną decyzję w systemie poznawczym

### Retencja
✅ Audit log w bazie danych = **pamięć operacyjna systemu**  
✅ Transparentność - użytkownik widzi co AI próbowało zrobić

---

## ✅ CHECKLIST

- [ ] Uruchomiłem migrację `002_security_layer_extension.sql`
- [ ] Sprawdziłem dashboard `/dashboard/security`
- [ ] Przetestowałem API endpoint (curl)
- [ ] Przeczytałem pełną dokumentację `SECURITY-LAYER-IMPLEMENTATION.md`

---

## 🆘 TROUBLESHOOTING

### Problem: Dashboard pokazuje błąd połączenia z bazą

**Rozwiązanie:**
1. Sprawdź czy migracja została uruchomiona
2. Sprawdź klucze Supabase w `.env`
3. Sprawdź logi w konsoli przeglądarki

### Problem: API nie blokuje niebezpiecznych operacji

**Rozwiązanie:**
1. Sprawdź czy endpoint jest zintegrowany z `validateOperation()`
2. Sprawdź logi serwera (`npm run dev`)
3. Sprawdź czy pattern jest poprawny (regex)

### Problem: Testy nie przechodzą

**Rozwiązanie:**
```bash
# Zainstaluj zależności testowe
npm install --save-dev @jest/globals

# Uruchom testy z verbose
npm test -- --verbose security-layer.test.ts
```

---

**Status:** ✅ System gotowy do użycia  
**Data:** 2026-01-09

