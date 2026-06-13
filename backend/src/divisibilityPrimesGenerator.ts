import type {ApiProblemDto} from './contracts'; // Uprav cestu
import type {ProblemBuilderContext} from './problemGenerator'; // Uprav cestu
import {int, pick, stringToSeed, uniqueIntegers} from './utils'; // Předpokládám import utilit

// ==========================================
// KONFIGURACE A MAGICKÁ ČÍSLA
// ==========================================

// Odebrány 2, 3 a 5, aby to nebylo trapně jednoduché
const PRIMES = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const PSEUDO_PRIMES = [9, 15, 21, 25, 27, 33, 35, 39, 49, 51, 55, 57, 63, 65, 69, 75, 77, 81, 85, 87, 91, 93, 95];

const DIVISORS_EASY = [2, 3, 5, 10];
const DIVISORS_HARD = [4, 6, 8, 9];

// Hezké páry pro NSN a NSD (aby z hlavy nevycházela monstra)
const GCD_LCM_PAIRS = [
    {a: 4, b: 6, gcd: 2, lcm: 12},
    {a: 6, b: 8, gcd: 2, lcm: 24},
    {a: 6, b: 9, gcd: 3, lcm: 18},
    {a: 8, b: 12, gcd: 4, lcm: 24},
    {a: 12, b: 15, gcd: 3, lcm: 60},
    {a: 15, b: 20, gcd: 5, lcm: 60},
    {a: 12, b: 18, gcd: 6, lcm: 36},
];

// ==========================================
// POMOCNÉ FUNKCE PRO TUTO VĚŽ
// ==========================================

function getDigitSum(n: number): number {
    let sum = 0;
    let temp = Math.abs(n);
    while (temp > 0) {
        sum += temp % 10;
        temp = Math.floor(temp / 10);
    }
    return sum;
}

// Geniální generátor chytáků - simuluje reálné chyby žáků
function generateSmartDivisibilityTraps(divisor: number, correct: number, rng: () => number): string[] {
    const traps = new Set<number>();
    let attempts = 0;

    while (traps.size < 4 && attempts < 100) {
        attempts++;
        if (divisor === 3 || divisor === 9) {
            // Žák blbě sečte ciferný součet (netrefí se o 1 nebo 2)
            const trap = divisor * int(rng, 4, 25) + pick(rng, [1, divisor - 1]);
            if (trap !== correct) traps.add(trap);
        } else if (divisor === 6) {
            // Žák testuje jen sudost, NEBO jen dělitelnost 3
            const trap = pick(rng, [
                2 * int(rng, 5, 25), // Je to sudé, ale není dělitelné 3 (např. 14)
                3 * pick(rng, [3, 5, 7, 9, 11]) // Je to dělitelné 3, ale je to liché (např. 15, 21)
            ]);
            if (trap % 6 !== 0 && trap !== correct) traps.add(trap);
        } else if (divisor === 8) {
            // Žák si plete 8 a 4
            const trap = 4 * pick(rng, [3, 5, 7, 9, 11, 13]); // např. 12, 20, 28
            if (trap % 8 !== 0 && trap !== correct) traps.add(trap);
        } else {
            // Univerzální fallback pro 2, 4, 5, 10
            const trap = divisor * int(rng, 3, 20) + pick(rng, [1, 2, divisor - 1]);
            if (trap !== correct && trap % divisor !== 0) traps.add(trap);
        }
    }
    return Array.from(traps).map(String);
}

// ==========================================
// HLAVNÍ GENERÁTOR
// ==========================================

export function buildDivisibilityProblem(ctx: ProblemBuilderContext): ApiProblemDto {
    const {rng, floor, difficulty, themeKey} = ctx;

    // Určení šablony - v závislosti na patře pouštíme různé typy úloh
    const templatesPool = floor <= 2
        ? ['divisible', 'prime', 'digit-sum']
        : ['divisible', 'prime', 'not-prime', 'gcd-lcm', 'digit-sum'];

    const variant = pick(rng, templatesPool);

    // 1. ZÁKLADNÍ DĚLITELNOST
    if (variant === 'divisible') {
        const divisor = pick(rng, floor <= 2 ? DIVISORS_EASY : DIVISORS_HARD);
        const correct = divisor * int(rng, 4, 15 + difficulty * 2);
        const prompt = `Které z čísel je dělitelné číslem ${divisor}?`;
        const wrongAnswers = generateSmartDivisibilityTraps(divisor, correct, rng);

        return {
            id: `d-${difficulty}-div-${divisor}-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(correct)],
            wrongAnswers,
            topic: themeKey,
            difficulty,
        };
    }

    // 2. KLASICKÁ PRVOČÍSLA
    if (variant === 'prime') {
        const correct = pick(rng, PRIMES.filter(p => floor <= 2 ? p < 30 : p >= 30));
        const prompt = 'Které z čísel je prvočíslo?';
        const wrongPool = uniqueIntegers(rng, PSEUDO_PRIMES, 4, val => val !== correct);

        return {
            id: `d-${difficulty}-prime-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(correct)],
            wrongAnswers: wrongPool.map(String),
            topic: themeKey,
            difficulty,
        };
    }

    // 3. NEGACE (NENÍ PRVOČÍSLO)
    if (variant === 'not-prime') {
        const correct = pick(rng, PSEUDO_PRIMES); // Např. 51
        const prompt = 'Které z těchto čísel NENÍ prvočíslo?';
        const wrongPool = uniqueIntegers(rng, PRIMES, 4, val => val !== correct); // Distraktory jsou opravdová prvočísla

        return {
            id: `d-${difficulty}-notprime-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(correct)],
            wrongAnswers: wrongPool.map(String),
            topic: themeKey,
            difficulty,
        };
    }

    // 4. CIFERNÝ SOUČET (Ušito na míru)
    if (variant === 'digit-sum') {
        const num = int(rng, 105, 999);
        const correct = getDigitSum(num);
        const prompt = `Jaký je ciferný součet čísla ${num}?`;

        // Lživé odpovědi simulují přičtení čísla navíc, nebo špatný výpočet
        const wrongPool = [
            String(correct + 1),
            String(Math.max(1, correct - 1)),
            String(correct + 9),
            String(correct + 2)
        ];

        return {
            id: `d-${difficulty}-digitsum-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(correct)],
            wrongAnswers: wrongPool,
            topic: themeKey,
            difficulty,
        };
    }

    // 5. NSD a NSN (Největší společný dělitel / Nejmenší společný násobek)
    const subVariant = pick(rng, ['gcd', 'lcm']);
    const pair = pick(rng, GCD_LCM_PAIRS);

    if (subVariant === 'gcd') {
        const prompt = `Najdi největšího společného dělitele (NSD) čísel ${pair.a} a ${pair.b}.`;
        const correct = pair.gcd;
        // Chytáky: jakýkoliv menší dělitel, nebo součet, nebo 1
        const wrongPool = [String(correct + 1), "1", String(correct * 2), String(pair.a)];
        return {
            id: `d-${difficulty}-gcd-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(correct)],
            wrongAnswers: Array.from(new Set(wrongPool)).filter(w => w !== String(correct)).slice(0, 4),
            topic: themeKey,
            difficulty,
        };
    } else {
        const prompt = `Najdi nejmenší společný násobek (NSN) čísel ${pair.a} a ${pair.b}.`;
        const correct = pair.lcm;
        // Chytáky: prosté vynásobení čísel (častá chyba dětí!), nebo polovina, nebo součet
        const wrongPool = [String(pair.a * pair.b), String(correct + pair.a), String(correct - pair.b), String(pair.a + pair.b)];
        return {
            id: `d-${difficulty}-lcm-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(correct)],
            wrongAnswers: Array.from(new Set(wrongPool)).filter(w => w !== String(correct)).slice(0, 4),
            topic: themeKey,
            difficulty,
        };
    }
}