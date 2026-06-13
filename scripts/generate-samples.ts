import * as fs from 'fs';
import * as path from 'path';
import {generateProblems, validateProblem} from '../backend/src/problemGenerator';
import type {ProblemGenerationRequest} from '../backend/src/problemGenerator';

const THEMES = [
    'divisibility-primes',
    'fractions',
    'decimals',
    'unit-conversions',
    'angles-degrees',
];

const floors = [1, 2, 3]; // map to EASY/MEDIUM/HARD

const OUT = path.join(process.cwd(), 'scripts', 'generated-samples.md');

let md = '# Vygenerované příklady pro review\n\n';

for (const theme of THEMES) {
    md += `## Téma: ${theme}\n\n`;
    for (const floor of floors) {
        md += `### Obtížnost (floor=${floor})\n\n`;
        const request: ProblemGenerationRequest = {towerId: theme, floor, enemyType: 'NORMAL', nodeId: 'sample-gen'};
        const problems = generateProblems(request, 20);
        let idx = 1;
        for (const p of problems) {
            const issues = validateProblem(p);
            md += `#### ${idx}. ${p.prompt}\n`;
            md += `- id: ${p.id}\n`;
            md += `- topic: ${p.topic}, difficulty: ${p.difficulty}\n`;
            md += `- correctAnswers: ${JSON.stringify(p.correctAnswers)}\n`;
            md += `- wrongAnswers: ${JSON.stringify(p.wrongAnswers)}\n`;
            if (issues.length > 0) {
                md += `- ISSUES: ${issues.join('; ')}\n`;
            }
            md += '\n';
            idx += 1;
        }
    }
}

fs.writeFileSync(OUT, md, 'utf8');
console.log(`Generated samples written to ${OUT}`);