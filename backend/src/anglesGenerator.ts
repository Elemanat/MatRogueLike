import type {ApiProblemDto} from './contracts';
import type {ProblemBuilderContext} from './problemGenerator';
import {
    int, pick, stringToSeed, uniqueWrongAnswers
} from './utils';

// ==========================================
// POMOCNÉ FUNKCE PRO ÚHLY (CHYTÁKY)
// ==========================================

// Simuluje chyby při doplňování úhlů (chyba o 10, doplňování do 100 místo 90 atd.)
function generateAngleTraps(target: number, current: number): string[] {
    const traps = new Set<string>();
    const correct = target - current;

    // 1. Chyba o 10 (typická chyba při odčítání pod sebou)
    traps.add(String(correct + 10));
    traps.add(String(Math.max(1, correct - 10)));

    // 2. Doplnění do špatného základu (100 místo 90, 200 místo 180)
    if (target === 90) {
        traps.add(String(100 - current)); // Dítě doplňuje do stovky
        traps.add(String(180 - current)); // Dítě si spletlo pravý a přímý úhel
    } else if (target === 180) {
        traps.add(String(200 - current)); // Dítě doplňuje do dvouset
        traps.add(String(90 - current > 0 ? 90 - current : 360 - current));
    }

    // 3. Dítě jen sečte čísla v zadání (pokud tam nějaká vidí)
    traps.add(String(target + current));

    return Array.from(traps).filter(t => t !== String(correct));
}

// ==========================================
// HLAVNÍ GENERÁTOR
// ==========================================

export function buildAnglesProblem(ctx: ProblemBuilderContext): ApiProblemDto {
    const {rng, floor, difficulty, themeKey} = ctx;

    // Klasifikace a doplňky na lehkých patrech, trojúhelníky a násobky na těžších
    const variantsPool = floor <= 2
        ? ['classification', 'complement', 'supplement']
        : ['classification', 'triangle', 'multiples', 'complement', 'supplement'];

    const variant = pick(rng, variantsPool);

    // 1. KLASIFIKACE ÚHLŮ (Ostrý, Tupý, atd.)
    if (variant === 'classification') {
        const angleTypes = [
            {name: 'Ostrý', min: 15, max: 89},
            {name: 'Pravý', min: 90, max: 90},
            {name: 'Tupý', min: 91, max: 179},
            {name: 'Přímý', min: 180, max: 180}
        ];

        const selectedType = pick(rng, angleTypes);
        const angle = int(rng, selectedType.min, selectedType.max);
        const prompt = `Jaký je úhel, který měří ${angle}°?`;

        const wrongAnswers = angleTypes
            .map(t => t.name)
            .filter(name => name !== selectedType.name);

        return {
            id: `a-${difficulty}-class-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [selectedType.name],
            wrongAnswers,
            topic: themeKey,
            difficulty,
        };
    }

    // 2. DOPLNĚK DO PRAVÉHO ÚHLU
    if (variant === 'complement') {
        const angle = int(rng, 15, 75); // Hezká čísla, ne extrémy jako 2°
        const result = 90 - angle;
        const prompt = `Doplň úhel ${angle}° do pravého úhlu = ?`;

        const traps = generateAngleTraps(90, angle);

        return {
            id: `a-${difficulty}-comp-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(result)],
            wrongAnswers: uniqueWrongAnswers([String(result)], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    // 3. DOPLNĚK DO PŘÍMÉHO ÚHLU
    if (variant === 'supplement') {
        const angle = int(rng, 25, 155);
        const result = 180 - angle;
        const prompt = `Doplň úhel ${angle}° do přímého úhlu = ?`;

        const traps = generateAngleTraps(180, angle);

        return {
            id: `a-${difficulty}-supp-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(result)],
            wrongAnswers: uniqueWrongAnswers([String(result)], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    // 4. TROJÚHELNÍK (Dopočet třetího úhlu)
    if (variant === 'triangle') {
        const a = int(rng, 30, 85); // Omezeno, aby trojúhelník fyzicky dával smysl
        const b = int(rng, 30, 150 - a);
        const result = 180 - a - b;
        const prompt = `V trojúhelníku jsou dva úhly ${a}° a ${b}°. Kolik měří třetí?`;

        const traps = [
            String(a + b), // Dítě zapomnělo odečíst od 180, jen sečetlo
            String(result + 10), // Aritmetická chyba při odčítání
            String(Math.max(1, result - 10)),
            String(360 - a - b) // Dítě si spletlo součet úhlů s čtyřúhelníkem
        ];

        return {
            id: `a-${difficulty}-tri-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [String(result)],
            wrongAnswers: uniqueWrongAnswers([String(result)], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    // 5. NÁSOBKY PRAVÉHO ÚHLU
    // Původní dobrý nápad z formulas.pdf
    const multiples = int(rng, 2, 5);
    const result = multiples * 90;
    const prompt = `Kolik stupňů mají dohromady ${multiples} pravé úhly?`;

    const wrongAnswers = [
        String(multiples * 60), // Dítě si to plete s časem (hodinami)
        String(multiples * 100), // Dítě bere pravý úhel jako 100
        String((multiples + 1) * 90),
        String(180) // Fixní chyták
    ];

    return {
        id: `a-${difficulty}-mult-${stringToSeed(ctx.nodeId)}`,
        prompt,
        correctAnswers: [String(result)],
        wrongAnswers: uniqueWrongAnswers([String(result)], wrongAnswers, 4),
        topic: themeKey,
        difficulty,
    };
}