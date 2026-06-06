export type ApiMode = 'mock' | 'real';

export interface ApiRuntimeConfig {
    readonly mode: ApiMode;
    readonly baseUrl: string;
    readonly timeoutMs: number;
}

function normalizeMode(rawMode: string | undefined): ApiMode {
    return rawMode === 'real' ? 'real' : 'mock';
}

function parseTimeout(raw: string | undefined): number {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return 8000;
    return Math.max(1000, Math.min(30000, parsed));
}

export function getApiRuntimeConfig(): ApiRuntimeConfig {
    return {
        mode: normalizeMode(import.meta.env.VITE_API_MODE),
        baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
        timeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
    };
}