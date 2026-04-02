import crypto from 'node:crypto';
/**
 * Build the message to sign: JSON.stringify(body) + nonce + timestamp
 */
export function buildSignatureMessage(body, nonce, timestamp) {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    return `${bodyString}${nonce}${timestamp}`;
}
/**
 * Sign a message with Ed25519 private key.
 * Returns base64-encoded signature.
 */
export function signMessage(message, privateKeyDer) {
    const keyObject = crypto.createPrivateKey({
        key: Buffer.from(privateKeyDer),
        format: 'der',
        type: 'pkcs8',
    });
    const signature = crypto.sign(null, Buffer.from(message), keyObject);
    return signature.toString('base64');
}
/**
 * Generate a unique nonce (UUID v4).
 */
export function generateNonce() {
    return crypto.randomUUID();
}
/**
 * Build all X-Claw-* headers for an authenticated request.
 */
export function buildCoolBuyHeaders(bodyString, agentId, privateKeyDer) {
    const nonce = generateNonce();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = buildSignatureMessage(bodyString, nonce, timestamp);
    const signature = signMessage(message, privateKeyDer);
    return {
        'X-Claw-Agent-ID': agentId,
        'X-Claw-Signature': signature,
        'X-Claw-Nonce': nonce,
        'X-Claw-Timestamp': timestamp,
    };
}
//# sourceMappingURL=signing.js.map