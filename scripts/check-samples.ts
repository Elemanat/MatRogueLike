import {generateProblems, validateProblem} from '../src/services/api/problemGenerator';
import type {ProblemGenerationRequest} from '../src/services/api/problemGenerator.ts';

const THEMES = [
    'divisibility-primes',
    'fractions',
    'decimals',
    'unit-conversions',
    'angles-degrees',
];
const floors = [1, 2, 3];
const SAMPLE_COUNT = 100;

interface Summary {
    total: number;
    invalid: number;
    issues: Record<string, number>;
}

(async function main() {
    const overall: Record<string, Summary> = {};

    for (const theme of THEMES) {
        overall[theme] = {total: 0, invalid: 0, issues: {}};
        for (const floor of floors) {
            const req: ProblemGenerationRequest = {towerId: theme, floor, enemyType: 'NORMAL'};
            const problems = generateProblems(req, SAMPLE_COUNT);
            for (const p of problems) {
                overall[theme].total += 1;
                const issues = validateProblem(p);
                if (issues.length > 0) {
                    overall[theme].invalid += 1;
                    for (const it of issues) overall[theme].issues[it] = (overall[theme].issues[it] ?? 0) + 1;
                }
            }
        }
    }

    console.log('Generation check summary:');
    for (const theme of THEMES) {
        const s = overall[theme];
        console.log(`- ${theme}: ${s.total} generated, ${s.invalid} with issues (${((s.invalid / s.total) * 100).toFixed(1)}%)`);
        if (Object.keys(s.issues).length > 0) {
            console.log('  Issues:');
            for (const [k, v] of Object.entries(s.issues)) console.log(`    ${k}: ${v}`);
        }
    }
})();

