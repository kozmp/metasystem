# 🛡️ DETEKCJA REKLAM I MANIPULACJI - Rozszerzona Metacybernetyka 2015

**KOSSECKI METASYSTEM (KMS) - Anti-Manipulation Module**

---

## ✅ TAK - System wykrywa reklamy i zakłamanie!

### 🎯 Jak to działa?

System Kosseckiego analizuje **intencję sterowniczą** źródła:
- **Poznawcza** (cognitive) - cel: prawda, wiedza
- **Ideologiczna** (ideological) - cel: przekonania
- **Etyczna** (ethical) - cel: normy moralne
- **⚠️ EKONOMICZNA** (economic) - cel: **sprzedaż, zysk!**

---

## 🔍 3 Parametry Kluczowe

### 1. **quality_a (Jakość informacji)**
```
1.0 = Obiektywne fakty, badania naukowe
0.7 = Mieszane (fakty + opinie)
0.3 = Perswazja, emocje
0.1 = Czysta manipulacja/reklama 🚨
```

### 2. **distortion_z (Zniekształcenie)**
```
Z = I_input / I_real  (Wzór Kosseckiego)

Z = 1.0  → Rzetelna informacja
Z > 1.5  → 🚨 PROPAGANDA/MANIPULACJA
Z > 2.5  → 🚨🚨 EKSTREMALNA manipulacja
Z > 3.5  → 🚨🚨🚨 REKLAMA ukryta jako edukacja
```

### 3. **control_system_type = 'economic'**
```
Jeśli wykryto: 
- Product placement
- Linki afiliacyjne
- Presję sprzedażową
→ System automatycznie klasyfikuje jako ECONOMIC
```

---

## 🚨 Czerwone Flagi (Auto-Detection)

### A) **PRODUCT PLACEMENT**
✅ Wykrywa:
- Logotypy, marki w tle
- "Przypadkowe" umieszczenie produktów
- Linki afiliacyjne w opisie
- Kody rabatowe

**Reakcja systemu:**
- `quality_a ≤ 0.3`
- `distortion_z ≥ 2.0`
- `commercial_intent = true`
- `control_system_type = 'economic'`

---

### B) **MANIPULACJA EMOCJONALNA**
✅ Wykrywa:
- Fear mongering ("straszenie")
- Hope selling ("sprzedaż nadziei")
- Brak źródeł naukowych
- Selektywne pomijanie faktów

**Reakcja systemu:**
- `quality_a` obniżone o 0.3-0.5
- `distortion_z` podwyższone proporcjonalnie
- Ostrzeżenie w `reasoning`

---

### C) **PSEUDO-NAUKA**
✅ Wykrywa:
- "Naukowcy odkryli" (bez źródeł)
- "Sekret, którego lekarze nie chcą ujawnić"
- Fake authority (osoba w fartuchu, ale nie ekspert)
- Anegdoty zamiast danych

**Reakcja systemu:**
- `quality_a ≤ 0.2`
- `distortion_z ≥ 2.5`
- Flaga: `manipulation_techniques: ["pseudo-science"]`

---

### D) **SOCIAL PROOF**
✅ Wykrywa:
- "10 milionów ludzi już kupiło"
- Testimoniale bez weryfikacji
- Presja czasowa ("tylko dzisiaj!")
- Sztuczny deficyt

**Reakcja systemu:**
- `distortion_z ≥ 2.0`
- Flaga: `manipulation_techniques: ["social-proof", "scarcity"]`

---

## 📊 Przykład: Film "Jak schudnąć" (ukryta reklama)

### Input:
```
URL: https://youtube.com/watch?v=XYZ123
Tytuł: "Jak schudnąć naturalnie - poradnik dietetyka"
```

### Output Gemini:
```json
{
  "power_v": 30000.0,
  "quality_a": 0.12,  // 🚨 BARDZO NISKA!
  "mass_c": 11.8,
  "total_power_p": 42864.0,
  
  "civilization_code": "turandot",  // Gospodarcza
  "control_system_type": "economic",  // 🚨 EKONOMICZNY!
  "distortion_z": 3.8,  // 🚨🚨🚨 EKSTREMALNE!
  
  "commercial_intent": true,  // 🛒 REKLAMA!
  "propaganda_warning": true,  // ⚠️ Z > 1.5
  
  "visual_symbols": [
    "supplement bottle (product placement)",
    "affiliate link in description",
    "fake doctor testimonial",
    "brand logo visible 47 times"
  ],
  
  "manipulation_techniques": [
    "product-placement",
    "pseudo-science",
    "fear-mongering",
    "social-proof",
    "affiliate-marketing"
  ],
  
  "reasoning": "⚠️⚠️⚠️ WYKRYTO UKRYTĄ REKLAMĘ MASOWANĄ JAKO EDUKACJA
  
  Film pozoruje poradnik dietetyczny, ale faktycznie jest profesjonalną 
  reklamą suplementu. Analiza wykryła:
  
  1. PRODUCT PLACEMENT: Butelka suplementu widoczna w 87% kadru
  2. PSEUDO-NAUKA: 'Naukowcy odkryli' (bez źródeł), fałszywy 'dietetyk'
  3. MANIPULACJA EMOCJONALNA: Straszenie skutkami otyłości
  4. SOCIAL PROOF: '2 miliony zadowolonych klientów' (bez weryfikacji)
  5. PRESJA CZASOWA: 'Promocja tylko do końca tygodnia'
  6. LINK AFILIACYJNY: W opisie wideo (ukryty kod rabatowy)
  7. SELEKTYWNE DANE: Pomija badania naukowe o skutkach ubocznych
  
  Wskaźnik zniekształcenia Z=3.8 wskazuje na EKSTREMALNĄ manipulację.
  System sterowania: EKONOMICZNY (cel = sprzedaż, nie edukacja).
  
  → OSTRZEŻENIE: To REKLAMA, nie rzetelna informacja!"
}
```

---

## 🎯 Jak używać?

### **OPCJA 1: Terminal**
```bash
# Edytuj plik:
src/scripts/test-gemini-only.ts

# Linia 43 - wklej link:
const TEST_URL = "https://youtube.com/watch?v=PODEJRZANY_FILM";

# Uruchom:
npm run test:gemini
```

### **OPCJA 2: Dashboard UI**
```
1. Otwórz: http://localhost:4321/dashboard
2. Znajdź sekcję: [GEMINI] Analiza Wideo YouTube
3. Wklej URL
4. Kliknij "Analizuj Wideo"
5. Czekaj 10-30 sekund
6. Zobacz wyniki z flagami reklam!
```

---

## 🛡️ Co system pokaże jeśli wykryje reklamę?

### W Terminalu:
```
╔═══════════════════════════════════════════════════════════════╗
║  ✅ SUKCES - GEMINI DZIAŁA!                                   ║
╚═══════════════════════════════════════════════════════════════╝

📊 WYNIK ANALIZY:

  Moc jednostkowa (v):       30000.00 W
  Jakość/sprawność (a):      0.12  🚨 BARDZO NISKA!
  Masa/zasięg (c):           11.80
  ────────────────────────────────────────────────────────
  MOC CAŁKOWITA (P):         42864.00 W
  ────────────────────────────────────────────────────────
  Cywilizacja:               turandot  (gospodarcza)
  System sterowania:         economic  🚨 EKONOMICZNY!
  Zniekształcenie (Z):       3.80  🚨🚨🚨 EKSTREMALNE!

  ⚠️  HIGH PROPAGANDA RISK
  Z = 3.80 > 1.5

  🛒 WYKRYTO INTENCJĘ KOMERCYJNĄ / REKLAMĘ!

  Techniki manipulacji:
    - product-placement
    - pseudo-science
    - fear-mongering
    - social-proof
    - affiliate-marketing

  Symbole wizualne:
    - supplement bottle (product placement)
    - affiliate link in description
    - fake doctor testimonial
    - brand logo visible 47 times

  Uzasadnienie AI:
  "⚠️⚠️⚠️ WYKRYTO UKRYTĄ REKLAMĘ... (pełny opis)"
```

### W Dashboard:
- 🔴 **Czerwony alert** na górze strony
- 🛒 **Ikona koszyka** przy obiekcie
- ⚠️ **Lista technik manipulacji**
- 📊 **Graf z czerwonym punktem** (economic)

---

## 🧪 Przetestuj na prawdziwych filmach!

### Filmy do testu (sugerowane):
1. **Influencer z product placement** - powinno wykryć Z > 2.0
2. **"Tajemnica lekarzy"** - pseudo-nauka, Z > 2.5
3. **Testimonial bez źródeł** - manipulacja emocjonalna
4. **Prawdziwy wykład naukowy** - powinno dać quality_a > 0.8, Z ≈ 1.0

---

## 📚 Teoria (Metacybernetyka 2015)

### Dlaczego to działa?

Kossecki wykazał, że **każdy system ma dominujący cel sterowania**:

1. **Poznawczy** - szuka prawdy (nauka, edukacja)
2. **Ideologiczny** - forsuje przekonania (polityka)
3. **Etyczny** - narzuca normy (religia, moralność)
4. **🚨 Ekonomiczny** - maksymalizuje zysk (reklama!)

**Reklama ukryta jako edukacja** to **sprzeczność systemowa**:
- Pozoruje system POZNAWCZY (edukacja)
- Faktycznie jest systemem EKONOMICZNYM (sprzedaż)

**Gemini wykrywa tę sprzeczność** przez analizę:
- Języka (perswazja vs faktografia)
- Wizualizacji (product placement)
- Struktury argumentacji (brak źródeł)
- Intencji (co autor zyskuje?)

---

## ✅ Podsumowanie

**TAK** - system wykrywa:
- ✅ Reklamy ukryte (product placement)
- ✅ Manipulację emocjonalną
- ✅ Pseudo-naukę
- ✅ Techniki social proof
- ✅ Presję sprzedażową
- ✅ Linki afiliacyjne
- ✅ Selektywne pomijanie faktów

**Parametry kluczowe:**
- `quality_a < 0.3` → manipulacja
- `distortion_z > 2.5` → reklama
- `control_system_type = 'economic'` → cel komercyjny
- `commercial_intent = true` → flaga!

**Metacybernetyka 2015 w akcji!** 🚀🛡️

---

*Raport: 2025-01-04*  
*System: KOSSECKI METASYSTEM (KMS)*  
*Moduł: Anti-Manipulation Detection*

