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
md += 'Tento dokument simuluje, jak hráči uvidí příklady přímo na obrazovce, včetně náhodně seřazených odpovědí (A, B, C).\n\n---\n\n';

for (const theme of themes) {
    md += `## ${theme.name}\n\n`;
    for (const floor of [1, 2, 3]) {
        const difficultyName = floor === 1 ? 'Lehká (Patro 1)' : floor === 2 ? 'Střední (Patro 2)' : 'Těžká (Patro 3+)';
        md += `### ${difficultyName}\n\n`;

        // Vygenerujeme 10 příkladů pro každou obtížnost
        for (let i = 0; i < 10; i++) {
            const req: ProblemGenerationRequest = {
                towerId: theme.id,
                floor: floor,
                enemyType: 'NORMAL',
                nodeId: `game-view-node-${i}`, // Doplněno chybějící nodeId
                seed: `game-view-demo-${theme.id}-${floor}-sample-${i}`
            };

            const problem = generateProblem(req);

            const correct = problem.correctAnswers[0];
            // Vezmeme správnou a jen 2 špatné (aby to bylo A, B, C)
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