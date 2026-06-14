import type {ApiProblemDto} from './contracts';
import type {ProblemBuilderContext} from './problemGenerator';
import {
    int, pick, stringToSeed, uniqueIntegers, uniqueWrongAnswers
} from './utils';

const PRIMES_EASY = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
const PRIMES_MED = [31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const PRIMES_HARD = [101, 103, 107, 109, 113, 127, 131, 137, 139, 149];
const PSEUDO_PRIMES = [39, 49, 51, 57, 69, 87, 91, 93, 111, 115, 117, 119, 121, 123, 133, 143];

function getDigitSum(n: number): number {
    let sum = 0;
    let temp = Math.abs(n);
    while (temp > 0) {
        sum += temp % 10;
        temp = Math.floor(temp / 10);
    }
    return sum;
}

function generateDivisibilityTraps(divisor: number, correct: number, rng: () => number): string[] {
    const traps = new Set<string>();
    let attempts = 0;

    while (traps.size < 4 && attempts < 150) {
        attempts++;
        let trap = 0;

        if (divisor === 4) {
            const prefix = int(rng, 1, 9) * 100;
            const suffix = pick(rng, [14, 34, 54, 74, 94, 22, 42, 62, 82]);
            trap = prefix + suffix;
        } else if (divisor === 8) {
            const prefix = int(rng, 1, 9) * 100;
            const suffix = pick(rng, [18, 28, 38, 58, 68, 78, 98, 12, 36, 44]);
            trap = prefix + suffix;
        } else if (divisor === 3 || divisor === 9) {
            trap = divisor * int(rng, 4, 30) + pick(rng, [1, divisor - 1]);
        } else if (divisor === 6) {
            trap = pick(rng, [
                2 * int(rng, 5, 25),
                3 * pick(rng, [3, 5, 7, 9, 11, 13])
            ]);
        } else {
            trap = divisor * int(rng, 3, 30) + pick(rng, [1, 2, divisor - 1]);
        }

        if (trap !== correct && trap % divisor !== 0) {
            traps.add(String(trap));
        }
    }
    return Array.from(traps);
}

export function buildDivisibilityProblem(ctx: ProblemBuilderContext): ApiProblemDto {
    const {rng, difficulty, themeKey} = ctx;

    if (difficulty >= 4) {
        const bossType = pick(rng, ['combo', 'hard-prime']);

        if (bossType === 'combo') {
            const pairs = [{a: 3, b: 4}, {a: 2, b: 5}, {a: 3, b: 5}];
            const pair = pick(rng, pairs);
            const lcm = pair.a * pair.b;
            const correct = lcm * int(rng, 2, 9);
            const prompt = `Které z čísel je dělitelné číslem ${pair.a} A ZÁROVEŇ číslem ${pair.b}?`;

            const traps = new Set<string>();
            while (traps.size < 3) {
                const t1 = pair.a * int(rng, 3, 20);
                if (t1 % pair.b !== 0 && t1 !== correct) traps.add(String(t1));

                const t2 = pair.b * int(rng, 3, 20);
                if (t2 % pair.a !== 0 && t2 !== correct) traps.add(String(t2));
            }

            return {
                id: `d-${difficulty}-bosscombo-${stringToSeed(ctx.nodeId)}`,
                prompt,
                correctAnswers: [String(correct)],
                wrongAnswers: uniqueWrongAnswers([String(correct)], Array.from(traps), 4),
                topic: themeKey,
                difficulty,
            };
        } else {
            const correct = pick(rng, PRIMES_HARD);
            const prompt = 'Které z těchto velkých čísel je ve skutečnosti PRVOČÍSLO?';
            const wrongPool = uniqueIntegers(rng, PSEUDO_PRIMES, 4, val => val !== correct);

            return {
                id: `d-${difficulty}-bossprime-${stringToSeed(ctx.nodeId)}`,
                prompt,
                correctAnswers: [String(correct)],
                wrongAnswers: wrongPool.map(String),
                topic: themeKey,
                difficulty,
            };
        }
    }

    let variantsPool: string[] = [];
    if (difficulty === 1) {
        variantsPool = ['divisible-easy', 'digit-sum', 'prime-easy'];
    } else if (difficulty === 2) {
        variantsPool = ['divisible-med', 'prime-med', 'not-prime', 'gcd-lcm', 'digit-sum'];
    } else {
        variantsPool = ['divisible-hard', 'prime-med', 'not-prime', 'gcd-lcm'];
    }

    const variant = pick(rng, variantsPool);

    if (variant.startsWith('divisible')) {
        let divisorPool: number[] = [];
        if (variant === 'divisible-easy') divisorPool = [2, 5, 10];
        if (variant === 'divisible-med') divisorPool = [3, 4, 9];
        if (variant === 'divisible-hard') divisorPool = [6, 8];

        const divisor = pick(rng, divisorPool);
        let correct = divisor * int(rng, 4, 25);

        if (divisor === 8 && correct < 100) {
            correct += 104;
        }

        const prompt = `Které z čísel je dělitelné číslem ${divisor}?`;
        const wrongAnswers = generateDivisibilityTraps(divisor, correct, rng);

        return {
            id: `d-${difficulty}-div${divisor}-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(correct)],
            wrongAnswers: uniqueWrongAnswers([String(correct)], wrongAnswers, 4),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'digit-sum') {
        const num = int(rng, 105, 999);
        const correct = getDigitSum(num);
        const prompt = `Jaký je ciferný součet čísla ${num}?`;

        const numStr = String(num);
        let partialSum = 0;
        if (numStr.length >= 2) partialSum = Number(numStr[0]) + Number(numStr[1]);

        const traps = [
            String(partialSum),
            String(correct + 1),
            String(Math.max(1, correct - 1)),
            String(correct + 9)
        ];

        return {
            id: `d-${difficulty}-digitsum-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(correct)],
            wrongAnswers: uniqueWrongAnswers([String(correct)], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'prime-easy' || variant === 'prime-med') {
        const correct = pick(rng, variant === 'prime-easy' ? PRIMES_EASY : PRIMES_MED);
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

    if (variant === 'not-prime') {
        const correct = pick(rng, PSEUDO_PRIMES.filter(p => p < 100));
        const prompt = 'Které z těchto čísel NENÍ prvočíslo?';
        const wrongPool = uniqueIntegers(rng, PRIMES_MED, 4, val => val !== correct);

        return {
            id: `d-${difficulty}-notprime-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(correct)],
            wrongAnswers: wrongPool.map(String),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'gcd-lcm') {
        const isGcd = pick(rng, [true, false]);

        const mPairs = [[2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [5, 6]];
        const m = pick(rng, mPairs);
        const g = int(rng, 2, 8);
        const a = g * m[0]!;
        const b = g * m[1]!;

        if (isGcd) {
            const prompt = `Najdi největšího společného dělitele (NSD) čísel ${a} a ${b}.`;
            const traps = [
                String(g * 2),
                String(a),
                "1",
                String(g + 1)
            ];
            return {
                id: `d-${difficulty}-gcd-${stringToSeed(ctx.nodeId)}`,
                prompt,
                correctAnswers: [String(g)],
                wrongAnswers: uniqueWrongAnswers([String(g)], traps, 4),
                topic: themeKey,
                difficulty,
            };
        } else {
            const prompt = `Najdi nejmenší společný násobek (NSN) čísel ${a} a ${b}.`;
            const correct = g * m[0]! * m[1]!;
            const traps = [
                String(a * b),
                String(correct + a),
                String(correct / 2),
                String(a + b)
            ];
            return {
                id: `d-${difficulty}-lcm-${stringToSeed(ctx.nodeId)}`,
                prompt,
                correctAnswers: [String(correct)],
                wrongAnswers: uniqueWrongAnswers([String(correct)], traps, 4),
                topic: themeKey,
                difficulty,
            };
        }
    }

    return {
        id: `d-fallback-${stringToSeed(ctx.nodeId)}`,
        prompt: "Nouzový příklad: Kolik je 1 + 1?",
        correctAnswers: ["2"],
        wrongAnswers: ["1", "3", "4"],
        topic: themeKey,
        difficulty,
    };
}