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

const testTiers = [
    {floor: 1, type: 'NORMAL', name: 'Lehká (Patro 1)'},
    {floor: 3, type: 'NORMAL', name: 'Střední (Patro 3)'},
    {floor: 5, type: 'NORMAL', name: 'Těžká (Patro 5)'},
    {floor: 5, type: 'BOSS', name: 'Finální Boss (Obtížnost 4)'}
];

const OUT = path.join(process.cwd(), 'scripts', 'generated-samples.md');

let md = '# Vygenerované příklady pro review\n\n';

for (const theme of THEMES) {
    md += `## Téma: ${theme}\n\n`;
    for (const tier of testTiers) {
        md += `### ${tier.name}\n\n`;
        const request: ProblemGenerationRequest = {
            towerId: theme,
            floor: tier.floor,
            enemyType: tier.type,
            nodeId: 'sample-gen'
        };
        const problems = generateProblems(request, 20); // Vygeneruje 20 vzorků od každého
        let idx = 1;
        for (const p of problems) {
            const issues = validateProblem(p);
            md += `#### ${idx}. ${p.prompt}\n`;
            md += `- id: ${p.id}\n`;
            md += `- topic: ${p.topic}, difficulty: ${p.difficulty}\n`;
            md += `- correctAnswers: ${JSON.stringify(p.correctAnswers)}\n`;
            md += `- wrongAnswers: ${JSON.stringify(p.wrongAnswers)}\n`;
            if (issues.length > 0) {
                md += `- **ISSUES:** ${issues.join('; ')}\n`;
            }
            md += '\n';
            idx += 1;
        }
    }
}

fs.writeFileSync(OUT, md, 'utf8');
console.log(`Generated samples written to ${OUT}`);