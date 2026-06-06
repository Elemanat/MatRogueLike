import type {ApiProblemDto} from './contracts';

export interface ProblemGenerationRequest {
    towerId: string;
    floor: number;
    enemyType: string;
    seed?: string;
}

type ProblemBuilder = (request: ProblemGenerationRequest, rng: () => number, themeKey: string) => ApiProblemDto;

const TOWER_THEME_MAP: Record<string, string> = {
    'divisibility-primes': 'divisibility-primes',
    'divisibility-and-primes': 'divisibility-primes',
    'delitelnost-a-prvocisla': 'divisibility-primes',
    'delitelnost': 'divisibility-primes',
    'prvocisla': 'divisibility-primes',
    fractions: 'fractions',
    zlomky: 'fractions',
    decimals: 'decimals',
    'decimal-numbers': 'decimals',
    'desetinna-cisla': 'decimals',
    'unit-conversions': 'unit-conversions',
    'unit-conversion': 'unit-conversions',
    'prevody-jednotek': 'unit-conversions',
    'prevod-jednotek': 'unit-conversions',
    'angles-degrees': 'angles-degrees',
    angles: 'angles-degrees',
    'uhly-a-stupne': 'angles-degrees',
    'uhly-a-stupen': 'angles-degrees',
};

function stringToSeed(value: string): number {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function createRng(seed: string): () => number {
    let state = stringToSeed(seed) || 1;
    return () => {
        state += 0x6D2B79F5;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pick<T>(rng: () => number, values: readonly T[]): T {
    return values[Math.floor(rng() * values.length)]!;
}

function int(rng: () => number, min: number, max: number): number {
    return Math.floor(rng() * (max - min + 1)) + min;
}

function normalizeKey(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function tierIndexFromFloor(floor: number): number {
    // Map floor to three difficulty tiers: 1 -> easy, 2 -> medium, 3+ -> hard
    if (floor <= 1) return 1;
    if (floor === 2) return 2;
    return 3;
}

function gcd(a: number, b: number): number {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
        const t = y;
        y = x % y;
        x = t;
    }
    return x || 1;
}

function simplifyFraction(num: number, den: number): { num: number; den: number } {
    const sign = den < 0 ? -1 : 1;
    const normalizedNum = num * sign;
    const normalizedDen = Math.abs(den);
    const divisor = gcd(normalizedNum, normalizedDen);
    return {
        num: normalizedNum / divisor,
        den: normalizedDen / divisor,
    };
}

function formatDecimal(value: number): string {
    const fixed = value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    return fixed === '-0' ? '0' : fixed;
}

function formatFraction(num: number, den: number): string {
    const simplified = simplifyFraction(num, den);
    if (simplified.den === 1) return String(simplified.num);
    return `${simplified.num}/${simplified.den}`;
}

function hasFiniteDecimal(den: number): boolean {
    let value = Math.abs(den);
    while (value % 2 === 0) value /= 2;
    while (value % 5 === 0) value /= 5;
    return value === 1;
}

function equivalentAnswersForFraction(num: number, den: number): string[] {
    const simplified = simplifyFraction(num, den);
    const answers = [formatFraction(simplified.num, simplified.den)];

    if (hasFiniteDecimal(simplified.den)) {
        answers.push(formatDecimal(simplified.num / simplified.den));
    }

    return [...new Set(answers)];
}

function parseAnswer(value: string): number | null {
    const normalized = value.trim().replace(',', '.');
    if (!normalized) return null;

    const fractionMatch = normalized.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    if (fractionMatch) {
        const numerator = Number(fractionMatch[1]);
        const denominator = Number(fractionMatch[2]);
        if (denominator === 0) return null;
        return numerator / denominator;
    }

    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : null;
}

function answersEquivalent(a: string, b: string): boolean {
    if (a.trim() === b.trim()) return true;
    const left = parseAnswer(a);
    const right = parseAnswer(b);
    if (left === null || right === null) return false;
    return Math.abs(left - right) < 1e-9;
}

function uniqueWrongAnswers(correctAnswers: string[], candidates: string[], count = 2): string[] {
    const wrongs: string[] = [];

    for (const candidate of candidates) {
        if (wrongs.length >= count) break;
        if (!candidate.trim()) continue;
        if (correctAnswers.some(correct => answersEquivalent(candidate, correct))) continue;
        if (wrongs.some(existing => answersEquivalent(existing, candidate))) continue;
        wrongs.push(candidate);
    }

    return wrongs;
}

function fractionCandidates(num: number, den: number, rng: () => number): string[] {
    const simplified = simplifyFraction(num, den);
    const value = simplified.num / simplified.den;
    return [
        formatFraction(simplified.num + 1, simplified.den),
        formatFraction(simplified.num, simplified.den + 1),
        formatFraction(Math.max(1, simplified.num - 1), simplified.den),
        formatDecimal(value + 0.1),
        formatDecimal(Math.max(0.1, value - 0.1)),
        formatFraction(simplified.num + int(rng, 1, 2), simplified.den + int(rng, 1, 2)),
    ];
}

function integerCandidates(value: number): string[] {
    return [String(value + 1), String(Math.max(0, value - 1)), String(value + 2), String(Math.max(0, value - 2))];
}

function decimalCandidates(value: number): string[] {
    return [
        formatDecimal(value + 0.1),
        formatDecimal(Math.max(0, value - 0.1)),
        formatDecimal(value + 0.2),
        formatDecimal(Math.max(0, value - 0.2)),
    ];
}

function uniqueIntegers(rng: () => number, values: number[], count: number, predicate: (value: number) => boolean): number[] {
    const picked = new Set<number>();
    const pool = [...values];

    while (picked.size < count && pool.length > 0) {
        const index = Math.floor(rng() * pool.length);
        const candidate = pool.splice(index, 1)[0]!;
        if (predicate(candidate)) picked.add(candidate);
    }

    return [...picked];
}

function buildNumericProblem(themeKey: string, prompt: string, correctValue: number, difficulty: number, idPrefix: string, candidateStrings: string[]): ApiProblemDto {
    const correctAnswer = formatDecimal(correctValue);
    const fallbackCandidates = [
        ...candidateStrings,
        ...decimalCandidates(correctValue),
        ...integerCandidates(Math.trunc(correctValue)),
        ...decimalCandidates(correctValue + 1),
    ];
    const wrongAnswers = uniqueWrongAnswers([correctAnswer], fallbackCandidates, 2);

    return {
        id: `${idPrefix}-${stringToSeed(`${themeKey}:${prompt}:${correctAnswer}`)}`,
        prompt,
        correctAnswers: [correctAnswer],
        wrongAnswers,
        topic: themeKey,
        difficulty,
    };
}

function buildFractionProblem(themeKey: string, floor: number, enemyType: string, rng: () => number): ApiProblemDto {
    const denominatorsLow = [3, 4, 5, 6, 8, 10];
    const denominatorsHigh = [3, 4, 5, 6, 8, 9, 10, 12];
    const denominatorPool = floor <= 2 ? denominatorsLow : denominatorsHigh;
    const denominator = pick(rng, denominatorPool);
    const variantsPool = floor <= 1 ? ['add', 'subtract'] : ['add', 'subtract', 'reduce', 'add-diff-den'];
    const variant = pick(rng, variantsPool);
    const baseTier = tierIndexFromFloor(floor);
    const difficulty = clamp(baseTier + (enemyType === 'MINIBOSS' ? 1 : enemyType === 'BOSS' ? 2 : 0), 1, 6);

    if (variant === 'add-diff-den') {
        const pairs = [
            {d1: 2, d2: 4}, {d1: 2, d2: 6}, {d1: 3, d2: 6}, {d1: 2, d2: 8}, {d1: 4, d2: 8}, {d1: 5, d2: 10}
        ];
        const hardPairs = [
            {d1: 2, d2: 3}, {d1: 3, d2: 4}, {d1: 2, d2: 5}, {d1: 3, d2: 5}, {d1: 4, d2: 5}
        ];
        const pool = floor >= 3 ? [...pairs, ...hardPairs] : pairs;
        const pair = pick(rng, pool);

        const num1 = int(rng, 1, pair.d1 - 1);
        const num2 = int(rng, 1, pair.d2 - 1);
        const resultNum = num1 * pair.d2 + num2 * pair.d1;
        const resultDen = pair.d1 * pair.d2;

        const prompt = `${num1}/${pair.d1} + ${num2}/${pair.d2} = ?`;
        const correctAnswers = equivalentAnswersForFraction(resultNum, resultDen);

        const fake1 = formatFraction(num1 + num2, pair.d1 + pair.d2);
        const fake2 = formatFraction(num1 + num2, pair.d1 * pair.d2);
        const wrongPool = fractionCandidates(resultNum, resultDen, rng);
        wrongPool.push(fake1, fake2);

        return {
            id: `f-${difficulty}-addD-${stringToSeed(`${themeKey}:${floor}:${enemyType}:${prompt}`)}`,
            prompt,
            correctAnswers,
            wrongAnswers: uniqueWrongAnswers(correctAnswers, wrongPool),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'add') {
        const left = int(rng, 1, Math.max(1, denominator - 2));
        const right = int(rng, 1, Math.max(1, denominator - left - 1));
        const resultNum = left + right;
        const prompt = `${left}/${denominator} + ${right}/${denominator} = ?`;
        const correctAnswers = equivalentAnswersForFraction(resultNum, denominator);
        return {
            id: `f-${difficulty}-add-${stringToSeed(`${themeKey}:${floor}:${enemyType}:${prompt}`)}`,
            prompt,
            correctAnswers,
            wrongAnswers: uniqueWrongAnswers(correctAnswers, fractionCandidates(resultNum, denominator, rng)),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'subtract') {
        const left = int(rng, 2, denominator - 1);
        const right = int(rng, 1, left - 1);
        const resultNum = left - right;
        const prompt = `${left}/${denominator} - ${right}/${denominator} = ?`;
        const correctAnswers = equivalentAnswersForFraction(resultNum, denominator);
        return {
            id: `f-${difficulty}-sub-${stringToSeed(`${themeKey}:${floor}:${enemyType}:${prompt}`)}`,
            prompt,
            correctAnswers,
            wrongAnswers: uniqueWrongAnswers(correctAnswers, fractionCandidates(resultNum, denominator, rng)),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'reduce') {
        const baseDenominators = floor <= 2 ? [2, 3, 4, 5] : [3, 4, 5, 6, 8];
        const baseNumerator = pick(rng, [1, 2, 3, 4, 5, 6]);
        const baseDenominator = pick(rng, baseDenominators);
        const factor = int(rng, 2, 4);
        const num = baseNumerator * factor;
        const den = baseDenominator * factor;
        const prompt = `Zkrať zlomek ${num}/${den} = ?`;
        const correctAnswers = equivalentAnswersForFraction(baseNumerator, baseDenominator);
        return {
            id: `f-${difficulty}-reduce-${stringToSeed(`${themeKey}:${floor}:${enemyType}:${prompt}`)}`,
            prompt,
            correctAnswers,
            wrongAnswers: uniqueWrongAnswers(correctAnswers, fractionCandidates(baseNumerator, baseDenominator, rng)),
            topic: themeKey,
            difficulty,
        };
    }

    const left = int(rng, 1, 9) / 10;
    const right = int(rng, 1, 9) / 10;
    const operator = pick(rng, ['+', '-']);
    const result = operator === '+' ? left + right : Math.max(0, left - right);
    const prompt = `${formatDecimal(left)} ${operator} ${formatDecimal(right)} = ?`;
    const correctAnswers = [formatDecimal(result)];
    return {
        id: `f-${difficulty}-decimal-${stringToSeed(`${themeKey}:${floor}:${enemyType}:${prompt}`)}`,
        prompt,
        correctAnswers,
        wrongAnswers: uniqueWrongAnswers(correctAnswers, [
            formatDecimal(result + 0.1),
            formatDecimal(Math.max(0, result - 0.1)),
            formatDecimal(result + 0.2),
            formatDecimal(Math.max(0, result - 0.2)),
        ]),
        topic: themeKey,
        difficulty,
    };
}

function buildDivisibilityProblem(themeKey: string, floor: number, enemyType: string, rng: () => number): ApiProblemDto {
    const baseTier = tierIndexFromFloor(floor);
    const difficulty = clamp(baseTier + (enemyType === 'MINIBOSS' ? 1 : enemyType === 'BOSS' ? 2 : 0), 1, 6);
    const variant = pick(rng, ['divisible', 'prime']);

    if (variant === 'divisible') {
        const divisors = floor <= 2 ? [2, 3, 5, 10] : [3, 4, 6, 8, 9];
        const divisor = pick(rng, divisors);
        const correct = divisor * int(rng, 3 + difficulty, 10 + difficulty * 4);
        const prompt = `Které z čísel je dělitelné číslem ${divisor}?`;

        const wrongs = [];
        while (wrongs.length < 5) {
            const trap = divisor * int(rng, 3, 20) + pick(rng, [1, 2, divisor - 1]);
            if (trap !== correct && trap % divisor !== 0) {
                wrongs.push(String(trap));
            }
        }

        return buildNumericProblem(
            themeKey,
            prompt,
            correct,
            difficulty,
            `d-${difficulty}-div-${divisor}`,
            wrongs
        );
    }

    const primePool = floor <= 2 ? [2, 3, 5, 7, 11, 13, 17, 19] : [23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
    const correct = pick(rng, primePool);
    const prompt = 'Které z čísel je prvočíslo?';

    const pseudoPrimes = [9, 15, 21, 25, 27, 33, 35, 39, 49, 51, 55, 57, 63, 65, 69, 75, 77, 81, 85, 87, 91, 93, 95];
    const wrongPool = uniqueIntegers(rng, pseudoPrimes, 5, value => value !== correct);

    return buildNumericProblem(
        themeKey,
        prompt,
        correct,
        difficulty,
        `d-${difficulty}-prime`,
        wrongPool.map(String),
    );
}

function buildDecimalsProblem(themeKey: string, floor: number, enemyType: string, rng: () => number): ApiProblemDto {
    const baseTier = tierIndexFromFloor(floor);
    const difficulty = clamp(baseTier + (enemyType === 'MINIBOSS' ? 1 : enemyType === 'BOSS' ? 2 : 0), 1, 6);
    const variant = pick(rng, ['add', 'subtract', 'convert']);

    if (variant === 'add') {
        const factor = floor >= 3 ? 100 : 10;
        const left = int(rng, 10, 99 + floor * 50) / factor;
        const right = int(rng, 10, 99 + floor * 50) / factor;
        const result = left + right;
        const prompt = `${formatDecimal(left)} + ${formatDecimal(right)} = ?`;

        const candidates = [
            formatDecimal(result + 0.1),
            formatDecimal(result + 1),
            formatDecimal(result - 1),
            formatDecimal(left + right * 10),
            formatDecimal((left * factor + right * factor + 1) / factor)
        ];

        return buildNumericProblem(themeKey, prompt, result, difficulty, `dec-${difficulty}-add`, candidates);
    }

    if (variant === 'subtract') {
        const factor = floor >= 3 ? 100 : 10;
        const left = int(rng, 50, 200 + floor * 50) / factor;
        const right = int(rng, 10, Math.floor(left * factor) - 5) / factor;
        const result = Math.max(0, left - right);
        const prompt = `${formatDecimal(left)} - ${formatDecimal(right)} = ?`;

        const candidates = [
            formatDecimal(result + 0.1),
            formatDecimal(result - 0.1),
            formatDecimal(result + 1),
            formatDecimal(Number(formatDecimal(left)) - Math.floor(right)),
        ];

        return buildNumericProblem(themeKey, prompt, result, difficulty, `dec-${difficulty}-sub`, candidates);
    }

    const denominators = floor <= 2 ? [2, 4, 5, 10] : [2, 4, 5, 8, 10, 20, 25, 50, 100];
    const denominator = pick(rng, denominators);
    const numerator = int(rng, 1, denominator - 1);
    const result = numerator / denominator;
    const prompt = `Převeď ${numerator}/${denominator} na desetinné číslo = ?`;
    return buildNumericProblem(themeKey, prompt, result, difficulty, `dec-${difficulty}-conv`, decimalCandidates(result));
}

function buildUnitConversionsProblem(themeKey: string, floor: number, enemyType: string, rng: () => number): ApiProblemDto {
    const baseTier = tierIndexFromFloor(floor);
    const difficulty = clamp(baseTier + (enemyType === 'MINIBOSS' ? 1 : enemyType === 'BOSS' ? 2 : 0), 1, 6);
    const conversions = [
        {from: 'm', to: 'cm', factor: 100, values: [1, 2, 3, 4, 5, 6, 7]},
        {from: 'cm', to: 'm', factor: 0.01, values: [25, 50, 75, 100, 125, 250, 500]},
        {from: 'km', to: 'm', factor: 1000, values: [1, 2, 3, 4, 5]},
        {from: 'm', to: 'km', factor: 0.001, values: [250, 500, 750, 1000, 1500, 2500, 5000]},
        {from: 'g', to: 'kg', factor: 0.001, values: [250, 500, 750, 1000, 1250, 1500, 2500]},
        {from: 'kg', to: 'g', factor: 1000, values: [1, 2, 3, 4, 5]},
        {from: 'min', to: 's', factor: 60, values: [1, 2, 3, 4, 5, 6, 7]},
        {from: 'h', to: 'min', factor: 60, values: [1, 2, 3, 4, 5]},
    ] as const;

    const conversion = pick(rng, conversions.slice(0, floor <= 2 ? 5 : conversions.length));
    const value = pick(rng, conversion.values);
    const result = value * conversion.factor;
    const prompt = `Převeď ${value} ${conversion.from} na ${conversion.to} = ?`;
    const candidates = Number.isInteger(result) ? integerCandidates(result) : decimalCandidates(result);
    return buildNumericProblem(themeKey, prompt, result, difficulty, `u-${difficulty}-${conversion.from}-${conversion.to}`, candidates);
}

function buildAnglesProblem(themeKey: string, floor: number, enemyType: string, rng: () => number): ApiProblemDto {
    const baseTier = tierIndexFromFloor(floor);
    const difficulty = clamp(baseTier + (enemyType === 'MINIBOSS' ? 1 : enemyType === 'BOSS' ? 2 : 0), 1, 6);
    const variants = floor <= 2 ? ['complement', 'supplement', 'right-multiple'] : ['complement', 'supplement', 'triangle', 'right-multiple'];
    const variant = pick(rng, variants);

    if (variant === 'complement') {
        const angle = int(rng, 10, 80);
        const result = 90 - angle;
        const prompt = `Doplň do 90°: ${angle}° = ?`;
        return buildNumericProblem(themeKey, prompt, result, difficulty, `a-${difficulty}-comp`, integerCandidates(result));
    }

    if (variant === 'supplement') {
        const angle = int(rng, 15, 165);
        const result = 180 - angle;
        const prompt = `Doplň do 180°: ${angle}° = ?`;
        return buildNumericProblem(themeKey, prompt, result, difficulty, `a-${difficulty}-supp`, integerCandidates(result));
    }

    if (variant === 'triangle') {
        const first = int(rng, 20, 80);
        const second = int(rng, 20, Math.max(20, 150 - first));
        const result = 180 - first - second;
        const prompt = `V trojúhelníku jsou dva úhly ${first}° a ${second}°. Kolik měří třetí?`;
        return buildNumericProblem(themeKey, prompt, result, difficulty, `a-${difficulty}-tri`, integerCandidates(result));
    }

    const count = int(rng, 2, 5);
    const result = count * 90;
    const prompt = `Kolik stupňů mají ${count} pravé úhly?`;
    return buildNumericProblem(themeKey, prompt, result, difficulty, `a-${difficulty}-right`, integerCandidates(result));
}

const THEME_BUILDERS: Record<string, ProblemBuilder> = {
    'divisibility-primes': (request, rng, themeKey) => buildDivisibilityProblem(themeKey, request.floor, request.enemyType, rng),
    fractions: (request, rng, themeKey) => buildFractionProblem(themeKey, request.floor, request.enemyType, rng),
    decimals: (request, rng, themeKey) => buildDecimalsProblem(themeKey, request.floor, request.enemyType, rng),
    'unit-conversions': (request, rng, themeKey) => buildUnitConversionsProblem(themeKey, request.floor, request.enemyType, rng),
    'angles-degrees': (request, rng, themeKey) => buildAnglesProblem(themeKey, request.floor, request.enemyType, rng),
};

function resolveThemeKey(towerId: string): string {
    const normalized = normalizeKey(towerId);
    return TOWER_THEME_MAP[normalized]
        ?? (normalized.includes('fraction') || normalized.includes('zlom') ? 'fractions'
            : normalized.includes('decimal') || normalized.includes('deset') ? 'decimals'
                : normalized.includes('unit') || normalized.includes('prevod') || normalized.includes('jednot') ? 'unit-conversions'
                    : normalized.includes('angle') || normalized.includes('uhl') || normalized.includes('stup') ? 'angles-degrees'
                        : normalized.includes('prime') || normalized.includes('prvoc') || normalized.includes('delitel') ? 'divisibility-primes'
                            : 'fractions');
}

export function generateProblem(request: ProblemGenerationRequest): ApiProblemDto {
    const themeKey = resolveThemeKey(request.towerId);
    const seed = `${themeKey}:${request.floor}:${request.enemyType}:${request.seed ?? ''}`;
    const rng = createRng(seed);
    const builder = THEME_BUILDERS[themeKey] ?? THEME_BUILDERS.fractions;

    return builder(request, rng, themeKey);
}

export function isEquivalentAnswer(selected: string, correct: string): boolean {
    return answersEquivalent(selected, correct);
}

export function generateProblems(request: ProblemGenerationRequest, count = 10): ApiProblemDto[] {
    const problems: ApiProblemDto[] = [];
    for (let i = 0; i < count; i++) {
        const seed = `${request.seed ?? ''}:${i}`;
        problems.push(generateProblem({...request, seed}));
    }
    return problems;
}

export function validateProblem(p: ApiProblemDto): string[] {
    const issues: string[] = [];
    if (!p.id) issues.push('missing id');
    if (!p.prompt) issues.push('missing prompt');
    if (!p.correctAnswers || p.correctAnswers.length === 0) issues.push('no correctAnswers');

    const canonical = parseAnswer(p.correctAnswers[0] ?? '');
    if (canonical === null) {
        // For non-numeric answers we skip numeric checks
    } else {
        for (const ca of p.correctAnswers) {
            if (!answersEquivalent(ca, String(canonical))) {
                issues.push(`correctAnswer "${ca}" not equivalent to canonical ${canonical}`);
            }
        }
        for (const wa of p.wrongAnswers ?? []) {
            if (answersEquivalent(wa, String(canonical))) {
                issues.push(`wrongAnswer "${wa}" is equivalent to canonical ${canonical}`);
            }
        }
    }

    if (p.prompt.includes('/0 ') || p.prompt.includes('/ 0') || p.prompt.includes('÷ 0')) {
        issues.push('div by zero in prompt');
    }

    if (p.prompt.match(/\d{5,}/)) {
        issues.push('numbers too large for 6th grade math (5+ digits)');
    }

    if (!p.wrongAnswers || p.wrongAnswers.length < 2) issues.push('less than 2 wrongAnswers');

    return issues;
}