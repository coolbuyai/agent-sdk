import { buildCoolBuyHeaders } from '../crypto/signing.js';
export class HttpClient {
    baseUrl;
    keyStore;
    timeoutMs;
    constructor(baseUrl, keyStore, timeoutMs = 30000) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.keyStore = keyStore;
        this.timeoutMs = timeoutMs;
    }
    async request(opts) {
        // Build URL with query params
        let url = `${this.baseUrl}${opts.path}`;
        if (opts.query) {
            const params = new URLSearchParams();
            for (const [k, v] of Object.entries(opts.query)) {
                if (v !== undefined)
                    params.set(k, String(v));
            }
            const qs = params.toString();
            if (qs)
                url += `?${qs}`;
        }
        // Serialize body
        const bodyString = opts.body ? JSON.stringify(opts.body) : '{}';
        // Build headers
        const headers = {
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
        const json = await response.json();
        if (!response.ok) {
            const err = new Error(json.message || `HTTP ${response.status}`);
            err.statusCode = response.status;
            err.errorCode = json.error_code;
            throw err;
        }
        return json;
    }
}
//# sourceMappingURL=http.js.map