import type { KeyStore } from '../store/index.js';
export interface RequestOptions {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    path: string;
    body?: unknown;
    auth?: boolean;
    query?: Record<string, string | number | undefined>;
    headers?: Record<string, string>;
}
export declare class HttpClient {
    private baseUrl;
    private keyStore;
    private timeoutMs;
    constructor(baseUrl: string, keyStore: KeyStore, timeoutMs?: number);
    request<T = unknown>(opts: RequestOptions): Promise<T>;
}
//# sourceMappingURL=http.d.ts.map