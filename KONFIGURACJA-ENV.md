# ⚡ Konfiguracja .env - INSTRUKCJA

## Krok 1: Utwórz plik .env

W głównym folderze projektu utwórz plik `.env` (jeśli nie istnieje):

```bash
# Windows PowerShell:
New-Item -Path .env -ItemType File -Force

# Lub ręcznie: kliknij prawym na folder → New → Text Document → zmień nazwę na .env
```

## Krok 2: Wklej konfigurację

Otwórz plik `.env` w edytorze i wklej:

```env
# GEMINI API (Google AI Studio)
GEMINI_API_KEY=AIzaSyDQev279vUiP5wCncKQ3Tydbd0qa3ywIYY

# SUPABASE (jeśli już masz projekt)
SUPABASE_URL=https://twoj-projekt.supabase.co
SUPABASE_ANON_KEY=eyJ...twoj_klucz...

# Opcjonalne: OpenAI (dla AI Strategy w module decyzyjnym)
# OPENAI_API_KEY=sk-...
```

## Krok 3: Zapisz i zrestartuj

```bash
# Jeśli serwer dev jest uruchomiony, zatrzymaj (Ctrl+C) i uruchom ponownie:
npm run dev
```

## ✅ Gotowe!

Teraz możesz uruchomić test:

```bash
npm run demo:video-pipeline
```

---

**UWAGA:** Plik `.env` jest w `.gitignore` - nigdy nie zostanie commitowany do repozytorium.

