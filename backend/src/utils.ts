export function stringToSeed(value: string): number {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

export function createRng(seed: string): () => number {
    let state = stringToSeed(seed) || 1;
    return () => {
        state += 0x6D2B79F5;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function pick<T>(rng: () => number, values: readonly T[]): T {
    return values[Math.floor(rng() * values.length)]!;
}

export function int(rng: () => number, min: number, max: number): number {
    return Math.floor(rng() * (max - min + 1)) + min;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function uniqueIntegers(rng: () => number, values: readonly number[], count: number, predicate: (value: number) => boolean): number[] {
    const picked = new Set<number>();
    const pool = [...values];

    while (picked.size < count && pool.length > 0) {
        const index = Math.floor(rng() * pool.length);
        const candidate = pool.splice(index, 1)[0]!;
        if (predicate(candidate)) picked.add(candidate);
    }

    return [...picked];
}

export function normalizeKey(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function gcd(a: number, b: number): number {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
        const t = y;
        y = x % y;
        x = t;
    }
    return x || 1;
}

export function simplifyFraction(num: number, den: number): { num: number; den: number } {
    const sign = den < 0 ? -1 : 1;
    const normalizedNum = num * sign;
    const normalizedDen = Math.abs(den);
    const divisor = gcd(normalizedNum, normalizedDen);
    return {
        num: normalizedNum / divisor,
        den: normalizedDen / divisor,
    };
}

export function formatDecimal(value: number): string {
    const fixed = value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    return fixed === '-0' ? '0' : fixed;
}

export function formatFraction(num: number, den: number): string {
    const simplified = simplifyFraction(num, den);
    if (simplified.den === 1) return String(simplified.num);
    return `${simplified.num}/${simplified.den}`;
}

export function parseAnswer(value: string): number | null {
    const normalized = value.trim().replace(',', '.');
    if (!normalized) return null;

    const mixedMatch = normalized.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixedMatch) {
        const whole = Number(mixedMatch[1]);
        const num = Number(mixedMatch[2]);
        const den = Number(mixedMatch[3]);
        if (den === 0) return null;

        const sign = whole < 0 ? -1 : 1;
        return whole + (sign * (num / den));
    }

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

export function answersEquivalent(a: string, b: string): boolean {
    if (a.trim() === b.trim()) return true;
    const left = parseAnswer(a);
    const right = parseAnswer(b);
    if (left === null || right === null) return false;
    return Math.abs(left - right) < 1e-9;
}

export function uniqueWrongAnswers(correctAnswers: string[], candidates: string[], count = 2): string[] {
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