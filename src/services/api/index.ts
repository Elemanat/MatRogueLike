import type {ApiClient} from './client';
import {getApiRuntimeConfig} from './config';
import {createRealApiClient} from './realAdapter';

export function createApiClient(): ApiClient {
    const config = getApiRuntimeConfig();
    console.log('[API Client] Using REAL adapter with config:', config);
    return createRealApiClient(config);
}

export const apiClient = createApiClient();