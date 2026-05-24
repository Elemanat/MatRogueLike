import type { ApiClient } from './client';
import { getApiRuntimeConfig } from './config';
import { createMockApiClient } from './mockAdapter';
import { createRealApiClient } from './realAdapter';

export function createApiClient(): ApiClient {
  const config = getApiRuntimeConfig();
  if (config.mode === 'real') {
    return createRealApiClient(config);
  }
  return createMockApiClient();
}

export const apiClient = createApiClient();

