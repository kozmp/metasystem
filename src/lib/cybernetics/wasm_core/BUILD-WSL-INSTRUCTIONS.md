# BUILD INSTRUKCJE - WSL

## Status: Instalacja wasm-pack w toku...

## OPCJA A: Z wasm-pack (Zalecane)

```bash
# 1. Wejdź do WSL
wsl

# 2. Nawiguj do projektu
cd "/mnt/c/projekty/KOSSECKI METASYSTEM (KMS)/src/lib/cybernetics/wasm_core"

# 3. Załaduj środowisko Rust
source $HOME/.cargo/env

# 4. Zbuduj moduł Wasm
wasm-pack build --target web --release

# 5. Sprawdź wyniki
ls -lh pkg/
```

**Oczekiwane pliki w `pkg/`:**
- `wasm_core.wasm` - skompilowany moduł (~50-100KB)
- `wasm_core.js` - JavaScript glue code
- `wasm_core.d.ts` - TypeScript definitions
- `package.json` - NPM package

---

## OPCJA B: Bezpośredni cargo build (Jeśli wasm-pack fail)

```bash
# 1. Wejdź do WSL
wsl

# 2. Nawiguj do projektu
cd "/mnt/c/projekty/KOSSECKI METASYSTEM (KMS)/src/lib/cybernetics/wasm_core"

# 3. Załaduj środowisko
source $HOME/.cargo/env

# 4. Zbuduj do wasm32
cargo build --target wasm32-unknown-unknown --release

# 5. Sprawdź wynik
ls -lh target/wasm32-unknown-unknown/release/wasm_core.wasm

# 6. Zainstaluj wasm-bindgen-cli (jeśli potrzebne)
cargo install wasm-bindgen-cli

# 7. Wygeneruj bindings
wasm-bindgen target/wasm32-unknown-unknown/release/wasm_core.wasm \
  --out-dir pkg \
  --target web

# 8. Sprawdź wyniki
ls -lh pkg/
```

---

## TESTY

### Test 1: Sprawdzenie rozmiaru

```bash
wsl bash -c "cd '/mnt/c/projekty/KOSSECKI METASYSTEM (KMS)/src/lib/cybernetics/wasm_core' && ls -lh pkg/wasm_core.wasm"
```

**Oczekiwany rozmiar:** 50-150KB (po optymalizacji)

### Test 2: Uruchomienie testów Rust

```bash
wsl bash -c "cd '/mnt/c/projekty/KOSSECKI METASYSTEM (KMS)/src/lib/cybernetics/wasm_core' && source \$HOME/.cargo/env && cargo test"
```

**Oczekiwane:** 3/3 testy PASS

### Test 3: Weryfikacja TypeScript definitions

```bash
cat pkg/wasm_core.d.ts
```

Powinien zawierać:
```typescript
export function wasm_find_influence_paths(
  objects_json: string,
  correlations_json: string,
  target_id: string,
  goal: string
): string;
```

---

## TROUBLESHOOTING

### Problem: `wasm-pack: command not found`

```bash
# Sprawdź instalację
wsl bash -c "source \$HOME/.cargo/env && which wasm-pack"

# Reinstaluj
wsl bash -c "source \$HOME/.cargo/env && cargo install wasm-pack --force"
```

### Problem: `error: linking with cc failed`

```bash
# Zainstaluj build essentials
wsl bash -c "sudo apt-get update && sudo apt-get install -y build-essential"
```

### Problem: `pkg-config not found`

```bash
wsl bash -c "sudo apt-get install -y pkg-config"
```

### Problem: Błędy kompilacji w dependencies

```bash
# Wyczyść cache i przebuduj
wsl bash -c "cd '/mnt/c/projekty/KOSSECKI METASYSTEM (KMS)/src/lib/cybernetics/wasm_core' && source \$HOME/.cargo/env && cargo clean && cargo build --target wasm32-unknown-unknown --release"
```

---

## OPTYMALIZACJA ROZMIARU

### Opcja 1: wasm-opt (z binaryen)

```bash
# Instalacja binaryen w WSL
wsl bash -c "sudo apt-get install -y binaryen"

# Optymalizacja
wsl bash -c "cd '/mnt/c/projekty/KOSSECKI METASYSTEM (KMS)/src/lib/cybernetics/wasm_core' && wasm-opt -Oz -o pkg/wasm_core_opt.wasm pkg/wasm_core.wasm"

# Porównanie rozmiarów
wsl bash -c "cd '/mnt/c/projekty/KOSSECKI METASYSTEM (KMS)/src/lib/cybernetics/wasm_core' && ls -lh pkg/wasm_core*.wasm"
```

### Opcja 2: wee_alloc (mniejszy allocator)

W `Cargo.toml`:
```toml
[features]
default = ["wee_alloc"]
```

Build:
```bash
wasm-pack build --target web --release -- --features wee_alloc
```

---

## NASTĘPNE KROKI PO BUILDZIE

1. **Integracja z Vite:**
   - Skopiuj `pkg/` do miejsca dostępnego dla Vite
   - Zaimportuj w `bridge.ts`

2. **Benchmark:**
   ```bash
   npm run test:benchmark
   ```

3. **Deploy:**
   ```bash
   npm run build
   ```

---

**Utworzone:** 2026-01-02
**Ostatnia aktualizacja:** [Auto-update po zakończeniu buildu]
