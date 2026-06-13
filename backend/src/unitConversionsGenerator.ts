import type {ApiProblemDto} from './contracts';
import type {ProblemBuilderContext} from './problemGenerator';
import {
    int, pick, stringToSeed, uniqueWrongAnswers, formatDecimal
} from './utils';

// ==========================================
// KONFIGURACE PŘEVODNÍCH MŮSTKŮ
// ==========================================

// Převody metrického systému (posuny čárky) - Max 3 řády
const METRIC_CONVERSIONS = [
    {from: 'mm', to: 'cm', factor: 0.1},
    {from: 'cm', to: 'mm', factor: 10},
    {from: 'cm', to: 'm', factor: 0.01},
    {from: 'm', to: 'cm', factor: 100},
    {from: 'm', to: 'km', factor: 0.001},
    {from: 'km', to: 'm', factor: 1000},
    {from: 'g', to: 'kg', factor: 0.001},
    {from: 'kg', to: 'g', factor: 1000},
    {from: 'ml', to: 'l', factor: 0.001},
    {from: 'l', to: 'ml', factor: 1000}
];

// Převody času (zde se nesmí aplikovat metrické chytáky s posunem čárky)
const TIME_CONVERSIONS = [
    {from: 'min', to: 's', factor: 60},
    {from: 'h', to: 'min', factor: 60}
];

// ==========================================
// POMOCNÉ FUNKCE PRO CHYTÁKY A HODNOTY
// ==========================================

// Generuje náhodnou hodnotu (celá čísla i desetinná)
function generateMetricValue(rng: () => number, floor: number): number {
    // Na vyšších patrech je větší šance na desetinná čísla
    const useDecimal = floor >= 3 ? pick(rng, [true, false]) : pick(rng, [false, false, true]);
    const base = int(rng, 11, 999); // Např. 372
    return useDecimal ? base / 10 : base; // Buď 372 nebo 37.2
}

// Chytáky pro metrický systém (posuny čárky a opačné operace)
function generateMetricTraps(value: number, correct: number, factor: number): string[] {
    const traps = new Set<string>();

    // 1. Žák udělá inverzní operaci (násobí místo dělení a naopak)
    // Abychom se vyhnuli float precision chybám, použijeme podíl
    const inverseValue = factor > 1 ? value / factor : value * (1 / factor);
    traps.add(formatDecimal(inverseValue));

    // 2. Špatný řád - posun o 1 místo nahoru a dolů od správného výsledku
    traps.add(formatDecimal(correct * 10));
    traps.add(formatDecimal(correct / 10));

    // 3. Špatný řád - posun o 2 místa (časté u převodů z mm na m nebo g na kg)
    if (factor === 1000 || factor === 0.001) {
        traps.add(formatDecimal(correct / 100));
        traps.add(formatDecimal(correct * 100));
    }

    // 4. Dítě jen opíše číslo a ignoruje převod
    traps.add(formatDecimal(value));

    // Vyčistíme od případné správné odpovědi
    return Array.from(traps).filter(t => t !== formatDecimal(correct));
}

// ==========================================
// HLAVNÍ GENERÁTOR
// ==========================================

export function buildUnitConversionsProblem(ctx: ProblemBuilderContext): ApiProblemDto {
    const {rng, floor, difficulty, themeKey} = ctx;

    // Vybereme typ převodu. Čas necháváme jako vzácnější (např. 1 z 4 případů)
    const isTime = pick(rng, [false, false, false, true]);

    if (!isTime) {
        // METRICKÝ SYSTÉM
        const conv = pick(rng, METRIC_CONVERSIONS);
        const value = generateMetricValue(rng, floor);
        const correct = value * conv.factor;
        const correctStr = formatDecimal(correct);

        const prompt = `Převeď: ${formatDecimal(value)} ${conv.from} = ? ${conv.to}`;
        const traps = generateMetricTraps(value, correct, conv.factor);

        return {
            id: `u-${difficulty}-${conv.from}-${conv.to}-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [correctStr],
            wrongAnswers: uniqueWrongAnswers([correctStr], traps, 4),
            topic: themeKey,
            difficulty,
        };

    } else {
        // ČAS (Zde držíme hezká celá čísla, např. 2 až 15 hodin/minut)
        const conv = pick(rng, TIME_CONVERSIONS);
        const value = int(rng, 2, 15 + floor * 2);
        const correct = value * conv.factor;
        const correctStr = formatDecimal(correct);

        const prompt = `Převeď: ${value} ${conv.from} = ? ${conv.to}`;

        // Zde nenasazujeme metrické chytáky, ale specifické pro čas (desítková soustava)
        const traps = [
            formatDecimal(value * 100), // Klasika: 3 minuty = 300 sekund
            formatDecimal(value * 10),  // 3 minuty = 30 sekund
            formatDecimal(Math.round(value / conv.factor)), // Inverzní a zaokrouhlené
            formatDecimal(correct + 60) // Přidal šedesátku navíc
        ];

        return {
            id: `u-${difficulty}-time-${conv.from}-${conv.to}-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [correctStr],
            wrongAnswers: uniqueWrongAnswers([correctStr], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }
}