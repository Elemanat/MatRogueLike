# Generátory příkladů: Šablony a Vzorce

Tento dokument ukazuje "kostru" generátoru – tedy pevné šablony, do kterých se automaticky dosazují náhodná čísla, a jak se tyto hodnoty vybírají.

Všechny příklady jsou vygenerovány v backendu na základě obtížnosti (1-5), kde patra 1-3 jsou běžné příklady, patro 4 je miniboss a patro 5 je finální boss.

---

## 1. Dělitelnost a prvočísla
V této věži se generují otázky zaměřené na pochopení vlastností čísel. Opakovací otázky se využívají zejména na nižších patrech.

### Běžné úrovně (Patra 1-3)

*   **Hledání násobku:** `Které z čísel je dělitelné číslem [D]?`
    - **Patro 1:** `D ∈ {2, 5, 10}` (velmi snadné)
    - **Patro 2:** `D ∈ {3, 4, 9}` (středně obtížné)
    - **Patro 3:** `D ∈ {6, 8}` (obtížnější)
    - **Správná odpověď:** Násobek D (např. `D × random(4-25)`)
    - **Lživé odpovědi:** Čísla s podobnými vlastnostmi, ale se zbytkem (např. pro 4: 14, 34, 54, 74, 94)

*   **Ciferný součet:** `Jaký je ciferný součet čísla [NUM]?`
    - **Příklad:** `Jaký je ciferný součet čísla 234?` → 2+3+4=9
    - **Lživé odpovědi:** Částečné sumy, součet±1, součet+9

*   **Hledání prvočísla:** `Které z čísel je prvočíslo?`
    - **Patro 1:** Výběr z prvočísel 2-29 (PRIMES_EASY)
    - **Patro 2:** Výběr z prvočísel 31-97 (PRIMES_MED)
    - **Lživé odpovědi:** Pseudoprvočísla (39, 49, 51, 57, 69, 87, 91, 93, ...)

*   **Hledání složeného čísla:** `Které z těchto čísel NENÍ prvočíslo?`
    - Opak předchozího – žák hledá složené číslo
    - **Správná odpověď:** Pseudoprvočíslo z blacklistu
    - **Lživé odpovědi:** Opravdová prvočísla

*   **Největší společný dělitel (NSD):** `Najdi největšího společného dělitele čísel [A] a [B].`
    - **Příklad:** `NSD(12, 18) = 6`
    - **Generování:** `A = g×m[0], B = g×m[1]` kde `m` je párová kombinace (2,3), (2,5), (3,4), (3,5), (4,5), (5,6)
    - **Lživé odpovědi:** `g×2`, `A` samo, `1`, `g+1`

*   **Nejmenší společný násobek (NSN):** `Najdi nejmenší společný násobek čísel [A] a [B].`
    - **Příklad:** `NSN(6, 8) = 24`
    - **Lživé odpovědi:** `A×B`, `correct+A`, `correct/2`, `A+B`

### Boss úrovně (Patra 4-5)

*   **Dělitelnost kombinací:** `Které z čísel je dělitelné číslem [A] A ZÁROVEŇ číslem [B]?`
    - **Příklad:** `Které číslo je dělitelné 3 A ZÁROVEŇ 4?` → hledáme násobek LCM(3,4)=12
    - **Páry:** (3,4), (2,5), (3,5)

*   **Velké prvočíslo:** `Které z těchto velkých čísel je PRVOČÍSLO?`
    - **Výběr z:** PRIMES_HARD (101-149)
    - **Lživé odpovědi:** Velká pseudoprvočísla

## 2. Zlomky
Procvičují se základní operace se zlomky - sčítání, odčítání, krácení a jejich převod na procenta z celku.

### Běžné úrovně (Patra 1-3)

*   **Sčítání se stejným jmenovatelem:** `[A]/[J] + [B]/[J] = ?`
    - **Příklad:** `2/5 + 3/5 = 1/1`
    - **Jmenovatele:** {3, 4, 5, 6, 8, 10}
    - **Automatické krácení výsledku:** `5/10 → 1/2`
    - **Lživé odpovědi:** Jmenovatel×2, opačná operace, výsledek±1

*   **Odčítání se stejným jmenovatelem:** `[A]/[J] - [B]/[J] = ?`
    - Podmínka: `A > B` (bez záporných čísel)
    - **Příklad:** `5/6 - 2/6 = 3/6 → 1/2`

*   **Sčítání s různými jmenovateli (Patra 2-3):** `[A]/[J1] + [B]/[J2] = ?`
    - **Páry jmenovatelů:** (2,4), (2,6), (3,6), (4,8), (5,10) na patře 2 a těžší páry na patře 3
    - **Příklad:** `1/2 + 1/4 = 3/4`
    - **Lživé odpovědi:** Součet čitatelů a jmenovatelů (`(A+B)/(J1+J2)`), průběžné chyby

*   **Odčítání s různými jmenovateli (Patra 2-3):** `[A]/[J1] - [B]/[J2] = ?`

*   **Krácení zlomku:** `Zkrať zlomek [A]/[B] = ?`
    - **Generování:** Vybere malý zlomek (1/3) a násobí faktorem 2-4 → `3/9`
    - **Příklad:** `6/8 = 3/4` (děleno 2)
    - **Lživé odpovědi:** Krácení jen čitatele, obrnácený zlomek, chybný GCD

*   **Zlomek z celku:** `Vypočítej [NUM]/[DEN] z čísla [WHOLE].`
    - **Příklad:** `3/4 z 20 = 15`
    - **Lživé odpovědi:** `WHOLE/NUM`, `WHOLE×NUM`, `WHOLE÷NUM`, `result+multiplier`

### Boss úrovně (Patra 4-5)

*   **Sčítání tří zlomků:** `[N1]/[D1] + [N2]/[D2] + [N3]/10 = ?`
    - **Příklad:** `1/2 + 2/3 + 1/10 = ?` (společný jmenovatel 30)
    - Výsledek automaticky zkrácen

## 3. Desetinná čísla
Operace s desetinnými čísly, porovnávání a převody mezi zlomky a desetinnými čísly. Čísla se formátují s čárkou (evropský formát).

### Běžné úrovně (Patra 1-3)

*   **Porovnávání:** `Které z těchto čísel je NEJMENŠÍ/NEJVĚTŠÍ?`
    - **Sady:** 0,5 vs 0,05 vs 0,55 vs 0,055 (a podobně)
    - Zákeřné případy - zbytečné nuly (0,50 = 0,5)
    - **Lživé odpovědi:** Sousední hodnoty v seřazené řadě

*   **Sčítání:** `[A,B] + [C,D] = ?`
    - **Patro 1:** Jen desetiny (1,2 + 3,4 = 4,6)
    - **Patro 3:** I setiny (1,25 + 0,55 = 1,80)
    - **Lživé odpovědi:** Posunutí řádu (×10, ÷10), chybné řady za čárkou

*   **Odčítání:** `[A,B] - [C,D] = ?`
    - Podobně jako sčítání, ale s ověřením `A ≥ B`
    - **Lživé odpovědi:** Převod řádů při půjčování

*   **Převod zlomku na desetinné číslo:** `Převeď [A]/[B] na desetinné číslo.`
    - **Jmenovatele:** {2, 4, 5, 10} (snadné rozšíření)
    - **Příklad:** `1/4 = 0,25`
    - **Lživé odpovědi:** `0,14`, `1,4` (chybné umístění čárky)

*   **Násobení a dělení:** `[A] * [B] = ?` nebo `[A] / [B] = ?`
    - Variace: des×des, des×celé, des÷celé
    - **Příklad:** `0,3 × 5 = 1,5`
    - **Lživé odpovědi:** Posunutí řádů, chybné dělení na straně

### Boss úrovně (Patra 4-5)

*   **Náročná operace:** `(a + b) × factor = ?` nebo `(a + b) ÷ factor = ?`
    - **Příklad:** `(1,5 + 2,3) × 100 = 380`
    - Více kroků, nutno pochopit pořadí operací

## 4. Převody jednotek
Systém převodů je rozšířený a pokrývá více kategorií - délku, hmotnost, objem a čas.

### Podporované jednotky

| Kategorie | Konverze | Faktor |
|-----------|----------|--------|
| **Délka** | cm ↔ m   | 0,01 / 100 |
| | m ↔ km   | 0,001 / 1000 |
| | mm ↔ cm  | 0,1 / 10 |
| | mm ↔ m   | 0,001 / 1000 |
| **Hmotnost** | g ↔ kg   | 0,001 / 1000 |
| | dkg ↔ g  | 0,1 / 10 |
| | kg ↔ t   | 0,001 / 1000 |
| **Objem** | ml ↔ l   | 0,001 / 1000 |
| | dl ↔ l   | 0,1 / 10 |
| **Čas** | min ↔ s  | 60 (obě cesty) |
| | h ↔ min  | 60 (obě cesty) |
| | h ↔ s    | 3600 (obě cesty) |
| **Plocha** | cm² ↔ m² | 0,0001 / 10000 |
| | m² ↔ a   | 0,01 / 100 |
| | a ↔ ha   | 0,01 / 100 |
| | ha ↔ km² | 0,01 / 100 |

### Běžné úrovně (Patra 1-3)

*   **Jednoduché převody:** `Převeď: [VALUE] [FROM] = ? [TO]`
    - **Příklady:** 
      - `25 cm = ? m` → 0,25
      - `5 kg = ? g` → 5000
      - `180 s = ? min` → 3
    - Generování čísel je přizpůsobeno faktoru (snadná čísla)
    - **Lživé odpovědi:** Opačný směr, ×10, ÷10, nesprávný faktor

### Boss úrovně (Patra 4-5)

*   **Sčítání s prevodem:** `Vypočítej [V1] m² + [V2] m² v cm²:`
    - **Příklad:** `1 m² + 2 m² = 30000 cm²`
    - Nejdřív sečte, pak převede

*   **Čas v sekundách:** `Převeď: [H]h [M]min [S]s = ? s`
    - **Příklad:** `1h 30min 45s = 5445 s`
    - Výpočet: `(h×3600) + (min×60) + s`

## 5. Úhly a stupně
Geometrie úhlů - klasifikace, doplnění do plných úhlů, práce s minutami a stupni, vlastnosti trojúhelníků.

### Běžné úrovně (Patra 1-3)

*   **Klasifikace úhlu:** `Jaký je úhel, který měří [X]°?`
    - **Typy:** Ostrý (15-89°), Pravý (90°), Tupý (91-179°), Přímý (180°)
    - **Příklad:** `Jaký je úhel, který měří 65°?` → Ostrý
    - **Lživé odpovědi:** Ostatní tři typy

*   **Doplnění do pravého úhlu:** `Doplň úhel [X]° do pravého úhlu = ?`
    - **Příklad:** `Doplň 35° do 90° = 55°`
    - Výpočet: `90 - X`
    - **Lživé odpovědi:** `100-X`, `180-X`, `X+10`

*   **Doplnění do přímého úhlu (vedlejší úhel):** `Dvě přímky se protínají. Jeden úhel měří [X]°. Kolik měří vedlejší?`
    - Výpočet: `180 - X`
    - **Příklad:** `Vedlejší úhel ke 45° = 135°`

*   **Vrcholový úhel:** `Dvě přímky se protínají. Jeden úhel měří [X]°. Kolik měří vrcholový?`
    - Výpočet: Stejný úhel
    - **Příklad:** `Vrcholový úhel ke 70° = 70°`

*   **Součet v trojúhelníku:** `V trojúhelníku jsou úhly [A]° a [B]°. Kolik měří třetí?`
    - Výpočet: `180 - A - B`
    - **Příklad:** `Úhly 50° a 60°, třetí = 70°`
    - **Lživé odpovědi:** `A+B`, `result±10`, `360-A-B`

*   **Konverze stupňů a minut:** `Převeď na minuty: [D]° [M]' = ?`
    - Výpočet: `D×60 + M` (v minutách)
    - **Příklad:** `2° 30' = 150'`

*   **Sčítání úhlů v dm/min:** `Sečti: [D1]° [M1]' + [D2]° [M2]' = ?`
    - Musí se ošetřit přetečení minut (60' = 1°)
    - **Příklad:** `2° 50' + 1° 30' = 4° 20'`

*   **Odčítání úhlů v dm/min:** `Odečti: [D1]° [M1]' - [D2]° [M2]' = ?`
    - Musí se ošetřit "půjčování" z stupňů
    - **Příklad:** `5° 20' - 2° 40' = 2° 40'`
    - Výpočet: Když `M1 < M2`, pak `D1-1` a `M1+60`

### Boss úrovně (Patra 4-5)

*   **Vedlejší úhly se minutami:** `Úhly alfa a beta jsou vedlejší. Úhel alfa měří [D]° [M]'. Kolik měří úhel beta?`
    - Výpočet: `179° 60' - D° M'` (ekvivalent 180°)
    - **Příklad:** `Vedlejší k 45° 30' = 134° 30'`
    - **Lživé odpovědi:** Různé kombinace chybných výpočtů
