import type {ApiProblemDto} from './contracts';
import {buildDivisibilityProblem} from './divisibilityPrimesGenerator';
import {buildFractionProblem} from './fractionsGenerator';
import {buildDecimalsProblem} from './decimalsGenerator';
import {buildUnitConversionsProblem} from './unitConversionsGenerator';
import {buildAnglesProblem} from './anglesGenerator';
import {
    createRng, normalizeKey, clamp,
    parseAnswer, answersEquivalent
} from './utils';

// ==========================================
// ROZHRANÍ A KONTEXT
// ==========================================

export interface ProblemGenerationRequest {
    towerId: string;
    floor: number;
    nodeId: string;
    enemyType: string;
    seed?: string;
}

export interface ProblemBuilderContext {
    rng: () => number;
    themeKey: string;
    floor: number;
    enemyType: string;
    nodeId: string;
    difficulty: number;
}

type ProblemBuilder = (ctx: ProblemBuilderContext) => ApiProblemDto;

// ==========================================
// KONFIGURACE ROUTOVÁNÍ
// ==========================================

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

const THEME_BUILDERS: Record<string, ProblemBuilder> = {
    'divisibility-primes': buildDivisibilityProblem,
    fractions: buildFractionProblem,
    decimals: buildDecimalsProblem,
    'unit-conversions': buildUnitConversionsProblem,
    'angles-degrees': buildAnglesProblem,
};

// ==========================================
// POMOCNÉ FUNKCE PRO ROUTER
// ==========================================

function tierIndexFromFloor(floor: number): number {
    // 1. a 2. patro = obtížnost 1; 3. a 4. patro = obtížnost 2; 5+ = obtížnost 3
    if (floor <= 2) return 1;
    if (floor <= 4) return 2;
    return 3;
}

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

// ==========================================
// HLAVNÍ EXPORTOVANÉ FUNKCE (API)
// ==========================================

export function generateProblem(request: ProblemGenerationRequest): ApiProblemDto {
    const themeKey = resolveThemeKey(request.towerId);

    // Zapojení nodeId do seedu zajišťuje absolutní unikátnost každého boje
    const seed = `${themeKey}:${request.floor}:${request.nodeId}:${request.enemyType}:${request.seed ?? ''}`;
    const rng = createRng(seed);

    const baseTier = tierIndexFromFloor(request.floor);
    const difficulty = clamp(baseTier + (request.enemyType === 'MINIBOSS' ? 1 : request.enemyType === 'BOSS' ? 2 : 0), 1, 6);

    const ctx: ProblemBuilderContext = {
        rng,
        themeKey,
        floor: request.floor,
        enemyType: request.enemyType,
        nodeId: request.nodeId,
        difficulty
    };

    const builder = THEME_BUILDERS[themeKey];

    if (builder) {
        return builder(ctx);
    }

    return buildFractionProblem(ctx); // Fallback
}

export function isEquivalentAnswer(selected: string, correct: string): boolean {
    return answersEquivalent(selected, correct);
}

export function generateProblems(request: ProblemGenerationRequest, count = 10): ApiProblemDto[] {
    const problems: ApiProblemDto[] = [];
    for (let i = 0; i < count; i++) {
        const seed = `${request.seed ?? ''}:${i}`;
        // Pro hromadné testování generujeme fiktivní nodeId pomocí indexu
        problems.push(generateProblem({...request, nodeId: `test-node-${i}`, seed}));
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
        // Ne-numerické odpovědi netestujeme
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