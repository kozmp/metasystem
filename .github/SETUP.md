# 🚀 Konfiguracja GitHub Actions dla KMS

## Krok po kroku - Uruchomienie CI/CD

### 1️⃣ Konfiguracja GitHub Environment

#### Stwórz Environment "integration"

1. Przejdź do repozytorium na GitHub
2. **Settings** → **Environments** → **New environment**
3. Nazwa: `integration`
4. Kliknij **Configure environment**

#### Dodaj Environment Secrets

W environment `integration` dodaj następujące sekrety:

| Nazwa Sekretu | Skąd Pobrać | Wymagane? |
|---------------|-------------|-----------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API | ✅ TAK |
| `SUPABASE_KEY` | Supabase Dashboard → Settings → API | ✅ TAK |
| `GEMINI_API_KEY` | https://makersuite.google.com/app/apikey | ✅ TAK |
| `GOOGLE_GENAI_API_KEY` | https://makersuite.google.com/app/apikey | ⚠️ Alternatywa |
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys | ⚠️ Opcjonalne |
| `AI_MODEL` | Nazwa modelu (np. "google/gemini-pro") | ⚠️ Opcjonalne |

**Uwaga:** `GEMINI_API_KEY` lub `GOOGLE_GENAI_API_KEY` - potrzebujesz przynajmniej jednego z nich.

---

### 2️⃣ Weryfikacja Struktury Plików

Upewnij się, że masz wszystkie potrzebne pliki:

```
.github/
├── actions/
│   └── setup-node-deps/
│       └── action.yml          ✅ Composite action
├── workflows/
│   └── pull-request.yml        ✅ Główny workflow
├── README.md                    ✅ Dokumentacja
└── SETUP.md                     ✅ Ten plik
```

---

### 3️⃣ Testowanie Workflow

#### Utwórz Test Branch

```bash
# Stwórz nową gałąź
git checkout -b test/github-actions

# Dodaj zmianę testową
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: sprawdzenie GitHub Actions"

# Push do GitHub
git push origin test/github-actions
```

#### Utwórz Pull Request

1. Przejdź do repozytorium na GitHub
2. Zobaczysz notyfikację: **Compare & pull request**
3. Kliknij i utwórz PR do gałęzi `master`

#### Obserwuj Workflow

- Workflow uruchomi się automatycznie
- Przejdź do zakładki **Actions**
- Kliknij na "Pull Request CI"
- Obserwuj poszczególne joby:
  - 🔍 Lint & Type Check
  - 🧪 Unit Tests
  - 🔗 Integration Tests
  - 💬 Status Comment

---

### 4️⃣ Interpretacja Wyników

#### ✅ Success - Wszystko działa

Po zakończeniu workflow zobaczysz:
- ✅ Zielony status przy wszystkich jobach
- 💬 Automatyczny komentarz w PR z podsumowaniem:
  - Statystyki wykonania
  - Code coverage (%)
  - Zgodność z Metacybernetyką

**Akcja:** Możesz merge'ować PR

---

#### ❌ Failure - Coś poszło nie tak

##### Scenario 1: Lint Failed

**Objawy:**
```
❌ Lint & Type Check - failure
✅ Unit Tests - skipped
✅ Integration Tests - skipped
```

**Przyczyna:** Błędy TypeScript (typy, składnia)

**Rozwiązanie:**
```bash
# Uruchom lokalnie
npx tsc --noEmit

# Napraw błędy i commituj
git add .
git commit -m "fix: błędy TypeScript"
git push
```

---

##### Scenario 2: Unit Tests Failed

**Objawy:**
```
✅ Lint & Type Check - success
❌ Unit Tests - failure
✅ Integration Tests - success
```

**Przyczyna:** Testy jednostkowe nie przechodzą

**Rozwiązanie:**
```bash
# Uruchom lokalnie
npm run test

# Sprawdź który test failuje
# Napraw kod lub test
git add .
git commit -m "fix: naprawiono testy jednostkowe"
git push
```

---

##### Scenario 3: Integration Tests Failed

**Objawy:**
```
✅ Lint & Type Check - success
✅ Unit Tests - success
❌ Integration Tests - failure
```

**Przyczyna:** 
- Brak połączenia z Supabase
- Nieprawidłowe klucze API
- Problemy z zewnętrznymi serwisami

**Rozwiązanie:**

1. **Sprawdź sekrety:**
   - Settings → Environments → integration
   - Upewnij się, że wszystkie wymagane sekrety są ustawione

2. **Sprawdź logi workflow:**
   - Actions → Pull Request CI → Integration Tests
   - Szukaj komunikatów błędów

3. **Testuj lokalnie:**
```bash
# Skopiuj .env (jeśli istnieje)
# Lub stwórz nowy z kluczami

# Uruchom integration test
npm run test:full
```

4. **Typowe problemy:**
   - `SUPABASE_URL` - czy URL jest poprawny?
   - `SUPABASE_KEY` - czy używasz `anon` czy `service_role`?
   - `GEMINI_API_KEY` - czy klucz jest aktywny?

---

### 5️⃣ Maintenance - Aktualizacja Akcji

Co 3-6 miesięcy sprawdź czy są nowsze wersje GitHub Actions:

```powershell
# Windows PowerShell
$actions = @('checkout', 'setup-node', 'upload-artifact', 'download-artifact', 'github-script')

foreach ($action in $actions) {
    $version = (Invoke-RestMethod -Uri "https://api.github.com/repos/actions/$action/releases/latest").tag_name
    Write-Host "actions/$action@$version"
}
```

```bash
# Linux/Mac
for action in checkout setup-node upload-artifact download-artifact github-script; do
    version=$(curl -s https://api.github.com/repos/actions/$action/releases/latest | grep '"tag_name":' | sed -E 's/.*"(v[0-9]+).*/\1/')
    echo "actions/$action@$version"
done
```

Zaktualizuj wersje w:
- `.github/workflows/pull-request.yml`
- `.github/actions/setup-node-deps/action.yml`

---

### 6️⃣ Debugging - Najczęstsze Problemy

#### Problem: "Workflow not found"

**Przyczyna:** GitHub nie widzi workflow

**Rozwiązanie:**
```bash
# Sprawdź strukturę plików
ls -la .github/workflows/

# Upewnij się, że plik istnieje
cat .github/workflows/pull-request.yml

# Sprawdź składnię YAML
npx yaml-lint .github/workflows/pull-request.yml
```

---

#### Problem: "Resource not accessible by integration"

**Przyczyna:** Brak uprawnień dla `GITHUB_TOKEN`

**Rozwiązanie:**
1. Settings → Actions → General
2. Scroll do "Workflow permissions"
3. Wybierz: **Read and write permissions**
4. Zaznacz: **Allow GitHub Actions to create and approve pull requests**
5. Kliknij **Save**

---

#### Problem: "Environment protection rules not met"

**Przyczyna:** Environment `integration` ma włączone Required Reviewers

**Rozwiązanie:**
1. Settings → Environments → integration
2. Usuń "Required reviewers" (jeśli nie są potrzebne)
3. Lub zatwierdź deployment manualnie w zakładce Actions

---

### 7️⃣ Zaawansowane: Branch Protection Rules

Aby wymusić przejście CI przed merge:

1. **Settings** → **Branches**
2. **Add branch protection rule**
3. Branch name pattern: `master`
4. Zaznacz:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
5. Status checks required:
   - `Lint & Type Check`
   - `Unit Tests`
   - `Integration Tests`
6. Kliknij **Create**

**Efekt:** Nie można zmerge'ować PR bez przejścia wszystkich testów.

---

## 🎯 Checklist Przed Merge

Przed zmergowaniem PR upewnij się, że:

- [ ] ✅ Wszystkie joby przeszły pomyślnie (zielone checkmarki)
- [ ] 📊 Code coverage jest akceptowalne (≥ 50%, idealnie ≥ 80%)
- [ ] 💬 Komentarz z statusem został dodany automatycznie
- [ ] 🔍 Code review został wykonany przez innego developera
- [ ] 🦾 Zmiany są zgodne z Metacybernetyką Kosseckiego

---

## 📚 Dodatkowe Zasoby

- [README.md](.github/README.md) - Pełna dokumentacja workflow
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Troubleshooting Workflows](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)

---

**Pytania?** Otwórz Issue w repozytorium z tagiem `github-actions`

