import type {ApiProblemDto} from './contracts';
import type {ProblemBuilderContext} from './problemGenerator';
import {
    int, pick, stringToSeed, uniqueWrongAnswers,
    formatFraction, gcd
} from './utils'; // Zde si naimportuj své stávající matematické utility

// ==========================================
// KONFIGURACE A MAGICKÁ ČÍSLA
// ==========================================

const DENOMINATORS_LOW = [3, 4, 5, 6, 8, 10];

// Hezké páry pro sčítání/odčítání různých jmenovatelů (aby společný jmenovatel nebyl obrovský)
const PAIRS_EASY = [{d1: 2, d2: 4}, {d1: 2, d2: 6}, {d1: 3, d2: 6}, {d1: 2, d2: 8}, {d1: 4, d2: 8}, {d1: 5, d2: 10}];
const PAIRS_HARD = [{d1: 2, d2: 3}, {d1: 3, d2: 4}, {d1: 2, d2: 5}, {d1: 3, d2: 5}, {d1: 4, d2: 5}];

// ==========================================
// POMOCNÉ FUNKCE PRO ZLOMKY (CHYTÁKY)
// ==========================================

// Vygeneruje reálné chyby žáků při sčítání/odčítání různých jmenovatelů
function generateSmartFractionTraps(n1: number, d1: number, n2: number, d2: number, isAdd: boolean): string[] {
    const traps = new Set<string>();

    const fakeNum = isAdd ? n1 + n2 : Math.max(1, n1 - n2);

    // Klasika: žák sečte/odečte vršky i spodky (např. 1/2 + 1/3 = 2/5)
    traps.add(formatFraction(fakeNum, d1 + d2));

    // Žák sečte vršky, ale spodek vynásobí
    traps.add(formatFraction(fakeNum, d1 * d2));

    // Žák zapomene rozšířit čitatele při převodu na společného jmenovatele
    const lcm = (d1 * d2) / gcd(d1, d2);
    traps.add(formatFraction(fakeNum, lcm));

    // Žák odečte místo sčítání (nebo naopak)
    const reverseNum = isAdd ? Math.max(1, Math.abs(n1 - n2)) : n1 + n2;
    traps.add(formatFraction(reverseNum, lcm));

    return Array.from(traps);
}

// ==========================================
// HLAVNÍ GENERÁTOR
// ==========================================

export function buildFractionProblem(ctx: ProblemBuilderContext): ApiProblemDto {
    const {rng, floor, difficulty, themeKey} = ctx;

    // Patra 1-2: stejní jmenovatelé + zlomek z celku
    // Patra 3+: různí jmenovatelé + krácení
    const variantsPool = floor <= 2
        ? ['add-same', 'sub-same', 'fraction-of-whole']
        : ['add-diff', 'sub-diff', 'reduce', 'fraction-of-whole'];

    const variant = pick(rng, variantsPool);

    // 1. ZLOMEK Z CELKU (např. 2/3 z 60) - Nová, velmi důležitá šablona
    if (variant === 'fraction-of-whole') {
        const den = pick(rng, [3, 4, 5, 6, 8, 10]);
        const num = int(rng, 1, den - 1);
        const multiplier = int(rng, 3, 12 + difficulty); // Kolikrát se jmenovatel vejde do celku
        const whole = den * multiplier;

        const correct = num * multiplier; // Výsledek je krásné celé číslo
        const prompt = `Vypočítej ${num}/${den} z čísla ${whole}.`;

        // Chytáky: zapomene vynásobit čitatelem, vynásobí celek čitatelem, nesmysl
        const wrongAnswers = [
            String(multiplier), // Jen vydělil jmenovatelem (časté)
            String(whole * num), // Jen vynásobil čitatelem
            String(Math.floor(whole / num)),
            String(correct + multiplier)
        ];

        return {
            id: `f-${difficulty}-whole-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(correct)],
            wrongAnswers: uniqueWrongAnswers([String(correct)], wrongAnswers, 4),
            topic: themeKey,
            difficulty,
        };
    }

    // 2. KRÁCENÍ ZLOMKŮ (Pouze zlomky, zakázáno desetinné číslo)
    if (variant === 'reduce') {
        const baseDenominators = floor <= 2 ? [2, 3, 4, 5] : [3, 4, 5, 6, 8];
        const baseNum = pick(rng, [1, 2, 3, 4, 5]);
        const baseDen = pick(rng, baseDenominators.filter(d => d > baseNum && gcd(baseNum, d) === 1));
        const factor = int(rng, 2, 4 + Math.floor(difficulty / 2));

        const unreducedNum = baseNum * factor;
        const unreducedDen = baseDen * factor;

        const correctStr = formatFraction(baseNum, baseDen);
        const prompt = `Zkrať zlomek na základní tvar: ${unreducedNum}/${unreducedDen}`;

        const wrongAnswers = [
            // Zkrátil jen částečně (pokud to jde)
            factor % 2 === 0 ? formatFraction(unreducedNum / 2, unreducedDen / 2) : '',
            // Zkrátil jen spodek
            `${unreducedNum}/${baseDen}`,
            // Převrácená hodnota
            `${baseDen}/${baseNum}`,
            // Zkráceno blbě (+1 k čitateli)
            formatFraction(baseNum + 1, baseDen)
        ].filter(Boolean);

        return {
            id: `f-${difficulty}-reduce-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [correctStr], // Záměrně nepouštíme do ekvivalentů s desetinnými čísly
            wrongAnswers: uniqueWrongAnswers([correctStr], wrongAnswers, 4),
            topic: themeKey,
            difficulty,
        };
    }

    // 3. SČÍTÁNÍ A ODČÍTÁNÍ (Různí jmenovatelé)
    if (variant === 'add-diff' || variant === 'sub-diff') {
        const isAdd = variant === 'add-diff';
        const pair = pick(rng, floor >= 3 ? [...PAIRS_EASY, ...PAIRS_HARD] : PAIRS_EASY);

        // Zajištění, aby první zlomek byl vždy větší pro odčítání (bez záporných výsledků)
        let n1 = int(rng, 1, pair.d1 - 1);
        let n2 = int(rng, 1, pair.d2 - 1);

        if (!isAdd && (n1 / pair.d1) <= (n2 / pair.d2)) {
            // Swap if subtracting and the second is bigger
            const temp = pair.d1;
            pair.d1 = pair.d2;
            pair.d2 = temp;
            const tempN = n1;
            n1 = n2;
            n2 = tempN;
        }

        const operator = isAdd ? '+' : '-';
        const prompt = `${n1}/${pair.d1} ${operator} ${n2}/${pair.d2} = ?`;

        const resultNum = isAdd ? (n1 * pair.d2 + n2 * pair.d1) : (n1 * pair.d2 - n2 * pair.d1);
        const resultDen = pair.d1 * pair.d2;

        const correctStr = formatFraction(resultNum, resultDen);
        const traps = generateSmartFractionTraps(n1, pair.d1, n2, pair.d2, isAdd);

        return {
            id: `f-${difficulty}-${variant}-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [correctStr], // Záměrně držíme formu zlomku pro vizuální čistotu UI
            wrongAnswers: uniqueWrongAnswers([correctStr], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    // 4. SČÍTÁNÍ A ODČÍTÁNÍ (Stejní jmenovatelé - fallback pro nejlehčí patra)
    const isAddSame = variant === 'add-same';
    const denominator = pick(rng, DENOMINATORS_LOW);
    const n1 = int(rng, isAddSame ? 1 : 2, denominator - 1);
    const n2 = int(rng, 1, isAddSame ? (denominator - n1) : (n1 - 1)); // Aby to nepřešlo přes 1 a nešlo do mínusu

    const operator = isAddSame ? '+' : '-';
    const prompt = `${n1}/${denominator} ${operator} ${n2}/${denominator} = ?`;
    const resultNum = isAddSame ? n1 + n2 : n1 - n2;
    const correctStr = formatFraction(resultNum, denominator);

    const wrongAnswers = [
        formatFraction(resultNum, denominator * 2), // Sečte i spodky
        formatFraction(isAddSame ? n1 - n2 : n1 + n2, denominator), // Opačná operace
        formatFraction(resultNum + 1, denominator)
    ];

    return {
        id: `f-${difficulty}-${variant}-${stringToSeed(ctx.nodeId)}`,
        prompt,
        correctAnswers: [correctStr],
        wrongAnswers: uniqueWrongAnswers([correctStr], wrongAnswers, 4),
        topic: themeKey,
        difficulty,
    };
}