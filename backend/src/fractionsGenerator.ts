import type {ApiProblemDto} from './contracts';
import type {ProblemBuilderContext} from './problemGenerator';
import {
    int, pick, stringToSeed, uniqueWrongAnswers,
    formatFraction, gcd
} from './utils';

const DENOMINATORS_LOW = [3, 4, 5, 6, 8, 10];
const PAIRS_EASY = [{d1: 2, d2: 4}, {d1: 2, d2: 6}, {d1: 3, d2: 6}, {d1: 4, d2: 8}, {d1: 5, d2: 10}];
const PAIRS_HARD = [{d1: 2, d2: 3}, {d1: 3, d2: 4}, {d1: 2, d2: 5}, {d1: 3, d2: 5}, {d1: 4, d2: 5}, {d1: 6, d2: 8}];

function generateSmartFractionTraps(n1: number, d1: number, n2: number, d2: number, isAdd: boolean): string[] {
    const traps = new Set<string>();
    const fakeNum = isAdd ? n1 + n2 : Math.max(1, Math.abs(n1 - n2));
    traps.add(formatFraction(fakeNum, d1 + d2));
    traps.add(formatFraction(fakeNum, d1 * d2));
    const lcm = (d1 * d2) / gcd(d1, d2);
    traps.add(formatFraction(fakeNum, lcm));
    const reverseNum = isAdd ? Math.max(1, Math.abs(n1 - n2)) : n1 + n2;
    traps.add(formatFraction(reverseNum, lcm));
    return Array.from(traps);
}

export function buildFractionProblem(ctx: ProblemBuilderContext): ApiProblemDto {
    const {rng, difficulty, themeKey} = ctx;

    if (difficulty >= 4) {
        const d1 = pick(rng, [2, 3, 4]);
        const d2 = pick(rng, [5, 6]);
        const n1 = int(rng, 1, d1 - 1);
        const n2 = int(rng, 1, d2 - 1);
        const n3 = int(rng, 1, 3);

        const prompt = `Vypočítej: ${n1}/${d1} + ${n2}/${d2} + ${n3}/10 = ?`;
        const commonDen = 30; // Zjednodušení pro bosse
        const resNum = (n1 * (commonDen/d1)) + (n2 * (commonDen/d2)) + (n3 * 3);
        const correctStr = formatFraction(resNum, commonDen);

        return {
            id: `f-${difficulty}-boss-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [correctStr],
            wrongAnswers: uniqueWrongAnswers([correctStr], [formatFraction(resNum - 1, commonDen), formatFraction(resNum + 1, commonDen), "1", "0"], 4),
            topic: themeKey,
            difficulty,
        };
    }

    const variantsPool = difficulty <= 1
        ? ['add-same', 'sub-same', 'fraction-of-whole']
        : ['add-diff', 'sub-diff', 'reduce', 'fraction-of-whole'];

    const variant = pick(rng, variantsPool);

    if (variant === 'fraction-of-whole') {
        const den = pick(rng, [3, 4, 5, 6, 8, 10]);
        const num = int(rng, 1, den - 1);
        const multiplier = int(rng, 3, 12 + difficulty);
        const whole = den * multiplier;
        const correct = num * multiplier;
        const prompt = `Vypočítej ${num}/${den} z čísla ${whole}.`;

        const wrongAnswers = [
            String(multiplier),
            String(whole * num),
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

    if (variant === 'reduce') {
        const baseDenominators = difficulty <= 1 ? [2, 3, 4, 5] : [3, 4, 5, 6, 8];
        const baseNum = pick(rng, [1, 2, 3, 4, 5]);
        const baseDen = pick(rng, baseDenominators.filter(d => d > baseNum && gcd(baseNum, d) === 1));
        const factor = int(rng, 2, 4 + Math.floor(difficulty / 2));

        const unreducedNum = baseNum * factor;
        const unreducedDen = baseDen * factor;
        const correctStr = formatFraction(baseNum, baseDen);
        const prompt = `Zkrať zlomek na základní tvar: ${unreducedNum}/${unreducedDen}`;

        const wrongAnswers = [
            factor % 2 === 0 ? formatFraction(unreducedNum / 2, unreducedDen / 2) : formatFraction(baseNum + 1, baseDen),
            `${unreducedNum}/${baseDen}`,
            `${baseDen}/${baseNum}`,
            formatFraction(baseNum + 1, baseDen)
        ];

        return {
            id: `f-${difficulty}-reduce-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [correctStr],
            wrongAnswers: uniqueWrongAnswers([correctStr], wrongAnswers, 4),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'add-diff' || variant === 'sub-diff') {
        const isAdd = variant === 'add-diff';
        const pair = pick(rng, difficulty >= 2 ? [...PAIRS_EASY, ...PAIRS_HARD] : PAIRS_EASY);

        let n1 = int(rng, 1, pair.d1 - 1);
        let n2 = int(rng, 1, pair.d2 - 1);

        if (!isAdd && (n1 / pair.d1) <= (n2 / pair.d2)) {
            const temp = pair.d1; pair.d1 = pair.d2; pair.d2 = temp;
            const tempN = n1; n1 = n2; n2 = tempN;
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
            correctAnswers: [correctStr],
            wrongAnswers: uniqueWrongAnswers([correctStr], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    const isAddSame = variant === 'add-same';
    const denominator = pick(rng, DENOMINATORS_LOW);
    const n1 = int(rng, isAddSame ? 1 : 2, denominator - 1);
    const n2 = int(rng, 1, isAddSame ? (denominator - n1) : (n1 - 1));

    const operator = isAddSame ? '+' : '-';
    const prompt = `${n1}/${denominator} ${operator} ${n2}/${denominator} = ?`;
    const resultNum = isAddSame ? n1 + n2 : n1 - n2;
    const correctStr = formatFraction(resultNum, denominator);

    const wrongAnswers = [
        formatFraction(resultNum, denominator * 2),
        formatFraction(isAddSame ? n1 - n2 : n1 + n2, denominator),
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