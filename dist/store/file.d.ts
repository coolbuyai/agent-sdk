import type { KeyStore } from './index.js';
/**
 * File-based key store with 0600 permissions.
 * Persists keys across process restarts.
 */
export declare class FileKeyStore implements KeyStore {
    private filePath;
    private cache;
    constructor(filePath: string);
    private load;
    getPrivateKey(): Promise<Uint8Array | null>;
    getPublicKey(): Promise<string | null>;
    getAgentId(): Promise<string | null>;
    store(privateKey: Uint8Array, publicKey: string, agentId: string): Promise<void>;
    clear(): Promise<void>;
}
//# sourceMappingURL=file.d.ts.map