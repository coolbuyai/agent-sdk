import crypto from 'node:crypto';
// Ed25519 SPKI DER prefix (12 bytes) - stripped to get raw 32-byte public key
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');
/**
 * Generate an Ed25519 key pair for agent identity.
 */
export function generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
        publicKeyEncoding: { type: 'spki', format: 'der' },
        privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    });
    // Strip SPKI prefix to get raw 32-byte public key
    const rawPublicKey = Buffer.from(publicKey).subarray(ED25519_SPKI_PREFIX.length);
    const publicKeyHex = rawPublicKey.toString('hex');
    return {
        publicKey: publicKeyHex,
        privateKeyDer: new Uint8Array(privateKey),
        agentId: deriveAgentId(publicKeyHex),
    };
}
/**
 * Derive agent ID from public key hex string.
 * agentId = SHA256(publicKeyHex).substring(0, 16)
 */
export function deriveAgentId(publicKeyHex) {
    return crypto.createHash('sha256').update(publicKeyHex).digest('hex').substring(0, 16);
}
//# sourceMappingURL=keys.js.map