import type {ApiProblemDto} from './contracts';
import type {ProblemBuilderContext} from './problemGenerator';
import {
    int, pick, stringToSeed, uniqueWrongAnswers, formatDecimal
} from './utils';

const FRACTION_DENOMINATORS = [2, 4, 5, 10];

function generateDecimalTraps(a: number, b: number, isAdd: boolean): string[] {
    const traps = new Set<string>();
    const correct = isAdd ? a + b : Math.max(0, a - b);

    traps.add(formatDecimal(correct * 10));
    if (correct > 10) traps.add(formatDecimal(correct / 10));

    traps.add(formatDecimal(correct + 1));
    traps.add(formatDecimal(Math.max(0, correct - 1)));

    if (isAdd && Number.isInteger(a) && !Number.isInteger(b)) {
        const decB = b - Math.floor(b);
        traps.add(formatDecimal(a + Math.floor(b) + decB / 10));
    } else if (isAdd && !Number.isInteger(a) && Number.isInteger(b)) {
        const decA = a - Math.floor(a);
        traps.add(formatDecimal(b + Math.floor(a) + decA / 10));
    }

    if (!isAdd) {
        const intA = Math.floor(a);
        const decA = Math.round((a - intA) * 10);
        const intB = Math.floor(b);
        const decB = Math.round((b - intB) * 10);

        if (decA < decB) {
            const fakeInt = intA - intB;
            const fakeDec = decB - decA;
            traps.add(formatDecimal(fakeInt + fakeDec / 10));
        }
    }

    traps.add(formatDecimal(correct + 0.1));
    traps.add(formatDecimal(Math.max(0, correct - 0.1)));

    return Array.from(traps).filter(t => t !== formatDecimal(correct));
}

function generateComparisonSet(rng: () => number): { correct: number, traps: number[], type: 'min' | 'max' } {
    const base = int(rng, 0, 50);
    const type = pick(rng, ['min', 'max'] as const);

    const decimalSets = [
        [0.5, 0.05, 0.55, 0.055],
        [0.1, 0.01, 0.11, 0.101],
        [0.9, 0.09, 0.99, 0.099],
        [0.2, 0.22, 0.02, 0.202],
        [0.4, 0.04, 0.44, 0.404],
        [0.7, 0.77, 0.07, 0.077],
        [0.3, 0.33, 0.03, 0.303]
    ];

    const selectedSet = pick(rng, decimalSets);
    const values = selectedSet.map(d => base + d).sort((a, b) => a - b);

    if (type === 'min') {
        return {
            correct: values[0]!,
            traps: [values[1]!, values[2]!, values[3]!],
            type
        };
    } else {
        return {
            correct: values[3]!,
            traps: [values[0]!, values[1]!, values[2]!],
            type
        };
    }
}

export function buildDecimalsProblem(ctx: ProblemBuilderContext): ApiProblemDto {
    const {rng, difficulty, themeKey} = ctx;

    if (difficulty >= 4) {
        const a = int(rng, 11, 99) / 10;
        const b = int(rng, 11, 99) / 10;
        const sum = a + b;
        const factor = pick(rng, [10, 100]);

        const isMul = pick(rng, [true, false]);
        const operator = isMul ? '*' : '/';
        const correct = isMul ? sum * factor : sum / factor;

        const prompt = `(${formatDecimal(a)} + ${formatDecimal(b)}) ${operator} ${factor} = ?`;

        const traps = [
            formatDecimal(sum),
            formatDecimal(isMul ? sum / factor : sum * factor),
            formatDecimal(a + (isMul ? b * factor : b / factor)),
            formatDecimal(isMul ? sum * (factor * 10) : sum / (factor * 10))
        ];

        return {
            id: `dec-${difficulty}-boss-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [formatDecimal(correct)],
            wrongAnswers: uniqueWrongAnswers([formatDecimal(correct)], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    const variantsPool = difficulty <= 1
        ? ['compare', 'multiply-divide', 'add']
        : ['add', 'subtract', 'fraction-to-decimal', 'multiply-divide'];

    const variant = pick(rng, variantsPool);

    if (variant === 'compare') {
        const {correct, traps, type} = generateComparisonSet(rng);
        const prompt = type === 'min' ? 'Které z těchto čísel je NEJMENŠÍ?' : 'Které z těchto čísel je NEJVĚTŠÍ?';

        return {
            id: `dec-${difficulty}-cmp-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [formatDecimal(correct)],
            wrongAnswers: traps.map(formatDecimal),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'multiply-divide') {
        const isMultiply = pick(rng, [true, false]);

        if (isMultiply) {
            const isDecDec = pick(rng, [true, false]);

            if (isDecDec) {
                const a = int(rng, 2, 12);
                const b = int(rng, 2, 9);
                const numA = a / 10;
                const numB = b / 10;
                const correct = (a * b) / 100;

                const prompt = `${formatDecimal(numA)} * ${formatDecimal(numB)} = ?`;
                const traps = [
                    formatDecimal((a * b) / 10),
                    formatDecimal((a * b) / 1000),
                    formatDecimal(a * b),
                    formatDecimal((a * b + 1) / 100)
                ];

                return {
                    id: `dec-${difficulty}-muldd-${stringToSeed(ctx.nodeId)}`,
                    prompt,
                    correctAnswers: [formatDecimal(correct)],
                    wrongAnswers: uniqueWrongAnswers([formatDecimal(correct)], traps, 4),
                    topic: themeKey,
                    difficulty,
                };
            } else {
                const a = int(rng, 2, 12);
                const b = int(rng, 2, 9);
                const num = a / 10;
                const correct = num * b;

                const prompt = `${formatDecimal(num)} * ${b} = ?`;
                const traps = [
                    formatDecimal(a * b),
                    formatDecimal(correct / 10),
                    formatDecimal(correct * 10),
                    formatDecimal(correct + 0.1)
                ];

                return {
                    id: `dec-${difficulty}-muldi-${stringToSeed(ctx.nodeId)}`,
                    prompt,
                    correctAnswers: [formatDecimal(correct)],
                    wrongAnswers: uniqueWrongAnswers([formatDecimal(correct)], traps, 4),
                    topic: themeKey,
                    difficulty,
                };
            }
        } else {
            const divisor = int(rng, 2, 9);
            const correctResult = pick(rng, [int(rng, 2, 12) / 10, int(rng, 2, 9) / 100]);
            const dividend = correctResult * divisor;

            const prompt = `${formatDecimal(dividend)} / ${divisor} = ?`;
            const traps = [
                formatDecimal(correctResult * 10),
                formatDecimal(correctResult / 10),
                formatDecimal(correctResult * 100),
                formatDecimal(correctResult + 0.1)
            ];

            return {
                id: `dec-${difficulty}-div-${stringToSeed(ctx.nodeId)}`,
                prompt,
                correctAnswers: [formatDecimal(correctResult)],
                wrongAnswers: uniqueWrongAnswers([formatDecimal(correctResult)], traps, 4),
                topic: themeKey,
                difficulty,
            };
        }
    }

    if (variant === 'add' || variant === 'subtract') {
        const isAdd = variant === 'add';
        const factor = difficulty >= 3 ? 100 : 10;

        const a = pick(rng, [int(rng, 1, 50), int(rng, 10, 200) / factor]);
        let b = int(rng, 10, 99) / 10;

        if (Number.isInteger(b)) {
            b += pick(rng, [0.3, 0.5, 0.7]);
        }

        const left = isAdd ? a : Math.max(a, b);
        const right = isAdd ? b : Math.min(a, b);

        const operator = isAdd ? '+' : '-';
        const prompt = `${formatDecimal(left)} ${operator} ${formatDecimal(right)} = ?`;
        const result = isAdd ? left + right : left - right;
        const correctStr = formatDecimal(result);

        const traps = generateDecimalTraps(left, right, isAdd);

        return {
            id: `dec-${difficulty}-${variant}-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [correctStr],
            wrongAnswers: uniqueWrongAnswers([correctStr], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    const denominator = pick(rng, FRACTION_DENOMINATORS);
    const numerator = int(rng, 1, denominator - 1);
    const result = numerator / denominator;
    const prompt = `Převeď zlomek ${numerator}/${denominator} na desetinné číslo.`;

    const correctStr = formatDecimal(result);
    const wrongAnswers = [
        formatDecimal(result / 10),
        formatDecimal(result * 10),
        formatDecimal((numerator * 2) / 100),
        formatDecimal(numerator / 10)
    ];

    return {
        id: `dec-${difficulty}-conv-${stringToSeed(ctx.nodeId)}`,
        prompt,
        correctAnswers: [correctStr],
        wrongAnswers: uniqueWrongAnswers([correctStr], wrongAnswers, 4),
        topic: themeKey,
        difficulty,
    };
}