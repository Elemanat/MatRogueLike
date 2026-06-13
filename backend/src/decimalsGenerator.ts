import type {ApiProblemDto} from './contracts';
import type {ProblemBuilderContext} from './problemGenerator';
import {
    int, pick, stringToSeed, uniqueWrongAnswers, formatDecimal
} from './utils';

// ==========================================
// KONFIGURACE A MAGICKÁ ČÍSLA
// ==========================================

const FRACTION_DENOMINATORS = [2, 4, 5, 8, 10, 20, 25, 50];

// ==========================================
// POMOCNÉ FUNKCE PRO DESETINNÁ ČÍSLA (CHYTÁKY)
// ==========================================

// Simuluje typické chyby žáků při sčítání/odčítání desetinných čísel
function generateDecimalTraps(a: number, b: number, isAdd: boolean): string[] {
    const traps = new Set<string>();

    // 1. Dítě ignoruje desetinnou čárku a sčítá/odčítá jen cifry, jako by to byla celá čísla
    const strA = String(a).replace('.', '');
    const strB = String(b).replace('.', '');
    const rawCalc = isAdd ? Number(strA) + Number(strB) : Math.max(0, Number(strA) - Number(strB));

    // Zkusí to posunout o 1 nebo 2 desetinná místa (typicky špatné zarovnání)
    traps.add(formatDecimal(rawCalc / 10));
    traps.add(formatDecimal(rawCalc / 100));

    // 2. Extrémně častá chyba: špatné zarovnání celého čísla a desetinného (např. 12 + 1.5 -> dítě sečte 2 a 5 -> 13.5 nebo 2.7)
    if (Number.isInteger(a) && !Number.isInteger(b)) {
        traps.add(formatDecimal(a / 10 + b)); // Posune celé číslo o řád dolů
    } else if (!Number.isInteger(a) && Number.isInteger(b)) {
        traps.add(formatDecimal(a + b / 10)); // Posune celé číslo o řád dolů
    }

    // 3. Při odčítání s přechodem: dítě odečte menší od většího v každém sloupci zvlášť (např. 19.4 - 12.8 -> 9-2=7, 8-4=4 -> 7.4)
    if (!isAdd) {
        const intA = Math.floor(a);
        const decA = Math.round((a - intA) * 10);
        const intB = Math.floor(b);
        const decB = Math.round((b - intB) * 10);

        if (decA < decB) { // Nastává přechod přes desítku
            const fakeInt = intA - intB;
            const fakeDec = decB - decA; // Dítě to otočí, aby to šlo odečíst
            traps.add(formatDecimal(fakeInt + fakeDec / 10));
        }
    }

    return Array.from(traps);
}

// Generuje sady čísel, která mažou dětem představivost (vypadají velká, ale jsou malá)
// Generuje sady čísel, která mažou dětem představivost (vypadají velká, ale jsou malá)
function generateComparisonSet(rng: () => number): { correct: number, traps: number[], type: 'min' | 'max' } {
    const base = int(rng, 0, 2); // 0, 1, nebo 2 celá

    // as const zajistí, že type bude striktně 'min' | 'max' a ne jen 'string'
    const type = pick(rng, ['min', 'max'] as const);

    if (type === 'min') {
        // Hledáme nejmenší. Chyták: čísla s mnoha ciframi vypadají velká.
        return {
            correct: base + 0.09,
            traps: [base + 0.1, base + 0.11, base + 0.099],
            type
        };
    } else {
        // Hledáme největší. Chyták: 0.199 vypadá na první pohled větší než 0.2.
        return {
            correct: base + 0.2,
            traps: [base + 0.19, base + 0.199, base + 0.029],
            type
        };
    }
}

// ==========================================
// HLAVNÍ GENERÁTOR
// ==========================================

export function buildDecimalsProblem(ctx: ProblemBuilderContext): ApiProblemDto {
    const {rng, floor, difficulty, themeKey} = ctx;

    // Porovnávání a násobení 10/100 je super pro lehká patra, sčítání/odčítání pro těžší
    const variantsPool = floor <= 2
        ? ['compare', 'multiply-divide', 'add']
        : ['add', 'subtract', 'fraction-to-decimal', 'multiply-divide'];

    const variant = pick(rng, variantsPool);

    // 1. POROVNÁVÁNÍ ČÍSEL (Nová šablona)
    if (variant === 'compare') {
        const {correct, traps, type} = generateComparisonSet(rng);
        const prompt = type === 'min' ? 'Které z těchto čísel je NEJMENŠÍ?' : 'Které z těchto čísel je NEJVĚTŠÍ?';

        return {
            id: `dec-${difficulty}-cmp-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [formatDecimal(correct)],
            wrongAnswers: traps.map(formatDecimal),
            topic: themeKey,
            difficulty,
        };
    }

    // 2. NÁSOBENÍ A DĚLENÍ 10, 100, 1000 (Nová šablona)
    if (variant === 'multiply-divide') {
        const isMultiply = pick(rng, [true, false]);
        const factor = pick(rng, [10, 100]);
        // Vygenerujeme číslo typu 3.45 nebo 12.8
        const num = int(rng, 10, 999) / 100;

        const operator = isMultiply ? '*' : '/'; // Můžeš změnit na '·' nebo ':' podle toho, co máš v UI
        const prompt = `${formatDecimal(num)} ${operator} ${factor} = ?`;

        const correct = isMultiply ? num * factor : num / factor;
        const correctStr = formatDecimal(correct);

        const wrongAnswers = [
            formatDecimal(isMultiply ? num / factor : num * factor), // Dítě udělalo opačnou operaci
            formatDecimal(isMultiply ? num * (factor * 10) : num / (factor * 10)), // Posun o nulu navíc
            formatDecimal(isMultiply ? num * (factor / 10) : num / (factor / 10)), // Posun o nulu méně
            String(Math.floor(num)) // Odstřihne desetinou část úplně
        ];

        return {
            id: `dec-${difficulty}-muldiv-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [correctStr],
            wrongAnswers: uniqueWrongAnswers([correctStr], wrongAnswers, 4),
            topic: themeKey,
            difficulty,
        };
    }

    // 3. SČÍTÁNÍ A ODČÍTÁNÍ DESETINNÝCH ČÍSEL
    if (variant === 'add' || variant === 'subtract') {
        const isAdd = variant === 'add';
        const factor = floor >= 3 ? 100 : 10;

        // Cíleně generujeme tak, aby vznikala potřeba zarovnávat čárku nebo přecházet desítku
        const a = pick(rng, [int(rng, 1, 50), int(rng, 10, 200) / factor]);
        const b = int(rng, 10, 99) / 10;

        // Zajištění, aby výsledek odčítání nebyl záporný
        const left = isAdd ? a : Math.max(a, b);
        const right = isAdd ? b : Math.min(a, b);

        const operator = isAdd ? '+' : '-';
        const prompt = `${formatDecimal(left)} ${operator} ${formatDecimal(right)} = ?`;
        const result = isAdd ? left + right : left - right;
        const correctStr = formatDecimal(result);

        const traps = generateDecimalTraps(left, right, isAdd);

        return {
            id: `dec-${difficulty}-${variant}-${stringToSeed(ctx.nodeId)}`,
            prompt,
            correctAnswers: [correctStr],
            wrongAnswers: uniqueWrongAnswers([correctStr], traps, 4),
            topic: themeKey,
            difficulty,
        };
    }

    // 4. PŘEVOD ZLOMKU NA DESETINNÉ ČÍSLO
    const denominator = pick(rng, FRACTION_DENOMINATORS);
    const numerator = int(rng, 1, denominator - 1);
    const result = numerator / denominator;
    const prompt = `Převeď zlomek ${numerator}/${denominator} na desetinné číslo.`;

    const correctStr = formatDecimal(result);
    const wrongAnswers = [
        formatDecimal(result / 10), // Chyba v řádu (např. 0.06 místo 0.6)
        formatDecimal(result * 10),
        formatDecimal((numerator * 2) / 100), // Různé divoké odhady
        formatDecimal(numerator / 10)
    ];

    return {
        id: `dec-${difficulty}-conv-${stringToSeed(ctx.nodeId)}`,
        prompt,
        correctAnswers: [correctStr],
        wrongAnswers: uniqueWrongAnswers([correctStr], wrongAnswers, 4),
        topic: themeKey,
        difficulty,
    };
}