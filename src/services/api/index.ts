import type {ApiClient} from './client';
import {getApiRuntimeConfig} from './config';
import {createMockApiClient} from './mockAdapter';
import {createRealApiClient} from './realAdapter';

export function createApiClient(): ApiClient {
    const config = getApiRuntimeConfig();
    console.log('[API Client] Config:', config);
    if (config.mode === 'real') {
        console.log('[API Client] Using REAL adapter');
        return createRealApiClient(config);
    }
    console.log('[API Client] Using MOCK adapter');
    return createMockApiClient();
}

export const apiClient = createApiClient();

