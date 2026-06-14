import type {ApiProblemDto} from './contracts';
import type {ProblemBuilderContext} from './problemGenerator';
import {
    int, pick, stringToSeed, uniqueWrongAnswers
} from './utils';

function generateAngleTraps(target: number, current: number): string[] {
    const traps = new Set<string>();
    const correct = target - current;

    traps.add(String(correct + 10));
    traps.add(String(Math.max(1, correct - 10)));

    if (target === 90) {
        traps.add(String(100 - current));
        traps.add(String(180 - current));
    }

    traps.add(String(target + current));

    return Array.from(traps).filter(t => t !== String(correct));
}

export function buildAnglesProblem(ctx: ProblemBuilderContext): ApiProblemDto {
    const {rng, difficulty, themeKey} = ctx;

    if (difficulty >= 4) {
        const bossDeg = int(rng, 30, 140);
        const bossMin = pick(rng, [15, 20, 30, 40, 45]);

        const prompt = `Úhly alfa a beta jsou vedlejší. Úhel alfa měří ${bossDeg}° ${bossMin}'. Kolik měří úhel beta?`;

        const correctDeg = 179 - bossDeg;
        const correctMin = 60 - bossMin;
        const correctStr = `${correctDeg}° ${correctMin}'`;

        const traps = [
            `${180 - bossDeg}° ${60 - bossMin}'`,
            `${179 - bossDeg}° ${100 - bossMin}'`,
            `${180 - bossDeg}° ${bossMin}'`,
            `${correctDeg - 1}° ${correctMin}'`
        ];

        return {
            id: `a-${difficulty}-boss-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [correctStr],
            wrongAnswers: uniqueWrongAnswers([correctStr], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    const variantsPool = difficulty <= 1
        ? ['classification', 'complement90']
        : ['triangle', 'vertical', 'adjacent', 'degMinConv', 'degMinAdd', 'degMinSub'];

    const variant = pick(rng, variantsPool);

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

    if (variant === 'complement90') {
        const angle = int(rng, 15, 75);
        const result = 90 - angle;
        const prompt = `Doplň úhel ${angle}° do pravého úhlu = ?`;

        const traps = generateAngleTraps(90, angle);

        return {
            id: `a-${difficulty}-comp-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [`${result}°`],
            wrongAnswers: uniqueWrongAnswers([`${result}°`], traps.map(t => `${t}°`), 4),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'vertical') {
        const angle = int(rng, 25, 155);
        const prompt = `Dvě přímky se protínají. Jeden z úhlů měří ${angle}°. Kolik měří jeho vrcholový úhel?`;

        const traps = [
            `${180 - angle}°`,
            `${90 - angle > 0 ? 90 - angle : 360 - angle}°`,
            `${angle + 10}°`,
            `${100 - angle > 0 ? 100 - angle : angle - 10}°`
        ];

        return {
            id: `a-${difficulty}-vert-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [`${angle}°`],
            wrongAnswers: uniqueWrongAnswers([`${angle}°`], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'adjacent') {
        const angle = int(rng, 25, 155);
        const result = 180 - angle;
        const prompt = `Dvě přímky se protínají. Jeden z úhlů měří ${angle}°. Kolik měří jeho vedlejší úhel?`;

        const traps = generateAngleTraps(180, angle);
        traps.push(String(angle));

        return {
            id: `a-${difficulty}-adj-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [`${result}°`],
            wrongAnswers: uniqueWrongAnswers([`${result}°`], traps.map(t => `${t}°`), 4),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'triangle') {
        const a = int(rng, 30, 85);
        const b = int(rng, 30, 150 - a);
        const result = 180 - a - b;
        const prompt = `V trojúhelníku jsou úhly ${a}° a ${b}°. Kolik měří třetí?`;

        const traps = [
            String(a + b),
            String(result + 10),
            String(Math.max(1, result - 10)),
            String(360 - a - b)
        ];

        return {
            id: `a-${difficulty}-tri-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [`${result}°`],
            wrongAnswers: uniqueWrongAnswers([`${result}°`], traps.map(t => `${t}°`), 4),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'degMinConv') {
        const degrees = int(rng, 2, 5);
        const minutes = pick(rng, [15, 20, 30, 45]);
        const correct = (degrees * 60) + minutes;

        const prompt = `Převeď na minuty: ${degrees}° ${minutes}' = ?`;
        const traps = [
            String((degrees * 100) + minutes),
            String(degrees * 60),
            String(degrees + minutes),
            String((degrees * 60) + 100)
        ];

        return {
            id: `a-${difficulty}-dmc-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [`${correct}'`],
            wrongAnswers: uniqueWrongAnswers([`${correct}'`], traps.map(t => `${t}'`), 4),
            topic: themeKey,
            difficulty,
        };
    }

    if (variant === 'degMinAdd') {
        const minA = pick(rng, [40, 45, 50]);
        const minB = pick(rng, [25, 30, 35]);
        const degA = int(rng, 1, 5);
        const degB = int(rng, 1, 3);

        const totalMinutes = minA + minB;
        const overflowDegrees = Math.floor(totalMinutes / 60);
        const remainderMinutes = totalMinutes % 60;

        const prompt = `Sečti: ${degA}° ${minA}' + ${degB}° ${minB}' = ?`;
        const correctStr = `${degA + degB + overflowDegrees}° ${remainderMinutes}'`;

        const traps = [
            `${degA + degB}° ${totalMinutes}'`,
            `${degA + degB + 1}° ${totalMinutes - 100}'`,
            `${degA + degB + overflowDegrees}° ${remainderMinutes + 10}'`
        ];

        return {
            id: `a-${difficulty}-dma-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [correctStr],
            wrongAnswers: uniqueWrongAnswers([correctStr], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    const deg1 = int(rng, 5, 12);
    const min1 = pick(rng, [10, 15, 20]);
    const deg2 = int(rng, 1, deg1 - 2);
    const min2 = pick(rng, [40, 45, 50]);

    const prompt = `Odečti: ${deg1}° ${min1}' - ${deg2}° ${min2}' = ?`;

    const correctDeg = deg1 - 1 - deg2;
    const correctMin = min1 + 60 - min2;
    const correctStr = `${correctDeg}° ${correctMin}'`;

    const traps = [
        `${deg1 - deg2}° ${min1 + 60 - min2}'`,
        `${deg1 - 1 - deg2}° ${min1 + 100 - min2}'`,
        `${deg1 - deg2}° ${min2 - min1}'`
    ];

    return {
        id: `a-${difficulty}-dms-${stringToSeed(ctx.nodeId)}`,
        prompt,
        correctAnswers: [correctStr],
        wrongAnswers: uniqueWrongAnswers([correctStr], traps, 4),
        topic: themeKey,
        difficulty,
    };
}