import type { ApiClient } from './client';
import type {
  NextProblemRequest,
  NextProblemResponse,
  RunAnswerRequest,
  RunAnswerResponse,
  RunStartRequest,
  RunStartResponse,
  PlayerStatsResponse,
} from './contracts';
import type { ApiRuntimeConfig } from './config';

async function fetchJson<T>(
  baseUrl: string,
  timeoutMs: number,
  path: string,
  init: RequestInit,
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`API ${response.status}: ${body}`);
    }

    return await response.json() as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function createRealApiClient(config: ApiRuntimeConfig): ApiClient {
  const baseUrl = config.baseUrl.replace(/\/$/, '');

  return {
    runs: {
      async startRun(request: RunStartRequest): Promise<RunStartResponse> {
        return fetchJson<RunStartResponse>(baseUrl, config.timeoutMs, '/api/runs/start', {
          method: 'POST',
          body: JSON.stringify(request),
        });
      },
      async answer(request: RunAnswerRequest): Promise<RunAnswerResponse> {
        return fetchJson<RunAnswerResponse>(baseUrl, config.timeoutMs, '/api/runs/answer', {
          method: 'POST',
          body: JSON.stringify(request),
        });
      },
    },
    problems: {
      async getNext(request: NextProblemRequest): Promise<NextProblemResponse> {
        const query = new URLSearchParams({
          towerId: request.towerId,
          floor: String(request.floor),
          enemyType: request.enemyType,
        }).toString();

        return fetchJson<NextProblemResponse>(baseUrl, config.timeoutMs, `/api/problems/next?${query}`, {
          method: 'GET',
        });
      },
    },
    players: {
      async getStats(playerName: string): Promise<PlayerStatsResponse> {
        return fetchJson<PlayerStatsResponse>(baseUrl, config.timeoutMs, `/api/players/${encodeURIComponent(playerName)}/stats`, {
          method: 'GET',
        });
      },
    },
  };
}
