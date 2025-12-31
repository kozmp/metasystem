# 🚨 INSTRUKCJA BEZPIECZEŃSTWA - NAPRAWA WYCIEKU KLUCZA API

## ⚠️ CO SIĘ STAŁO

Klucz API OpenRouter został przypadkowo wrzucony do publicznego repozytorium GitHub.
OpenRouter automatycznie wyłączył ten klucz.

**Naruszony klucz:** `...4380`  
**Lokalizacja:** https://github.com/kozmp/metasystem/blob/8e79be5/WYNIKI-TESTOW.md

---

## ✅ CO ZOSTAŁO JUŻ ZROBIONE

1. ✅ Usunięto pliki z wrażliwymi danymi z repozytorium
2. ✅ Dodano `.gitignore` dla plików testowych
3. ✅ Utworzono bezpieczne wersje plików dokumentacji
4. ✅ Scommitowano zmiany

---

## 🔴 CO MUSISZ TERAZ ZROBIĆ

### Krok 1: Wygeneruj nowy klucz API ⚠️ KRYTYCZNE

1. Idź na: https://openrouter.ai/keys
2. Kliknij **"Create Key"**
3. Skopiuj nowy klucz

### Krok 2: Zaktualizuj plik .env

Edytuj plik `.env` i zamień stary klucz na nowy:

```bash
# STARY (wyłączony):
# OPENROUTER_API_KEY=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

# NOWY (wygeneruj na openrouter.ai/keys):
OPENROUTER_API_KEY=twój_nowy_klucz_tutaj
```

### Krok 3: Wyczyść historię Git ⚠️ WAŻNE

Usunięcie plików z repozytorium NIE usuwa ich z historii git. 
Musisz wyczyścić historię!

#### Opcja A: BFG Repo-Cleaner (ZALECANE - szybsze)

```bash
# 1. Pobierz BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# 2. Utwórz backup
git clone --mirror https://github.com/kozmp/metasystem.git metasystem-backup.git

# 3. Wyczyść wrażliwe dane
java -jar bfg.jar --replace-text passwords.txt metasystem-backup.git

# 4. Wyczyść reflog i gc
cd metasystem-backup.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push
git push --force
```

Plik `passwords.txt`:
```
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===>REMOVED
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeGdlZ2RjeWdxcnB0dXZpd21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjIzMjgsImV4cCI6MjA4MjA5ODMyOH0.AnRsFOgb-X9GCR9Dt3bEMNV_H_cxt_kUiUmGDFc2F4o===>REMOVED
```

#### Opcja B: git filter-repo

```bash
# 1. Zainstaluj git-filter-repo
pip install git-filter-repo

# 2. Utwórz backup
git clone https://github.com/kozmp/metasystem.git metasystem-clean
cd metasystem-clean

# 3. Usuń wrażliwe pliki z historii
git filter-repo --path WYNIKI-TESTOW.md --invert-paths
git filter-repo --path INSTRUKCJA-AKTUALIZACJI-BAZY.md --invert-paths
git filter-repo --path ENV_SETUP.md --invert-paths
git filter-repo --path test-scraper.ts --invert-paths
git filter-repo --path test-rss.ts --invert-paths

# 4. Force push
git remote add origin https://github.com/kozmp/metasystem.git
git push origin --force --all
git push origin --force --tags
```

#### Opcja C: git filter-branch (najmniej zalecane - wolniejsze)

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch WYNIKI-TESTOW.md INSTRUKCJA-AKTUALIZACJI-BAZY.md ENV_SETUP.md test-scraper.ts test-rss.ts" \
  --prune-empty --tag-name-filter cat -- --all

git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
git push origin --force --tags
```

### Krok 4: Push zmian

```bash
git push origin master --force
```

### Krok 5: Weryfikacja

Sprawdź czy klucze zniknęły z GitHub:
```
https://github.com/kozmp/metasystem
```

Użyj GitHub search:
```
sk-or-v1-a6eb
```

Jeśli nadal widzisz klucze, powtórz Krok 3.

---

## 🔒 ZAPOBIEGANIE W PRZYSZŁOŚCI

### 1. Nigdy nie commituj plików .env

Plik `.gitignore` został zaktualizowany i zawiera:
```
.env
.env.local
.env.*.local
*-with-keys.md
test-scraper.ts
test-rss.ts
```

### 2. Używaj zmiennych środowiskowych

Zawsze:
```bash
# W terminalu (PowerShell):
$env:OPENROUTER_API_KEY="your_key_here"
```

Nigdy:
```javascript
// ❌ ZŁE
const apiKey = "sk-or-v1-xxxxx";

// ✅ DOBRE
const apiKey = process.env.OPENROUTER_API_KEY;
```

### 3. Skanuj przed commitem

Zainstaluj pre-commit hook:

```bash
# Zainstaluj gitleaks
# https://github.com/gitleaks/gitleaks

# Dodaj do .git/hooks/pre-commit
#!/bin/sh
gitleaks protect --staged --verbose
```

### 4. Używaj GitHub Secret Scanning

GitHub automatycznie skanuje publiczne repo i wysyła alerty.
Upewnij się że masz włączone notyfikacje.

---

## 📋 Checklist Bezpieczeństwa

- [ ] Wygenerowałem nowy klucz API na openrouter.ai/keys
- [ ] Zaktualizowałem `.env` z nowym kluczem
- [ ] Wyczyściłem historię git (BFG / filter-repo)
- [ ] Wykonałem force push do GitHub
- [ ] Zweryfikowałem że klucze zniknęły z GitHub
- [ ] Sprawdziłem że aplikacja działa z nowym kluczem
- [ ] Przeczytałem sekcję "Zapobieganie w przyszłości"

---

## 🆘 Pomoc

### GitHub Support
https://support.github.com/

### OpenRouter Support
support@openrouter.ai

### Git BFG Repo-Cleaner
https://rtyley.github.io/bfg-repo-cleaner/

### git-filter-repo
https://github.com/newren/git-filter-repo

---

## 📚 Więcej Informacji

- [GitHub - Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP - API Security](https://owasp.org/www-project-api-security/)
- [Git Secret](https://git-secret.io/)

---

**Status:** ⚠️ **WYMAGANA AKCJA - Wykonaj kroki 1-5 NATYCHMIAST**

**Priorytet:** 🔴 **KRYTYCZNY**

