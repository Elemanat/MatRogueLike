import * as fs from 'fs';
import {generateProblem} from '../backend/src/problemGenerator';
import type {ProblemGenerationRequest} from '../backend/src/problemGenerator';

const themes = [
    {id: 'divisibility-primes', name: 'Dělitelnost a prvočísla'},
    {id: 'fractions', name: 'Zlomky'},
    {id: 'decimals', name: 'Desetinná čísla'},
    {id: 'unit-conversions', name: 'Převody jednotek'},
    {id: 'angles-degrees', name: 'Úhly a stupně'}
];

function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

let md = '# Pohled ze hry (Ukázky příkladů)\n\n';
md += 'Tento dokument simuluje, jak hráči uvidí příklady přímo na obrazovce.\n\n---\n\n';

for (const theme of themes) {
    md += `## ${theme.name}\n\n`;

    const testTiers = [
        {floor: 1, type: 'NORMAL', name: 'Lehká (Patro 1)'},
        {floor: 3, type: 'NORMAL', name: 'Střední (Patro 3)'},
        {floor: 5, type: 'NORMAL', name: 'Těžká (Patro 5)'},
        {floor: 5, type: 'BOSS', name: 'Finální Boss (Obtížnost 4)'}
    ];

    for (const tier of testTiers) {
        md += `### ${tier.name}\n\n`;

        for (let i = 0; i < 10; i++) {
            const req: ProblemGenerationRequest = {
                towerId: theme.id,
                floor: tier.floor,
                enemyType: tier.type,
                nodeId: `game-view-node-${i}`,
                seed: `game-view-demo-${theme.id}-${tier.type}-${i}`
            };

            const problem = generateProblem(req);

            const correct = problem.correctAnswers[0];
            const wrongs = problem.wrongAnswers.slice(0, 2);
            const options = shuffle([correct, ...wrongs]);

            md += `#### Příklad ${i + 1}:\n**${problem.prompt}**\n\n`;

            const letterMap = ['A', 'B', 'C'];
            let correctLetter = '';

            options.forEach((opt, idx) => {
                md += `* **${letterMap[idx]})** ${opt}\n`;
                if (opt === correct) {
                    correctLetter = letterMap[idx];
                }
            });

            md += `\n*Správně: ${correctLetter}) ${correct}*\n\n---\n\n`;
        }
    }
}

fs.writeFileSync('scripts/game-view-samples.md', md, 'utf-8');
console.log('Markdown generated.');