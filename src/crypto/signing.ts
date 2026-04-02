import crypto from 'node:crypto';

export interface CoolBuyHeaders {
  'X-Claw-Agent-ID': string;
  'X-Claw-Signature': string;
  'X-Claw-Nonce': string;
  'X-Claw-Timestamp': string;
}

/**
 * Build the message to sign: JSON.stringify(body) + nonce + timestamp
 */
export function buildSignatureMessage(body: unknown, nonce: string, timestamp: string): string {
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  return `${bodyString}${nonce}${timestamp}`;
}

/**
 * Sign a message with Ed25519 private key.
 * Returns base64-encoded signature.
 */
export function signMessage(message: string, privateKeyDer: Uint8Array): string {
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
export function generateNonce(): string {
  return crypto.randomUUID();
}

/**
 * Build all X-Claw-* headers for an authenticated request.
 */
export function buildCoolBuyHeaders(
  bodyString: string,
  agentId: string,
  privateKeyDer: Uint8Array,
): CoolBuyHeaders {
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
