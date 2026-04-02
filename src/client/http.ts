import type { KeyStore } from '../store/index.js';
import { buildCoolBuyHeaders } from '../crypto/signing.js';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
}

export class HttpClient {
  private baseUrl: string;
  private keyStore: KeyStore;
  private timeoutMs: number;

  constructor(baseUrl: string, keyStore: KeyStore, timeoutMs = 30000) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.keyStore = keyStore;
    this.timeoutMs = timeoutMs;
  }

  async request<T = unknown>(opts: RequestOptions): Promise<T> {
    // Build URL with query params
    let url = `${this.baseUrl}${opts.path}`;
    if (opts.query) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined) params.set(k, String(v));
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    // Serialize body
    const bodyString = opts.body ? JSON.stringify(opts.body) : '{}';

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...opts.headers,
    };

    // Sign if authenticated
    if (opts.auth !== false) {
      const agentId = await this.keyStore.getAgentId();
      const privateKey = await this.keyStore.getPrivateKey();

      if (!agentId || !privateKey) {
        throw new Error('Agent keys not found. Call generateKeys() first.');
      }

      const authHeaders = buildCoolBuyHeaders(bodyString, agentId, privateKey);
      Object.assign(headers, authHeaders);
    }

    const response = await fetch(url, {
      method: opts.method,
      headers,
      body: opts.method !== 'GET' ? bodyString : undefined,
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    const json = await response.json() as T & { success?: boolean; message?: string; error_code?: string };

    if (!response.ok) {
      const err: Error & { statusCode?: number; errorCode?: string } = new Error(
        (json as Record<string, unknown>).message as string || `HTTP ${response.status}`
      );
      err.statusCode = response.status;
      err.errorCode = (json as Record<string, unknown>).error_code as string | undefined;
      throw err;
    }

    return json;
  }
}
