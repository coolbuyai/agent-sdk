export interface CoolBuyHeaders {
    'X-Claw-Agent-ID': string;
    'X-Claw-Signature': string;
    'X-Claw-Nonce': string;
    'X-Claw-Timestamp': string;
}
/**
 * Build the message to sign: JSON.stringify(body) + nonce + timestamp
 */
export declare function buildSignatureMessage(body: unknown, nonce: string, timestamp: string): string;
/**
 * Sign a message with Ed25519 private key.
 * Returns base64-encoded signature.
 */
export declare function signMessage(message: string, privateKeyDer: Uint8Array): string;
/**
 * Generate a unique nonce (UUID v4).
 */
export declare function generateNonce(): string;
/**
 * Build all X-Claw-* headers for an authenticated request.
 */
export declare function buildCoolBuyHeaders(bodyString: string, agentId: string, privateKeyDer: Uint8Array): CoolBuyHeaders;
//# sourceMappingURL=signing.d.ts.map