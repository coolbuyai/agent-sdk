export interface KeyPairResult {
    publicKey: string;
    privateKeyDer: Uint8Array;
    agentId: string;
}
/**
 * Generate an Ed25519 key pair for agent identity.
 */
export declare function generateKeyPair(): KeyPairResult;
/**
 * Derive agent ID from public key hex string.
 * agentId = SHA256(publicKeyHex).substring(0, 16)
 */
export declare function deriveAgentId(publicKeyHex: string): string;
//# sourceMappingURL=keys.d.ts.map