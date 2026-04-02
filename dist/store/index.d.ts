export interface KeyStore {
    getPrivateKey(): Promise<Uint8Array | null>;
    getPublicKey(): Promise<string | null>;
    getAgentId(): Promise<string | null>;
    store(privateKey: Uint8Array, publicKey: string, agentId: string): Promise<void>;
    clear(): Promise<void>;
}
/**
 * In-memory key store. Keys are lost when process exits.
 */
export declare class MemoryKeyStore implements KeyStore {
    private privateKey;
    private publicKey;
    private agentId;
    getPrivateKey(): Promise<Uint8Array<ArrayBufferLike> | null>;
    getPublicKey(): Promise<string | null>;
    getAgentId(): Promise<string | null>;
    store(privateKey: Uint8Array, publicKey: string, agentId: string): Promise<void>;
    clear(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map