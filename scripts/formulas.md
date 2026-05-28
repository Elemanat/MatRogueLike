# Generátory příkladů: Šablony a Vzorce

Tento dokument ukazuje "kostru" generátoru – tedy pevné šablony, do kterých se automaticky dosazují náhodná čísla, a jak se tyto hodnoty vybírají.

---

## 1. Dělitelnost a prvočísla
V této věži se negenerují standardní rovnice, ale otázky na výběr z možností. Zkouší se pochopení vlastností čísel.

*   **Hledání násobku:** `Které z čísel je dělitelné číslem [D]?`
    *   **Za co se dosazuje [D]:** Náhodné číslo z množiny {2, 3, 4, 5, 6, 8, 9, 10} podle obtížnosti.
    *   **Správná odpověď:** Obyčejný násobek *(`D × náhodné číslo`)*.
    *   **Lživé odpovědi (distraktory):** Distraktory simulují časté chyby žáků – jsou to čísla blízká násobkům, končící na podobné cifry (např. při dělitelnosti 4 se nabídne 14), ale vždy se zbytkem po dělení.
*   **Hledání prvočísla:** `Které z čísel je prvočíslo?`
    *   **Správná odpověď:** Náhodně vybrané opravdové prvočíslo (2 až 71, roste patrem).
    *   **Lživé odpovědi:** Vyberou se z připraveného "Blacklistu falešných prvočísel" (lichá kompozitní čísla, dělitelná 3 nebo 7, co vypadají nedělitelně: 9, 15, 21, 27, 33, 39, 49, 51, 55, 57, 87, 91).

## 2. Zlomky
Zde se procvičují základní operace. Jmenovatel je pro 6. třídu u sčítání/odčítání vždy stejný, hlavní je pochopit krácení.
**Oprava:** Od určitého patra nahoru (Tier 2/3) se žáci potkají i se sčítáním s *různými jmenovateli*.

*   **Sčítání:** `[A]/[J] + [B]/[J] = ?`
    *   **Za co se dosazuje:** Jmenovatel `[J]` je vybrán z {3, 4, 5, 6, 8, 9, 10, 12}. Čitatele `[A]` a `[B]` se vygenerují tak, aby nezpůsobily složité přetečení přes více než jednu celou. Výsledek se formátuje jako pokrácený zlomek.
*   **Sčítání - Jmenovatele se liší (TĚŽKÁ OBTÍŽNOST - Patro 2+):** `[A]/[J1] + [B]/[J2] = ?`
    *   Jedná se o vyšší úroveň. Hra nejdříve vygeneruje páry hezkých celků a společných dělitelů. Např. páry jmenovatelů 2 a 4, 3 a 6, případně těžší 2 a 3 atp.
    *   V distraktorech se úmyslně používají časté žákovské chyby, jako např. prosté sečtení čitatelů a prosté sečtení jmenovatelů (`A+B / J1+J2`).
*   **Odčítání:** `[A]/[J] - [B]/[J] = ?`
    *   Podmínka generátoru zajišťuje, že `[A] > [B]`, aby nevznikala v 6. třídě záporná čísla.
*   **Krácení (Základovka):** `Zkrať zlomek [A]/[B] = ?`
    *   Systém si v pozadí vybere napřed "hezký malý zlomek" (např. 1/3) a následně jej schválně nafoukne pronásobením čísly 2, 3 nebo 4 (vznikne prompt `Zkrať zlomek 3/9 = ?`). Žák to pak vrací do základu.
*   **Základní desetinné sčítání:** `[0.X] [+/-] [0.Y] = ?`

## 3. Desetinná čísla
V této věži se posouvají řády a sčítají desetinná čísla, častým problémem dětí je práce s posunem desetinné čárky.

*   **Sčítání:** `[A,B] + [C,D] = ?`
    *   Základní patra řeší pouze desetiny (např. `1,2 + 3,4`). Vyšší patra přidávají i setiny (např. `1,25 + 0,55`).
*   **Odčítání:** `[A,B] - [C,D] = ?`
*   **Převod do desetinné podoby:** `Převeď [A]/[B] na desetinné číslo = ?`
    *   `[B]` se musí dát lehce rozšířit na 10, 100 atd. Použité jmenovatele: {2, 4, 5, 8, 10, 20, 25, 50, 100}.
    *   *Možné chybné odpovědi:* Odpovědi o 1 řád vedle (např. desetiná čárka jinde), nezpracování čitatele správně (např. `1/4 -> 1,4`).

## 4. Převody jednotek
Vzorec má vždy naprosto stejný tvar, jen se mění zvolený "Převodní můstek".

*   **Šablona:** `Převeď [HODNOTA] [Z_JEDNOTKY] na [DO_JEDNOTKY] = ?`
*   **Podporované sady převodů (můstky):**
    *   Délka: `m -> cm` (*100), `cm -> m` (/100), `km -> m` (*1000), `m -> km` (/1000)
    *   Hmotnost: `kg -> g` (*1000), `g -> kg` (/1000)
    *   Čas: `min -> s` (*60), `h -> min` (*60)
*   **Co se dosazuje:** Pro každý můstek je definovaná "logická ucelená řada hodnot", co dává pro děti smysl. Např. pro cm->m to dává `25, 50, 75, 125, 250` atd.

## 5. Úhly a stupně
Začíná jednoduchými úvahami v rovině a končí trojúhelníkem.

*   **Doplněk do pravého úhlu:** `Doplň do 90°: [X]° = ?`
    *   *[X]* je náhodné od 10 do 80.
*   **Doplněk do přímého úhlu:** `Doplň do 180°: [X]° = ?`
    *   *[X]* je náhodný tupý nebo ostrý úhel (15 až 165).
*   **Násobky pravého úhlu:** `Kolik stupňů mají [N] pravé úhly?`
    *   *[N]* je od 2 do 5 (např. kolik jsou 3 pravé úhly? = 270).
*   **Trojúhelník (Těžší/Vyšší patra):** `V trojúhelníku jsou dva úhly [X]° a [Y]°. Kolik měří třetí?`
    *   Vnitřně se vygenerují dvě logické náhodné hodnoty pro X a Y a záchytným pravidlem je `180 - X - Y`. Lživé odpovědi zkusí např. `90 - X - Y` nebo pouhý součet.
