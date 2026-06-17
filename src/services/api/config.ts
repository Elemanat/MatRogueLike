export interface ApiRuntimeConfig {
    readonly baseUrl: string;
    readonly timeoutMs: number;
}

function parseTimeout(raw: string | undefined): number {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return 8000;
    return Math.max(1000, Math.min(30000, parsed));
}

export function getApiRuntimeConfig(): ApiRuntimeConfig {
    return {
        baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
        timeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
    };
}