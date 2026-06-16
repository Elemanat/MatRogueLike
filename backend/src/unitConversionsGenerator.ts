import type {ApiProblemDto} from './contracts';
import type {ProblemBuilderContext} from './problemGenerator';
import {
    int, pick, stringToSeed, uniqueWrongAnswers, formatDecimal
} from './utils';

type UnitCategory = 'length' | 'weight' | 'liquid' | 'time' | 'area';

interface Conversion {
    from: string;
    to: string;
    factor: number;
    category: UnitCategory;
    minDiff: number;
    squareTrap?: boolean;
}

const CONVERSIONS: Conversion[] = [
    {from: 'cm', to: 'm', factor: 0.01, category: 'length', minDiff: 1},
    {from: 'm', to: 'cm', factor: 100, category: 'length', minDiff: 1},
    {from: 'm', to: 'km', factor: 0.001, category: 'length', minDiff: 1},
    {from: 'km', to: 'm', factor: 1000, category: 'length', minDiff: 1},
    {from: 'mm', to: 'cm', factor: 0.1, category: 'length', minDiff: 2},
    {from: 'cm', to: 'mm', factor: 10, category: 'length', minDiff: 2},
    {from: 'mm', to: 'm', factor: 0.001, category: 'length', minDiff: 3},
    {from: 'm', to: 'mm', factor: 1000, category: 'length', minDiff: 3},
    {from: 'g', to: 'kg', factor: 0.001, category: 'weight', minDiff: 1},
    {from: 'kg', to: 'g', factor: 1000, category: 'weight', minDiff: 1},
    {from: 'dkg', to: 'g', factor: 10, category: 'weight', minDiff: 2},
    {from: 'g', to: 'dkg', factor: 0.1, category: 'weight', minDiff: 2},
    {from: 'kg', to: 't', factor: 0.001, category: 'weight', minDiff: 2},
    {from: 't', to: 'kg', factor: 1000, category: 'weight', minDiff: 2},
    {from: 'ml', to: 'l', factor: 0.001, category: 'liquid', minDiff: 1},
    {from: 'l', to: 'ml', factor: 1000, category: 'liquid', minDiff: 1},
    {from: 'dl', to: 'l', factor: 0.1, category: 'liquid', minDiff: 2},
    {from: 'l', to: 'dl', factor: 10, category: 'liquid', minDiff: 2},
    {from: 'min', to: 's', factor: 60, category: 'time', minDiff: 1},
    {from: 'h', to: 'min', factor: 60, category: 'time', minDiff: 1},
    {from: 's', to: 'min', factor: 1/60, category: 'time', minDiff: 2},
    {from: 'min', to: 'h', factor: 1/60, category: 'time', minDiff: 2},
    {from: 'h', to: 's', factor: 3600, category: 'time', minDiff: 3},
    {from: 'cm²', to: 'm²', factor: 0.0001, category: 'area', minDiff: 2, squareTrap: true},
    {from: 'm²', to: 'cm²', factor: 10000, category: 'area', minDiff: 2, squareTrap: true},
    {from: 'm²', to: 'a', factor: 0.01, category: 'area', minDiff: 3},
    {from: 'a', to: 'm²', factor: 100, category: 'area', minDiff: 3},
    {from: 'a', to: 'ha', factor: 0.01, category: 'area', minDiff: 3},
    {from: 'ha', to: 'a', factor: 100, category: 'area', minDiff: 3},
    {from: 'ha', to: 'km²', factor: 0.01, category: 'area', minDiff: 4},
    {from: 'km²', to: 'ha', factor: 100, category: 'area', minDiff: 4}
];

function generateInputValue(rng: () => number, conv: Conversion, diff: number): number {
    const step = conv.factor < 1 ? Math.round(1 / conv.factor) : 1;
    if (conv.category === 'time') {
        if (step === 1) return int(rng, 2, conv.factor >= 3600 ? 5 : 12 + diff * 3);
        return int(rng, 1, Math.max(2, Math.min(12, Math.floor(900 / step)))) * step;
    }
    const maxN = step > 1 ? Math.max(2, Math.min(20, Math.floor(90_000 / step))) : 15 + diff * 5;
    if (diff === 1) return step > 1 ? int(rng, 1, Math.min(maxN, 12)) * step : int(rng, 2, 15);
    if (diff === 2) return step > 1 ? (pick(rng, [true, true, false]) ? int(rng, 1, maxN) * step : int(rng, 1, maxN) * step + Math.round(step / 2)) : int(rng, 2, 50);
    const n = int(rng, 1, maxN);
    return pick(rng, [true, false]) ? n * step : n * step + Math.round(step / 2);
}

function generateTraps(value: number, correct: number, conv: Conversion): string[] {
    const traps = new Set<string>();
    const correctStr = formatDecimal(correct);

    traps.add(formatDecimal(conv.factor > 1 ? value / conv.factor : value * (1 / conv.factor)));
    traps.add(formatDecimal(correct * 10));
    traps.add(formatDecimal(correct / 10));
    traps.add(formatDecimal(value));

    if (conv.squareTrap) {
        const lin = Math.sqrt(conv.factor > 1 ? conv.factor : 1 / conv.factor);
        traps.add(formatDecimal(conv.factor > 1 ? value * lin : value / lin));
    }

    return Array.from(traps).filter(t => t !== correctStr && parseFloat(t.replace(',', '.')) > 0);
}

export function buildUnitConversionsProblem(ctx: ProblemBuilderContext): ApiProblemDto {
    const {rng, difficulty, themeKey} = ctx;

    if (difficulty >= 4) {
        const isArea = pick(rng, [true, false]);
        if (isArea) {
            const v1 = int(rng, 1, 5);
            const v2 = int(rng, 1, 5);
            const res = (v1 + v2) * 10000;
            const prompt = `Vypočítej ${v1} m² + ${v2} m² v cm²:`;
            return {
                id: `u-${difficulty}-boss-area-${stringToSeed(ctx.nodeId)}`,
                prompt,
                correctAnswers: [formatDecimal(res)],
                wrongAnswers: uniqueWrongAnswers([formatDecimal(res)], [formatDecimal(v1 + v2), formatDecimal((v1 + v2) * 100)], 4),
                topic: themeKey,
                difficulty,
            };
        } else {
            const h = int(rng, 1, 2);
            const m = pick(rng, [15, 20, 30, 45]);
            const s = int(rng, 20, 50);
            const res = (h * 3600) + (m * 60) + s;
            const prompt = `Převeď na sekundy: ${h}h ${m}min ${s}s = ?`;
            return {
                id: `u-${difficulty}-boss-time-${stringToSeed(ctx.nodeId)}`,
                prompt,
                correctAnswers: [String(res)],
                wrongAnswers: uniqueWrongAnswers([String(res)], [String((h + m + s)), String(res + 60)], 4),
                topic: themeKey,
                difficulty,
            };
        }
    }

    const conv = pick(rng, CONVERSIONS.filter(c => c.minDiff <= difficulty));
    const value = generateInputValue(rng, conv, difficulty);
    const correct = value * conv.factor;
    const correctStr = formatDecimal(correct);

    return {
        id: `u-${difficulty}-${conv.from}-${conv.to}-${stringToSeed(ctx.nodeId)}`,
        prompt: `Převeď: ${formatDecimal(value)} ${conv.from} = ? ${conv.to}`,
        correctAnswers: [correctStr],
        wrongAnswers: uniqueWrongAnswers([correctStr], generateTraps(value, correct, conv), 4),
        topic: themeKey,
        difficulty,
    };
}