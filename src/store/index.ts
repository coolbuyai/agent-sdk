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
export class MemoryKeyStore implements KeyStore {
  private privateKey: Uint8Array | null = null;
  private publicKey: string | null = null;
  private agentId: string | null = null;

  async getPrivateKey() { return this.privateKey; }
  async getPublicKey() { return this.publicKey; }
  async getAgentId() { return this.agentId; }

  async store(privateKey: Uint8Array, publicKey: string, agentId: string) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.agentId = agentId;
  }

  async clear() {
    this.privateKey = null;
    this.publicKey = null;
    this.agentId = null;
  }
}
